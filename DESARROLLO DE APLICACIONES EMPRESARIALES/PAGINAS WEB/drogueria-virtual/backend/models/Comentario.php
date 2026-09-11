<?php
class Comentario {
    private $db;

    public function __construct() {
        $this->db = obtenerConexion();
    }

    public function crear($usuarioId, $tipo, $contenido) {
        $stmt = $this->db->prepare(
            "INSERT INTO comentarios (usuario_id, tipo, contenido) VALUES (:uid, :tipo, :contenido)"
        );
        $stmt->execute(['uid' => $usuarioId, 'tipo' => $tipo, 'contenido' => $contenido]);
        return $this->db->lastInsertId();
    }

    public function listarPorUsuario($usuarioId) {
        $stmt = $this->db->prepare("SELECT * FROM comentarios WHERE usuario_id = :uid ORDER BY fecha DESC");
        $stmt->execute(['uid' => $usuarioId]);
        return $stmt->fetchAll();
    }

    public function listarTodos($tipo = null) {
        if ($tipo) {
            $stmt = $this->db->prepare(
                "SELECT c.*, u.nombre AS usuario_nombre, u.email AS usuario_email
                 FROM comentarios c JOIN usuarios u ON c.usuario_id = u.id
                 WHERE c.tipo = :tipo ORDER BY c.fecha DESC"
            );
            $stmt->execute(['tipo' => $tipo]);
        } else {
            $stmt = $this->db->query(
                "SELECT c.*, u.nombre AS usuario_nombre, u.email AS usuario_email
                 FROM comentarios c JOIN usuarios u ON c.usuario_id = u.id
                 ORDER BY c.fecha DESC"
            );
        }
        return $stmt->fetchAll();
    }

    public function marcarRevisado($id) {
        $stmt = $this->db->prepare("UPDATE comentarios SET revisado = 1 WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    public function contarPorTipo() {
        $stmt = $this->db->query("SELECT tipo, COUNT(*) AS total FROM comentarios GROUP BY tipo");
        return $stmt->fetchAll();
    }

    public function contarSinRevisar() {
        return $this->db->query("SELECT COUNT(*) AS total FROM comentarios WHERE revisado = 0")->fetch()['total'];
    }
}