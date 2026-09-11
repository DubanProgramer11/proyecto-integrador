<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../controllers/ProductoController.php';

$controlador = new ProductoController();
$metodo = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($metodo) {
    case 'GET':
        if ($id) {
            $controlador->obtener($id);
        } else {
            $controlador->listar();
        }
        break;
    case 'POST':
        $controlador->crear();
        break;
    case 'PUT':
        if (!$id) responderError('ID requerido para actualizar.', 400);
        $controlador->actualizar($id);
        break;
    case 'DELETE':
        if (!$id) responderError('ID requerido para eliminar.', 400);
        $controlador->eliminar($id);
        break;
    default:
        responderError('Método no permitido.', 405);
}