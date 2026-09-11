<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../models/Usuario.php';

exigirSesion();

if ($_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    $datos = obtenerCuerpoJSON();

    $nombre = $datos['nombre'] ?? '';
    $telefono = $datos['telefono'] ?? '';

    $errores = [];
    if (!validarSoloLetrasServidor($nombre)) {
        $errores['nombre'] = 'Ingresa un nombre válido.';
    }
    if (!validarTelefonoServidor($telefono)) {
        $errores['telefono'] = 'Ingresa un teléfono válido (7 a 10 dígitos).';
    }
    if (!empty($errores)) {
        responderError('Revisa los datos ingresados.', 422, $errores);
    }

    $usuarioModelo = new Usuario();
    $usuarioModelo->actualizarPerfil($_SESSION['usuario_id'], $nombre, $telefono);

    // Actualizamos también el nombre en la sesión activa
    $_SESSION['usuario_nombre'] = $nombre;

    responderExito('Perfil actualizado correctamente.', [
        'nombre' => $nombre,
        'telefono' => $telefono
    ]);
} else {
    responderError('Método no permitido.', 405);
}