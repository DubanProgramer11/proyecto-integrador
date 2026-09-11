<?php
/**
 * MODELO PEDIDO
 * Tablas: pedidos (id, usuario_id, direccion_id, estado, subtotal, costo_domicilio, total, fecha_pedido)
 *         detalle_pedido (id, pedido_id, producto_id, cantidad, precio_unitario, subtotal)
 */
class Pedido {
    private $db;

    const ESTADOS = ['pendiente', 'confirmado', 'en_camino', 'entregado', 'cancelado'];

    public function __construct() {
        $this->db = obtenerConexion();
    }

    /* =========================================================
       CREACIÓN DEL PEDIDO (checkout)
       ========================================================= */

    public function crearDesdeCarrito($usuarioId, $direccionId) {
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare(
                "SELECT ci.producto_id, ci.cantidad, p.precio, p.stock, p.disponible, p.nombre
                 FROM carrito_items ci
                 JOIN productos p ON ci.producto_id = p.id
                 WHERE ci.usuario_id = :uid"
            );
            $stmt->execute(['uid' => $usuarioId]);
            $items = $stmt->fetchAll();

            if (empty($items)) {
                throw new Exception('El carrito está vacío.');
            }

            foreach ($items as $item) {
                if ((int)$item['disponible'] !== 1) {
                    throw new Exception('El producto "' . $item['nombre'] . '" ya no está disponible.');
                }
                if ((int)$item['cantidad'] > (int)$item['stock']) {
                    throw new Exception('No hay suficiente stock de "' . $item['nombre'] . '". Disponible: ' . $item['stock']);
                }
            }

            $subtotal = 0;
            foreach ($items as $item) {
                $subtotal += $item['precio'] * $item['cantidad'];
            }
            $domicilio = ($subtotal >= 80000) ? 0 : 6000;
            $total = $subtotal + $domicilio;

            $stmtPedido = $this->db->prepare(
                "INSERT INTO pedidos (usuario_id, direccion_id, estado, subtotal, costo_domicilio, total)
                 VALUES (:uid, :did, 'pendiente', :subtotal, :domicilio, :total)"
            );
            $stmtPedido->execute([
                'uid' => $usuarioId,
                'did' => $direccionId,
                'subtotal' => $subtotal,
                'domicilio' => $domicilio,
                'total' => $total
            ]);
            $pedidoId = $this->db->lastInsertId();

            $stmtDetalle = $this->db->prepare(
                "INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
                 VALUES (:pid, :prod, :cant, :precio, :sub)"
            );
            $stmtStock = $this->db->prepare(
                "UPDATE productos SET stock = stock - :cant WHERE id = :prod"
            );

            foreach ($items as $item) {
                $stmtDetalle->execute([
                    'pid' => $pedidoId,
                    'prod' => $item['producto_id'],
                    'cant' => $item['cantidad'],
                    'precio' => $item['precio'],
                    'sub' => $item['precio'] * $item['cantidad']
                ]);
                $stmtStock->execute([
                    'cant' => $item['cantidad'],
                    'prod' => $item['producto_id']
                ]);
            }

            $stmtVaciar = $this->db->prepare("DELETE FROM carrito_items WHERE usuario_id = :uid");
            $stmtVaciar->execute(['uid' => $usuarioId]);

            $this->db->commit();
            return $pedidoId;

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /* =========================================================
       VISTA DEL CLIENTE
       ========================================================= */

    public function listarPorUsuario($usuarioId) {
        $stmt = $this->db->prepare(
            "SELECT p.id, p.estado, p.subtotal, p.costo_domicilio, p.total, p.fecha_pedido,
                    d.direccion, d.ciudad, d.barrio,
                    (SELECT COALESCE(SUM(dp.cantidad), 0) FROM detalle_pedido dp
                      WHERE dp.pedido_id = p.id) AS total_items
             FROM pedidos p
             LEFT JOIN direcciones d ON p.direccion_id = d.id
             WHERE p.usuario_id = :uid
             ORDER BY p.fecha_pedido DESC, p.id DESC"
        );
        $stmt->execute(['uid' => (int)$usuarioId]);
        return $stmt->fetchAll();
    }

    /** Detalle de un pedido propio. Filtra por usuario para que nadie vea pedidos ajenos. */
    public function obtenerDetalle($id, $usuarioId) {
        $stmt = $this->db->prepare(
            "SELECT p.*, d.direccion, d.ciudad, d.barrio, d.referencia,
                    d.etiqueta, d.telefono_contacto
             FROM pedidos p
             LEFT JOIN direcciones d ON p.direccion_id = d.id
             WHERE p.id = :id AND p.usuario_id = :uid"
        );
        $stmt->execute(['id' => (int)$id, 'uid' => (int)$usuarioId]);
        $pedido = $stmt->fetch();
        if (!$pedido) return null;

        $pedido['items'] = $this->itemsDelPedido($id);
        return $pedido;
    }

    private function itemsDelPedido($pedidoId) {
        $stmt = $this->db->prepare(
            "SELECT dp.producto_id, dp.cantidad, dp.precio_unitario, dp.subtotal,
                    pr.nombre, pr.icono, pr.imagen_url
             FROM detalle_pedido dp
             JOIN productos pr ON dp.producto_id = pr.id
             WHERE dp.pedido_id = :pid"
        );
        $stmt->execute(['pid' => (int)$pedidoId]);
        return $stmt->fetchAll();
    }

    /* =========================================================
       CAMBIO DE ESTADO
       ========================================================= */

    public function actualizarEstado($pedidoId, $nuevoEstado) {
        if (!in_array($nuevoEstado, self::ESTADOS, true)) {
            return false;
        }

        $stmt = $this->db->prepare("SELECT estado FROM pedidos WHERE id = :id");
        $stmt->execute(['id' => (int)$pedidoId]);
        $actual = $stmt->fetchColumn();
        if (!$actual) {
            return false;
        }
        if ($actual === 'cancelado') {
            return true; // ya está cancelado, no se devuelve stock dos veces
        }

        if ($nuevoEstado === 'cancelado') {
            $this->db->beginTransaction();
            try {
                $stmtDetalles = $this->db->prepare(
                    "SELECT producto_id, cantidad FROM detalle_pedido WHERE pedido_id = :pid"
                );
                $stmtDetalles->execute(['pid' => (int)$pedidoId]);
                $detalles = $stmtDetalles->fetchAll();

                $stmtStock = $this->db->prepare(
                    "UPDATE productos SET stock = stock + :cant WHERE id = :prod"
                );
                foreach ($detalles as $detalle) {
                    $stmtStock->execute([
                        'cant' => $detalle['cantidad'],
                        'prod' => $detalle['producto_id']
                    ]);
                }

                $stmtUpdate = $this->db->prepare(
                    "UPDATE pedidos SET estado = 'cancelado' WHERE id = :id"
                );
                $stmtUpdate->execute(['id' => (int)$pedidoId]);

                $this->db->commit();
                return true;
            } catch (Exception $e) {
                $this->db->rollBack();
                throw $e;
            }
        }

        $stmt = $this->db->prepare("UPDATE pedidos SET estado = :estado WHERE id = :id");
        return $stmt->execute(['estado' => $nuevoEstado, 'id' => (int)$pedidoId]);
    }

    /* =========================================================
       PANEL ADMINISTRATIVO
       ========================================================= */

    public function contarTotal() {
        $stmt = $this->db->query("SELECT COUNT(*) AS total FROM pedidos");
        return (int)$stmt->fetch()['total'];
    }

    public function listarTodos($filtros = []) {
        $condiciones = [];
        $parametros  = [];

        if (!empty($filtros['estado'])) {
            $condiciones[] = "p.estado = :estado";
            $parametros['estado'] = $filtros['estado'];
        }
        if (!empty($filtros['desde'])) {
            $condiciones[] = "DATE(p.fecha_pedido) >= :desde";
            $parametros['desde'] = $filtros['desde'];
        }
        if (!empty($filtros['hasta'])) {
            $condiciones[] = "DATE(p.fecha_pedido) <= :hasta";
            $parametros['hasta'] = $filtros['hasta'];
        }
        if (!empty($filtros['busqueda'])) {
            $condiciones[] = "(u.nombre LIKE :busqueda OR u.email LIKE :busqueda OR p.id = :busquedaId)";
            $parametros['busqueda']   = '%' . $filtros['busqueda'] . '%';
            $parametros['busquedaId'] = (int)$filtros['busqueda'];
        }

        $where = empty($condiciones) ? '' : 'WHERE ' . implode(' AND ', $condiciones);

        $sql = "SELECT p.id, p.usuario_id, p.estado, p.subtotal, p.costo_domicilio,
                       p.total, p.fecha_pedido,
                       u.nombre AS cliente_nombre, u.email AS cliente_email,
                       u.telefono AS cliente_telefono,
                       d.direccion, d.ciudad, d.barrio,
                       (SELECT COALESCE(SUM(dp.cantidad), 0) FROM detalle_pedido dp
                         WHERE dp.pedido_id = p.id) AS total_items
                FROM pedidos p
                JOIN usuarios u ON p.usuario_id = u.id
                LEFT JOIN direcciones d ON p.direccion_id = d.id
                $where
                ORDER BY p.fecha_pedido DESC, p.id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($parametros);
        return $stmt->fetchAll();
    }

    public function obtenerDetalleAdmin($id) {
        $stmt = $this->db->prepare(
            "SELECT p.*, u.nombre AS cliente_nombre, u.email AS cliente_email,
                    u.telefono AS cliente_telefono,
                    d.direccion, d.ciudad, d.barrio, d.referencia,
                    d.etiqueta, d.telefono_contacto
             FROM pedidos p
             JOIN usuarios u ON p.usuario_id = u.id
             LEFT JOIN direcciones d ON p.direccion_id = d.id
             WHERE p.id = :id"
        );
        $stmt->execute(['id' => (int)$id]);
        $pedido = $stmt->fetch();
        if (!$pedido) return null;

        $pedido['items'] = $this->itemsDelPedido($id);
        return $pedido;
    }

    public function contarPorEstado() {
        $stmt = $this->db->query(
            "SELECT estado, COUNT(*) AS total FROM pedidos GROUP BY estado"
        );
        return $stmt->fetchAll();
    }

    /** Los pedidos cancelados no cuentan como venta. */
    public function resumenVentas($desde = null, $hasta = null) {
        $condiciones = ["estado <> 'cancelado'"];
        $parametros  = [];

        if (!empty($desde)) {
            $condiciones[] = "DATE(fecha_pedido) >= :desde";
            $parametros['desde'] = $desde;
        }
        if (!empty($hasta)) {
            $condiciones[] = "DATE(fecha_pedido) <= :hasta";
            $parametros['hasta'] = $hasta;
        }
        $where = 'WHERE ' . implode(' AND ', $condiciones);

        $stmt = $this->db->prepare(
            "SELECT COUNT(*) AS total_pedidos,
                    COALESCE(SUM(total), 0) AS total_vendido,
                    COALESCE(AVG(total), 0) AS ticket_promedio
             FROM pedidos $where"
        );
        $stmt->execute($parametros);
        $resumen = $stmt->fetch();

        $stmtDias = $this->db->prepare(
            "SELECT DATE(fecha_pedido) AS dia,
                    COUNT(*) AS pedidos,
                    COALESCE(SUM(total), 0) AS monto
             FROM pedidos $where
             GROUP BY DATE(fecha_pedido)
             ORDER BY dia ASC"
        );
        $stmtDias->execute($parametros);
        $resumen['por_dia'] = $stmtDias->fetchAll();

        $resumen['total_pedidos']   = (int)$resumen['total_pedidos'];
        $resumen['total_vendido']   = (float)$resumen['total_vendido'];
        $resumen['ticket_promedio'] = round((float)$resumen['ticket_promedio']);

        return $resumen;
    }

    public function listarRecientes($limite = 5) {
        $limite = (int)$limite;
        $stmt = $this->db->query(
            "SELECT p.id, p.estado, p.total, p.fecha_pedido,
                    u.nombre AS cliente_nombre, u.email AS cliente_email
             FROM pedidos p
             JOIN usuarios u ON p.usuario_id = u.id
             ORDER BY p.fecha_pedido DESC, p.id DESC
             LIMIT $limite"
        );
        return $stmt->fetchAll();
    }
        /**
     * Top de productos más vendidos. Solo cuenta pedidos no cancelados,
     * porque un pedido cancelado devolvió el stock y no es una venta real.
     */
    public function masVendidos($limite = 5) {
        $limite = (int)$limite;
        $stmt = $this->db->query(
            "SELECT pr.id, pr.nombre, pr.icono,
                    SUM(dp.cantidad) AS unidades,
                    SUM(dp.subtotal) AS ingresos
             FROM detalle_pedido dp
             JOIN pedidos p ON dp.pedido_id = p.id
             JOIN productos pr ON dp.producto_id = pr.id
             WHERE p.estado <> 'cancelado'
             GROUP BY pr.id, pr.nombre, pr.icono
             ORDER BY unidades DESC
             LIMIT $limite"
        );
        return $stmt->fetchAll();
    }
}