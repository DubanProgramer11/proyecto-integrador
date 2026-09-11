<?php
require_once __DIR__ . '/../models/Pedido.php';

class PedidoController {
    private $modelo;

    public function __construct() {
        exigirSesion();
        $this->modelo = new Pedido();
    }

    public function cambiarEstado($id) {
        if (!esAdmin()) {
            responderError('No tienes permisos para esta acción.', 403);
        }

        $datos = obtenerCuerpoJSON();
        $nuevoEstado = $datos['estado'] ?? null;
        if (!$nuevoEstado) {
            responderError('El campo "estado" es obligatorio.', 422);
        }

        try {
            $actualizado = $this->modelo->actualizarEstado($id, $nuevoEstado);
            if ($actualizado) {
                responderExito('Estado del pedido actualizado correctamente.');
            } else {
                responderError('No se pudo actualizar el estado.', 500);
            }
        } catch (Exception $e) {
            responderError($e->getMessage(), 400);
        }
    }

    public function crear() {
        $datos = obtenerCuerpoJSON();
        $direccionId = $datos['direccion_id'] ?? null;

        if (!$direccionId) {
            responderError('Selecciona una dirección de entrega.', 422);
        }

        try {
            $pedidoId = $this->modelo->crearDesdeCarrito($_SESSION['usuario_id'], $direccionId);
            responderExito('Pedido creado con éxito.', ['pedido_id' => $pedidoId], 201);
        } catch (Exception $e) {
            responderError($e->getMessage(), 422);
        }
    }

    public function listar() {
        responderExito('Pedidos obtenidos.', $this->modelo->listarPorUsuario($_SESSION['usuario_id']));
    }

    public function detalle($id) {
        $pedido = $this->modelo->obtenerDetalle($id, $_SESSION['usuario_id']);
        if (!$pedido) {
            responderError('Pedido no encontrado.', 404);
        }
        responderExito('Detalle del pedido.', $pedido);
    }
}