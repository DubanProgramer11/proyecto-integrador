<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../controllers/ConversacionController.php';

$controlador = new ConversacionController();
$metodo = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($metodo) {
    case 'GET':
        if ($id) {
            $controlador->detalle($id);
        } else {
            $controlador->listar();
        }
        break;

    case 'PUT':
        if (!$id) {
            responderError('Falta el id de la conversación.', 400);
        }
        $datos = json_decode(file_get_contents('php://input'), true) ?? [];
        $controlador->cambiarEstado($id, $datos);
        break;

    default:
        responderError('Método no permitido.', 405);
}