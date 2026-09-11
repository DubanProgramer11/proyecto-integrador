<?php
require_once __DIR__ . '/../models/Carrito.php';
require_once __DIR__ . '/../models/Producto.php';

class CarritoController {
    private $modelo;

    public function __construct() {
        exigirSesion();
        $this->modelo = new Carrito();
    }

    public function listar() {
        responderExito('Carrito obtenido.', $this->modelo->listar($_SESSION['usuario_id']));
    }

    public function agregar() {
    $datos = obtenerCuerpoJSON();
    $productoId = $datos['producto_id'] ?? null;
    $cantidad = max(1, (int)($datos['cantidad'] ?? 1));

    if (!$productoId) {
        responderError('Falta el producto a agregar.', 422);
    }

    // Obtener el producto para verificar stock
    $productoModel = new Producto();
    $producto = $productoModel->buscarPorId($productoId);
    if (!$producto) {
        responderError('Producto no encontrado.', 404);
    }
    if ((int)$producto['disponible'] !== 1) {
        responderError('Este producto no está disponible.', 400);
    }
    if ($cantidad > (int)$producto['stock']) {
        responderError("Solo hay {$producto['stock']} unidades disponibles.", 400);
    }

    $this->modelo->agregar($_SESSION['usuario_id'], $productoId, $cantidad);
    responderExito('Producto agregado al carrito.');
}

    public function actualizar($itemId) {
        $datos = obtenerCuerpoJSON();
        $cantidad = (int)($datos['cantidad'] ?? 1);

        if ($cantidad <= 0) {
            $this->modelo->eliminarItem($_SESSION['usuario_id'], $itemId);
            responderExito('Producto eliminado del carrito.');
        }

        $this->modelo->actualizarCantidad($_SESSION['usuario_id'], $itemId, $cantidad);
        responderExito('Cantidad actualizada.');
    }

    public function eliminar($itemId) {
        $this->modelo->eliminarItem($_SESSION['usuario_id'], $itemId);
        responderExito('Producto eliminado del carrito.');
    }

    public function vaciar() {
        $this->modelo->vaciar($_SESSION['usuario_id']);
        responderExito('Carrito vaciado.');
    }
}