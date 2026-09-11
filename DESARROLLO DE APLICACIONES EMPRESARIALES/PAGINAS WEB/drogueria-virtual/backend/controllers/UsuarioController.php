<?php


require_once __DIR__ . '/../models/Usuario.php';

class UsuarioController {
    private $modelo;

    public function __construct() {
        exigirRol(['superadmin']);
        $this->modelo = new Usuario();
    }

    /** Lista TODOS los usuarios, incluidos administradores. */
    public function listar() {
        $filtros = [
            'rol'      => $_GET['rol']      ?? null,
            'busqueda' => $_GET['busqueda'] ?? null,
            'activo'   => $_GET['activo']   ?? null
        ];
        responderExito('Usuarios obtenidos.', $this->modelo->listarTodos($filtros));
    }

    /** Cambia el rol de un usuario. */
    public function cambiarRol() {
        $datos = obtenerCuerpoJSON();
        $id  = isset($datos['id']) ? (int)$datos['id'] : null;
        $rol = $datos['rol'] ?? null;

        if (!$id || !$rol) {
            responderError('Se requiere id y rol.', 422);
        }

        // Candado 1: nadie modifica su propio rol.
        // Evita que un superadmin se degrade por error y quede sin acceso.
        if ($id === (int)$_SESSION['usuario_id']) {
            responderError('No puedes cambiar tu propio rol.', 403);
        }

        // Candado 2: no dejar el sistema sin superadministradores.
        $usuario = $this->modelo->buscarPorId($id);
        if (!$usuario) {
            responderError('Usuario no encontrado.', 404);
        }
        if ($usuario['rol_nombre'] === 'superadmin' && $rol !== 'superadmin') {
            if ($this->modelo->contarSuperadminsActivos() <= 1) {
                responderError('No puedes degradar al último superadministrador activo.', 409);
            }
        }

        if (!$this->modelo->cambiarRol($id, $rol)) {
            responderError('El rol indicado no existe.', 422);
        }

        responderExito('Rol actualizado correctamente.', ['id' => $id, 'rol' => $rol]);
    }

    /** Activa o desactiva una cuenta. No se borran usuarios. */
    public function cambiarEstado() {
        $datos = obtenerCuerpoJSON();
        $id     = isset($datos['id']) ? (int)$datos['id'] : null;
        $activo = $datos['activo'] ?? null;

        if (!$id || $activo === null) {
            responderError('Se requiere id y activo (0 o 1).', 422);
        }

        if ($id === (int)$_SESSION['usuario_id']) {
            responderError('No puedes desactivar tu propia cuenta.', 403);
        }

        $usuario = $this->modelo->buscarPorId($id);
        if (!$usuario) {
            responderError('Usuario no encontrado.', 404);
        }
        if ($usuario['rol_nombre'] === 'superadmin' && (int)$activo === 0) {
            if ($this->modelo->contarSuperadminsActivos() <= 1) {
                responderError('No puedes desactivar al último superadministrador activo.', 409);
            }
        }

        $this->modelo->cambiarEstadoActivo($id, (int)$activo);
        responderExito(
            (int)$activo === 1 ? 'Cuenta activada.' : 'Cuenta desactivada.',
            ['id' => $id, 'activo' => (int)$activo]
        );
    }

    /** Ficha completa de un usuario. */
    public function ficha($id) {
        $usuario = $this->modelo->fichaAdmin($id);
        if (!$usuario) {
            responderError('Usuario no encontrado.', 404);
        }
        responderExito('Ficha del usuario.', $usuario);
    }
}