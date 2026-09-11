<?php
// login.php
// Formulario de inicio de sesión
require_once __DIR__ . "/config/conexion.php";
session_start(); // inicia (o reanuda) la sesión de PHP para poder guardar quién inició sesión

$error = "";
$exito = "";

if (isset($_GET["registrado"])) {
    $exito = "Cuenta creada correctamente. Ahora inicia sesión.";
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $correo = trim($_POST["correo"]);
    $contrasena = $_POST["contrasena"];

    if ($correo === "" || $contrasena === "") {
        $error = "Ingresa tu correo y tu contraseña.";
    } else {
        $consulta = mysqli_prepare($conexion, "SELECT id, nombre, contrasena, rol FROM usuarios WHERE correo = ?");
        mysqli_stmt_bind_param($consulta, "s", $correo);
        mysqli_stmt_execute($consulta);
        $resultado = mysqli_stmt_get_result($consulta);
        $usuario = mysqli_fetch_assoc($resultado);

        // password_verify compara la contraseña escrita con el hash guardado
        if ($usuario && password_verify($contrasena, $usuario["contrasena"])) {
            // Guardamos los datos del usuario en la sesión para usarlos en otras páginas
            $_SESSION["id_usuario"] = $usuario["id"];
            $_SESSION["nombre_usuario"] = $usuario["nombre"];
            $_SESSION["rol_usuario"] = $usuario["rol"];

            header("Location: dashboard.php");
            exit;
        } else {
            $error = "Correo o contraseña incorrectos.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar sesión | DocuMind IA</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/estilo.css">
</head>
<body>

    <header class="navbar">
        <div class="contenedor navbar-contenido">
            <a href="index.php" class="marca">
                <svg class="logo-icono" width="38" height="38" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="4" width="26" height="34" rx="3" fill="url(#gradDoc3)"/>
                    <line x1="13" y1="14" x2="29" y2="14" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>
                    <line x1="13" y1="19" x2="29" y2="19" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>
                    <line x1="13" y1="24" x2="24" y2="24" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>
                    <path d="M34 26 L37.2 32.4 L44 34.6 L37.2 36.8 L34 43.2 L30.8 36.8 L24 34.6 L30.8 32.4 Z" fill="url(#gradSpark3)"/>
                    <defs>
                        <linearGradient id="gradDoc3" x1="8" y1="4" x2="34" y2="38" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#1E5AA8"/>
                            <stop offset="1" stop-color="#1B8A6B"/>
                        </linearGradient>
                        <linearGradient id="gradSpark3" x1="24" y1="26" x2="44" y2="43" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#2FBE8F"/>
                            <stop offset="1" stop-color="#1E8FD1"/>
                        </linearGradient>
                    </defs>
                </svg>
                <span class="marca-texto">DocuMind<span class="marca-acento">IA</span></span>
            </a>
        </div>
    </header>

    <div class="auth-envoltorio">
        <div class="auth-tarjeta">
            <h1 class="auth-titulo">Inicia sesión</h1>
            <p class="auth-subtitulo">Accede a tu repositorio de documentos</p>

            <?php if ($error): ?>
                <div class="mensaje mensaje-error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            <?php if ($exito): ?>
                <div class="mensaje mensaje-exito"><?php echo htmlspecialchars($exito); ?></div>
            <?php endif; ?>

            <form method="POST" action="login.php">
                <div class="campo">
                    <label for="correo">Correo electrónico</label>
                    <input type="email" id="correo" name="correo" required>
                </div>
                <div class="campo">
                    <label for="contrasena">Contraseña</label>
                    <input type="password" id="contrasena" name="contrasena" required>
                </div>
                <button type="submit" class="btn btn-lleno auth-boton">Entrar</button>
            </form>

            <p class="auth-pie">¿No tienes cuenta? <a href="registro.php">Regístrate</a></p>
        </div>
    </div>

</body>
</html>