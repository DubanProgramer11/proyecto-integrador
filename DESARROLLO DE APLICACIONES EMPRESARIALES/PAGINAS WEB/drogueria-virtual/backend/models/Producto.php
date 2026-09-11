<?php
class Producto {
    private $db;

    public function __construct() {
        $this->db = obtenerConexion();
    }

    public function listarTodos() {
        $stmt = $this->db->query(
            "SELECT p.*, c.nombre AS categoria_nombre
             FROM productos p
             JOIN categorias c ON p.categoria_id = c.id
             ORDER BY p.id ASC"
        );
        return $stmt->fetchAll();
    }

    public function buscarPorId($id) {
        $stmt = $this->db->prepare(
            "SELECT p.*, c.nombre AS categoria_nombre
             FROM productos p
             JOIN categorias c ON p.categoria_id = c.id
             WHERE p.id = :id"
        );
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function buscarPorTermino($termino) {
        $stmt = $this->db->prepare(
            "SELECT p.*, c.nombre AS categoria_nombre
             FROM productos p
             JOIN categorias c ON p.categoria_id = c.id
             WHERE p.nombre LIKE :termino
             ORDER BY p.nombre ASC
             LIMIT 5"
        );
        $stmt->execute(['termino' => '%' . $termino . '%']);
        return $stmt->fetchAll();
    }
        /** Productos con inventario igual o por debajo del umbral. */
    public function stockBajo($umbral = 5) {
        $stmt = $this->db->prepare(
            "SELECT id, nombre, stock, categoria_id
             FROM productos
             WHERE stock <= :umbral AND disponible = 1
             ORDER BY stock ASC"
        );
        $stmt->execute(['umbral' => (int)$umbral]);
        return $stmt->fetchAll();
    }

    public function buscarVariosPorId(array $ids) {
        if (empty($ids)) return [];
        $marcadores = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $this->db->prepare("SELECT * FROM productos WHERE id IN ($marcadores)");
        $stmt->execute($ids);
        return $stmt->fetchAll();
    }

    // ✅ Crear producto con todos los campos
    public function crear($datos) {
        $stmt = $this->db->prepare(
            "INSERT INTO productos (
                categoria_id, nombre, descripcion, precio, precio_anterior,
                stock, disponible, imagen_url, icono, badge, requiere_orden_medica
            ) VALUES (
                :categoria_id, :nombre, :descripcion, :precio, :precio_anterior,
                :stock, :disponible, :imagen_url, :icono, :badge, :requiere_orden_medica
            )"
        );
        $stmt->execute([
            ':categoria_id' => $datos['categoria_id'],
            ':nombre'       => $datos['nombre'],
            ':descripcion'  => $datos['descripcion'] ?? '',
            ':precio'       => $datos['precio'],
            ':precio_anterior' => $datos['precio_anterior'] ?? null,
            ':stock'        => $datos['stock'] ?? 0,
            ':disponible'   => $datos['disponible'] ?? 1,
            ':imagen_url'   => $datos['imagen_url'] ?? '',
            ':icono'        => $datos['icono'] ?? '📦',
            ':badge'        => $datos['badge'] ?? '',
            ':requiere_orden_medica' => $datos['requiere_orden_medica'] ?? 0
        ]);
        return $this->db->lastInsertId();
    }

    // ✅ Actualizar producto con todos los campos
    public function actualizar($id, $datos) {
        $stmt = $this->db->prepare(
            "UPDATE productos SET
                categoria_id = :categoria_id,
                nombre = :nombre,
                descripcion = :descripcion,
                precio = :precio,
                precio_anterior = :precio_anterior,
                stock = :stock,
                disponible = :disponible,
                imagen_url = :imagen_url,
                icono = :icono,
                badge = :badge,
                requiere_orden_medica = :requiere_orden_medica
             WHERE id = :id"
        );
        return $stmt->execute([
            ':id' => $id,
            ':categoria_id' => $datos['categoria_id'],
            ':nombre'       => $datos['nombre'],
            ':descripcion'  => $datos['descripcion'] ?? '',
            ':precio'       => $datos['precio'],
            ':precio_anterior' => $datos['precio_anterior'] ?? null,
            ':stock'        => $datos['stock'] ?? 0,
            ':disponible'   => $datos['disponible'] ?? 1,
            ':imagen_url'   => $datos['imagen_url'] ?? '',
            ':icono'        => $datos['icono'] ?? '📦',
            ':badge'        => $datos['badge'] ?? '',
            ':requiere_orden_medica' => $datos['requiere_orden_medica'] ?? 0
        ]);
    }

    public function eliminar($id) {
        $stmt = $this->db->prepare("DELETE FROM productos WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    public function contarTotal() {
        return $this->db->query("SELECT COUNT(*) AS total FROM productos")->fetch()['total'];
    }
}