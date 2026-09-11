<?php


require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../controllers/AdminController.php';

$controlador = new AdminController(); // aquí ya se validó el rol
$metodo  = $_SERVER['REQUEST_METHOD'];
$recurso = $_GET['recurso'] ?? '';
$id      = isset($_GET['id']) ? (int)$_GET['id'] : null;

if ($metodo === 'GET') {

    switch ($recurso) {
        case 'resumen':
            $controlador->resumen();
            break;
        case 'pedidos':
            $controlador->listarPedidos();
            break;
        case 'pedido':
            if (!$id) responderError('Falta el parámetro id.', 422);
            $controlador->detallePedido($id);
            break;
        case 'ordenes-medicas':
            $controlador->listarOrdenesMedicas();
            break;
        case 'orden-medica':
            if (!$id) responderError('Falta el parámetro id.', 422);
            $controlador->detalleOrdenMedica($id);
            break;
        case 'clientes':
            $controlador->listarClientes();
            break;
        case 'cliente':
            if (!$id) responderError('Falta el parámetro id.', 422);
            $controlador->fichaCliente($id);
            break;
        default:
            responderError('Recurso no reconocido: "' . htmlspecialchars($recurso) . '".', 404);
    }

} elseif ($metodo === 'PUT') {

    if ($recurso === 'pedido-estado') {
        $controlador->cambiarEstadoPedido();
    } else {
        responderError('Recurso no reconocido para PUT.', 404);
    }

} else {
    responderError('Método no permitido.', 405);
}