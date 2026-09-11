<?php
class Calificacion {
    private $db;

    public function __construct() {
        $this->db = obtenerConexion();
    }

    public function crear($usuarioId, $pedidoId, $puntuacion, $clasificacion, $comentario) {
        $stmt = $this->db->prepare(
            "INSERT INTO calificaciones (usuario_id, pedido_id, puntuacion, clasificacion, comentario)
             VALUES (:uid, :pedido, :puntuacion, :clasificacion, :comentario)"
        );
        $stmt->execute([
            'uid' => $usuarioId,
            'pedido' => $pedidoId,
            'puntuacion' => $puntuacion,
            'clasificacion' => $clasificacion,
            'comentario' => $comentario
        ]);
        return $this->db->lastInsertId();
    }

    public function yaCalificado($pedidoId) {
        $stmt = $this->db->prepare("SELECT COUNT(*) AS total FROM calificaciones WHERE pedido_id = :pedido");
        $stmt->execute(['pedido' => $pedidoId]);
        return $stmt->fetch()['total'] > 0;
    }

    public function pedidosSinCalificar($usuarioId) {
        $stmt = $this->db->prepare(
            "SELECT p.id, p.total, p.fecha_pedido
             FROM pedidos p
             WHERE p.usuario_id = :uid
               AND p.id NOT IN (SELECT pedido_id FROM calificaciones WHERE pedido_id IS NOT NULL)
             ORDER BY p.fecha_pedido DESC"
        );
        $stmt->execute(['uid' => $usuarioId]);
        return $stmt->fetchAll();
    }

    public function listarPorUsuario($usuarioId) {
        $stmt = $this->db->prepare(
            "SELECT c.*, p.id AS numero_pedido
             FROM calificaciones c
             LEFT JOIN pedidos p ON c.pedido_id = p.id
             WHERE c.usuario_id = :uid
             ORDER BY c.fecha DESC"
        );
        $stmt->execute(['uid' => $usuarioId]);
        return $stmt->fetchAll();
    }

    public function listarTodas() {
        $stmt = $this->db->query(
            "SELECT c.*, u.nombre AS usuario_nombre, u.email AS usuario_email
             FROM calificaciones c
             JOIN usuarios u ON c.usuario_id = u.id
             ORDER BY c.fecha DESC"
        );
        return $stmt->fetchAll();
    }

    public function obtenerEstadisticas() {
        $stmt = $this->db->query(
            "SELECT clasificacion, COUNT(*) AS total FROM calificaciones GROUP BY clasificacion"
        );
        $conteos = $stmt->fetchAll();

        $totalGeneral = array_sum(array_column($conteos, 'total'));
        $resultado = ['Excelente' => 0, 'Buena' => 0, 'Regular' => 0, 'Mala' => 0];

        foreach ($conteos as $fila) {
            $resultado[$fila['clasificacion']] = $totalGeneral > 0
                ? round(($fila['total'] / $totalGeneral) * 100, 1)
                : 0;
        }

        $promedio = $this->db->query("SELECT AVG(puntuacion) AS promedio FROM calificaciones")->fetch()['promedio'];

        return [
            'porcentajes' => $resultado,
            'promedio' => $promedio ? round($promedio, 1) : 0,
            'total' => (int)$totalGeneral
        ];
    }
}