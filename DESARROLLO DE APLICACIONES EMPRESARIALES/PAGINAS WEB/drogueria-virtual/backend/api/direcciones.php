<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../controllers/DireccionController.php';

$controlador = new DireccionController();
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':
        $controlador->listar();
        break;
    case 'POST':
        $controlador->crear();
        break;
    case 'PUT':
        parse_str(file_get_contents('php://input'), $_PUT); // no usado, mantenemos ID por query
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $controlador->actualizar($id);
        break;
    case 'DELETE':
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $controlador->eliminar($id);
        break;
    default:
        responderError('Método no permitido.', 405);
}