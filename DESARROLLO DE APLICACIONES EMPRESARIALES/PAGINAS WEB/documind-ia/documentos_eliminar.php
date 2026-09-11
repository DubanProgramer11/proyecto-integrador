<?php
// documentos_eliminar.php
require_once __DIR__ . "/config/conexion.php";
session_start();

if (!isset($_SESSION["id_usuario"])) {
    header("Location: login.php");
    exit;
}

$id_documento = (int) ($_GET["id"] ?? 0);
$id_usuario = $_SESSION["id_usuario"];

// Buscamos el documento verificando que sea de un repositorio del usuario
$consulta = mysqli_prepare($conexion, "
    SELECT d.ruta_archivo, d.id_repositorio
    FROM documentos d
    INNER JOIN repositorios r ON d.id_repositorio = r.id
    WHERE d.id = ? AND r.id_usuario = ?
");
mysqli_stmt_bind_param($consulta, "ii", $id_documento, $id_usuario);
mysqli_stmt_execute($consulta);
$documento = mysqli_stmt_get_result($consulta)->fetch_assoc();

if ($documento) {
    // Borramos primero el archivo físico del servidor
    $rutaCompleta = __DIR__ . "/" . $documento["ruta_archivo"];
    if (file_exists($rutaCompleta)) {
        unlink($rutaCompleta);
    }

    // Luego el registro en la base de datos (esto también borra en
    // cascada sus filas relacionadas en logs_procesamiento y entidades_extraidas)
    $eliminar = mysqli_prepare($conexion, "DELETE FROM documentos WHERE id = ?");
    mysqli_stmt_bind_param($eliminar, "i", $id_documento);
    mysqli_stmt_execute($eliminar);

    header("Location: repositorio.php?id=" . $documento["id_repositorio"]);
} else {
    header("Location: dashboard.php");
}
exit;
?>