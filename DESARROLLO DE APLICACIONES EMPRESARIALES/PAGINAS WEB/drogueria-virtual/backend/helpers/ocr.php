<?php
function extraerTextoDeImagen($rutaArchivo, $extension = null) {
    // Detecta el tipo MIME correcto según la extensión, para que OCR.space
    // sepa si está recibiendo una imagen o un PDF.
    $tiposMime = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'pdf' => 'application/pdf'
    ];
    $mime = $tiposMime[$extension] ?? mime_content_type($rutaArchivo);

    $curl = curl_init();

    curl_setopt_array($curl, [
        CURLOPT_URL => 'https://api.ocr.space/parse/image',
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 60, // los PDF tardan un poco más que las imágenes
        CURLOPT_HTTPHEADER => ['apikey: ' . OCR_SPACE_API_KEY],
        CURLOPT_POSTFIELDS => [
            'file' => new CURLFile($rutaArchivo, $mime),
            'language' => 'spa',
            'isOverlayRequired' => 'false',
            'OCREngine' => '2',
            'filetype' => strtoupper($extension === 'jpg' ? 'jpg' : $extension)
        ]
    ]);

    $respuesta = curl_exec($curl);
    $error = curl_error($curl);
    curl_close($curl);

    if ($error) {
        return ['exito' => false, 'texto' => '', 'error' => $error];
    }

    $data = json_decode($respuesta, true);

    if (!$data || !empty($data['IsErroredOnProcessing'])) {
        $mensajeError = $data['ErrorMessage'][0] ?? 'Error desconocido al procesar el archivo.';
        return ['exito' => false, 'texto' => '', 'error' => $mensajeError];
    }

    // Un PDF puede tener varias páginas: unimos el texto de todas
    $paginas = $data['ParsedResults'] ?? [];
    $textoCompleto = implode("\n", array_map(function($p) {
        return $p['ParsedText'] ?? '';
    }, $paginas));

    return ['exito' => true, 'texto' => trim($textoCompleto), 'error' => null];
}


/**
 * Compara el texto extraído contra los nombres de productos del catálogo
 * y devuelve las coincidencias encontradas (comparación por palabras clave).
 */
function buscarCoincidenciasProductos($texto, $db) {
    // Limpiamos el texto: minúsculas, quitamos signos, dividimos en palabras
    $textoLimpio = mb_strtolower($texto, 'UTF-8');
    $textoLimpio = preg_replace('/[^a-záéíóúñ0-9\s]/ui', ' ', $textoLimpio);
    $palabras = array_filter(explode(' ', $textoLimpio), function($p) {
        return mb_strlen($p) >= 4; // ignoramos palabras muy cortas (de, la, mg, etc. ya quedan filtradas por longitud)
    });

    if (empty($palabras)) return [];

    $stmt = $db->query("SELECT id, nombre, precio, icono FROM productos WHERE disponible = 1");
    $productos = $stmt->fetchAll();

    $coincidencias = [];
    foreach ($productos as $producto) {
        $nombreProducto = mb_strtolower($producto['nombre'], 'UTF-8');
        foreach ($palabras as $palabra) {
            if (mb_strpos($nombreProducto, $palabra) !== false) {
                $coincidencias[$producto['id']] = $producto;
                break;
            }
        }
    }

    return array_values($coincidencias);
}