<?php
// repositorios_guardar.php
// Procesa las tres acciones sobre repositorios: crear, editar, eliminar
require_once __DIR__ . "/config/conexion.php";
session_start();

if (!isset($_SESSION["id_usuario"])) {
    header("Location: login.php");
    exit;
}

$id_usuario = $_SESSION["id_usuario"];
$accion = $_POST["accion"] ?? "";

if ($accion === "crear") {
    $nombre = trim($_POST["nombre"]);
    $descripcion = trim($_POST["descripcion"]);

    if ($nombre !== "") {
        $consulta = mysqli_prepare($conexion, "INSERT INTO repositorios (nombre, descripcion, id_usuario) VALUES (?, ?, ?)");
        mysqli_stmt_bind_param($consulta, "ssi", $nombre, $descripcion, $id_usuario);
        mysqli_stmt_execute($consulta);
    }

} elseif ($accion === "editar") {
    $id = (int) $_POST["id"];
    $nombre = trim($_POST["nombre"]);
    $descripcion = trim($_POST["descripcion"]);

    // El "AND id_usuario = ?" es clave: evita que alguien edite un repositorio que no es suyo
    $consulta = mysqli_prepare($conexion, "UPDATE repositorios SET nombre = ?, descripcion = ? WHERE id = ? AND id_usuario = ?");
    mysqli_stmt_bind_param($consulta, "ssii", $nombre, $descripcion, $id, $id_usuario);
    mysqli_stmt_execute($consulta);

} elseif ($accion === "eliminar") {
    $id = (int) $_POST["id"];

    // Gracias a "ON DELETE CASCADE" en la tabla documentos, al borrar el repositorio
    // se borran automáticamente sus documentos asociados en la base de datos.
    $consulta = mysqli_prepare($conexion, "DELETE FROM repositorios WHERE id = ? AND id_usuario = ?");
    mysqli_stmt_bind_param($consulta, "ii", $id, $id_usuario);
    mysqli_stmt_execute($consulta);
}

header("Location: dashboard.php");
exit;
?>