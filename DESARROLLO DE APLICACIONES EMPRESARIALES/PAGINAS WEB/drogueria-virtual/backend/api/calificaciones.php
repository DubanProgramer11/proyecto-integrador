<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../controllers/CalificacionController.php';

$controlador = new CalificacionController();
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    $controlador->crear();
} elseif ($metodo === 'GET' && isset($_GET['pendientes'])) {
    $controlador->pedidosPendientes();
} elseif ($metodo === 'GET' && isset($_GET['estadisticas'])) {
    $controlador->estadisticas();
} elseif ($metodo === 'GET' && isset($_GET['todas'])) {
    $controlador->listarTodas();
} elseif ($metodo === 'GET') {
    $controlador->listarPropias();
} else {
    responderError('Método no permitido.', 405);
}