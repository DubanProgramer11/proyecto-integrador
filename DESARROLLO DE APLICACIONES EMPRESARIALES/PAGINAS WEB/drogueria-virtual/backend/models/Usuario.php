<?php
/**
 * MODELO USUARIO
 * Tablas que usa:
 *   usuarios (id, nombre, email, telefono, password_hash, rol_id, activo, fecha_registro)
 *   roles    (id, nombre)   -> 'cliente', 'admin', 'superadmin'
 */
class Usuario {
    private $db;

    public function __construct() {
        $this->db = obtenerConexion();
    }

    /* =========================================================
       AUTENTICACIÓN
       ========================================================= */

    /** Devuelve el usuario con su rol y su hash. Lo usa el login. */
    public function buscarPorEmail($email) {
        $stmt = $this->db->prepare(
            "SELECT u.id, u.nombre, u.email, u.telefono, u.password_hash,
                    u.rol_id, u.activo, u.fecha_registro,
                    COALESCE(r.nombre, 'cliente') AS rol_nombre
             FROM usuarios u
             LEFT JOIN roles r ON u.rol_id = r.id
             WHERE u.email = :email
             LIMIT 1"
        );
        $stmt->execute(['email' => trim($email)]);
        $usuario = $stmt->fetch();
        return $usuario ?: null;
    }

    /** Igual que el anterior pero por id y sin exponer el hash. */
    public function buscarPorId($id) {
        $stmt = $this->db->prepare(
            "SELECT u.id, u.nombre, u.email, u.telefono,
                    u.rol_id, u.activo, u.fecha_registro,
                    COALESCE(r.nombre, 'cliente') AS rol_nombre
             FROM usuarios u
             LEFT JOIN roles r ON u.rol_id = r.id
             WHERE u.id = :id
             LIMIT 1"
        );
        $stmt->execute(['id' => (int)$id]);
        $usuario = $stmt->fetch();
        return $usuario ?: null;
    }

    /** Registro público: siempre crea con rol 'cliente' y cuenta activa. */
    public function crear($nombre, $email, $telefono, $passwordHash) {
        $rolId = $this->idDeRol('cliente');
        if ($rolId === null) {
            $rolId = 1; // respaldo si la tabla roles aún no tiene la fila
        }

        $stmt = $this->db->prepare(
            "INSERT INTO usuarios (nombre, email, telefono, password_hash, rol_id, activo)
             VALUES (:nombre, :email, :telefono, :hash, :rol, 1)"
        );
        $stmt->execute([
            'nombre'   => trim($nombre),
            'email'    => trim($email),
            'telefono' => trim($telefono),
            'hash'     => $passwordHash,
            'rol'      => $rolId
        ]);

        return (int)$this->db->lastInsertId();
    }

    /** Actualiza nombre y teléfono desde "Mi perfil". */
    public function actualizarPerfil($id, $nombre, $telefono) {
        $stmt = $this->db->prepare(
            "UPDATE usuarios SET nombre = :nombre, telefono = :telefono WHERE id = :id"
        );
        return $stmt->execute([
            'nombre'   => trim($nombre),
            'telefono' => trim($telefono),
            'id'       => (int)$id
        ]);
    }

    private function idDeRol($nombreRol) {
        $stmt = $this->db->prepare("SELECT id FROM roles WHERE nombre = :n LIMIT 1");
        $stmt->execute(['n' => $nombreRol]);
        $fila = $stmt->fetch();
        return $fila ? (int)$fila['id'] : null;
    }

    /* =========================================================
       PANEL ADMINISTRATIVO
       ========================================================= */

    public function listarTodos($filtros = []) {
        $condiciones = [];
        $parametros  = [];

        if (!empty($filtros['rol'])) {
            $condiciones[] = "r.nombre = :rol";
            $parametros['rol'] = $filtros['rol'];
        }

        if (!empty($filtros['busqueda'])) {
            $condiciones[] = "(u.nombre LIKE :busqueda OR u.email LIKE :busqueda)";
            $parametros['busqueda'] = '%' . $filtros['busqueda'] . '%';
        }

        if (isset($filtros['activo']) && $filtros['activo'] !== null && $filtros['activo'] !== '') {
            $condiciones[] = "u.activo = :activo";
            $parametros['activo'] = (int)$filtros['activo'];
        }

        $where = empty($condiciones) ? '' : 'WHERE ' . implode(' AND ', $condiciones);

        $sql = "SELECT u.id, u.nombre, u.email, u.telefono, u.activo, u.fecha_registro,
                       COALESCE(r.nombre, 'cliente') AS rol_nombre,
                       (SELECT d.ciudad FROM direcciones d
                         WHERE d.usuario_id = u.id
                         ORDER BY d.predeterminada DESC, d.id ASC LIMIT 1) AS ciudad,
                       (SELECT COUNT(*) FROM pedidos p WHERE p.usuario_id = u.id) AS total_pedidos
                FROM usuarios u
                LEFT JOIN roles r ON u.rol_id = r.id
                $where
                ORDER BY u.id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($parametros);
        return $stmt->fetchAll();
    }

    public function fichaAdmin($id) {
        $stmt = $this->db->prepare(
            "SELECT u.id, u.nombre, u.email, u.telefono, u.activo, u.fecha_registro,
                    COALESCE(r.nombre, 'cliente') AS rol_nombre,
                    (SELECT d.ciudad FROM direcciones d
                      WHERE d.usuario_id = u.id
                      ORDER BY d.predeterminada DESC, d.id ASC LIMIT 1) AS ciudad
             FROM usuarios u
             LEFT JOIN roles r ON u.rol_id = r.id
             WHERE u.id = :id"
        );
        $stmt->execute(['id' => (int)$id]);
        $usuario = $stmt->fetch();
        if (!$usuario) return null;

        $stmtActividad = $this->db->prepare(
            "SELECT
                (SELECT COUNT(*) FROM pedidos p WHERE p.usuario_id = :id1) AS total_pedidos,
                (SELECT COALESCE(SUM(p.total), 0) FROM pedidos p
                  WHERE p.usuario_id = :id2 AND p.estado <> 'cancelado') AS monto_comprado,
                (SELECT COUNT(*) FROM ordenes_medicas om WHERE om.usuario_id = :id3) AS total_ordenes_medicas,
                (SELECT COUNT(*) FROM comentarios c WHERE c.usuario_id = :id4) AS total_comentarios"
        );
        $stmtActividad->execute([
            'id1' => (int)$id, 'id2' => (int)$id,
            'id3' => (int)$id, 'id4' => (int)$id
        ]);
        $usuario['actividad'] = $stmtActividad->fetch();

        $stmtDirecciones = $this->db->prepare(
            "SELECT id, etiqueta, direccion, ciudad, barrio, referencia,
                    telefono_contacto, predeterminada
             FROM direcciones
             WHERE usuario_id = :id
             ORDER BY predeterminada DESC, id ASC"
        );
        $stmtDirecciones->execute(['id' => (int)$id]);
        $usuario['direcciones'] = $stmtDirecciones->fetchAll();

        return $usuario;
    }

    public function cambiarRol($id, $nombreRol) {
        $rolId = $this->idDeRol($nombreRol);
        if ($rolId === null) {
            return false;
        }
        $stmt = $this->db->prepare("UPDATE usuarios SET rol_id = :rol WHERE id = :id");
        return $stmt->execute(['rol' => $rolId, 'id' => (int)$id]);
    }

    public function cambiarEstadoActivo($id, $activo) {
        $stmt = $this->db->prepare("UPDATE usuarios SET activo = :activo WHERE id = :id");
        return $stmt->execute(['activo' => (int)$activo, 'id' => (int)$id]);
    }

    public function contarSuperadminsActivos() {
        $stmt = $this->db->query(
            "SELECT COUNT(*) AS total
             FROM usuarios u JOIN roles r ON u.rol_id = r.id
             WHERE r.nombre = 'superadmin' AND u.activo = 1"
        );
        return (int)$stmt->fetch()['total'];
    }

    /* =========================================================
       ESTADÍSTICAS DEL DASHBOARD
       ========================================================= */

    public function contarTotal() {
        $stmt = $this->db->query(
            "SELECT COUNT(*) AS total
             FROM usuarios u LEFT JOIN roles r ON u.rol_id = r.id
             WHERE COALESCE(r.nombre, 'cliente') = 'cliente'"
        );
        return (int)$stmt->fetch()['total'];
    }

    public function contarPorRol() {
        $stmt = $this->db->query(
            "SELECT COALESCE(r.nombre, 'cliente') AS rol, COUNT(*) AS total
             FROM usuarios u LEFT JOIN roles r ON u.rol_id = r.id
             GROUP BY COALESCE(r.nombre, 'cliente')
             ORDER BY total DESC"
        );
        return $stmt->fetchAll();
    }

    public function contarClientesPorRango($desde = null, $hasta = null) {
        $condiciones = ["COALESCE(r.nombre, 'cliente') = 'cliente'"];
        $parametros  = [];

        if (!empty($desde)) {
            $condiciones[] = "DATE(u.fecha_registro) >= :desde";
            $parametros['desde'] = $desde;
        }
        if (!empty($hasta)) {
            $condiciones[] = "DATE(u.fecha_registro) <= :hasta";
            $parametros['hasta'] = $hasta;
        }

        $sql = "SELECT COUNT(*) AS total
                FROM usuarios u LEFT JOIN roles r ON u.rol_id = r.id
                WHERE " . implode(' AND ', $condiciones);

        $stmt = $this->db->prepare($sql);
        $stmt->execute($parametros);
        return (int)$stmt->fetch()['total'];
    }
}