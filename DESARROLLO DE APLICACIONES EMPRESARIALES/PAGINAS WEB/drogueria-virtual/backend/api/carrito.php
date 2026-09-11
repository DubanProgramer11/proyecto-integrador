<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../controllers/CarritoController.php';

$controlador = new CarritoController();
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $controlador->listar();
} elseif ($metodo === 'POST') {
    if (isset($_GET['accion']) && $_GET['accion'] === 'vaciar') {
        $controlador->vaciar();
    } else {
        $controlador->agregar();
    }
} elseif ($metodo === 'PUT') {
    $itemId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $controlador->actualizar($itemId);
} elseif ($metodo === 'DELETE') {
    $itemId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $controlador->eliminar($itemId);
} else {
    responderError('Método no permitido.', 405);
}