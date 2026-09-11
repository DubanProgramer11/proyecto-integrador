<?php
// config/conexion.php
// Archivo central de conexión a MySQL. Todos los demás archivos PHP
// del proyecto incluirán este archivo para hablar con la base de datos.

$host = "localhost";      // XAMPP corre MySQL en tu propia máquina
$usuario = "root";        // usuario por defecto de XAMPP
$contrasena = "";         // por defecto XAMPP no tiene contraseña
$base_datos = "documind_ia";

// mysqli_connect crea la conexión. Si algo falla, detenemos la ejecución
// y mostramos el error para poder depurarlo.
$conexion = mysqli_connect($host, $usuario, $contrasena, $base_datos);

if (!$conexion) {
    die("Error de conexión a la base de datos: " . mysqli_connect_error());
}

// Forzamos la codificación de caracteres para que tildes y ñ se guarden bien
mysqli_set_charset($conexion, "utf8mb4");
?>