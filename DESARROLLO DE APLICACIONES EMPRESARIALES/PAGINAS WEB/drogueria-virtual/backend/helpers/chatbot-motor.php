<?php
/**
 * Motor de reglas del chatbot (Versión 2).
 * Detecta la intención del mensaje del usuario por palabras clave,
 * y responde consultando datos reales cuando aplica.
 * NUNCA inventa información: si no sabe, lo dice y ofrece escalar a un humano.
 */

function procesarMensajeChatbot($mensaje, $usuarioId, $db) {
    $texto = mb_strtolower(trim($mensaje), 'UTF-8');

    // ===== Saludos =====
    if (preg_match('/\b(hola|buenas|buenos dias|buenas tardes|buenas noches|hey)\b/u', $texto)) {
        return [
            'respuesta' => '¡Hola! 👋 Soy el asistente virtual de VitalFarma. Puedo ayudarte con información sobre productos, tus pedidos, domicilios, órdenes médicas o tu cuenta. ¿En qué te ayudo?',
            'requiere_humano' => false
        ];
    }

    // ===== Carrito =====
    if (preg_match('/\b(carrito|mi carrito|ver carrito)\b/u', $texto)) {
        if (!$usuarioId) {
            return [
                'respuesta' => 'Para ver tu carrito necesitas iniciar sesión. ¿Puedes hacerlo y volver a intentar?',
                'requiere_humano' => false
            ];
        }
        return obtenerInfoCarrito($usuarioId, $db);
    }

    // ===== Ir a pagar / Checkout =====
    if (preg_match('/\b(pagar|checkout|hacer pedido|confirmar compra)\b/u', $texto)) {
        if (!$usuarioId) {
            return [
                'respuesta' => 'Necesitas iniciar sesión para hacer un pedido.',
                'requiere_humano' => false
            ];
        }
        // Verificar si tiene productos en el carrito
        $stmt = $db->prepare("SELECT COUNT(*) FROM carrito_items WHERE usuario_id = :uid");
        $stmt->execute(['uid' => $usuarioId]);
        $count = $stmt->fetchColumn();
        if ($count > 0) {
            return [
                'respuesta' => 'Perfecto, te llevaré a la página de pago. 🚀',
                'requiere_humano' => false
            ];
        } else {
            return [
                'respuesta' => 'Tu carrito está vacío. Agrega productos antes de hacer un pedido.',
                'requiere_humano' => false
            ];
        }
    }

    // ===== Productos: disponibilidad y precio =====
    if (preg_match('/\b(tienen|tienes|hay|venden|precio|cuesta|cuanto vale|disponible)\b/u', $texto)) {
        return buscarProductoEnMensaje($texto, $db);
    }

    // ===== Pedidos =====
    if (preg_match('/\b(pedido|orden de compra|mi compra|estado de mi pedido|cuando llega)\b/u', $texto)) {
        if (!$usuarioId) {
            return [
                'respuesta' => 'Para consultar tus pedidos necesito que inicies sesión primero. ¿Puedes iniciar sesión e intentarlo de nuevo?',
                'requiere_humano' => false
            ];
        }
        return consultarPedidosUsuario($usuarioId, $db);
    }

    // ===== Cancelar pedido =====
    if (preg_match('/\b(cancelar|anular)\b.*\bpedido\b/u', $texto)) {
        return [
            'respuesta' => 'Entiendo que quieres cancelar un pedido. Por seguridad, esta acción la debe confirmar uno de nuestros agentes. Voy a escalar tu caso para que te contacten lo antes posible.',
            'requiere_humano' => true
        ];
    }

    // ===== Cuenta: contraseña =====
    if (preg_match('/\b(contraseña|password|clave)\b/u', $texto)) {
        return [
            'respuesta' => 'Para cambiar tu contraseña, ve a "Mi cuenta" → "Mi perfil". Si olvidaste tu contraseña actual, usa la opción "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión.',
            'requiere_humano' => false
        ];
    }

    // ===== Cuenta: dirección =====
    if (preg_match('/\b(cambiar|actualizar|editar)\b.*\b(direccion|domicilio)\b/u', $texto)) {
        return [
            'respuesta' => 'Puedes administrar tus direcciones desde "Mi cuenta" → "Mis direcciones". Ahí puedes agregar, editar o marcar una dirección como predeterminada.',
            'requiere_humano' => false
        ];
    }

    // ===== Domicilios: costo y tiempo =====
    if (preg_match('/\b(domicilio|envio|entrega)\b.*\b(costo|precio|cuanto|vale|tarda|demora)\b/u', $texto)
        || preg_match('/\b(cuanto tarda|cuanto demora|cuanto cuesta el domicilio)\b/u', $texto)) {
        return [
            'respuesta' => 'El costo del domicilio es de $6.000, ¡y es gratis en compras superiores a $80.000! El tiempo estimado de entrega es el mismo día si tu pedido se confirma antes de las 5:00 p.m.',
            'requiere_humano' => false
        ];
    }

    // ===== Domicilios: cobertura =====
    if (preg_match('/\b(a donde|que lugares|cobertura|ciudades|zonas)\b.*\b(entregan|domicilio|llegan)\b/u', $texto)) {
        return [
            'respuesta' => 'Actualmente hacemos entregas dentro del área urbana de Bucaramanga y su área metropolitana. Si tienes dudas sobre tu zona específica, dime tu ciudad y te confirmo.',
            'requiere_humano' => false
        ];
    }

    // ===== Órdenes médicas =====
    if (preg_match('/\b(orden medica|formula medica|receta)\b/u', $texto)) {
        if (preg_match('/\b(como|donde)\b.*\b(subo|subir|cargar)\b/u', $texto)) {
            return [
                'respuesta' => 'Puedes subir tu orden médica desde el menú "Subir orden médica". Aceptamos imágenes (JPG, PNG) y archivos PDF de hasta 5MB. Nuestro sistema analiza el documento y te sugiere los medicamentos que coincidan con nuestro catálogo, para que tú confirmes cuáles agregar al carrito.',
                'requiere_humano' => false
            ];
        }
        if (preg_match('/\b(que pasa|que sucede|despues)\b/u', $texto)) {
            return [
                'respuesta' => 'Después de subir tu orden médica, el sistema analiza el texto automáticamente y te muestra los medicamentos de nuestro catálogo que coinciden. Tú decides cuáles agregar a tu carrito — nunca decidimos ni recomendamos medicamentos por nuestra cuenta.',
                'requiere_humano' => false
            ];
        }
        return [
            'respuesta' => 'Puedo ayudarte con la carga de tu orden médica desde "Subir orden médica" en el menú. ¿Tienes alguna duda específica sobre este proceso?',
            'requiere_humano' => false
        ];
    }

    // ===== Quejas o reclamos =====
    if (preg_match('/\b(queja|reclamo|problema|mal servicio|no funciona|error)\b/u', $texto)) {
        return [
            'respuesta' => 'Lamento que hayas tenido un inconveniente. Voy a escalar tu caso a uno de nuestros agentes para que te ayude personalmente. También puedes dejar tu comentario detallado en la sección "Comentarios" de tu cuenta.',
            'requiere_humano' => true
        ];
    }

    // ===== Agradecimientos / despedidas =====
    if (preg_match('/\b(gracias|listo|eso es todo|hasta luego|chao|adios)\b/u', $texto)) {
        return [
            'respuesta' => '¡Con gusto! Si necesitas algo más, aquí estaré. 😊',
            'requiere_humano' => false
        ];
    }

    // ===== Sin coincidencia: no inventamos respuesta =====
    return [
        'respuesta' => 'No tengo información suficiente para responder eso con seguridad. Puedo escalar tu pregunta a un agente humano para que te ayude mejor. ¿Quieres que lo haga?',
        'requiere_humano' => true
    ];
}

function obtenerInfoCarrito($usuarioId, $db) {
    $stmt = $db->prepare(
        "SELECT ci.cantidad, p.nombre, p.precio
         FROM carrito_items ci
         JOIN productos p ON ci.producto_id = p.id
         WHERE ci.usuario_id = :uid"
    );
    $stmt->execute(['uid' => $usuarioId]);
    $items = $stmt->fetchAll();

    if (empty($items)) {
        return [
            'respuesta' => 'Tu carrito está vacío. ¿Quieres buscar productos para agregar?',
            'requiere_humano' => false
        ];
    }

    $totalItems = 0;
    $subtotal = 0;
    $lineas = [];
    foreach ($items as $item) {
        $totalItems += $item['cantidad'];
        $subtotal += $item['precio'] * $item['cantidad'];
        $lineas[] = "• {$item['cantidad']}x {$item['nombre']} — $" . number_format($item['precio'] * $item['cantidad'], 0, ',', '.');
    }

    $respuesta = "📦 **Tu carrito** ({$totalItems} productos):\n\n" . implode("\n", $lineas) . "\n\n**Subtotal:** $" . number_format($subtotal, 0, ',', '.');
    return [
        'respuesta' => $respuesta,
        'requiere_humano' => false
    ];
}

function buscarProductoEnMensaje($texto, $db) {
    $palabrasIgnorar = ['tienen', 'tienes', 'hay', 'venden', 'precio', 'de', 'cuesta', 'cuanto', 'vale',
                         'el', 'la', 'los', 'las', 'un', 'una', 'disponible', 'que'];
    $palabras = array_diff(explode(' ', preg_replace('/[^a-záéíóúñ0-9\s]/ui', ' ', $texto)), $palabrasIgnorar);
    $palabras = array_filter($palabras, fn($p) => mb_strlen($p) >= 4);

    if (empty($palabras)) {
        return [
            'respuesta' => '¿Sobre qué producto quieres saber? Dime el nombre y te confirmo si lo tenemos disponible y su precio.',
            'requiere_humano' => false
        ];
    }

    $stmt = $db->query("SELECT nombre, precio, disponible, stock FROM productos");
    $productos = $stmt->fetchAll();

    foreach ($productos as $producto) {
        $nombreProducto = mb_strtolower($producto['nombre'], 'UTF-8');
        foreach ($palabras as $palabra) {
            if (mb_strpos($nombreProducto, $palabra) !== false) {
                $disponibilidad = (int)$producto['disponible'] === 1
                    ? "Sí, está disponible (quedan {$producto['stock']} unidades)."
                    : "En este momento está agotado.";
                $precio = number_format($producto['precio'], 0, ',', '.');
                return [
                    'respuesta' => "Encontré \"{$producto['nombre']}\". Precio: \$$precio. $disponibilidad",
                    'requiere_humano' => false
                ];
            }
        }
    }

    return [
        'respuesta' => 'No encontré ese producto en nuestro catálogo actual. ¿Quieres que te muestre productos similares, o prefieres que un agente te ayude a buscarlo?',
        'requiere_humano' => false
    ];
}

function consultarPedidosUsuario($usuarioId, $db) {
    $stmt = $db->prepare(
        "SELECT id, estado, total, fecha_pedido FROM pedidos WHERE usuario_id = :uid ORDER BY fecha_pedido DESC LIMIT 3"
    );
    $stmt->execute(['uid' => $usuarioId]);
    $pedidos = $stmt->fetchAll();

    if (empty($pedidos)) {
        return [
            'respuesta' => 'No encuentro pedidos registrados en tu cuenta. Si acabas de hacer una compra, dame un momento o revisa "Mis pedidos" en tu cuenta.',
            'requiere_humano' => false
        ];
    }

    $estadosTexto = [
        'pendiente' => 'Pendiente',
        'confirmado' => 'Confirmado',
        'en_camino' => 'En camino',
        'entregado' => 'Entregado',
        'cancelado' => 'Cancelado'
    ];

    $lineas = array_map(function($p) use ($estadosTexto) {
        $estado = $estadosTexto[$p['estado']] ?? $p['estado'];
        $total = number_format($p['total'], 0, ',', '.');
        $fecha = date('d/m/Y', strtotime($p['fecha_pedido']));
        return "• Pedido #{$p['id']} — $estado — \$$total ($fecha)";
    }, $pedidos);

    return [
        'respuesta' => "Estos son tus pedidos más recientes:\n" . implode("\n", $lineas),
        'requiere_humano' => false
    ];
}