<?php
require_once __DIR__ . '/../models/Conversacion.php';
require_once __DIR__ . '/../helpers/chatbot-motor.php';

class ChatbotController {
    private $modelo;

    public function __construct() {
        $this->modelo = new Conversacion();
    }

    // Verificar inactividad y cerrar conversación si es necesario
    public function finalizarPorInactividad($conversacionId) {
        $this->modelo->marcarEstado($conversacionId, 'resuelta');
    }

    public function enviarMensaje() {
    $datos = obtenerCuerpoJSON();
    $mensaje = trim($datos['mensaje'] ?? '');
    $conversacionId = $datos['conversacion_id'] ?? null;

    if ($mensaje === '') {
        responderError('Escribe un mensaje.', 422);
    }

    $usuarioId = haySesionActiva() ? $_SESSION['usuario_id'] : null;

    // Si el usuario cambió, cerrar conversación anterior y forzar una nueva
    if ($usuarioId && isset($_SESSION['conversacion_usuario_id']) && $_SESSION['conversacion_usuario_id'] != $usuarioId) {
        if (isset($_SESSION['conversacion_id'])) {
            $this->modelo->marcarEstado($_SESSION['conversacion_id'], 'resuelta');
            unset($_SESSION['conversacion_id']);
        }
        unset($_SESSION['conversacion_usuario_id']);
        $conversacionId = null; // forzar nueva
    }

    // Crear conversación nueva si no existe una activa
    if (!$conversacionId) {
        $conversacionId = $this->modelo->crear($usuarioId);
        $_SESSION['conversacion_id'] = $conversacionId;
        if ($usuarioId) {
            $_SESSION['conversacion_usuario_id'] = $usuarioId;
        }
    }

    // 1. Guardar el mensaje del usuario
    $this->modelo->guardarMensaje($conversacionId, 'usuario', $mensaje);

    // 2. Procesar el mensaje con el motor de reglas
    $db = obtenerConexion();
    $resultado = procesarMensajeChatbot($mensaje, $usuarioId, $db);

    // 3. Guardar la respuesta del bot
    $this->modelo->guardarMensaje($conversacionId, 'bot', $resultado['respuesta']);

    // 4. Si el motor detectó que se necesita un humano, escalar
    if ($resultado['requiere_humano']) {
        $this->modelo->marcarEstado($conversacionId, 'escalada_humano');
    }

    // 5. Responder al frontend — esto es lo que faltaba por completo
    responderExito('Mensaje procesado.', [
        'conversacion_id' => $conversacionId,
        'respuesta'       => $resultado['respuesta'],
        'requiere_humano' => $resultado['requiere_humano']
    ]);
}

    public function historial($conversacionId) {
        responderExito('Historial obtenido.', $this->modelo->listarMensajes($conversacionId));
    }

    public function finalizar() {
        $datos = obtenerCuerpoJSON();
        $conversacionId = $datos['conversacion_id'] ?? null;
        if (!$conversacionId) {
            responderError('Falta el id de la conversación.', 422);
        }
        $this->modelo->marcarEstado($conversacionId, 'resuelta');
        unset($_SESSION['conversacion_id']);
        responderExito('Conversación finalizada.');
    }

    public function escalar() {
        $datos = obtenerCuerpoJSON();
        $conversacionId = $datos['conversacion_id'] ?? null;

        $usuarioId = haySesionActiva() ? $_SESSION['usuario_id'] : null;

        if (!$conversacionId) {
            $conversacionId = $this->modelo->crear($usuarioId);
            $_SESSION['conversacion_id'] = $conversacionId;
        }

        $this->modelo->guardarMensaje($conversacionId, 'usuario', 'Solicitó hablar con un agente humano.');
        $this->modelo->marcarEstado($conversacionId, 'escalada_humano');

        responderExito('Solicitud escalada.', ['conversacion_id' => $conversacionId]);
    }

    // Para el panel admin (Fase 15)
    public function listarTodas() {
        exigirRol(['admin', 'superadmin']);
        responderExito('Conversaciones obtenidas.', $this->modelo->listarTodas());
    }
}