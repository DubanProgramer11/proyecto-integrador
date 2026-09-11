<?php
class Conversacion {
    private $db;

    public function __construct() {
        $this->db = obtenerConexion();
    }

    public function crear($usuarioId) {
        $stmt = $this->db->prepare(
            "INSERT INTO conversaciones (usuario_id, estado) VALUES (:uid, 'abierta')"
        );
        $stmt->execute(['uid' => $usuarioId]);
        return $this->db->lastInsertId();
    }

    public function buscarPorId($id) {
        $stmt = $this->db->prepare("SELECT * FROM conversaciones WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function marcarEstado($id, $estado) {
    $stmt = $this->db->prepare(
        "UPDATE conversaciones SET estado = :estado1, fecha_fin = IF(:estado2 != 'abierta', NOW(), fecha_fin) WHERE id = :id"
    );
    $stmt->execute(['estado1' => $estado, 'estado2' => $estado, 'id' => $id]);
}

    public function guardarMensaje($conversacionId, $emisor, $contenido) {
        $stmt = $this->db->prepare(
            "INSERT INTO mensajes (conversacion_id, emisor, contenido) VALUES (:cid, :emisor, :contenido)"
        );
        $stmt->execute(['cid' => $conversacionId, 'emisor' => $emisor, 'contenido' => $contenido]);
    }

    public function listarMensajes($conversacionId) {
        $stmt = $this->db->prepare(
            "SELECT * FROM mensajes WHERE conversacion_id = :cid ORDER BY fecha_envio ASC"
        );
        $stmt->execute(['cid' => $conversacionId]);
        return $stmt->fetchAll();
    }

    public function listarTodas() {
        $stmt = $this->db->query(
            "SELECT c.*, u.nombre AS usuario_nombre, u.email AS usuario_email,
                    (SELECT COUNT(*) FROM mensajes m WHERE m.conversacion_id = c.id) AS total_mensajes
             FROM conversaciones c
             LEFT JOIN usuarios u ON c.usuario_id = u.id
             ORDER BY c.fecha_inicio DESC"
        );
        return $stmt->fetchAll();
    }

    public function contarPorEstado() {
        $stmt = $this->db->query(
            "SELECT estado, COUNT(*) AS total FROM conversaciones GROUP BY estado"
        );
        return $stmt->fetchAll();
    }

    public function contarTotal() {
        return $this->db->query("SELECT COUNT(*) AS total FROM conversaciones")->fetch()['total'];
    }
}