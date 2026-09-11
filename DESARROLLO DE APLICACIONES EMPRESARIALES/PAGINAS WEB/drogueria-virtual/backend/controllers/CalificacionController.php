<?php
require_once __DIR__ . '/../models/Calificacion.php';

class CalificacionController {
    private $modelo;

    public function __construct() {
        $this->modelo = new Calificacion();
    }

    public function crear() {
        exigirSesion();
        $datos = obtenerCuerpoJSON();

        $pedidoId = $datos['pedido_id'] ?? null;
        $puntuacion = (int)($datos['puntuacion'] ?? 0);
        $clasificacion = $datos['clasificacion'] ?? '';
        $comentario = trim($datos['comentario'] ?? '');

        $clasificacionesValidas = ['Excelente', 'Buena', 'Regular', 'Mala'];

        if ($puntuacion < 1 || $puntuacion > 5) {
            responderError('La puntuación debe estar entre 1 y 5 estrellas.', 422);
        }
        if (!in_array($clasificacion, $clasificacionesValidas)) {
            responderError('Selecciona una clasificación válida.', 422);
        }
        if ($pedidoId && $this->modelo->yaCalificado($pedidoId)) {
            responderError('Este pedido ya fue calificado anteriormente.', 409);
        }

        $id = $this->modelo->crear($_SESSION['usuario_id'], $pedidoId, $puntuacion, $clasificacion, $comentario);
        responderExito('¡Gracias por tu calificación!', ['id' => $id], 201);
    }

    public function pedidosPendientes() {
        exigirSesion();
        responderExito('Pedidos pendientes por calificar.', $this->modelo->pedidosSinCalificar($_SESSION['usuario_id']));
    }

    public function listarPropias() {
        exigirSesion();
        responderExito('Calificaciones obtenidas.', $this->modelo->listarPorUsuario($_SESSION['usuario_id']));
    }

    public function listarTodas() {
        exigirRol(['admin', 'superadmin']);
        responderExito('Calificaciones obtenidas.', $this->modelo->listarTodas());
    }

    public function estadisticas() {
        exigirRol(['admin', 'superadmin']);
        responderExito('Estadísticas obtenidas.', $this->modelo->obtenerEstadisticas());
    }
}