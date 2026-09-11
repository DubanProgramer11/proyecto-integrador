<?php
// dashboard.php
// Panel principal: lista los repositorios del usuario y permite crear/editar/eliminar
require_once __DIR__ . "/config/conexion.php";
session_start();

if (!isset($_SESSION["id_usuario"])) {
    header("Location: login.php");
    exit;
}

$id_usuario = $_SESSION["id_usuario"];

// Traemos todos los repositorios de este usuario, más recientes primero
$consulta = mysqli_prepare($conexion, "SELECT id, nombre, descripcion, fecha_creacion FROM repositorios WHERE id_usuario = ? ORDER BY fecha_creacion DESC");
mysqli_stmt_bind_param($consulta, "i", $id_usuario);
mysqli_stmt_execute($consulta);
$repositorios = mysqli_stmt_get_result($consulta);

// Iniciales del nombre para el avatar (ej. "Juan Pérez" -> "JP")
$partes_nombre = explode(" ", trim($_SESSION["nombre_usuario"]));
$iniciales = strtoupper(substr($partes_nombre[0], 0, 1) . (isset($partes_nombre[1]) ? substr($partes_nombre[1], 0, 1) : ""));
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mis repositorios | DocuMind IA</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/estilo.css">
</head>
<body>

    <header class="app-navbar">
        <div class="contenedor app-navbar-contenido">
            <a href="dashboard.php" class="marca">
                <svg width="34" height="34" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="4" width="26" height="34" rx="3" fill="url(#gradDocD)"/>
                    <line x1="13" y1="14" x2="29" y2="14" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>
                    <line x1="13" y1="19" x2="29" y2="19" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>
                    <line x1="13" y1="24" x2="24" y2="24" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>
                    <path d="M34 26 L37.2 32.4 L44 34.6 L37.2 36.8 L34 43.2 L30.8 36.8 L24 34.6 L30.8 32.4 Z" fill="url(#gradSparkD)"/>
                    <defs>
                        <linearGradient id="gradDocD" x1="8" y1="4" x2="34" y2="38" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#1E5AA8"/><stop offset="1" stop-color="#1B8A6B"/>
                        </linearGradient>
                        <linearGradient id="gradSparkD" x1="24" y1="26" x2="44" y2="43" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#2FBE8F"/><stop offset="1" stop-color="#1E8FD1"/>
                        </linearGradient>
                    </defs>
                </svg>
                <span class="marca-texto">DocuMind<span class="marca-acento">IA</span></span>
            </a>
            <div class="usuario-chip">
    <span><?php echo htmlspecialchars($_SESSION["nombre_usuario"]); ?></span>
    <div class="usuario-avatar"><?php echo htmlspecialchars($iniciales); ?></div>
    <?php if ($_SESSION["rol_usuario"] === "admin"): ?>
        <a href="admin.php" class="btn btn-outline" style="padding:8px 18px;">Panel admin</a>
    <?php endif; ?>
    <a href="logout.php" class="btn btn-outline" style="padding:8px 18px;">Salir</a>
</div>
        </div>
    </header>

    <main class="app-envoltorio">
        <div class="app-encabezado">
            <div>
                <h1>Mis repositorios</h1>
                <p>Organiza tus documentos en carpetas por proyecto, cliente o categoría.</p>
            </div>
        </div>

        <div class="repos-grid">

            <!-- Tarjeta para crear un repositorio nuevo -->
            <div class="repo-tarjeta repo-nueva" onclick="document.getElementById('modalCrear').classList.add('activo')">
                <div class="repo-nueva-icono">+</div>
                <span>Crear repositorio</span>
            </div>

            <?php if (mysqli_num_rows($repositorios) === 0): ?>
                <!-- No hay mensaje de vacío aquí porque ya está la tarjeta "Crear repositorio" -->
            <?php else: ?>
                <?php while ($repo = mysqli_fetch_assoc($repositorios)): ?>
                    <div class="repo-tarjeta">
                        <div class="repo-icono">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
                        </div>
                        <span class="repo-nombre"><?php echo htmlspecialchars($repo["nombre"]); ?></span>
                        <p class="repo-descripcion"><?php echo htmlspecialchars($repo["descripcion"] ?: "Sin descripción"); ?></p>
                        <span class="repo-fecha">Creado el <?php echo date("d/m/Y", strtotime($repo["fecha_creacion"])); ?></span>
                        <div class="repo-acciones">
                            <a href="repositorio.php?id=<?php echo $repo['id']; ?>" class="enlace-abrir">Abrir</a>
                            <button type="button" class="enlace-editar"
                                onclick="abrirEditar(<?php echo $repo['id']; ?>, '<?php echo htmlspecialchars(addslashes($repo['nombre'])); ?>', '<?php echo htmlspecialchars(addslashes($repo['descripcion'])); ?>')">
                                Editar
                            </button>
                            <button type="button" class="enlace-eliminar"
                                onclick="confirmarEliminar(<?php echo $repo['id']; ?>, '<?php echo htmlspecialchars(addslashes($repo['nombre'])); ?>')">
                                Eliminar
                            </button>
                        </div>
                    </div>
                <?php endwhile; ?>
            <?php endif; ?>

        </div>
    </main>

    <!-- ===== MODAL: Crear repositorio ===== -->
    <div class="modal-fondo" id="modalCrear">
        <div class="modal-caja">
            <h2>Crear repositorio</h2>
            <form method="POST" action="repositorios_guardar.php">
                <input type="hidden" name="accion" value="crear">
                <div class="campo">
                    <label for="nombreCrear">Nombre</label>
                    <input type="text" id="nombreCrear" name="nombre" required>
                </div>
                <div class="campo">
                    <label for="descripcionCrear">Descripción (opcional)</label>
                    <input type="text" id="descripcionCrear" name="descripcion">
                </div>
                <div class="modal-botones">
                    <button type="button" class="btn-cancelar" onclick="document.getElementById('modalCrear').classList.remove('activo')">Cancelar</button>
                    <button type="submit" class="btn btn-lleno" style="border:none;">Crear</button>
                </div>
            </form>
        </div>
    </div>

    <!-- ===== MODAL: Editar repositorio ===== -->
    <div class="modal-fondo" id="modalEditar">
        <div class="modal-caja">
            <h2>Editar repositorio</h2>
            <form method="POST" action="repositorios_guardar.php">
                <input type="hidden" name="accion" value="editar">
                <input type="hidden" name="id" id="idEditar">
                <div class="campo">
                    <label for="nombreEditar">Nombre</label>
                    <input type="text" id="nombreEditar" name="nombre" required>
                </div>
                <div class="campo">
                    <label for="descripcionEditar">Descripción (opcional)</label>
                    <input type="text" id="descripcionEditar" name="descripcion">
                </div>
                <div class="modal-botones">
                    <button type="button" class="btn-cancelar" onclick="document.getElementById('modalEditar').classList.remove('activo')">Cancelar</button>
                    <button type="submit" class="btn btn-lleno" style="border:none;">Guardar cambios</button>
                </div>
            </form>
        </div>
    </div>

    <!-- ===== MODAL: Confirmar eliminación ===== -->
    <div class="modal-fondo" id="modalEliminar">
        <div class="modal-caja">
            <h2>¿Eliminar repositorio?</h2>
            <p id="textoEliminar" style="color: var(--texto-medio); font-size: 0.92rem;"></p>
            <form method="POST" action="repositorios_guardar.php">
                <input type="hidden" name="accion" value="eliminar">
                <input type="hidden" name="id" id="idEliminar">
                <div class="modal-botones">
                    <button type="button" class="btn-cancelar" onclick="document.getElementById('modalEliminar').classList.remove('activo')">Cancelar</button>
                    <button type="submit" class="btn btn-lleno" style="border:none; background:#C23232; box-shadow:none;">Eliminar</button>
                </div>
            </form>
        </div>
    </div>

    <script src="assets/js/repositorios.js"></script>
</body>
</html>