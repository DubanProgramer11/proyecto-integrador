<?php
// logout.php
session_start();
session_destroy(); // borra todos los datos de la sesión
header("Location: index.php");
exit;
?>