<?php
/**
 * Endpoint de login - SOLO POST
 * Maneja preflight OPTIONS para CORS
 */

// 🔹 Responder a preflight OPTIONS (necesario para CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit();
}

// 🔹 Verificar que sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(['exito' => false, 'mensaje' => 'Método no permitido. Usa POST.']);
    exit;
}

// 🔹 Incluir config y controlador
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../controllers/AuthController.php';

$controlador = new AuthController();
$controlador->login();