<?php
// index.php
// Página de inicio (landing page) de DocuMind IA
require_once __DIR__ . "/config/conexion.php";
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DocuMind IA | Gestión Inteligente de Documentos</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/estilo.css">
</head>
<body>

    <!-- ===== BARRA DE NAVEGACIÓN ===== -->
    <header class="navbar">
        <div class="contenedor navbar-contenido">
            <div class="marca">
                <svg class="logo-icono" width="38" height="38" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="4" width="26" height="34" rx="3" fill="url(#gradDoc)"/>
                    <line x1="13" y1="14" x2="29" y2="14" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>
                    <line x1="13" y1="19" x2="29" y2="19" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>
                    <line x1="13" y1="24" x2="24" y2="24" stroke="white" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>
                    <path d="M34 26 L37.2 32.4 L44 34.6 L37.2 36.8 L34 43.2 L30.8 36.8 L24 34.6 L30.8 32.4 Z" fill="url(#gradSpark)"/>
                    <defs>
                        <linearGradient id="gradDoc" x1="8" y1="4" x2="34" y2="38" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#1E5AA8"/>
                            <stop offset="1" stop-color="#1B8A6B"/>
                        </linearGradient>
                        <linearGradient id="gradSpark" x1="24" y1="26" x2="44" y2="43" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#2FBE8F"/>
                            <stop offset="1" stop-color="#1E8FD1"/>
                        </linearGradient>
                    </defs>
                </svg>
                <span class="marca-texto">DocuMind<span class="marca-acento">IA</span></span>
            </div>
            <nav class="nav-links">
                <a href="#caracteristicas">Características</a>
                <a href="#como-funciona">Cómo funciona</a>
                <a href="login.php" class="btn btn-outline">Iniciar sesión</a>
                <a href="registro.php" class="btn btn-lleno">Crear cuenta</a>
            </nav>
        </div>
    </header>

    <!-- ===== HERO ===== -->
    <section class="hero">
        <div class="contenedor hero-contenido">
            <div class="hero-texto">
                <span class="etiqueta">Sistema Inteligente de Gestión Documental</span>
                <h1>Convierte tu repositorio de archivos en <span class="resaltado">conocimiento consultable</span></h1>
                <p class="hero-parrafo">
                    DocuMind IA organiza, clasifica, resume y responde preguntas sobre tus documentos
                    PDF, Word y de texto, usando inteligencia artificial en cada paso del proceso.
                </p>
                <div class="hero-botones">
                    <a href="registro.php" class="btn btn-lleno btn-grande">Comenzar ahora</a>
                    <a href="#como-funciona" class="btn btn-texto">Ver cómo funciona →</a>
                </div>
            </div>
            <div class="hero-panel">
                <div class="panel-tarjeta">
                    <div class="panel-fila">
                        <span class="punto punto-verde"></span>
                        <span>contrato_arrendamiento.pdf</span>
                        <span class="estado estado-listo">Procesado</span>
                    </div>
                    <div class="panel-fila">
                        <span class="punto punto-azul"></span>
                        <span>factura_0231.docx</span>
                        <span class="estado estado-proceso">Analizando</span>
                    </div>
                    <div class="panel-fila">
                        <span class="punto punto-verde"></span>
                        <span>informe_trimestral.txt</span>
                        <span class="estado estado-listo">Procesado</span>
                    </div>
                    <div class="panel-divisor"></div>
                    <div class="panel-pregunta">
                        <span class="panel-pregunta-etiqueta">Consulta en lenguaje natural</span>
                        <p>"¿Cuál es el valor total facturado este mes?"</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ===== CARACTERÍSTICAS ===== -->
    <section id="caracteristicas" class="seccion">
        <div class="contenedor">
            <h2 class="seccion-titulo">Todo lo que necesitas en un solo repositorio</h2>
            <p class="seccion-subtitulo">Del archivo sin procesar a la respuesta útil, en un flujo continuo.</p>

            <div class="tarjetas-grid">
                <div class="tarjeta">
                    <div class="tarjeta-icono icono-azul">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h10M4 18h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    </div>
                    <h3>Clasificación automática</h3>
                    <p>La IA organiza cada documento en categorías como contratos, facturas o informes.</p>
                </div>
                <div class="tarjeta">
                    <div class="tarjeta-icono icono-verde">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 3v10m0 0l-3.5-3.5M12 13l3.5-3.5M5 21h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <h3>Resúmenes por documento</h3>
                    <p>Obtén el resumen de cualquier archivo sin tener que abrirlo ni leerlo completo.</p>
                </div>
                <div class="tarjeta">
                    <div class="tarjeta-icono icono-azul">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    </div>
                    <h3>Búsqueda dentro del contenido</h3>
                    <p>Encuentra información específica sin importar en qué archivo esté guardada.</p>
                </div>
                <div class="tarjeta">
                    <div class="tarjeta-icono icono-verde">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2a5 5 0 015 5v2a5 5 0 01-10 0V7a5 5 0 015-5z" stroke="currentColor" stroke-width="2"/><path d="M19 11a7 7 0 01-14 0M12 18v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    </div>
                    <h3>Preguntas en lenguaje natural</h3>
                    <p>Escribe una pregunta como lo harías a una persona y obtén una respuesta basada en tus documentos.</p>
                </div>
                <div class="tarjeta">
                    <div class="tarjeta-icono icono-azul">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="13" y="3" width="8" height="5" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="13" y="12" width="8" height="9" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="3" y="15" width="8" height="6" rx="1.5" stroke="currentColor" stroke-width="2"/></svg>
                    </div>
                    <h3>Dashboard con indicadores</h3>
                    <p>Visualiza el estado de tu repositorio: documentos por categoría, formato y estado de procesamiento.</p>
                </div>
                <div class="tarjeta">
                    <div class="tarjeta-icono icono-verde">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 6v6c0 5 3.8 9 9 10 5.2-1 9-5 9-10V6l-9-4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
                    </div>
                    <h3>Control de errores</h3>
                    <p>Cada etapa del procesamiento queda registrada, incluyendo fallos y advertencias.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- ===== CÓMO FUNCIONA ===== -->
    <section id="como-funciona" class="seccion seccion-alterna">
        <div class="contenedor">
            <h2 class="seccion-titulo">El flujo real detrás de cada documento</h2>
            <div class="pasos">
                <div class="paso">
                    <span class="paso-numero">01</span>
                    <h4>Carga del archivo</h4>
                    <p>Subes un PDF, DOCX o TXT a tu repositorio.</p>
                </div>
                <div class="paso">
                    <span class="paso-numero">02</span>
                    <h4>Extracción de contenido</h4>
                    <p>El sistema lee el texto real del documento.</p>
                </div>
                <div class="paso">
                    <span class="paso-numero">03</span>
                    <h4>Procesamiento con IA</h4>
                    <p>Se clasifica, resume y extraen datos clave.</p>
                </div>
                <div class="paso">
                    <span class="paso-numero">04</span>
                    <h4>Consulta y respuesta</h4>
                    <p>Buscas o preguntas, y obtienes la respuesta.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- ===== PIE DE PÁGINA ===== -->
    <footer class="pie">
        <div class="contenedor pie-contenido">
            <span>© <?php echo date("Y"); ?> DocuMind IA — Proyecto Integrador UTS</span>
            <span>Desarrollo de Aplicaciones Empresariales · VI semestre</span>
        </div>
    </footer>

</body>
</html>