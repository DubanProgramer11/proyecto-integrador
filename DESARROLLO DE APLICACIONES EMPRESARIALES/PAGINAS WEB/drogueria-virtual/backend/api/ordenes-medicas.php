<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../controllers/OrdenMedicaController.php';

$controlador = new OrdenMedicaController();
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST' && isset($_GET['accion']) && $_GET['accion'] === 'confirmar') {
    $controlador->confirmarProductos();
} elseif ($metodo === 'POST') {
    $controlador->subirYAnalizar();
} elseif ($metodo === 'GET' && isset($_GET['id'])) {
    $controlador->detalle((int)$_GET['id']);
} elseif ($metodo === 'GET') {
    $controlador->listar();
} else {
    responderError('Método no permitido.', 405);
}