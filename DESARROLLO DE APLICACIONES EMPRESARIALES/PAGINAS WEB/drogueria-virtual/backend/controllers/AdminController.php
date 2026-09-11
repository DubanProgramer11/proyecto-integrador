<?php

require_once __DIR__ . '/../models/Pedido.php';
require_once __DIR__ . '/../models/OrdenMedica.php';
require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../models/Producto.php';
require_once __DIR__ . '/../models/Comentario.php';
require_once __DIR__ . '/../models/Calificacion.php';
require_once __DIR__ . '/../models/Conversacion.php';

class AdminController {

    public function __construct() {
        // Un solo punto de control para TODO el controlador.
        exigirRol(['admin', 'superadmin']);
    }

    /* ----------------------------------------------------------
       Lee los filtros que llegan por la URL (?estado=...&desde=...)
       Solo aceptamos las claves que conocemos: si llega cualquier
       otro parámetro, se ignora.
       ---------------------------------------------------------- */
    private function filtrosDesdeUrl() {
        return [
            'estado'   => $_GET['estado']   ?? null,
            'desde'    => $_GET['desde']    ?? null,
            'hasta'    => $_GET['hasta']    ?? null,
            'busqueda' => $_GET['busqueda'] ?? null,
            'rol'      => $_GET['rol']      ?? null
        ];
    }

    /* ==========================================================
       PEDIDOS
       ========================================================== */

    public function listarPedidos() {
        $modelo = new Pedido();
        $pedidos = $modelo->listarTodos($this->filtrosDesdeUrl());
        responderExito('Pedidos obtenidos.', $pedidos);
    }

    public function detallePedido($id) {
        $modelo = new Pedido();
        $pedido = $modelo->obtenerDetalleAdmin($id);
        if (!$pedido) {
            responderError('Pedido no encontrado.', 404);
        }
        responderExito('Detalle del pedido.', $pedido);
    }

    public function cambiarEstadoPedido() {
        $datos = obtenerCuerpoJSON();
        $id     = $datos['id']     ?? null;
        $estado = $datos['estado'] ?? null;

        if (!$id || !$estado) {
            responderError('Faltan datos: se requiere id y estado.', 422);
        }

        $modelo = new Pedido();
        if (!$modelo->actualizarEstado((int)$id, $estado)) {
            responderError(
                'Estado no válido o pedido inexistente. Estados permitidos: '
                . implode(', ', Pedido::ESTADOS), 422
            );
        }

        responderExito('Estado del pedido actualizado.', ['id' => (int)$id, 'estado' => $estado]);
    }

    /* ==========================================================
       ÓRDENES MÉDICAS

       Recordatorio de privacidad (requisito 8): el LISTADO solo
       entrega metadatos. El texto extraído del documento aparece
       únicamente en el detalle individual.
       ========================================================== */

    public function listarOrdenesMedicas() {
        $modelo = new OrdenMedica();
        $ordenes = $modelo->listarTodas($this->filtrosDesdeUrl());
        responderExito('Órdenes médicas obtenidas.', $ordenes);
    }

    public function detalleOrdenMedica($id) {
        $modelo = new OrdenMedica();
        $orden = $modelo->obtenerDetalleAdmin($id);
        if (!$orden) {
            responderError('Orden médica no encontrada.', 404);
        }
        responderExito('Detalle de la orden médica.', $orden);
    }

    /* ==========================================================
       CLIENTES
       ========================================================== */

    public function listarClientes() {
        $filtros = $this->filtrosDesdeUrl();
        $filtros['rol'] = 'cliente'; // esta vista es solo de clientes

        $modelo = new Usuario();
        responderExito('Clientes obtenidos.', $modelo->listarTodos($filtros));
    }

    public function fichaCliente($id) {
        $modelo = new Usuario();
        $cliente = $modelo->fichaAdmin($id);
        if (!$cliente) {
            responderError('Cliente no encontrado.', 404);
        }
        responderExito('Ficha del cliente.', $cliente);
    }

    /* ==========================================================
       RESUMEN DEL DASHBOARD

       Una sola petición devuelve todos los números del panel.
       Es preferible a que el frontend haga ocho llamadas sueltas:
       menos viajes al servidor y datos coherentes entre sí.
       ========================================================== */

    public function resumen() {
        $desde = $_GET['desde'] ?? null;
        $hasta = $_GET['hasta'] ?? null;

        $pedidoModelo       = new Pedido();
        $usuarioModelo      = new Usuario();
        $ordenModelo        = new OrdenMedica();
        $productoModelo     = new Producto();
        $comentarioModelo   = new Comentario();
        $calificacionModelo = new Calificacion();
        $conversacionModelo = new Conversacion();

        $resumen = [
            'rango' => ['desde' => $desde, 'hasta' => $hasta],

            'totales' => [
                'clientes'        => (int)$usuarioModelo->contarTotal(),
                'pedidos'         => (int)$pedidoModelo->contarTotal(),
                'productos'       => count($productoModelo->listarTodos()),
                'ordenes_medicas' => (int)$ordenModelo->contarTotal(),
                'conversaciones'  => (int)$conversacionModelo->contarTotal()
            ],

            'pedidos_por_estado' => $pedidoModelo->contarPorEstado(),
            'ventas'             => $pedidoModelo->resumenVentas($desde, $hasta),
            'pedidos_recientes'  => $pedidoModelo->listarRecientes(5),
            'productos_top'      => $pedidoModelo->masVendidos(5),

            'ordenes_por_estado' => $ordenModelo->contarPorEstado(),
            'usuarios_por_rol'   => $usuarioModelo->contarPorRol(),

            'atencion' => [
                'calificaciones'       => $calificacionModelo->obtenerEstadisticas(),
                'comentarios_por_tipo' => $comentarioModelo->contarPorTipo(),
                'comentarios_pendientes' => (int)$comentarioModelo->contarSinRevisar(),
                'conversaciones_por_estado' => $conversacionModelo->contarPorEstado()
            ],

            'nuevos_en_rango' => [
                'clientes'        => $usuarioModelo->contarClientesPorRango($desde, $hasta),
                'ordenes_medicas' => $ordenModelo->contarPorRango($desde, $hasta)
            ]
        ];

        responderExito('Resumen administrativo.', $resumen);
    }
}