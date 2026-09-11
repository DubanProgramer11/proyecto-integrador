<?php
class OrdenMedica {
    private $db;

        const ESTADOS = ['pendiente', 'procesada', 'revisada_por_usuario', 'error'];

    public function __construct() {
        $this->db = obtenerConexion();
    }

    public function crear($usuarioId, $archivoUrl) {
        $stmt = $this->db->prepare(
            "INSERT INTO ordenes_medicas (usuario_id, archivo_url, estado_analisis)
             VALUES (:uid, :archivo, 'pendiente')"
        );
        $stmt->execute(['uid' => $usuarioId, 'archivo' => $archivoUrl]);
        return $this->db->lastInsertId();
    }

    public function actualizarTextoExtraido($id, $texto, $estado) {
        $stmt = $this->db->prepare(
            "UPDATE ordenes_medicas SET texto_extraido = :texto, estado_analisis = :estado WHERE id = :id"
        );
        $stmt->execute(['texto' => $texto, 'estado' => $estado, 'id' => $id]);
    }

    public function buscarPorId($id, $usuarioId) {
        $stmt = $this->db->prepare("SELECT * FROM ordenes_medicas WHERE id = :id AND usuario_id = :uid");
        $stmt->execute(['id' => $id, 'uid' => $usuarioId]);
        return $stmt->fetch();
    }

    public function listarPorUsuario($usuarioId) {
        $stmt = $this->db->prepare("SELECT * FROM ordenes_medicas WHERE usuario_id = :uid ORDER BY fecha_carga DESC");
        $stmt->execute(['uid' => $usuarioId]);
        return $stmt->fetchAll();
    }

    public function guardarCoincidencias($ordenId, array $productoIds) {
        $stmt = $this->db->prepare(
            "INSERT INTO orden_medica_productos (orden_medica_id, producto_id, confirmado_por_usuario)
             VALUES (:orden, :producto, 0)"
        );
        foreach ($productoIds as $pid) {
            $stmt->execute(['orden' => $ordenId, 'producto' => $pid]);
        }
    }

    public function confirmarProductos($ordenId, array $productoIds) {
        $stmt = $this->db->prepare(
            "UPDATE orden_medica_productos SET confirmado_por_usuario = 1
             WHERE orden_medica_id = :orden AND producto_id = :producto"
        );
        foreach ($productoIds as $pid) {
            $stmt->execute(['orden' => $ordenId, 'producto' => $pid]);
        }
        $this->db->prepare("UPDATE ordenes_medicas SET estado_analisis = 'revisada_por_usuario' WHERE id = :id")
                  ->execute(['id' => $ordenId]);
    }

    public function contarTotal() {
        return $this->db->query("SELECT COUNT(*) AS total FROM ordenes_medicas")->fetch()['total'];
    }

    public function obtenerDetalleUsuario($id, $usuarioId) {
        $stmt = $this->db->prepare(
            "SELECT * FROM ordenes_medicas WHERE id = :id AND usuario_id = :uid"
        );
        $stmt->execute(['id' => $id, 'uid' => $usuarioId]);
        $orden = $stmt->fetch();
        if (!$orden) return null;

        $stmtProductos = $this->db->prepare(
            "SELECT omp.producto_id, omp.confirmado_por_usuario, p.nombre, p.precio, p.icono
             FROM orden_medica_productos omp
             JOIN productos p ON omp.producto_id = p.id
             WHERE omp.orden_medica_id = :id"
        );
        $stmtProductos->execute(['id' => $id]);
        $orden['productos_detectados'] = $stmtProductos->fetchAll();

        return $orden;
    }

    /* ==========================================================
       ===============  MÉTODOS ADMINISTRATIVOS  ================
       Fase 16.

       NOTA DE PRIVACIDAD (requisito 8 del proyecto): una orden
       médica es DATO SENSIBLE. El listado del panel devuelve solo
       metadatos —quién la subió, cuándo, en qué estado y cuántos
       productos se detectaron— pero NO el texto extraído del
       documento. Ese contenido solo se entrega en el detalle
       individual, cuando el administrador lo abre a propósito.
       ========================================================== */

    /**
     * Lista TODAS las órdenes médicas con el nombre de quien las subió.
     * Devuelve metadatos, nunca el contenido del documento.
     *
     * @param array $filtros ['estado' => ..., 'desde' => ..., 'hasta' => ...]
     */
    public function listarTodas($filtros = []) {
        $condiciones = [];
        $parametros = [];

        if (!empty($filtros['estado'])) {
            $condiciones[] = "om.estado_analisis = :estado";
            $parametros['estado'] = $filtros['estado'];
        }
        if (!empty($filtros['desde'])) {
            $condiciones[] = "DATE(om.fecha_carga) >= :desde";
            $parametros['desde'] = $filtros['desde'];
        }
        if (!empty($filtros['hasta'])) {
            $condiciones[] = "DATE(om.fecha_carga) <= :hasta";
            $parametros['hasta'] = $filtros['hasta'];
        }

        $where = empty($condiciones) ? '' : 'WHERE ' . implode(' AND ', $condiciones);

        $sql = "SELECT om.id, om.usuario_id, om.archivo_url, om.estado_analisis, om.fecha_carga,
                       u.nombre AS cliente_nombre, u.email AS cliente_email,
                       (SELECT COUNT(*) FROM orden_medica_productos omp
                         WHERE omp.orden_medica_id = om.id) AS productos_detectados,
                       (SELECT COUNT(*) FROM orden_medica_productos omp
                         WHERE omp.orden_medica_id = om.id AND omp.confirmado_por_usuario = 1) AS productos_confirmados
                FROM ordenes_medicas om
                JOIN usuarios u ON om.usuario_id = u.id
                $where
                ORDER BY om.fecha_carga DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($parametros);
        return $stmt->fetchAll();
    }

    /**
     * Detalle de una orden médica para el panel, sin filtrar por usuario.
     * Aquí sí se incluye el texto extraído y los productos detectados,
     * porque el administrador la está abriendo deliberadamente.
     */
    public function obtenerDetalleAdmin($id) {
        $stmt = $this->db->prepare(
            "SELECT om.*, u.nombre AS cliente_nombre, u.email AS cliente_email, u.telefono AS cliente_telefono
             FROM ordenes_medicas om
             JOIN usuarios u ON om.usuario_id = u.id
             WHERE om.id = :id"
        );
        $stmt->execute(['id' => $id]);
        $orden = $stmt->fetch();
        if (!$orden) return null;

        $stmtProductos = $this->db->prepare(
            "SELECT omp.producto_id, omp.confirmado_por_usuario, p.nombre, p.precio, p.icono
             FROM orden_medica_productos omp
             JOIN productos p ON omp.producto_id = p.id
             WHERE omp.orden_medica_id = :id"
        );
        $stmtProductos->execute(['id' => $id]);
        $orden['productos_detectados'] = $stmtProductos->fetchAll();

        return $orden;
    }

    /**
     * Cuántas órdenes hay en cada estado. Para el dashboard.
     */
    public function contarPorEstado() {
        $filas = $this->db->query(
            "SELECT estado_analisis, COUNT(*) AS cantidad
             FROM ordenes_medicas GROUP BY estado_analisis"
        )->fetchAll();

        $resultado = array_fill_keys(self::ESTADOS, 0);
        foreach ($filas as $fila) {
            $resultado[$fila['estado_analisis']] = (int)$fila['cantidad'];
        }
        return $resultado;
    }

    /**
     * Cuenta órdenes cargadas dentro de un rango de fechas.
     */
    public function contarPorRango($desde = null, $hasta = null) {
        $condiciones = [];
        $parametros = [];

        if ($desde) {
            $condiciones[] = "DATE(fecha_carga) >= :desde";
            $parametros['desde'] = $desde;
        }
        if ($hasta) {
            $condiciones[] = "DATE(fecha_carga) <= :hasta";
            $parametros['hasta'] = $hasta;
        }

        $where = empty($condiciones) ? '' : 'WHERE ' . implode(' AND ', $condiciones);

        $stmt = $this->db->prepare("SELECT COUNT(*) AS total FROM ordenes_medicas $where");
        $stmt->execute($parametros);
        return (int)$stmt->fetch()['total'];
    }
}