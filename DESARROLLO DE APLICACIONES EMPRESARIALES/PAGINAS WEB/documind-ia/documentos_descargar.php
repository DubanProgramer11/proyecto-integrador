<?php
// documentos_descargar.php
require_once __DIR__ . "/config/conexion.php";
session_start();

if (!isset($_SESSION["id_usuario"])) {
    header("Location: login.php");
    exit;
}

$id_documento = (int) ($_GET["id"] ?? 0);
$id_usuario = $_SESSION["id_usuario"];

// El JOIN con repositorios asegura que el documento pertenezca a un
// repositorio de este mismo usuario (nadie puede descargar archivos ajenos)
$consulta = mysqli_prepare($conexion, "
    SELECT d.nombre_original, d.ruta_archivo
    FROM documentos d
    INNER JOIN repositorios r ON d.id_repositorio = r.id
    WHERE d.id = ? AND r.id_usuario = ?
");
mysqli_stmt_bind_param($consulta, "ii", $id_documento, $id_usuario);
mysqli_stmt_execute($consulta);
$documento = mysqli_stmt_get_result($consulta)->fetch_assoc();

if (!$documento) {
    die("Documento no encontrado o no tienes permiso para descargarlo.");
}

$rutaCompleta = __DIR__ . "/" . $documento["ruta_archivo"];

if (!file_exists($rutaCompleta)) {
    die("El archivo ya no existe en el servidor.");
}

// Encabezados que le indican al navegador que debe descargar el archivo
header("Content-Description: File Transfer");
header("Content-Type: application/octet-stream");
header("Content-Disposition: attachment; filename=\"" . $documento["nombre_original"] . "\"");
header("Content-Length: " . filesize($rutaCompleta));
readfile($rutaCompleta);
exit;
?>