<?php
// documentos_procesar.php
// Ejecuta el flujo completo de IA sobre un documento:
// extracción de texto -> clasificación -> resumen -> extracción de entidades -> guardado
require_once __DIR__ . "/config/conexion.php";
require_once __DIR__ . "/config/ia.php";
require_once __DIR__ . "/vendor/autoload.php";
require_once __DIR__ . "/servicios/ExtractorTexto.php";
require_once __DIR__ . "/servicios/ClienteIA.php";
session_start();

if (!isset($_SESSION["id_usuario"])) {
    header("Location: login.php");
    exit;
}

$id_documento = (int) ($_GET["id"] ?? 0);
$id_usuario = $_SESSION["id_usuario"];

// Función auxiliar para no repetir el INSERT del log en cada paso
function registrarLog(mysqli $conexion, int $id_documento, string $etapa, string $estado, string $mensaje): void {
    $log = mysqli_prepare($conexion, "INSERT INTO logs_procesamiento (id_documento, etapa, estado, mensaje) VALUES (?, ?, ?, ?)");
    mysqli_stmt_bind_param($log, "isss", $id_documento, $etapa, $estado, $mensaje);
    mysqli_stmt_execute($log);
}

// Verificamos que el documento exista y pertenezca a un repositorio del usuario
$consulta = mysqli_prepare($conexion, "
    SELECT d.id, d.ruta_archivo, d.formato, d.id_repositorio
    FROM documentos d
    INNER JOIN repositorios r ON d.id_repositorio = r.id
    WHERE d.id = ? AND r.id_usuario = ?
");
mysqli_stmt_bind_param($consulta, "ii", $id_documento, $id_usuario);
mysqli_stmt_execute($consulta);
$documento = mysqli_stmt_get_result($consulta)->fetch_assoc();

if (!$documento) {
    header("Location: dashboard.php");
    exit;
}

$id_repositorio = $documento["id_repositorio"];

// Marcamos el documento como "procesando"
mysqli_query($conexion, "UPDATE documentos SET estado_procesamiento = 'procesando' WHERE id = $id_documento");
registrarLog($conexion, $id_documento, "procesamiento", "info", "Inicia el procesamiento con IA.");

try {
    $rutaCompleta = __DIR__ . "/" . $documento["ruta_archivo"];

    // Paso 1: extracción de contenido
    $texto = extraerTexto($rutaCompleta, $documento["formato"]);

    if (trim($texto) === "") {
        throw new Exception("No se pudo extraer texto del documento (puede ser un PDF escaneado sin texto real).");
    }

    registrarLog($conexion, $id_documento, "extraccion", "info", "Texto extraído correctamente (" . mb_strlen($texto) . " caracteres).");

    // Paso 2: clasificación
    $id_categoria = clasificarTexto($conexion, $texto);
    registrarLog($conexion, $id_documento, "clasificacion", "info", $id_categoria ? "Documento clasificado." : "No se pudo determinar una categoría clara.");

    // Paso 3: resumen
    $resumen = generarResumen($texto);
    registrarLog($conexion, $id_documento, "resumen", "info", "Resumen generado correctamente.");

    // Paso 4: extracción de entidades
    $entidades = extraerEntidades($texto);
    registrarLog($conexion, $id_documento, "extraccion_entidades", "info", count($entidades) . " entidades encontradas.");

    // Paso 5: almacenamiento de resultados
    $actualizar = mysqli_prepare($conexion, "UPDATE documentos SET contenido_extraido = ?, resumen = ?, id_categoria = ?, estado_procesamiento = 'completado' WHERE id = ?");
    mysqli_stmt_bind_param($actualizar, "ssii", $texto, $resumen, $id_categoria, $id_documento);
    mysqli_stmt_execute($actualizar);

    // Guardamos cada entidad extraída en su propia fila
    foreach ($entidades as $entidad) {
        if (!isset($entidad["tipo"], $entidad["valor"])) continue;
        $insertarEntidad = mysqli_prepare($conexion, "INSERT INTO entidades_extraidas (id_documento, tipo_entidad, valor) VALUES (?, ?, ?)");
        mysqli_stmt_bind_param($insertarEntidad, "iss", $id_documento, $entidad["tipo"], $entidad["valor"]);
        mysqli_stmt_execute($insertarEntidad);
    }

    registrarLog($conexion, $id_documento, "procesamiento", "info", "Procesamiento completado con éxito.");

} catch (Exception $error) {
    // Si algo falla en cualquier paso, dejamos constancia en el log y marcamos el error
    mysqli_query($conexion, "UPDATE documentos SET estado_procesamiento = 'error' WHERE id = $id_documento");
    registrarLog($conexion, $id_documento, "procesamiento", "error", $error->getMessage());
}

header("Location: repositorio.php?id=$id_repositorio");
exit;
?>