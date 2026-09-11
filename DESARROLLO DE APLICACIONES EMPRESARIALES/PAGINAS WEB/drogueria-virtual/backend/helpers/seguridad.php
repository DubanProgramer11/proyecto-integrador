<?php
/**
 * Funciones relacionadas con seguridad: hashing de contraseñas y sesiones.
 * Ampliaremos este archivo en la Fase 18 con protección CSRF, límites de intentos, etc.
 */

function hashearPassword($password) {
    // password_hash usa BCRYPT por defecto: nunca guardamos contraseñas en texto plano.
    return password_hash($password, PASSWORD_BCRYPT);
}

function verificarPassword($password, $hash) {
    return password_verify($password, $hash);
}

function crearSesionUsuario($usuario) {
    $_SESSION['usuario_id'] = $usuario['id'];
    $_SESSION['usuario_nombre'] = $usuario['nombre'];
    $_SESSION['usuario_email'] = $usuario['email'];
    $_SESSION['usuario_rol'] = $usuario['rol_nombre'];
}

function haySesionActiva() {
    return isset($_SESSION['usuario_id']);
}

function obtenerUsuarioSesion() {
    if (!haySesionActiva()) return null;
    return [
        'id' => $_SESSION['usuario_id'],
        'nombre' => $_SESSION['usuario_nombre'],
        'email' => $_SESSION['usuario_email'],
        'rol' => $_SESSION['usuario_rol']
    ];
}

function cerrarSesionUsuario() {
    $_SESSION = [];
    session_destroy();
}

/**
 * Exige que exista sesión activa; si no, corta la ejecución con error 401.
 * La usaremos en endpoints protegidos (carrito, pedidos, perfil, etc.)
 */
function exigirSesion() {
    if (!haySesionActiva()) {
        responderError('Debes iniciar sesión para realizar esta acción.', 401);
    }
}

/**
 * Exige un rol específico (o superior). La usaremos en endpoints del panel admin.
 */
function exigirRol($rolesPermitidos) {
    exigirSesion();
    if (!in_array($_SESSION['usuario_rol'], $rolesPermitidos)) {
        responderError('No tienes permisos para realizar esta acción.', 403);
    }
}