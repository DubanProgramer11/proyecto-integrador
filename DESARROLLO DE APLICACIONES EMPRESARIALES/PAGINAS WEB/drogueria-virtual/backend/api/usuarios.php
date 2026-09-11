<?php


require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../controllers/UsuarioController.php';

$controlador = new UsuarioController(); // valida rol superadmin
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET' && isset($_GET['id'])) {
    $controlador->ficha((int)$_GET['id']);

} elseif ($metodo === 'GET') {
    $controlador->listar();

} elseif ($metodo === 'PUT') {
    $accion = $_GET['accion'] ?? '';
    if ($accion === 'rol') {
        $controlador->cambiarRol();
    } elseif ($accion === 'estado') {
        $controlador->cambiarEstado();
    } else {
        responderError('Acción no reconocida. Usa ?accion=rol o ?accion=estado.', 404);
    }

} else {
    responderError('Método no permitido.', 405);
}