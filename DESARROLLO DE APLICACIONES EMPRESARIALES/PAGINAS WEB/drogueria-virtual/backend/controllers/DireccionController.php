<?php
require_once __DIR__ . '/../models/Direccion.php';

class DireccionController {
    private $modelo;

    public function __construct() {
        exigirSesion();
        $this->modelo = new Direccion();
    }

    public function listar() {
        responderExito('Direcciones obtenidas.', $this->modelo->listarPorUsuario($_SESSION['usuario_id']));
    }

    public function crear() {
        $datos = obtenerCuerpoJSON();

        if (campoVacio($datos['direccion'] ?? '') || campoVacio($datos['ciudad'] ?? '') || campoVacio($datos['telefono'] ?? '')) {
            responderError('La dirección, la ciudad y el teléfono son obligatorios.', 422);
        }

        $usuarioId = $_SESSION['usuario_id'];
        $esPrimera = $this->modelo->contarPorUsuario($usuarioId) == 0;
        $predeterminada = $esPrimera ? true : !empty($datos['predeterminada']);

        $nuevoId = $this->modelo->crear($usuarioId, [
            'etiqueta' => $datos['etiqueta'] ?? 'Casa',
            'direccion' => trim($datos['direccion']),
            'ciudad' => trim($datos['ciudad']),
            'barrio' => trim($datos['barrio'] ?? ''),
            'referencia' => trim($datos['referencia'] ?? ''),
            'telefono' => trim($datos['telefono']),
            'predeterminada' => $predeterminada
        ]);

        if ($predeterminada) {
            $this->modelo->quitarPredeterminadaDeOtras($usuarioId, $nuevoId);
        }

        responderExito('Dirección guardada.', ['id' => $nuevoId], 201);
    }

    public function actualizar($id) {
        $datos = obtenerCuerpoJSON();
        $usuarioId = $_SESSION['usuario_id'];

        if (!$this->modelo->buscarPorId($id, $usuarioId)) {
            responderError('Dirección no encontrada.', 404);
        }

        $predeterminada = !empty($datos['predeterminada']);

        $this->modelo->actualizar($id, $usuarioId, [
            'etiqueta' => $datos['etiqueta'] ?? 'Casa',
            'direccion' => trim($datos['direccion'] ?? ''),
            'ciudad' => trim($datos['ciudad'] ?? ''),
            'barrio' => trim($datos['barrio'] ?? ''),
            'referencia' => trim($datos['referencia'] ?? ''),
            'telefono' => trim($datos['telefono'] ?? ''),
            'predeterminada' => $predeterminada
        ]);

        if ($predeterminada) {
            $this->modelo->quitarPredeterminadaDeOtras($usuarioId, $id);
        }

        responderExito('Dirección actualizada.');
    }

    public function eliminar($id) {
        $usuarioId = $_SESSION['usuario_id'];
        if (!$this->modelo->buscarPorId($id, $usuarioId)) {
            responderError('Dirección no encontrada.', 404);
        }
        $this->modelo->eliminar($id, $usuarioId);
        responderExito('Dirección eliminada.');
    }
}