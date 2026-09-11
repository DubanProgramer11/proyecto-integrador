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
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="40" rx="11" fill="url(#gradChip1)"/>
                    <rect x="11" y="8" width="16" height="22" rx="2.5" fill="white" opacity="0.97"/>
                    <rect x="14" y="13.5" width="10" height="1.8" rx="0.9" fill="#1E5AA8"/>
                    <rect x="14" y="17.5" width="10" height="1.8" rx="0.9" fill="#1E5AA8"/>
                    <rect x="14" y="21.5" width="6" height="1.8" rx="0.9" fill="#1B8A6B"/>
                    <circle cx="28" cy="27" r="7" fill="#2FBE8F"/>
                    <path d="M28 23.8 L29.1 26.4 L31.7 27 L29.1 27.6 L28 30.2 L26.9 27.6 L24.3 27 L26.9 26.4 Z" fill="white"/>
                    <defs>
                        <linearGradient id="gradChip1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#1E5AA8"/><stop offset="1" stop-color="#1B8A6B"/>
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
                <h1>Tus documentos, <span class="resaltado">mejor organizados</span> con Inteligencia Artificial</h1>
                <p class="hero-parrafo">
                    DocuMind IA te permite almacenar, clasificar y analizar tus documentos
                    con el poder de la IA, en un flujo continuo: del archivo a la respuesta.
                </p>
                <div class="hero-botones">
                    <a href="registro.php" class="btn btn-lleno btn-grande">Registrarse</a>
                    <a href="login.php" class="btn btn-outline btn-grande">Iniciar sesión</a>
                </div>
            </div>

            <div class="hero-panel">
                <svg class="hero-ilustracion" viewBox="0 0 380 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="190" cy="160" r="150" fill="#EAF1FA"/>
                    <circle cx="60" cy="70" r="34" fill="#E9F7F1"/>
                    <circle cx="330" cy="250" r="26" fill="#EAF1FA"/>

                    <!-- Conectores -->
                    <path d="M96 110 Q150 140 168 150" stroke="#C9D9EC" stroke-width="2.5" stroke-dasharray="5,6" fill="none"/>
                    <path d="M96 190 Q150 175 168 165" stroke="#C9D9EC" stroke-width="2.5" stroke-dasharray="5,6" fill="none"/>
                    <path d="M120 250 Q155 220 172 185" stroke="#C9D9EC" stroke-width="2.5" stroke-dasharray="5,6" fill="none"/>

                    <!-- Archivo PDF -->
                    <rect x="58" y="86" width="56" height="56" rx="16" fill="#D64545"/>
                    <rect x="76" y="103" width="20" height="24" rx="3" fill="white"/>
                    <text x="86" y="119" text-anchor="middle" font-family="Poppins, sans-serif" font-size="7" font-weight="700" fill="#D64545">PDF</text>

                    <!-- Archivo DOCX -->
                    <rect x="52" y="168" width="56" height="56" rx="16" fill="#2E5CA8"/>
                    <rect x="70" y="185" width="20" height="24" rx="3" fill="white"/>
                    <text x="80" y="201" text-anchor="middle" font-family="Poppins, sans-serif" font-size="6.3" font-weight="700" fill="#2E5CA8">DOCX</text>

                    <!-- Archivo TXT -->
                    <rect x="96" y="228" width="52" height="52" rx="15" fill="#5C6B75"/>
                    <rect x="112" y="244" width="20" height="22" rx="3" fill="white"/>
                    <text x="122" y="259" text-anchor="middle" font-family="Poppins, sans-serif" font-size="6.6" font-weight="700" fill="#5C6B75">TXT</text>

                    <!-- Nodo central IA -->
                    <circle cx="230" cy="165" r="62" fill="url(#gradNodo)"/>
                    <circle cx="230" cy="165" r="62" fill="none" stroke="white" stroke-width="4"/>
                    <rect x="205" y="142" width="22" height="30" rx="4" fill="white" opacity="0.95"/>
                    <rect x="211" y="150" width="10" height="2.2" rx="1.1" fill="#1E5AA8"/>
                    <rect x="211" y="156" width="10" height="2.2" rx="1.1" fill="#1E5AA8"/>
                    <path d="M246 148 L249 155 L256 157.5 L249 160 L246 167 L243 160 L236 157.5 L243 155 Z" fill="white"/>
                    <text x="230" y="200" text-anchor="middle" font-family="Poppins, sans-serif" font-size="12" font-weight="700" fill="white">IA</text>

                    <defs>
                        <linearGradient id="gradNodo" x1="168" y1="103" x2="292" y2="227" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#1E5AA8"/>
                            <stop offset="1" stop-color="#1B8A6B"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>

        <div class="contenedor">
            <div class="chips-caracteristicas">
                <div class="chip-caracteristica">
                    <div class="chip-icono icono-azul">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h10M4 18h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    </div>
                    <span>Clasificación automática de documentos</span>
                </div>
                <div class="chip-caracteristica">
                    <div class="chip-icono icono-verde">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3v10m0 0l-3.5-3.5M12 13l3.5-3.5M5 21h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <span>Resumen de contenido con IA</span>
                </div>
                <div class="chip-caracteristica">
                    <div class="chip-icono icono-azul">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    </div>
                    <span>Extracción de entidades y datos clave</span>
                </div>
                <div class="chip-caracteristica">
                    <div class="chip-icono icono-verde">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 6v6c0 5 3.8 9 9 10 5.2-1 9-5 9-10V6l-9-4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
                    </div>
                    <span>Gestión segura de repositorios</span>
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