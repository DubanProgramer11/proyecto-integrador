<?php
// admin_acciones.php
// Procesa las acciones del panel de administrador sobre usuarios:
// cambiar de rol o eliminar una cuenta.
require_once __DIR__ . "/config/conexion.php";
session_start();

if (!isset($_SESSION["id_usuario"]) || $_SESSION["rol_usuario"] !== "admin") {
    header("Location: login.php");
    exit;
}

$accion = $_POST["accion"] ?? "";
$id = (int) ($_POST["id"] ?? 0);

// Un administrador nunca puede modificarse ni eliminarse a sí mismo desde aquí,
// para evitar que el sistema se quede sin ningún administrador por accidente
if ($id === (int) $_SESSION["id_usuario"]) {
    header("Location: admin.php");
    exit;
}

if ($accion === "cambiar_rol") {
    $nuevoRol = $_POST["nuevo_rol"] === "admin" ? "admin" : "usuario";
    $consulta = mysqli_prepare($conexion, "UPDATE usuarios SET rol = ? WHERE id = ?");
    mysqli_stmt_bind_param($consulta, "si", $nuevoRol, $id);
    mysqli_stmt_execute($consulta);

} elseif ($accion === "eliminar") {
    // ON DELETE CASCADE en la tabla repositorios se encarga de borrar en
    // cadena sus documentos, logs y entidades asociadas
    $consulta = mysqli_prepare($conexion, "DELETE FROM usuarios WHERE id = ?");
    mysqli_stmt_bind_param($consulta, "i", $id);
    mysqli_stmt_execute($consulta);
}

header("Location: admin.php");
exit;
?>