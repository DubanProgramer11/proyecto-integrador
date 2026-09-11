<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../controllers/PedidoController.php';

$controlador = new PedidoController();
$metodo = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($metodo) {
    case 'POST':
        $controlador->crear();
        break;
    case 'GET':
        if ($id) {
            $controlador->detalle($id);
        } else {
            $controlador->listar();
        }
        break;
    case 'PUT':
        if (!$id) responderError('ID requerido.', 400);
        $controlador->cambiarEstado($id);
        break;
    default:
        responderError('Método no permitido.', 405);
}