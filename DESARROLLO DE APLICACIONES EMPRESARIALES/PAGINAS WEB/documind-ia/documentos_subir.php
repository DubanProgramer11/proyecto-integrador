<?php
// documentos_subir.php
// Recibe el archivo subido, lo valida, lo guarda en disco y registra
// la fila correspondiente en la tabla "documentos"
require_once __DIR__ . "/config/conexion.php";
session_start();

if (!isset($_SESSION["id_usuario"])) {
    header("Location: login.php");
    exit;
}

$id_usuario = $_SESSION["id_usuario"];
$id_repositorio = (int) ($_POST["id_repositorio"] ?? 0);

// Verificamos que el repositorio pertenezca al usuario logueado
$consulta = mysqli_prepare($conexion, "SELECT id FROM repositorios WHERE id = ? AND id_usuario = ?");
mysqli_stmt_bind_param($consulta, "ii", $id_repositorio, $id_usuario);
mysqli_stmt_execute($consulta);
if (mysqli_stmt_get_result($consulta)->num_rows === 0) {
    header("Location: dashboard.php");
    exit;
}

// Verificamos que efectivamente llegó un archivo sin errores de subida
if (!isset($_FILES["archivo"]) || $_FILES["archivo"]["error"] !== UPLOAD_ERR_OK) {
    header("Location: repositorio.php?id=$id_repositorio&error=subida");
    exit;
}

$archivo = $_FILES["archivo"];

// Extraemos la extensión del archivo original y la pasamos a minúsculas
$extension = strtolower(pathinfo($archivo["name"], PATHINFO_EXTENSION));
$formatosPermitidos = ["pdf", "docx", "txt"];

if (!in_array($extension, $formatosPermitidos)) {
    header("Location: repositorio.php?id=$id_repositorio&error=formato");
    exit;
}

// Límite propio de la aplicación: 15 MB (además del límite de php.ini)
$tamanoMaximoBytes = 15 * 1024 * 1024;
if ($archivo["size"] > $tamanoMaximoBytes) {
    header("Location: repositorio.php?id=$id_repositorio&error=tamano");
    exit;
}

// Generamos un nombre único en disco para que dos archivos con el mismo
// nombre original no se sobrescriban entre sí (guardamos el nombre real
// aparte, en la columna nombre_original, para mostrarlo al usuario)
$nombreEnDisco = uniqid("doc_", true) . "." . $extension;
$carpetaDestino = __DIR__ . "/uploads/";

// Si la carpeta uploads no existe todavía, la creamos automáticamente
if (!is_dir($carpetaDestino)) {
    mkdir($carpetaDestino, 0755, true);
}

$rutaCompleta = $carpetaDestino . $nombreEnDisco;

if (!move_uploaded_file($archivo["tmp_name"], $rutaCompleta)) {
    header("Location: repositorio.php?id=$id_repositorio&error=subida");
    exit;
}

$tamanoKb = round($archivo["size"] / 1024);
// Guardamos la ruta relativa (no la ruta absoluta del disco) para que
// funcione igual sin importar en qué computador esté instalado XAMPP
$rutaRelativa = "uploads/" . $nombreEnDisco;

$insertar = mysqli_prepare($conexion, "INSERT INTO documentos (id_repositorio, nombre_original, ruta_archivo, formato, tamano_kb, estado_procesamiento) VALUES (?, ?, ?, ?, ?, 'pendiente')");
mysqli_stmt_bind_param($insertar, "isssi", $id_repositorio, $archivo["name"], $rutaRelativa, $extension, $tamanoKb);
mysqli_stmt_execute($insertar);

$id_documento = mysqli_insert_id($conexion);

// Registramos el primer evento en el log de procesamiento (requisito del enunciado)
$log = mysqli_prepare($conexion, "INSERT INTO logs_procesamiento (id_documento, etapa, estado, mensaje) VALUES (?, 'carga', 'info', 'Documento subido correctamente, en espera de procesamiento por IA.')");
mysqli_stmt_bind_param($log, "i", $id_documento);
mysqli_stmt_execute($log);

header("Location: documentos_procesar.php?id=$id_documento");
exit;
?>