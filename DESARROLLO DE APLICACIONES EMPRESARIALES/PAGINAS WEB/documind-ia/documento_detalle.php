<?php
// documento_detalle.php
// Muestra el resultado del procesamiento IA de un documento: resumen,
// entidades extraídas y el historial de logs de su procesamiento.
require_once __DIR__ . "/config/conexion.php";
session_start();

if (!isset($_SESSION["id_usuario"])) {
    header("Location: login.php");
    exit;
}

$id_documento = (int) ($_GET["id"] ?? 0);
$id_usuario = $_SESSION["id_usuario"];

$consulta = mysqli_prepare($conexion, "
    SELECT d.*, r.nombre AS nombre_repositorio, c.nombre AS nombre_categoria
    FROM documentos d
    INNER JOIN repositorios r ON d.id_repositorio = r.id
    LEFT JOIN categorias c ON d.id_categoria = c.id
    WHERE d.id = ? AND r.id_usuario = ?
");
mysqli_stmt_bind_param($consulta, "ii", $id_documento, $id_usuario);
mysqli_stmt_execute($consulta);
$doc = mysqli_stmt_get_result($consulta)->fetch_assoc();

if (!$doc) {
    header("Location: dashboard.php");
    exit;
}

$entidades = mysqli_prepare($conexion, "SELECT tipo_entidad, valor FROM entidades_extraidas WHERE id_documento = ?");
mysqli_stmt_bind_param($entidades, "i", $id_documento);
mysqli_stmt_execute($entidades);
$entidades = mysqli_stmt_get_result($entidades);

$logs = mysqli_prepare($conexion, "SELECT etapa, estado, mensaje, fecha FROM logs_procesamiento WHERE id_documento = ? ORDER BY fecha ASC");
mysqli_stmt_bind_param($logs, "i", $id_documento);
mysqli_stmt_execute($logs);
$logs = mysqli_stmt_get_result($logs);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($doc["nombre_original"]); ?> | DocuMind IA</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/estilo.css">
    <style>
        .detalle-envoltorio { max-width: 820px; margin: 0 auto; padding: 48px 24px 80px; }
        .detalle-bloque { background: var(--blanco); border: 1px solid var(--borde); border-radius: var(--radio); padding: 28px; margin-bottom: 24px; }
        .detalle-bloque h2 { font-size: 1.05rem; margin-bottom: 14px; }
        .entidad-fila { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--fondo); font-size: 0.9rem; }
        .entidad-tipo { font-weight: 600; color: var(--azul); min-width: 140px; text-transform: capitalize; }
        .log-fila { padding: 8px 0; border-bottom: 1px solid var(--fondo); font-size: 0.85rem; }
        .log-etapa { font-weight: 600; }
        .log-fecha { color: var(--texto-medio); font-size: 0.78rem; }
    </style>
</head>
<body>
    <header class="app-navbar">
        <div class="contenedor app-navbar-contenido">
            <a href="dashboard.php" class="marca"><span class="marca-texto">DocuMind<span class="marca-acento">IA</span></span></a>
            <a href="logout.php" class="btn btn-outline" style="padding:8px 18px;">Salir</a>
        </div>
    </header>

    <main class="detalle-envoltorio">
        <a href="repositorio.php?id=<?php echo $doc['id_repositorio']; ?>" class="volver-enlace">← <?php echo htmlspecialchars($doc["nombre_repositorio"]); ?></a>
        <h1 style="margin: 10px 0 6px;"><?php echo htmlspecialchars($doc["nombre_original"]); ?></h1>
        <p style="color: var(--texto-medio); margin-bottom: 30px;">
            Categoría: <strong><?php echo htmlspecialchars($doc["nombre_categoria"] ?? "Sin clasificar"); ?></strong>
            · Estado: <strong><?php echo htmlspecialchars($doc["estado_procesamiento"]); ?></strong>
        </p>

        <div class="detalle-bloque">
            <h2>Resumen generado por IA</h2>
            <p><?php echo $doc["resumen"] ? nl2br(htmlspecialchars($doc["resumen"])) : "Todavía no se ha generado un resumen para este documento."; ?></p>
        </div>

        <div class="detalle-bloque">
            <h2>Información extraída</h2>
            <?php if (mysqli_num_rows($entidades) === 0): ?>
                <p style="color: var(--texto-medio); font-size: 0.9rem;">No se encontró información estructurada en este documento.</p>
            <?php else: ?>
                <?php while ($e = mysqli_fetch_assoc($entidades)): ?>
                    <div class="entidad-fila">
                        <span class="entidad-tipo"><?php echo htmlspecialchars(str_replace("_", " ", $e["tipo_entidad"])); ?></span>
                        <span><?php echo htmlspecialchars($e["valor"]); ?></span>
                    </div>
                <?php endwhile; ?>
            <?php endif; ?>
        </div>

        <div class="detalle-bloque">
            <h2>Registro de procesamiento</h2>
            <?php while ($log = mysqli_fetch_assoc($logs)): ?>
                <div class="log-fila">
                    <span class="log-etapa"><?php echo htmlspecialchars(ucfirst($log["etapa"])); ?></span>
                    (<?php echo htmlspecialchars($log["estado"]); ?>) — <?php echo htmlspecialchars($log["mensaje"]); ?>
                    <div class="log-fecha"><?php echo date("d/m/Y H:i", strtotime($log["fecha"])); ?></div>
                </div>
            <?php endwhile; ?>
        </div>
    </main>
</body>
</html>