<?php
require_once __DIR__ . '/../models/OrdenMedica.php';
require_once __DIR__ . '/../helpers/ocr.php';
require_once __DIR__ . '/../models/Carrito.php';

class OrdenMedicaController {
    private $modelo;

    public function __construct() {
        exigirSesion();
        $this->modelo = new OrdenMedica();
    }

    public function detalle($id) {
        $orden = $this->modelo->obtenerDetalleUsuario($id, $_SESSION['usuario_id']);
        if (!$orden) {
            responderError('Orden médica no encontrada.', 404);
        }
        responderExito('Detalle de la orden médica.', $orden);
    }

    public function subirYAnalizar() {
        if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
            responderError('Debes subir un archivo de imagen válido.', 422);
        }

        $archivo = $_FILES['archivo'];
        $extensionesPermitidas = ['jpg', 'jpeg', 'png', 'pdf'];
        $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));

        if (!in_array($extension, $extensionesPermitidas)) {
            responderError('Solo se permiten imágenes JPG, PNG o archivos PDF.', 422);
        }

        if ($archivo['size'] > 5 * 1024 * 1024) { // 5MB
            responderError('El archivo no puede superar los 5MB.', 422);
        }

        // Guardar el archivo con un nombre único
        $usuarioId = $_SESSION['usuario_id'];
        $nombreArchivo = 'orden_' . $usuarioId . '_' . time() . '.' . $extension;
        $rutaDestino = __DIR__ . '/../../uploads/ordenes_medicas/' . $nombreArchivo;

        if (!move_uploaded_file($archivo['tmp_name'], $rutaDestino)) {
            responderError('No se pudo guardar el archivo en el servidor.', 500);
        }

        $archivoUrlRelativa = 'uploads/ordenes_medicas/' . $nombreArchivo;

        // Crear el registro en la base de datos
        $ordenId = $this->modelo->crear($usuarioId, $archivoUrlRelativa);

        // Analizar con OCR (soporta imágenes JPG/PNG y también PDF)
        $resultadoOcr = extraerTextoDeImagen($rutaDestino, $extension);

        if (!$resultadoOcr['exito']) {
            $this->modelo->actualizarTextoExtraido($ordenId, '', 'pendiente');
            responderExito('Tu orden fue guardada, pero no pudimos leer el texto automáticamente. Puedes buscar tus productos manualmente.', [
                'orden_id' => $ordenId,
                'texto_extraido' => '',
                'coincidencias' => [],
                'error_ocr' => $resultadoOcr['error']
            ]);
        }

        $db = obtenerConexion();
        $coincidencias = buscarCoincidenciasProductos($resultadoOcr['texto'], $db);

        $this->modelo->actualizarTextoExtraido($ordenId, $resultadoOcr['texto'], 'procesada');

        if (!empty($coincidencias)) {
            $this->modelo->guardarCoincidencias($ordenId, array_column($coincidencias, 'id'));
        }

        responderExito('Orden analizada con éxito.', [
            'orden_id' => $ordenId,
            'texto_extraido' => $resultadoOcr['texto'],
            'coincidencias' => $coincidencias
        ]);
    }

    public function confirmarProductos() {
        $datos = obtenerCuerpoJSON();
        $ordenId = $datos['orden_id'] ?? null;
        $productoIds = $datos['producto_ids'] ?? [];

        if (!$ordenId || !$this->modelo->buscarPorId($ordenId, $_SESSION['usuario_id'])) {
            responderError('Orden médica no encontrada.', 404);
        }

        if (empty($productoIds)) {
            responderError('Selecciona al menos un producto para agregar al carrito.', 422);
        }

        $this->modelo->confirmarProductos($ordenId, $productoIds);

        // Agregar los productos confirmados directamente al carrito del usuario
        $carritoModelo = new Carrito();
        foreach ($productoIds as $pid) {
            $carritoModelo->agregar($_SESSION['usuario_id'], $pid, 1);
        }

        responderExito('Productos agregados a tu carrito.');
    }

    public function listar() {
        responderExito('Órdenes médicas obtenidas.', $this->modelo->listarPorUsuario($_SESSION['usuario_id']));
    }
}