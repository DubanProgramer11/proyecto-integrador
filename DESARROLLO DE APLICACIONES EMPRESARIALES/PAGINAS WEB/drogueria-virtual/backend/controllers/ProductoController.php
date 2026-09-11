<?php
require_once __DIR__ . '/../models/Producto.php';

class ProductoController {

    public function listar() {
        $modelo = new Producto();
        if (isset($_GET['buscar']) && trim($_GET['buscar']) !== '') {
            responderExito('Resultados de búsqueda.', $modelo->buscarPorTermino(trim($_GET['buscar'])));
            return;
        }
        responderExito('Productos obtenidos.', $modelo->listarTodos());
    }

    public function obtener($id) {
        $modelo = new Producto();
        $producto = $modelo->buscarPorId($id);
        if (!$producto) {
            responderError('Producto no encontrado.', 404);
        }
        responderExito('Producto obtenido.', $producto);
    }

    /** Productos con inventario bajo. La consulta vive en el modelo. */
    public function stockBajo() {
        $umbral = isset($_GET['umbral']) ? (int)$_GET['umbral'] : 5;
        $modelo = new Producto();
        responderExito('Productos con stock bajo.', $modelo->stockBajo($umbral));
    }

    public function crear() {
        $datos = obtenerCuerpoJSON();
        $errores = [];

        if (empty($datos['nombre'])) $errores['nombre'] = 'El nombre es obligatorio.';
        if (empty($datos['categoria_id'])) $errores['categoria_id'] = 'La categoría es obligatoria.';
        if (!isset($datos['precio']) || $datos['precio'] <= 0) $errores['precio'] = 'El precio debe ser mayor a 0.';
        if (!isset($datos['stock']) || $datos['stock'] < 0) $errores['stock'] = 'El stock no puede ser negativo.';

        if (!empty($errores)) {
            responderError('Datos inválidos.', 422, $errores);
        }

        $modelo = new Producto();
        $id = $modelo->crear([
            'categoria_id' => (int)$datos['categoria_id'],
            'nombre' => trim($datos['nombre']),
            'descripcion' => trim($datos['descripcion'] ?? ''),
            'precio' => (float)$datos['precio'],
            'precio_anterior' => isset($datos['precio_anterior']) ? (float)$datos['precio_anterior'] : null,
            'stock' => (int)$datos['stock'],
            'disponible' => isset($datos['disponible']) ? (int)$datos['disponible'] : 1,
            'imagen_url' => trim($datos['imagen_url'] ?? ''),
            'icono' => trim($datos['icono'] ?? '📦'),
            'badge' => trim($datos['badge'] ?? ''),
            'requiere_orden_medica' => isset($datos['requiere_orden_medica']) ? (int)$datos['requiere_orden_medica'] : 0
        ]);

        if (!$id) {
            responderError('No se pudo crear el producto.', 500);
        }

        $producto = $modelo->buscarPorId($id);
        responderExito('Producto creado exitosamente.', $producto, 201);
    }

    public function actualizar($id) {
        $datos = obtenerCuerpoJSON();
        $modelo = new Producto();

        $productoExistente = $modelo->buscarPorId($id);
        if (!$productoExistente) {
            responderError('Producto no encontrado.', 404);
        }

        $errores = [];
        if (isset($datos['nombre']) && empty($datos['nombre'])) $errores['nombre'] = 'El nombre es obligatorio.';
        if (isset($datos['precio']) && $datos['precio'] <= 0) $errores['precio'] = 'El precio debe ser mayor a 0.';
        if (isset($datos['stock']) && $datos['stock'] < 0) $errores['stock'] = 'El stock no puede ser negativo.';

        if (!empty($errores)) {
            responderError('Datos inválidos.', 422, $errores);
        }

        $actualizados = $modelo->actualizar($id, [
            'categoria_id' => isset($datos['categoria_id']) ? (int)$datos['categoria_id'] : $productoExistente['categoria_id'],
            'nombre' => isset($datos['nombre']) ? trim($datos['nombre']) : $productoExistente['nombre'],
            'descripcion' => isset($datos['descripcion']) ? trim($datos['descripcion']) : $productoExistente['descripcion'],
            'precio' => isset($datos['precio']) ? (float)$datos['precio'] : $productoExistente['precio'],
            // Antes esta línea ponía null cuando el campo no venía,
            // borrando el precio anterior en cada edición.
            'precio_anterior' => array_key_exists('precio_anterior', $datos) && $datos['precio_anterior'] !== null
                ? (float)$datos['precio_anterior']
                : $productoExistente['precio_anterior'],
            'stock' => isset($datos['stock']) ? (int)$datos['stock'] : $productoExistente['stock'],
            'disponible' => isset($datos['disponible']) ? (int)$datos['disponible'] : $productoExistente['disponible'],
            'imagen_url' => isset($datos['imagen_url']) ? trim($datos['imagen_url']) : $productoExistente['imagen_url'],
            'icono' => isset($datos['icono']) ? trim($datos['icono']) : $productoExistente['icono'],
            'badge' => isset($datos['badge']) ? trim($datos['badge']) : $productoExistente['badge'],
            'requiere_orden_medica' => isset($datos['requiere_orden_medica']) ? (int)$datos['requiere_orden_medica'] : $productoExistente['requiere_orden_medica']
        ]);

        if (!$actualizados) {
            responderError('No se pudo actualizar el producto.', 500);
        }

        $producto = $modelo->buscarPorId($id);
        responderExito('Producto actualizado.', $producto);
    }

    public function eliminar($id) {
        $modelo = new Producto();
        $producto = $modelo->buscarPorId($id);
        if (!$producto) {
            responderError('Producto no encontrado.', 404);
        }

        $eliminado = $modelo->eliminar($id);
        if (!$eliminado) {
            responderError('No se pudo eliminar el producto.', 500);
        }

        responderExito('Producto eliminado correctamente.');
    }
}