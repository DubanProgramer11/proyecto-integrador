<?php
// login.php
// Formulario de inicio de sesión
require_once __DIR__ . "/config/conexion.php";
session_start();

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

        if ($usuario && password_verify($contrasena, $usuario["contrasena"])) {
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
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="40" rx="11" fill="url(#gradChip2)"/>
                    <rect x="11" y="8" width="16" height="22" rx="2.5" fill="white" opacity="0.97"/>
                    <rect x="14" y="13.5" width="10" height="1.8" rx="0.9" fill="#1E5AA8"/>
                    <rect x="14" y="17.5" width="10" height="1.8" rx="0.9" fill="#1E5AA8"/>
                    <rect x="14" y="21.5" width="6" height="1.8" rx="0.9" fill="#1B8A6B"/>
                    <circle cx="28" cy="27" r="7" fill="#2FBE8F"/>
                    <path d="M28 23.8 L29.1 26.4 L31.7 27 L29.1 27.6 L28 30.2 L26.9 27.6 L24.3 27 L26.9 26.4 Z" fill="white"/>
                    <defs>
                        <linearGradient id="gradChip2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#1E5AA8"/><stop offset="1" stop-color="#1B8A6B"/>
                        </linearGradient>
                    </defs>
                </svg>
                <span class="marca-texto">DocuMind<span class="marca-acento">IA</span></span>
            </a>
        </div>
    </header>

    <div class="auth-envoltorio">
        <div class="auth-tarjeta">
            <h1 class="auth-titulo">Iniciar sesión</h1>
            <p class="auth-subtitulo">Ingresa a tu cuenta para continuar</p>

            <?php if ($error): ?>
                <div class="mensaje mensaje-error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            <?php if ($exito): ?>
                <div class="mensaje mensaje-exito"><?php echo htmlspecialchars($exito); ?></div>
            <?php endif; ?>

            <form method="POST" action="login.php">
                <div class="campo">
                    <label for="correo">Correo electrónico</label>
                    <input type="email" id="correo" name="correo" placeholder="tuusuario@ejemplo.com" required>
                </div>
                <div class="campo">
                    <label for="contrasena">Contraseña</label>
                    <input type="password" id="contrasena" name="contrasena" required>
                </div>
                <button type="submit" class="btn btn-lleno auth-boton">Iniciar sesión</button>
            </form>

            <p class="auth-pie">¿No tienes una cuenta? <a href="registro.php">Regístrate</a></p>
        </div>
    </div>

</body>
</html>