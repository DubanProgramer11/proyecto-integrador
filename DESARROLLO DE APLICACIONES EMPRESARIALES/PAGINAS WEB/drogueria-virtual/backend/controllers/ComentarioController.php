<?php
require_once __DIR__ . '/../models/Comentario.php';

class ComentarioController {
    private $modelo;

    public function __construct() {
        $this->modelo = new Comentario();
    }

    public function crear() {
        exigirSesion();
        $datos = obtenerCuerpoJSON();

        $tipo = $datos['tipo'] ?? '';
        $contenido = trim($datos['contenido'] ?? '');
        $tiposValidos = ['comentario', 'queja', 'sugerencia', 'recomendacion'];

        if (!in_array($tipo, $tiposValidos)) {
            responderError('Selecciona un tipo válido.', 422);
        }
        if (campoVacio($contenido) || mb_strlen($contenido) < 5) {
            responderError('Escribe un mensaje de al menos 5 caracteres.', 422);
        }

        $id = $this->modelo->crear($_SESSION['usuario_id'], $tipo, $contenido);
        responderExito('¡Gracias por tu mensaje! Lo tendremos en cuenta.', ['id' => $id], 201);
    }

    public function listarPropios() {
        exigirSesion();
        responderExito('Comentarios obtenidos.', $this->modelo->listarPorUsuario($_SESSION['usuario_id']));
    }

    public function listarTodos() {
        exigirRol(['admin', 'superadmin']);
        $tipo = $_GET['tipo'] ?? null;
        responderExito('Comentarios obtenidos.', $this->modelo->listarTodos($tipo));
    }

    public function marcarRevisado($id) {
        exigirRol(['admin', 'superadmin']);
        $this->modelo->marcarRevisado($id);
        responderExito('Marcado como revisado.');
    }
}