<?php
// servicios/ClienteIA.php
// Cliente que habla con el modelo de IA (API compatible con OpenAI).
// Todas las funciones de este archivo son el paso "procesamiento IA -> análisis"
// del flujo exigido por el enunciado.

// Función genérica: envía un mensaje al modelo y devuelve su respuesta en texto
function llamarModeloIA(string $instruccionSistema, string $mensajeUsuario): string {
    $cuerpo = [
        "model" => IA_MODELO,
        "messages" => [
            ["role" => "system", "content" => $instruccionSistema],
            ["role" => "user", "content" => $mensajeUsuario],
        ],
        "temperature" => 0.2, // valores bajos = respuestas más consistentes, menos "creativas"
    ];

    $ch = curl_init(IA_API_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "Authorization: Bearer " . IA_API_KEY,
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($cuerpo));
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);

    $respuesta = curl_exec($ch);
    $errorCurl = curl_error($ch);
    $codigoHttp = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($errorCurl) {
        throw new Exception("Error de conexión con el servicio de IA: $errorCurl");
    }

    if ($codigoHttp !== 200) {
        throw new Exception("El servicio de IA respondió con error HTTP $codigoHttp: $respuesta");
    }

    $datos = json_decode($respuesta, true);
    if (!isset($datos["choices"][0]["message"]["content"])) {
        throw new Exception("Respuesta de IA con formato inesperado: $respuesta");
    }

    return trim($datos["choices"][0]["message"]["content"]);
}

// Clasifica el texto dentro de una de las categorías existentes en la base de datos
function clasificarTexto(mysqli $conexion, string $texto): ?int {
    $resultado = mysqli_query($conexion, "SELECT id, nombre FROM categorias");
    $categorias = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $categorias[$fila["nombre"]] = $fila["id"];
    }

    $listaCategorias = implode(", ", array_keys($categorias));
    $instruccion = "Eres un clasificador de documentos empresariales. Debes responder ÚNICAMENTE con el nombre exacto de una de estas categorías, sin explicación adicional: $listaCategorias";
    $mensaje = "Clasifica el siguiente documento:\n\n" . mb_substr($texto, 0, 6000);

    $respuesta = trim(llamarModeloIA($instruccion, $mensaje));

    // Buscamos coincidencia exacta o parcial con alguna categoría conocida
    foreach ($categorias as $nombre => $id) {
        if (stripos($respuesta, $nombre) !== false) {
            return $id;
        }
    }

    return null; // si la IA responde algo que no coincide con ninguna categoría
}

// Genera un resumen corto del documento
function generarResumen(string $texto): string {
    $instruccion = "Eres un asistente que resume documentos empresariales en español, de forma clara y concisa, en máximo 5 líneas.";
    $mensaje = "Resume el siguiente documento:\n\n" . mb_substr($texto, 0, 8000);

    return llamarModeloIA($instruccion, $mensaje);
}

// Extrae información relevante en forma de lista de entidades (tipo -> valor)
function extraerEntidades(string $texto): array {
    $instruccion = 'Eres un extractor de información de documentos empresariales. '
        . 'Responde ÚNICAMENTE con un arreglo JSON válido, sin texto adicional ni bloques de código, '
        . 'con este formato: [{"tipo": "fecha", "valor": "..."}, {"tipo": "monto", "valor": "..."}]. '
        . 'Tipos posibles: fecha, monto, persona, empresa, numero_documento, lugar. '
        . 'Incluye solo los datos que realmente encuentres en el texto, máximo 8 entidades.';
    $mensaje = "Extrae la información relevante de este documento:\n\n" . mb_substr($texto, 0, 8000);

    $respuesta = llamarModeloIA($instruccion, $mensaje);

    // Por si el modelo agrega ```json ... ``` a pesar de la instrucción, lo limpiamos
    $respuesta = preg_replace('/```json|```/', '', $respuesta);
    $respuesta = trim($respuesta);

    $entidades = json_decode($respuesta, true);

    if (!is_array($entidades)) {
        return []; // si no se pudo interpretar como JSON, seguimos sin romper el flujo
    }

    return $entidades;
}