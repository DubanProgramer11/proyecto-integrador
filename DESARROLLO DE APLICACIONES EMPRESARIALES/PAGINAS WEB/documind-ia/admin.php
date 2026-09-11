<?php
// admin.php
// Panel de administrador: indicadores globales del sistema y gestión de usuarios
require_once __DIR__ . "/config/conexion.php";
session_start();

if (!isset($_SESSION["id_usuario"])) {
    header("Location: login.php");
    exit;
}

// Solo los usuarios con rol "admin" pueden entrar aquí
if ($_SESSION["rol_usuario"] !== "admin") {
    header("Location: dashboard.php");
    exit;
}

// ===== Indicadores globales (KPIs) =====
$totalUsuarios = mysqli_fetch_assoc(mysqli_query($conexion, "SELECT COUNT(*) AS total FROM usuarios"))["total"];
$totalRepositorios = mysqli_fetch_assoc(mysqli_query($conexion, "SELECT COUNT(*) AS total FROM repositorios"))["total"];
$totalDocumentos = mysqli_fetch_assoc(mysqli_query($conexion, "SELECT COUNT(*) AS total FROM documentos"))["total"];
$totalErrores = mysqli_fetch_assoc(mysqli_query($conexion, "SELECT COUNT(*) AS total FROM documentos WHERE estado_procesamiento = 'error'"))["total"];

// ===== Documentos por estado (para las barras) =====
$porEstado = mysqli_query($conexion, "SELECT estado_procesamiento, COUNT(*) AS total FROM documentos GROUP BY estado_procesamiento");
$estadosMapa = ["pendiente" => 0, "procesando" => 0, "completado" => 0, "error" => 0];
while ($fila = mysqli_fetch_assoc($porEstado)) {
    $estadosMapa[$fila["estado_procesamiento"]] = (int) $fila["total"];
}
$maximoEstado = max(1, max($estadosMapa));

// ===== Documentos por categoría (para las barras) =====
$porCategoria = mysqli_query($conexion, "
    SELECT c.nombre, COUNT(d.id) AS total
    FROM categorias c
    LEFT JOIN documentos d ON d.id_categoria = c.id
    GROUP BY c.id, c.nombre
    ORDER BY total DESC
");
$categoriasFilas = mysqli_fetch_all($porCategoria, MYSQLI_ASSOC);
$maximoCategoria = 1;
foreach ($categoriasFilas as $fila) {
    $maximoCategoria = max($maximoCategoria, (int) $fila["total"]);
}

// ===== Lista de usuarios =====
$usuarios = mysqli_query($conexion, "
    SELECT u.id, u.nombre, u.correo, u.rol, u.fecha_registro,
           (SELECT COUNT(*) FROM repositorios r WHERE r.id_usuario = u.id) AS total_repos
    FROM usuarios u
    ORDER BY u.fecha_registro DESC
");
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de administrador | DocuMind IA</title>
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
            <div class="usuario-chip">
                <a href="dashboard.php" class="btn btn-outline" style="padding:8px 18px;">Mis repositorios</a>
                <a href="logout.php" class="btn btn-outline" style="padding:8px 18px;">Salir</a>
            </div>
        </div>
    </header>

    <main class="app-envoltorio">
        <div class="app-encabezado">
            <div>
                <h1>Panel de administrador</h1>
                <p>Indicadores generales del sistema y gestión de usuarios.</p>
            </div>
        </div>

        <!-- KPIs -->
        <div class="kpi-grid">
            <div class="kpi-tarjeta">
                <div class="kpi-etiqueta">Usuarios registrados</div>
                <div class="kpi-valor kpi-azul"><?php echo $totalUsuarios; ?></div>
            </div>
            <div class="kpi-tarjeta">
                <div class="kpi-etiqueta">Repositorios creados</div>
                <div class="kpi-valor kpi-azul"><?php echo $totalRepositorios; ?></div>
            </div>
            <div class="kpi-tarjeta">
                <div class="kpi-etiqueta">Documentos totales</div>
                <div class="kpi-valor kpi-verde"><?php echo $totalDocumentos; ?></div>
            </div>
            <div class="kpi-tarjeta">
                <div class="kpi-etiqueta">Documentos con error</div>
                <div class="kpi-valor kpi-rojo"><?php echo $totalErrores; ?></div>
            </div>
        </div>

        <!-- Documentos por estado -->
        <div class="admin-seccion">
            <h2>Documentos por estado de procesamiento</h2>
            <?php
            $etiquetasEstado = ["pendiente" => "Pendiente", "procesando" => "Procesando", "completado" => "Completado", "error" => "Error"];
            foreach ($etiquetasEstado as $clave => $etiqueta):
                $valor = $estadosMapa[$clave];
                $porcentaje = round(($valor / $maximoEstado) * 100);
            ?>
                <div class="barra-fila">
                    <span class="barra-etiqueta"><?php echo $etiqueta; ?></span>
                    <div class="barra-pista"><div class="barra-relleno" style="width: <?php echo $porcentaje; ?>%;"></div></div>
                    <span class="barra-numero"><?php echo $valor; ?></span>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Documentos por categoría -->
        <div class="admin-seccion">
            <h2>Documentos por categoría</h2>
            <?php foreach ($categoriasFilas as $fila):
                $porcentaje = round(((int)$fila["total"] / $maximoCategoria) * 100);
            ?>
                <div class="barra-fila">
                    <span class="barra-etiqueta"><?php echo htmlspecialchars($fila["nombre"]); ?></span>
                    <div class="barra-pista"><div class="barra-relleno" style="width: <?php echo $porcentaje; ?>%;"></div></div>
                    <span class="barra-numero"><?php echo $fila["total"]; ?></span>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Gestión de usuarios -->
        <div class="admin-seccion">
            <h2>Usuarios</h2>
            <table class="documentos-tabla">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Repositorios</th>
                        <th>Registrado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while ($u = mysqli_fetch_assoc($usuarios)): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($u["nombre"]); ?></td>
                            <td><?php echo htmlspecialchars($u["correo"]); ?></td>
                            <td>
                                <span class="rol-chip <?php echo $u['rol'] === 'admin' ? 'rol-admin' : 'rol-usuario'; ?>">
                                    <?php echo $u["rol"] === "admin" ? "Administrador" : "Usuario"; ?>
                                </span>
                            </td>
                            <td><?php echo $u["total_repos"]; ?></td>
                            <td><?php echo date("d/m/Y", strtotime($u["fecha_registro"])); ?></td>
                            <td>
                                <div class="doc-acciones">
                                    <?php if ($u["id"] != $_SESSION["id_usuario"]): ?>
                                        <form method="POST" action="admin_acciones.php" style="display:inline;">
                                            <input type="hidden" name="id" value="<?php echo $u['id']; ?>">
                                            <input type="hidden" name="accion" value="cambiar_rol">
                                            <input type="hidden" name="nuevo_rol" value="<?php echo $u['rol'] === 'admin' ? 'usuario' : 'admin'; ?>">
                                            <button type="submit" class="enlace-editar">
                                                <?php echo $u["rol"] === "admin" ? "Quitar admin" : "Hacer admin"; ?>
                                            </button>
                                        </form>
                                        <form method="POST" action="admin_acciones.php" style="display:inline;" onsubmit="return confirm('¿Eliminar este usuario junto con todos sus repositorios y documentos?');">
                                            <input type="hidden" name="id" value="<?php echo $u['id']; ?>">
                                            <input type="hidden" name="accion" value="eliminar">
                                            <button type="submit" class="enlace-eliminar">Eliminar</button>
                                        </form>
                                    <?php else: ?>
                                        <span style="color: var(--texto-medio); font-size: 0.82rem;">Tu cuenta</span>
                                    <?php endif; ?>
                                </div>
                            </td>
                        </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        </div>
    </main>

</body>
</html>