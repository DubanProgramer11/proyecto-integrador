<?php
/**
 * Validaciones reutilizables del lado del servidor.
 * IMPORTANTE: el JS ya valida en el navegador (Fase 5), pero eso NUNCA es suficiente,
 * porque cualquiera puede saltarse el frontend y enviar peticiones directas a la API.
 * Por eso todo se vuelve a validar aquí.
 */

function validarEmailServidor($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validarTelefonoServidor($telefono) {
    return preg_match('/^[0-9]{7,10}$/', $telefono) === 1;
}

function validarSoloLetrasServidor($texto) {
    return preg_match('/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/u', trim($texto)) === 1;
}

function validarPasswordServidor($password) {
    return strlen($password) >= 8;
}

function campoVacio($valor) {
    return !isset($valor) || trim($valor) === '';
}