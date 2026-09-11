<?php
// repositorio.php
// Vista de un repositorio: subir documentos y ver el listado con su estado
require_once __DIR__ . "/config/conexion.php";
session_start();

if (!isset($_SESSION["id_usuario"])) {
    header("Location: login.php");
    exit;
}

$id_repositorio = (int) ($_GET["id"] ?? 0);
$id_usuario = $_SESSION["id_usuario"];

// Verificamos que el repositorio exista y sea del usuario logueado
$consulta = mysqli_prepare($conexion, "SELECT nombre, descripcion FROM repositorios WHERE id = ? AND id_usuario = ?");
mysqli_stmt_bind_param($consulta, "ii", $id_repositorio, $id_usuario);
mysqli_stmt_execute($consulta);
$repositorio = mysqli_stmt_get_result($consulta)->fetch_assoc();

if (!$repositorio) {
    header("Location: dashboard.php");
    exit;
}

// Traemos los documentos de este repositorio, más recientes primero
$consultaDocs = mysqli_prepare($conexion, "SELECT id, nombre_original, formato, tamano_kb, id_categoria, estado_procesamiento, fecha_carga FROM documentos WHERE id_repositorio = ? ORDER BY fecha_carga DESC");
mysqli_stmt_bind_param($consultaDocs, "i", $id_repositorio);
mysqli_stmt_execute($consultaDocs);
$documentos = mysqli_stmt_get_result($consultaDocs);

// Traemos las categorías disponibles (para mostrarlas como texto, aunque
// la asignación real de categoría la hará el módulo de IA en el próximo paso)
$categorias = mysqli_query($conexion, "SELECT id, nombre FROM categorias");
$mapaCategorias = [];
while ($cat = mysqli_fetch_assoc($categorias)) {
    $mapaCategorias[$cat["id"]] = $cat["nombre"];
}

$error = $_GET["error"] ?? "";
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($repositorio["nombre"]); ?> | DocuMind IA</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/estilo.css">
</head>
<body>

    <header class="app-navbar">
        <div class="contenedor app-navbar-contenido">
            <a href="dashboard.php" class="marca">
                <span class="marca-texto">DocuMind<span class="marca-acento">IA</span></span>
            </a>
            <a href="logout.php" class="btn btn-outline" style="padding:8px 18px;">Salir</a>
        </div>
    </header>

    <main class="app-envoltorio">
        <a href="dashboard.php" class="volver-enlace">← Mis repositorios</a>

        <div class="repo-encabezado">
            <div>
                <h1><?php echo htmlspecialchars($repositorio["nombre"]); ?></h1>
                <p><?php echo htmlspecialchars($repositorio["descripcion"] ?: "Sin descripción"); ?></p>
            </div>
        </div>

        <?php if ($error === "formato"): ?>
            <div class="mensaje mensaje-error" style="margin-bottom: 24px;">Formato no permitido. Solo se aceptan archivos PDF, DOCX o TXT.</div>
        <?php elseif ($error === "tamano"): ?>
            <div class="mensaje mensaje-error" style="margin-bottom: 24px;">El archivo supera el tamaño máximo permitido.</div>
        <?php elseif ($error === "subida"): ?>
            <div class="mensaje mensaje-error" style="margin-bottom: 24px;">Ocurrió un error al subir el archivo. Intenta de nuevo.</div>
        <?php endif; ?>

        <!-- Formulario de carga -->
        <form action="documentos_subir.php" method="POST" enctype="multipart/form-data" id="formCarga">
            <input type="hidden" name="id_repositorio" value="<?php echo $id_repositorio; ?>">
            <div class="zona-carga" id="zonaCarga">
                <div class="zona-carga-icono">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0-12l-4 4m4-4l4 4M5 21h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <h3>Arrastra un archivo aquí o haz clic para elegirlo</h3>
                <p>Formatos permitidos: PDF, DOCX, TXT</p>
                <label for="archivoInput" class="btn btn-lleno" style="cursor: pointer;">Elegir archivo</label>
                <input type="file" id="archivoInput" name="archivo" accept=".pdf,.docx,.txt" required>
                <div class="nombre-archivo-elegido" id="nombreElegido"></div>
            </div>
        </form>

        <!-- Tabla de documentos -->
        <?php if (mysqli_num_rows($documentos) === 0): ?>
            <div class="estado-vacio">Todavía no has subido documentos a este repositorio.</div>
        <?php else: ?>
            <table class="documentos-tabla">
                <thead>
                    <tr>
                        <th>Documento</th>
                        <th>Categoría</th>
                        <th>Tamaño</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while ($doc = mysqli_fetch_assoc($documentos)): ?>
                        <tr>
                            <td>
                                <div class="doc-nombre">
                                    <span class="doc-formato formato-<?php echo $doc['formato']; ?>"><?php echo strtoupper($doc['formato']); ?></span>
                                    <?php echo htmlspecialchars($doc["nombre_original"]); ?>
                                </div>
                            </td>
                            <td><?php echo $doc["id_categoria"] ? htmlspecialchars($mapaCategorias[$doc["id_categoria"]]) : "—"; ?></td>
                            <td><?php echo number_format($doc["tamano_kb"]); ?> KB</td>
                            <td>
                                <?php
                                $estados = [
                                    "pendiente" => ["Pendiente", "badge-pendiente"],
                                    "procesando" => ["Procesando", "badge-procesando"],
                                    "completado" => ["Completado", "badge-completado"],
                                    "error" => ["Error", "badge-error"],
                                ];
                                $info = $estados[$doc["estado_procesamiento"]];
                                ?>
                                <span class="badge-estado <?php echo $info[1]; ?>"><?php echo $info[0]; ?></span>
                            </td>
                            <td><?php echo date("d/m/Y", strtotime($doc["fecha_carga"])); ?></td>
                            <td>
                                <div class="doc-acciones">
    <a href="documento_detalle.php?id=<?php echo $doc['id']; ?>">Ver detalle</a>
    <a href="documentos_descargar.php?id=<?php echo $doc['id']; ?>">Descargar</a>
    <?php if (in_array($doc["estado_procesamiento"], ["error", "pendiente"])): ?>
        <a href="documentos_procesar.php?id=<?php echo $doc['id']; ?>">Reprocesar</a>
    <?php endif; ?>
    <a href="documentos_eliminar.php?id=<?php echo $doc['id']; ?>" onclick="return confirm('¿Eliminar este documento?');" style="color:#C23232;">Eliminar</a>
</div>
                            </td>
                        </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </main>

    <script src="assets/js/documentos.js"></script>
</body>
</html>