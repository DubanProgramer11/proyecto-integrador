<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../controllers/ChatbotController.php';

$controlador = new ChatbotController();

// ✅ Verificar inactividad (4 minutos) sin destruir la sesión global
if (session_status() === PHP_SESSION_NONE) session_start();
if (isset($_SESSION['chatbot_ultima_actividad'])) {
    $inactivo = time() - $_SESSION['chatbot_ultima_actividad'];
    if ($inactivo > 240) { // 4 minutos
        // Cerrar conversación activa si existe
        if (isset($_SESSION['conversacion_id'])) {
            $controlador->finalizarPorInactividad($_SESSION['conversacion_id']);
            unset($_SESSION['conversacion_id']);
        }
        // Limpiar datos de usuario de chat, pero NO destruir sesión global
        unset($_SESSION['conversacion_usuario_id']);
        // Reiniciar timestamp para evitar bucles
        $_SESSION['chatbot_ultima_actividad'] = time();
    }
}
// Actualizar timestamp de actividad
$_SESSION['chatbot_ultima_actividad'] = time();

$metodo = $_SERVER['REQUEST_METHOD'];
$accion = $_GET['accion'] ?? null;

if ($metodo === 'POST' && $accion === 'finalizar') {
    $controlador->finalizar();
} elseif ($metodo === 'POST' && $accion === 'escalar') {
    $controlador->escalar();
} elseif ($metodo === 'POST') {
    $controlador->enviarMensaje();
} elseif ($metodo === 'GET' && isset($_GET['conversacion_id'])) {
    $controlador->historial((int)$_GET['conversacion_id']);
} elseif ($metodo === 'GET' && isset($_GET['todas'])) {
    $controlador->listarTodas();
} else {
    responderError('Método no permitido.', 405);
}