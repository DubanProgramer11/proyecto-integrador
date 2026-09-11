<?php
class Direccion {
    private $db;

    public function __construct() {
        $this->db = obtenerConexion();
    }

    public function listarPorUsuario($usuarioId) {
        $stmt = $this->db->prepare("SELECT * FROM direcciones WHERE usuario_id = :uid ORDER BY predeterminada DESC, id DESC");
        $stmt->execute(['uid' => $usuarioId]);
        return $stmt->fetchAll();
    }

    public function buscarPorId($id, $usuarioId) {
        $stmt = $this->db->prepare("SELECT * FROM direcciones WHERE id = :id AND usuario_id = :uid");
        $stmt->execute(['id' => $id, 'uid' => $usuarioId]);
        return $stmt->fetch();
    }

    public function contarPorUsuario($usuarioId) {
        $stmt = $this->db->prepare("SELECT COUNT(*) AS total FROM direcciones WHERE usuario_id = :uid");
        $stmt->execute(['uid' => $usuarioId]);
        return $stmt->fetch()['total'];
    }

    public function crear($usuarioId, $datos) {
        $stmt = $this->db->prepare(
            "INSERT INTO direcciones (usuario_id, etiqueta, direccion, ciudad, barrio, referencia, telefono_contacto, predeterminada)
             VALUES (:uid, :etiqueta, :direccion, :ciudad, :barrio, :referencia, :telefono, :predeterminada)"
        );
        $stmt->execute([
            'uid' => $usuarioId,
            'etiqueta' => $datos['etiqueta'],
            'direccion' => $datos['direccion'],
            'ciudad' => $datos['ciudad'],
            'barrio' => $datos['barrio'],
            'referencia' => $datos['referencia'],
            'telefono' => $datos['telefono'],
            'predeterminada' => $datos['predeterminada'] ? 1 : 0
        ]);
        return $this->db->lastInsertId();
    }

    public function actualizar($id, $usuarioId, $datos) {
        $stmt = $this->db->prepare(
            "UPDATE direcciones SET etiqueta = :etiqueta, direccion = :direccion, ciudad = :ciudad,
                barrio = :barrio, referencia = :referencia, telefono_contacto = :telefono, predeterminada = :predeterminada
             WHERE id = :id AND usuario_id = :uid"
        );
        return $stmt->execute([
            'etiqueta' => $datos['etiqueta'],
            'direccion' => $datos['direccion'],
            'ciudad' => $datos['ciudad'],
            'barrio' => $datos['barrio'],
            'referencia' => $datos['referencia'],
            'telefono' => $datos['telefono'],
            'predeterminada' => $datos['predeterminada'] ? 1 : 0,
            'id' => $id,
            'uid' => $usuarioId
        ]);
    }

    public function eliminar($id, $usuarioId) {
        $stmt = $this->db->prepare("DELETE FROM direcciones WHERE id = :id AND usuario_id = :uid");
        return $stmt->execute(['id' => $id, 'uid' => $usuarioId]);
    }

    public function quitarPredeterminadaDeOtras($usuarioId, $exceptoId = null) {
        $sql = "UPDATE direcciones SET predeterminada = 0 WHERE usuario_id = :uid";
        $params = ['uid' => $usuarioId];
        if ($exceptoId) {
            $sql .= " AND id != :id";
            $params['id'] = $exceptoId;
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
    }
}