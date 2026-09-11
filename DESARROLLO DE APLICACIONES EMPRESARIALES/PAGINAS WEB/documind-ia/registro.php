<?php
// registro.php
// Formulario para crear una cuenta nueva en la tabla "usuarios"
require_once __DIR__ . "/config/conexion.php";

$error = "";
$exito = "";

// Este bloque solo se ejecuta cuando el usuario envía el formulario (método POST)
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // trim() quita espacios sobrantes al inicio/final de lo que escribió el usuario
    $nombre = trim($_POST["nombre"]);
    $correo = trim($_POST["correo"]);
    $contrasena = $_POST["contrasena"];
    $confirmar = $_POST["confirmar"];

    if ($nombre === "" || $correo === "" || $contrasena === "") {
        $error = "Todos los campos son obligatorios.";
    } elseif (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        $error = "El correo electrónico no tiene un formato válido.";
    } elseif (strlen($contrasena) < 6) {
        $error = "La contraseña debe tener al menos 6 caracteres.";
    } elseif ($contrasena !== $confirmar) {
        $error = "Las contraseñas no coinciden.";
    } else {
        // Verificamos que el correo no esté ya registrado.
        // Usamos consultas preparadas (?) para evitar inyección SQL.
        $consulta = mysqli_prepare($conexion, "SELECT id FROM usuarios WHERE correo = ?");
        mysqli_stmt_bind_param($consulta, "s", $correo);
        mysqli_stmt_execute($consulta);
        mysqli_stmt_store_result($consulta);

        if (mysqli_stmt_num_rows($consulta) > 0) {
            $error = "Ya existe una cuenta registrada con ese correo.";
        } else {
            // password_hash cifra la contraseña, nunca se guarda en texto plano
            $hash = password_hash($contrasena, PASSWORD_DEFAULT);

            $insertar = mysqli_prepare($conexion, "INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)");
            mysqli_stmt_bind_param($insertar, "sss", $nombre, $correo, $hash);

            if (mysqli_stmt_execute($insertar)) {
                // Redirigimos a login.php con un mensaje de éxito en la URL
                header("Location: login.php?registrado=1");
                exit;
            } else {
                $error = "Ocurrió un error al crear la cuenta. Intenta de nuevo.";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crear cuenta | DocuMind IA</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/estilo.css">
</head>
<body>

    <header class="navbar">
        <div class="contenedor navbar-contenido">
            <a href="index.php" class="marca">
                <svg class="logo-icono" width="38" height="38" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="4" width="26" height="34" rx="3" fill="url(#gradDoc2)"/>
                    <line x1="13" y1="14" x2="29" y2="14" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>
                    <line x1="13" y1="19" x2="29" y2="19" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>
                    <line x1="13" y1="24" x2="24" y2="24" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>
                    <path d="M34 26 L37.2 32.4 L44 34.6 L37.2 36.8 L34 43.2 L30.8 36.8 L24 34.6 L30.8 32.4 Z" fill="url(#gradSpark2)"/>
                    <defs>
                        <linearGradient id="gradDoc2" x1="8" y1="4" x2="34" y2="38" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#1E5AA8"/>
                            <stop offset="1" stop-color="#1B8A6B"/>
                        </linearGradient>
                        <linearGradient id="gradSpark2" x1="24" y1="26" x2="44" y2="43" gradientUnits="userSpaceOnUse">
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
            <h1 class="auth-titulo">Crea tu cuenta</h1>
            <p class="auth-subtitulo">Empieza a organizar tus documentos con IA</p>

            <?php if ($error): ?>
                <div class="mensaje mensaje-error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <form method="POST" action="registro.php">
                <div class="campo">
                    <label for="nombre">Nombre completo</label>
                    <input type="text" id="nombre" name="nombre" value="<?php echo isset($nombre) ? htmlspecialchars($nombre) : ''; ?>" required>
                </div>
                <div class="campo">
                    <label for="correo">Correo electrónico</label>
                    <input type="email" id="correo" name="correo" value="<?php echo isset($correo) ? htmlspecialchars($correo) : ''; ?>" required>
                </div>
                <div class="campo">
                    <label for="contrasena">Contraseña</label>
                    <input type="password" id="contrasena" name="contrasena" required>
                </div>
                <div class="campo">
                    <label for="confirmar">Confirmar contraseña</label>
                    <input type="password" id="confirmar" name="confirmar" required>
                </div>
                <button type="submit" class="btn btn-lleno auth-boton">Crear cuenta</button>
            </form>

            <p class="auth-pie">¿Ya tienes cuenta? <a href="login.php">Inicia sesión</a></p>
        </div>
    </div>

</body>
</html>