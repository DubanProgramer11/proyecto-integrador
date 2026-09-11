<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../controllers/ComentarioController.php';

$controlador = new ComentarioController();
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    $controlador->crear();
} elseif ($metodo === 'PUT' && isset($_GET['id'])) {
    $controlador->marcarRevisado((int)$_GET['id']);
} elseif ($metodo === 'GET' && isset($_GET['todos'])) {
    $controlador->listarTodos();
} elseif ($metodo === 'GET') {
    $controlador->listarPropios();
} else {
    responderError('Método no permitido.', 405);
}