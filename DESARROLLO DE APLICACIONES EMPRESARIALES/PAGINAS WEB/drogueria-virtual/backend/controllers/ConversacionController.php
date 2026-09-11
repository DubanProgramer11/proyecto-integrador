<?php
require_once __DIR__ . '/../models/Conversacion.php';

/**
 * Gestión de conversaciones del chatbot desde el panel.
 * Todo aquí exige rol administrativo: son datos de otros usuarios.
 */
class ConversacionController {

    private $modelo;

    public function __construct() {
        exigirRol(['admin', 'superadmin']);
        $this->modelo = new Conversacion();
    }

    /** GET conversaciones-admin.php -> listado + contadores */
    public function listar() {
        $conversaciones = $this->modelo->listarTodas();

        // Filtros en PHP: el listado de un proyecto local es pequeño
        // y así no hay que tocar el modelo, que ya funciona.
        $estado = $_GET['estado'] ?? '';
        $busqueda = trim($_GET['busqueda'] ?? '');

        if ($estado !== '') {
            $conversaciones = array_values(array_filter($conversaciones, function ($c) use ($estado) {
                return $c['estado'] === $estado;
            }));
        }

        if ($busqueda !== '') {
            $conversaciones = array_values(array_filter($conversaciones, function ($c) use ($busqueda) {
                return stripos($c['usuario_nombre'] ?? '', $busqueda) !== false
                    || stripos($c['usuario_email'] ?? '', $busqueda) !== false
                    || (string)$c['id'] === $busqueda;
            }));
        }

        $porEstado = [];
        foreach ($this->modelo->contarPorEstado() as $fila) {
            $porEstado[$fila['estado']] = (int)$fila['total'];
        }

        responderExito('Conversaciones obtenidas.', [
            'conversaciones' => $conversaciones,
            'total'          => (int)$this->modelo->contarTotal(),
            'por_estado'     => $porEstado
        ]);
    }

    /** GET conversaciones-admin.php?id=5 -> conversación + mensajes */
    public function detalle($id) {
        $conversacion = $this->modelo->buscarPorId((int)$id);
        if (!$conversacion) {
            responderError('Conversación no encontrada.', 404);
        }

        $conversacion['mensajes'] = $this->modelo->listarMensajes((int)$id);
        responderExito('Detalle obtenido.', $conversacion);
    }

    /** PUT conversaciones-admin.php?id=5 { estado: "cerrada" } */
    public function cambiarEstado($id, $datos) {
        $estadosValidos = ['abierta', 'cerrada', 'escalada'];
        $estado = $datos['estado'] ?? '';

        if (!in_array($estado, $estadosValidos, true)) {
            responderError('Estado no válido. Usa: ' . implode(', ', $estadosValidos), 422);
        }

        if (!$this->modelo->buscarPorId((int)$id)) {
            responderError('Conversación no encontrada.', 404);
        }

        $this->modelo->marcarEstado((int)$id, $estado);
        responderExito('Estado actualizado.', ['id' => (int)$id, 'estado' => $estado]);
    }
}