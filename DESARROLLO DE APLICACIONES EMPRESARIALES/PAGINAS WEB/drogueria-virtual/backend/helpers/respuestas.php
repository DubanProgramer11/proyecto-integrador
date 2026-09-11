<?php
/**
 * Funciones para estandarizar las respuestas JSON de la API.
 * Así todos los endpoints devuelven la misma estructura y el JS del frontend
 * puede manejarlas de forma predecible.
 */

function responderExito($mensaje, $datos = null, $codigo = 200) {
    http_response_code($codigo);
    echo json_encode([
        'exito' => true,
        'mensaje' => $mensaje,
        'datos' => $datos
    ]);
    exit();
}

function responderError($mensaje, $codigo = 400, $errores = null) {
    http_response_code($codigo);
    echo json_encode([
        'exito' => false,
        'mensaje' => $mensaje,
        'errores' => $errores
    ]);
    exit();
}

function obtenerCuerpoJSON() {
    $data = json_decode(file_get_contents('php://input'), true);
    return $data ?? [];
}