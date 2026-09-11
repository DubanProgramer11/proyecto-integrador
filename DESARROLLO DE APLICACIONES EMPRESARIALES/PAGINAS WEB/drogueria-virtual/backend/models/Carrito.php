<?php
class Carrito {
    private $db;

    public function __construct() {
        $this->db = obtenerConexion();
    }

    public function listar($usuarioId) {
    $stmt = $this->db->prepare(
        "SELECT ci.id AS item_id, ci.producto_id, ci.cantidad, 
                p.nombre, p.precio, p.icono, p.categoria_id, p.stock, p.imagen_url,
                c.nombre AS categoria
         FROM carrito_items ci
         JOIN productos p ON ci.producto_id = p.id
         JOIN categorias c ON p.categoria_id = c.id
         WHERE ci.usuario_id = :uid"
    );
    $stmt->execute(['uid' => $usuarioId]);
    return $stmt->fetchAll();
}

    public function buscarItem($usuarioId, $productoId) {
        $stmt = $this->db->prepare("SELECT * FROM carrito_items WHERE usuario_id = :uid AND producto_id = :pid");
        $stmt->execute(['uid' => $usuarioId, 'pid' => $productoId]);
        return $stmt->fetch();
    }

    public function agregar($usuarioId, $productoId, $cantidad) {
        $existente = $this->buscarItem($usuarioId, $productoId);
        if ($existente) {
            $stmt = $this->db->prepare("UPDATE carrito_items SET cantidad = cantidad + :cant WHERE id = :id");
            $stmt->execute(['cant' => $cantidad, 'id' => $existente['id']]);
        } else {
            $stmt = $this->db->prepare("INSERT INTO carrito_items (usuario_id, producto_id, cantidad) VALUES (:uid, :pid, :cant)");
            $stmt->execute(['uid' => $usuarioId, 'pid' => $productoId, 'cant' => $cantidad]);
        }
    }

    public function actualizarCantidad($usuarioId, $itemId, $cantidad) {
        $stmt = $this->db->prepare("UPDATE carrito_items SET cantidad = :cant WHERE id = :id AND usuario_id = :uid");
        return $stmt->execute(['cant' => $cantidad, 'id' => $itemId, 'uid' => $usuarioId]);
    }

    public function eliminarItem($usuarioId, $itemId) {
        $stmt = $this->db->prepare("DELETE FROM carrito_items WHERE id = :id AND usuario_id = :uid");
        return $stmt->execute(['id' => $itemId, 'uid' => $usuarioId]);
    }

    public function vaciar($usuarioId) {
        $stmt = $this->db->prepare("DELETE FROM carrito_items WHERE usuario_id = :uid");
        return $stmt->execute(['uid' => $usuarioId]);
    }
}