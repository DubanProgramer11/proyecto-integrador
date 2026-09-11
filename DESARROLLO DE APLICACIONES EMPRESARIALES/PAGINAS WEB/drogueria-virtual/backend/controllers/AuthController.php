<?php
require_once __DIR__ . '/../models/Usuario.php';

class AuthController {

    public function registrar() {
        $datos = obtenerCuerpoJSON();

        $nombre = $datos['nombre'] ?? '';
        $email = $datos['email'] ?? '';
        $telefono = $datos['telefono'] ?? '';
        $password = $datos['password'] ?? '';

        $errores = [];

        if (!validarSoloLetrasServidor($nombre)) {
            $errores['nombre'] = 'Ingresa un nombre válido (mínimo 2 letras).';
        }
        if (!validarEmailServidor($email)) {
            $errores['email'] = 'Ingresa un correo electrónico válido.';
        }
        if (!validarTelefonoServidor($telefono)) {
            $errores['telefono'] = 'Ingresa un teléfono válido (7 a 10 dígitos).';
        }
        if (!validarPasswordServidor($password)) {
            $errores['password'] = 'La contraseña debe tener mínimo 8 caracteres.';
        }

        if (!empty($errores)) {
            responderError('Revisa los datos ingresados.', 422, $errores);
        }

        $usuarioModelo = new Usuario();

        if ($usuarioModelo->buscarPorEmail($email)) {
            responderError('Ya existe una cuenta registrada con este correo.', 409);
        }

        $passwordHash = hashearPassword($password);
        $nuevoId = $usuarioModelo->crear($nombre, $email, $telefono, $passwordHash);

        $usuarioCreado = $usuarioModelo->buscarPorId($nuevoId);
        crearSesionUsuario([
            'id' => $usuarioCreado['id'],
            'nombre' => $usuarioCreado['nombre'],
            'email' => $usuarioCreado['email'],
            'rol_nombre' => $usuarioCreado['rol_nombre']
        ]);

        responderExito('Cuenta creada con éxito.', [
            'id' => $usuarioCreado['id'],
            'nombre' => $usuarioCreado['nombre'],
            'email' => $usuarioCreado['email'],
            'rol' => $usuarioCreado['rol_nombre']
        ], 201);
    }

    public function login() {
        $datos = obtenerCuerpoJSON();

        $email = $datos['email'] ?? '';
        $password = $datos['password'] ?? '';

        if (campoVacio($email) || campoVacio($password)) {
            responderError('Ingresa tu correo y contraseña.', 422);
        }

        $usuarioModelo = new Usuario();
        $usuario = $usuarioModelo->buscarPorEmail($email);

        if (!$usuario || !verificarPassword($password, $usuario['password_hash'])) {
            responderError('Correo o contraseña incorrectos.', 401);
        }

        if ((int)$usuario['activo'] === 0) {
            responderError('Esta cuenta ha sido desactivada. Contacta a soporte.', 403);
        }

        crearSesionUsuario([
            'id' => $usuario['id'],
            'nombre' => $usuario['nombre'],
            'email' => $usuario['email'],
            'rol_nombre' => $usuario['rol_nombre']
        ]);

        responderExito('Inicio de sesión exitoso.', [
            'id' => $usuario['id'],
            'nombre' => $usuario['nombre'],
            'email' => $usuario['email'],
            'rol' => $usuario['rol_nombre']
        ]);
    }

    public function loginAdmin() {
        $datos = obtenerCuerpoJSON();

        $email = $datos['email'] ?? '';
        $password = $datos['password'] ?? '';

        if (campoVacio($email) || campoVacio($password)) {
            responderError('Ingresa tu correo y contraseña.', 422);
        }

        $usuarioModelo = new Usuario();
        $usuario = $usuarioModelo->buscarPorEmail($email);

        if (!$usuario || !verificarPassword($password, $usuario['password_hash'])) {
            responderError('Correo o contraseña incorrectos.', 401);
        }

        if (!in_array($usuario['rol_nombre'], ['admin', 'superadmin'])) {
            responderError('Esta cuenta no tiene permisos de administrador.', 403);
        }

        if ((int)$usuario['activo'] === 0) {
            responderError('Esta cuenta ha sido desactivada.', 403);
        }

        crearSesionUsuario([
            'id' => $usuario['id'],
            'nombre' => $usuario['nombre'],
            'email' => $usuario['email'],
            'rol_nombre' => $usuario['rol_nombre']
        ]);

        responderExito('Acceso concedido.', [
            'id' => $usuario['id'],
            'nombre' => $usuario['nombre'],
            'email' => $usuario['email'],
            'rol' => $usuario['rol_nombre']
        ]);
    }

    public function logout() {
        cerrarSesionUsuario();
        responderExito('Sesión cerrada correctamente.');
    }

        public function sesionActual() {
        $usuario = obtenerUsuarioSesion();
        if (!$usuario) {
            responderError('No hay sesión activa.', 401);
        }

        
        $usuarioModelo = new Usuario();
        $datos = $usuarioModelo->buscarPorId($usuario['id']);
        if ($datos) {
            $usuario['telefono'] = $datos['telefono'];
        }

        responderExito('Sesión activa.', $usuario);
    }
}