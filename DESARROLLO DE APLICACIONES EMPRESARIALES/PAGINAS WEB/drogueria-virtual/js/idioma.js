// ============================================================
// ARCHIVO: js/idioma.js
// Traducciones centralizadas + botón de idioma en el header.
// Se carga en TODAS las páginas, justo después de api.js.
//
// Atributos soportados en el HTML:
//   data-i18n        -> reemplaza el texto (textContent)
//   data-i18n-html   -> reemplaza el contenido con HTML (para textos con <span>)
//   data-i18n-title  -> traduce solo el tooltip, sin tocar el contenido
// ============================================================

// var (no const): si el archivo se carga dos veces por error,
// const lanzaría "Identifier has already been declared" y tumba la página.
var TRADUCCIONES = {
    es: {
        // Generales
        "titulo_sitio": "VitalFarma",
        "buscar_placeholder": "Buscar productos, marcas, categorías...",
        "mi_cuenta": "Mi cuenta",
        "carrito": "Carrito",
        "catalogo": "Catálogo",
        "subir_orden": "Subir orden médica",
        "iniciar_sesion": "Iniciar sesión",
        "registrarse": "Registrarse",
        "cerrar_sesion": "Cerrar sesión",
        "mi_perfil": "Mi perfil",
        "mis_direcciones": "Mis direcciones",
        "mis_pedidos": "Mis pedidos",
        "historial": "Historial",
        "ordenes_medicas": "Órdenes médicas",
        "calificar_atencion": "Calificar atención",
        "resumen": "Resumen",
        "configuracion": "Configuración",
        "seleccionar_idioma": "Selecciona tu idioma:",
        "espanol": "🇪🇸 Español",
        "ingles": "🇬🇧 English",
        "idioma_detectado": "🌐 El idioma se detecta automáticamente según tu navegador.",
        "idioma_cambiado": "Idioma cambiado correctamente.",

        // ===== INICIO (index.html) =====
        "nav_medicamentos": "Medicamentos",
        "nav_cuidado_personal": "Cuidado personal",
        "nav_vitaminas": "Vitaminas",
        "nav_higiene": "Higiene",
        "nav_bebes": "Bebés",
        "nav_primeros_auxilios": "Primeros auxilios",

        "banner_etiqueta": "🚚 Entrega en el mismo día",
        "banner_titulo_html": "Tu salud, <span>a un clic</span> de distancia",
        "banner_texto": "Medicamentos, cuidado personal y bienestar con la confianza de una droguería real. Sube tu orden médica y nosotros nos encargamos del resto.",
        "ver_catalogo": "Ver catálogo",
        "banner_originales": "✅ Productos originales",
        "banner_segura": "🔒 Compra segura",
        "banner_domicilios": "⏱️ Domicilios rápidos",
        "banner_card_titulo": "Asistente virtual 24/7",
        "banner_card_texto": "Resuelve dudas sobre productos, pedidos y domicilios al instante.",

        "categorias_titulo": "Explora por categoría",
        "destacados_titulo": "Productos destacados",
        "ver_todo": "Ver todo →",

        "beneficios_titulo": "¿Por qué elegir VitalFarma?",
        "beneficio1_titulo": "Entrega rápida",
        "beneficio1_texto": "Domicilios el mismo día en tu ciudad.",
        "beneficio2_titulo": "Compra segura",
        "beneficio2_texto": "Tus datos y pagos protegidos en todo momento.",
        "beneficio3_titulo": "Asesoría 24/7",
        "beneficio3_texto": "Nuestro asistente virtual resuelve tus dudas.",
        "beneficio4_titulo": "Productos originales",
        "beneficio4_texto": "Garantía de calidad en cada producto.",

        "chatbot_flotante_title": "Habla con nuestro asistente",

        "footer_tagline": "Tu droguería virtual de confianza.",
        "footer_enlaces": "Enlaces",
        "footer_nosotros": "Nosotros",
        "footer_contacto": "Contacto",
        "footer_crear_cuenta": "Crear cuenta",
        "footer_derechos": "© 2026 VitalFarma. Todos los derechos reservados.",

        // Catálogo
        "catalogo_titulo": "Catálogo de productos",
        "catalogo_subtitulo": "Encuentra medicamentos, cuidado personal y mucho más.",
        "filtros": "Filtros",
        "categoria": "Categoría",
        "precio_maximo": "Precio máximo",
        "disponibilidad": "Disponibilidad",
        "solo_disponibles": "Solo mostrar disponibles",
        "limpiar_filtros": "Limpiar filtros",
        "buscar_en_catalogo": "Buscar en el catálogo...",
        "productos_encontrados": "productos encontrados",
        "ordenar_por": "Ordenar por",
        "relevancia": "Relevancia",
        "precio_asc": "Precio: menor a mayor",
        "precio_desc": "Precio: mayor a menor",
        "mejor_calificados": "Mejor calificados",
        "no_resultados": "No encontramos productos con esos filtros. Intenta ajustarlos.",

        // Productos
        "disponible": "Disponible",
        "agotado": "Agotado",
        "agregar": "Agregar",
        "ver": "Ver",
        "no_disponible": "No disponible",
        "stock_disponible": "Stock disponible",
        "maximo": "Máx.",
        "subtotal": "Subtotal",
        "total": "Total",
        "envio": "Envío",
        "gratis": "Gratis",
        "te_faltan": "Te faltan",
        "para_envio_gratis": "para envío gratis 🚚",

        // Carrito
        "carrito_titulo": "Tu carrito",
        "carrito_vacio": "Tu carrito está vacío",
        "carrito_vacio_texto": "Agrega productos desde el catálogo para verlos aquí.",
        "ir_al_catalogo": "Ir al catálogo",
        "resumen_pedido": "Resumen del pedido",
        "confirmar_pedido": "Confirmar pedido",
        "vaciar_carrito": "Vaciar carrito",
        "seguro_vaciar": "¿Seguro que deseas vaciar el carrito?",
        "producto_agregado": "Producto agregado al carrito",
        "inicia_sesion_para_carrito": "Inicia sesión para agregar productos al carrito",

        // Checkout
        "checkout_titulo": "Finalizar compra",
        "checkout_subtitulo": "Selecciona la dirección de entrega y confirma tu pedido.",
        "direccion_entrega": "Dirección de entrega",
        "agregar_direccion": "+ Agregar dirección",
        "seleccionar_direccion": "Selecciona una dirección de entrega.",
        "confirmar_pedido_btn": "Confirmar pedido",
        "pedido_confirmado": "¡Pedido confirmado con éxito! Redirigiendo...",
        "error_pedido": "Error al confirmar el pedido. Intenta de nuevo.",
        "carrito_vacio_checkout": "Tu carrito está vacío. No puedes confirmar un pedido sin productos.",

        // Perfil
        "perfil_titulo": "Mi perfil",
        "perfil_subtitulo": "Actualiza tu información personal.",
        "nombre_completo": "Nombre completo",
        "correo_electronico": "Correo electrónico",
        "telefono": "Teléfono",
        "guardar_cambios": "Guardar cambios",
        "error_nombre_invalido": "⚠️ Ingresa un nombre válido (mínimo 2 letras).",
        "error_telefono_invalido": "⚠️ Ingresa un teléfono válido (7 a 10 dígitos).",
        "datos_actualizados": "✅ Tus datos se actualizaron correctamente.",
        "cambiar_contraseña": "Cambiar contraseña",

        // Chatbot
        "chatbot_titulo": "Asistente VitalFarma",
        "chatbot_en_linea": "En línea",
        "chatbot_escribiendo": "El asistente está escribiendo...",
        "chatbot_placeholder": "Escribe o elige una opción...",
        "chatbot_bienvenida": "¡Hola! 👋 Soy el asistente virtual de VitalFarma. Elige una opción o escribe tu pregunta:",
        "chatbot_error": "Ocurrió un error al procesar tu mensaje. Intenta de nuevo.",
        "chatbot_escalado": "🔔 Tu caso fue escalado a un agente humano.",
        "chatbot_volver_menu": "⬅️ Volver al menú",
        "chatbot_buscar_producto": "🔍 Buscar un producto",
        "chatbot_ver_categorias": "📂 Ver productos por categoría",
        "chatbot_ver_carrito": "🛒 Mi carrito",
        "chatbot_ver_pedidos": "📦 Mis pedidos",
        "chatbot_orden_medica": "📋 Orden médica",
        "chatbot_domicilios": "🚚 Domicilios",
        "chatbot_agente": "💬 Hablar con un agente",
        "chatbot_modo_libre": "✏️ Escribir mi pregunta",
        "chatbot_domicilio_costo": "💲 Costo y tiempo de entrega",
        "chatbot_domicilio_cobertura": "📍 Zonas de cobertura",
        "chatbot_ir_orden": "📋 Ir a subir mi orden",
        "chatbot_pregunta_producto": "Escribe el nombre del producto que buscas 🔍",
        "chatbot_agregar": "➕ Agregar",
        "chatbot_seguir_comprando": "🔍 Seguir comprando",
        "chatbot_ir_pagar": "🛍️ Ir a pagar",
        "chatbot_carrito_vacio": "Tu carrito está vacío. ¿Quieres buscar productos para agregar?",
        "chatbot_pedidos_vacios": "No encuentro pedidos registrados en tu cuenta todavía.",
        "chatbot_no_resultados": "No encontré productos que coincidan con",
        "chatbot_intentar_otro": "¿Quieres intentar con otro nombre?",

        // Órdenes médicas
        "orden_medica_titulo": "Subir orden médica",
        "orden_medica_subtitulo": "Carga tu orden médica (imagen o PDF) y nuestro sistema la analizará automáticamente.",
        "orden_medica_subir": "Subir archivo",
        "orden_medica_estado": "Estado de la orden",
        "orden_medica_pendiente": "Pendiente",
        "orden_medica_procesada": "Procesada",
        "orden_medica_revisada": "Revisada por usuario",
        "orden_medica_rechazada": "Rechazada",
        "orden_medica_confirmar": "Confirmar productos",
        "orden_medica_analizando": "Analizando orden médica...",
        "orden_medica_sugerencias": "Productos sugeridos para tu orden médica:",
        "orden_medica_sin_orden": "No has subido ninguna orden médica.",

        // Admin (panel)
        "admin_dashboard": "Panel de control",
        "admin_productos": "Productos",
        "admin_pedidos": "Pedidos",
        "admin_clientes": "Clientes",
        "admin_ordenes_medicas": "Órdenes médicas",
        "admin_conversaciones": "Conversaciones",
        "admin_calificaciones": "Calificaciones",
        "admin_comentarios": "Comentarios",
        "admin_recomendaciones": "Recomendaciones",
        "admin_reportes": "Reportes",
        "admin_usuarios": "Usuarios y roles",
        "admin_configuracion": "Configuración",
        "admin_cerrar_sesion": "Cerrar sesión",

        // ===== CARRITO, CHECKOUT Y ORDEN MÉDICA =====
        "mi_carrito": "Mi carrito",
        "domicilio": "Domicilio",
        "proceder_pedido": "Proceder al pedido",
        "carrito_seguir": "← Seguir comprando",
        "agregar_direccion_nueva": "+ Agregar nueva dirección",
        "orden_titulo": "Sube tu orden médica",
        "orden_intro": "Analizamos automáticamente tu fórmula y te sugerimos los medicamentos disponibles en nuestro catálogo. No diagnosticamos ni decidimos por ti — tú confirmas qué agregar al carrito.",
        "orden_aviso": "⚠️ Esta función es opcional. Puedes comprar medicamentos de venta libre sin necesidad de subir ninguna orden.",
        "orden_arrastra": "Arrastra tu imagen aquí, o",
        "orden_seleccionar": "📁 Seleccionar archivo",
        "orden_formatos": "JPG, PNG o PDF — máximo 5MB",
        "orden_analizar": "Analizar orden médica",
        "orden_texto_detectado": "Texto detectado en tu orden:",
        "orden_encontrados": "Medicamentos encontrados en nuestro catálogo:",
        "orden_agregar_seleccionados": "Agregar seleccionados al carrito",

                // ===== LOGIN Y REGISTRO =====
        "login_titulo": "Bienvenido de nuevo",
        "login_subtitulo": "Ingresa tus datos para acceder a tu cuenta.",
        "recordarme": "Recordarme",
        "olvidaste_password": "¿Olvidaste tu contraseña?",
        "no_tienes_cuenta_html": "¿No tienes cuenta? <a href=\"registro.html\">Regístrate aquí</a>",
        "ya_tienes_cuenta_html": "¿Ya tienes cuenta? <a href=\"login.html\">Inicia sesión aquí</a>",
        "ph_correo": "tucorreo@ejemplo.com",
        "ph_password": "••••••••",
        "login_visual_titulo": "Tu salud, siempre a un clic",
        "login_visual_texto": "Accede a tus pedidos, órdenes médicas y mucho más.",
        "login_visual_1": "✅ Compra segura y protegida",
        "login_visual_2": "🚚 Domicilios el mismo día",
        "login_visual_3": "💬 Asistente virtual 24/7",

        "registro_titulo": "Crea tu cuenta",
        "registro_subtitulo": "Regístrate para comprar y seguir tus pedidos.",
        "confirmar_password": "Confirmar contraseña",
        "crear_cuenta": "Crear cuenta",
        "ph_nombre": "Ej: María Fernanda Gómez",
        "ph_telefono": "Ej: 3001234567",
        "ph_min8": "Mínimo 8 caracteres",
        "ph_repite": "Repite tu contraseña",
        "terminos_html": "Acepto los <a href=\"#\" style=\"color:var(--color-primario); font-weight:600;\">términos y condiciones</a> y el tratamiento de mis datos.",
        "registro_visual_titulo": "Únete a VitalFarma",
        "registro_visual_texto": "Crea tu cuenta y disfruta de todos los beneficios.",
        "registro_visual_1": "📦 Seguimiento de tus pedidos",
        "registro_visual_2": "📋 Sube tus órdenes médicas",
        "registro_visual_3": "⭐ Guarda tus productos favoritos",

        // ===== RESUMEN DE MI CUENTA =====
        "saludo_hola": "¡Hola {nombre}! 👋",
        "cuenta_subtitulo": "Este es el resumen de tu cuenta en VitalFarma.",
        "resumen_pedidos_label": "Pedidos realizados",
        "resumen_direcciones_label": "Direcciones guardadas",
        "resumen_ordenes_label": "Órdenes médicas",
        "ver_mis_pedidos": "Ver mis pedidos",
        "editar_perfil": "Editar perfil",

        // ===== HISTORIAL Y ÓRDENES MÉDICAS =====
        "hist_titulo": "Historial de compras",
        "hist_subtitulo": "Todos tus pedidos anteriores, con el detalle de lo que compraste en cada uno. Haz clic en un pedido para ver sus productos.",
        "om_titulo": "Mis órdenes médicas",
        "om_subtitulo_html": "Las fórmulas que has subido y su estado de análisis. <a href=\"../../pages/orden-medica.html\" style=\"color:var(--color-primario); font-weight:600;\">Subir una nueva →</a>",
        "cuenta_titulo": "Mi cuenta",

                // ===== ESTADOS Y TEXTOS GENERADOS POR JS =====
        "est_pendiente": "Pendiente",
        "est_confirmado": "Confirmado",
        "est_en_camino": "En camino",
        "est_entregado": "Entregado",
        "est_cancelado": "Cancelado",
        "om_est_pendiente": "Pendiente",
        "om_est_procesada": "Procesada",
        "om_est_revisada": "Revisada",
        "om_est_error": "Con error",

        "cargando_detalle": "Cargando detalle...",
        "cargando_direcciones": "Cargando direcciones...",
        "err_cargar_direcciones": "No se pudieron cargar tus direcciones.",
        "err_detalle_pedido": "No se pudo cargar el detalle de este pedido.",
        "err_detalle_orden": "No se pudo cargar el detalle de esta orden.",

        "dir_sin_direcciones": "Aún no tienes direcciones guardadas. Agrega la primera con el formulario. 📍",
        "dir_badge_pred": "Predeterminada",
        "dir_ref_label": "Referencia:",
        "dir_tel_label": "Tel. contacto:",
        "dir_btn_editar": "✏️ Editar",
        "dir_btn_pred": "⭐ Marcar predeterminada",
        "dir_btn_eliminar": "🗑️ Eliminar",
        "dir_editar_titulo": "Editar dirección",
        "dir_confirmar_eliminar": "¿Eliminar esta dirección?",
        "dir_campos_minimos": "Por favor completa al menos la dirección, la ciudad y el teléfono de contacto.",

        "ped_vacio": "Todavía no has realizado ningún pedido.",
        "hist_vacio": "Todavía no tienes compras en tu historial.",
        "ir_catalogo_flecha": "Ir al catálogo →",
        "pedido_num": "Pedido",
        "orden_num": "Orden",
        "sin_productos_pedido": "Sin productos registrados en este pedido.",

        "om_vacio": "Todavía no has subido ninguna orden médica.",
        "om_subir_primera": "Subir mi primera orden →",
        "om_ver_archivo": "📄 Ver archivo subido",
        "om_texto_doc": "Texto detectado en el documento:",
        "om_productos_detectados": "Productos detectados:",
        "om_sin_productos": "No se detectaron productos del catálogo en este documento.",
        "om_en_carrito": "Agregada al carrito",
        "om_sin_confirmar": "Sin confirmar",

        "cal_sin_pendientes": "No tienes pedidos pendientes por calificar",
        "cal_selecciona": "Selecciona un pedido...",
        "cal_err_pedido": "Selecciona el pedido que quieres calificar.",
        "cal_err_estrellas": "Selecciona una calificación en estrellas.",
        "cal_err_clasificacion": "Selecciona una clasificación (Excelente, Buena, Regular o Mala).",
        "cal_gracias": "¡Gracias por tu calificación!",
        "cal_min5": "Escribe un mensaje de al menos 5 caracteres.",
        "cal_gracias_mensaje": "¡Gracias por tu mensaje!",

        "perfil_err_nombre": "Ingresa un nombre válido (mínimo 2 letras).",
        "perfil_err_telefono": "Ingresa un teléfono válido (7 a 10 dígitos).",
        "perfil_ok": "✅ Datos actualizados correctamente.",
        "perfil_error": "Error al actualizar tus datos.",
        "confirmar_logout": "¿Deseas cerrar sesión?",

                "cerrar_sesion": "🚪 Cerrar sesión",
        "mi_perfil": "👤 Mi perfil",
        "mis_direcciones": "📍 Mis direcciones",
        "mis_pedidos": "📦 Mis pedidos",
        "historial": "🧾 Historial",
        "ordenes_medicas": "📋 Órdenes médicas",
        "calificar_atencion": "⭐ Calificar atención",
        "resumen": "🏠 Resumen",

                // ===== MIS DIRECCIONES =====
        "dir_titulo": "Mis direcciones",
        "dir_subtitulo": "Administra tus direcciones de entrega.",
        "dir_form_titulo": "Agregar nueva dirección",
        "dir_etiqueta": "Etiqueta",
        "dir_casa": "Casa",
        "dir_trabajo": "Trabajo",
        "dir_otro": "Otro",
        "dir_direccion": "Dirección",
        "dir_ciudad": "Ciudad",
        "dir_barrio": "Barrio",
        "dir_referencia": "Referencia (opcional)",
        "dir_telefono": "Teléfono de contacto",
        "dir_predeterminada": "Marcar como predeterminada",
        "dir_guardar": "Guardar dirección",
        "dir_cancelar": "Cancelar",
        "ph_dir_direccion": "Calle 45 # 12-30",
        "ph_dir_ciudad": "Bucaramanga",
        "ph_dir_barrio": "Cabecera",
        "ph_dir_referencia": "Casa esquinera, portón azul",
        "ph_dir_telefono": "3001234567",

        // ===== MIS PEDIDOS =====
        "ped_titulo": "Mis pedidos",
        "ped_subtitulo": "Todos tus pedidos realizados en VitalFarma.",

        // ===== CALIFICAR Y COMENTAR =====
        "cal_titulo": "Calificar y comentar",
        "cal_subtitulo": "Tu opinión nos ayuda a mejorar.",
        "cal_tab_calificar": "⭐ Calificar un pedido",
        "cal_tab_comentar": "💬 Comentario / sugerencia",
        "cal_que_pedido": "¿Qué pedido quieres calificar?",
        "cal_estrellas": "¿Cómo calificarías la atención? (1 a 5 estrellas)",
        "cal_clasificacion": "Clasificación general",
        "cal_excelente": "Excelente",
        "cal_buena": "Buena",
        "cal_regular": "Regular",
        "cal_mala": "Mala",
        "cal_comentario_opcional": "Comentario (opcional)",
        "cal_enviar": "Enviar calificación",
        "cal_tipo_mensaje": "Tipo de mensaje",
        "cal_tipo_comentario": "💬 Comentario",
        "cal_tipo_queja": "⚠️ Queja",
        "cal_tipo_sugerencia": "💡 Sugerencia",
        "cal_tipo_recomendacion": "⭐ Recomendación",
        "cal_tu_mensaje": "Tu mensaje",
        "cal_enviar_mensaje": "Enviar mensaje",
        "ph_cal_experiencia": "Cuéntanos más sobre tu experiencia...",
        "ph_cal_escribe": "Escribe aquí...",
        "cal_gracias": "¡Gracias por tu calificación!",
        "cal_gracias_mensaje": "¡Gracias por tu mensaje!",
        "cal_err_pedido": "Selecciona el pedido que quieres calificar.",
        "cal_err_estrellas": "Selecciona una calificación en estrellas.",
        "cal_err_clasificacion": "Selecciona una clasificación (Excelente, Buena, Regular o Mala).",
        "cal_min5": "Escribe un mensaje de al menos 5 caracteres.",

                "modal_titulo": "Iniciar sesión o registrarse",
        "modal_sin_cuenta": "¿No tienes cuenta?",
        "modal_con_cuenta": "¿Ya tienes cuenta?",
        "modal_err_email": "Ingresa un correo electrónico válido.",
        "modal_err_password": "Ingresa tu contraseña.",
        "modal_err_password_corta": "La contraseña debe tener mínimo 8 caracteres.",
        "modal_err_nombre": "Ingresa un nombre válido (mínimo 2 letras).",
        "modal_err_telefono": "Ingresa un teléfono válido (7 a 10 dígitos).",
        "modal_credenciales": "Correo o contraseña incorrectos.",
        "modal_bienvenido": "¡Bienvenido de nuevo!",
        "modal_acceso_admin": "Acceso administrativo verificado. Abriendo el panel...",
        "modal_cuenta_creada": "¡Cuenta creada con éxito!",
        "modal_err_registro": "No se pudo crear la cuenta. Intenta de nuevo.",

        "banner_etiqueta_texto": "Entrega en el mismo día",
        "banner_originales_texto": "Productos originales",
        "banner_segura_texto": "Compra segura",
        "banner_domicilios_texto": "Domicilios rápidos",
        "ver_todo_texto": "Ver todo",

                "volver_inicio": "Volver al inicio",
        "login_visual_titulo_html": "Tu salud, siempre <span>a un clic</span>",
        "login_t1_titulo": "Sigue tus pedidos",
        "login_t1_texto": "Consulta el estado de cada entrega en tiempo real.",
        "login_t2_titulo": "Sube tu orden médica",
        "login_t2_texto": "La analizamos y te sugerimos los medicamentos.",
        "login_t3_titulo": "Domicilios el mismo día",
        "login_t3_texto": "Envío gratis en compras superiores a $80.000.",

                "cal_tab_calificar_texto": "Calificar un pedido",
        "cal_tab_comentar_texto": "Comentario / sugerencia",
        "cal_tipo_comentario_texto": "Comentario",
        "cal_tipo_queja_texto": "Queja",
        "cal_tipo_sugerencia_texto": "Sugerencia",
        "cal_tipo_recomendacion_texto": "Recomendación",
        "configuracion_texto": "Configuración"

    },
    en: {
        // General
        "titulo_sitio": "VitalFarma",
        "buscar_placeholder": "Search products, brands, categories...",
        "mi_cuenta": "My account",
        "carrito": "Cart",
        "catalogo": "Catalog",
        "subir_orden": "Upload medical order",
        "iniciar_sesion": "Log in",
        "registrarse": "Sign up",
        "cerrar_sesion": "Log out",
        "mi_perfil": "My profile",
        "mis_direcciones": "My addresses",
        "mis_pedidos": "My orders",
        "historial": "History",
        "ordenes_medicas": "Medical orders",
        "calificar_atencion": "Rate service",
        "resumen": "Summary",
        "configuracion": "Settings",
        "seleccionar_idioma": "Select your language:",
        "espanol": "🇪🇸 Spanish",
        "ingles": "🇬🇧 English",
        "idioma_detectado": "🌐 Language is automatically detected from your browser.",
        "idioma_cambiado": "Language changed successfully.",
                // ===== MY ADDRESSES =====
        "dir_titulo": "My addresses",
        "dir_subtitulo": "Manage your delivery addresses.",
        "dir_form_titulo": "Add new address",
        "dir_etiqueta": "Label",
        "dir_casa": "Home",
        "dir_trabajo": "Work",
        "dir_otro": "Other",
        "dir_direccion": "Address",
        "dir_ciudad": "City",
        "dir_barrio": "Neighborhood",
        "dir_referencia": "Landmark (optional)",
        "dir_telefono": "Contact phone",
        "dir_predeterminada": "Set as default",
        "dir_guardar": "Save address",
        "dir_cancelar": "Cancel",
        "ph_dir_direccion": "45th St # 12-30",
        "ph_dir_ciudad": "Bucaramanga",
        "ph_dir_barrio": "Cabecera",
        "ph_dir_referencia": "Corner house, blue gate",
        "ph_dir_telefono": "3001234567",

        // ===== MY ORDERS =====
        "ped_titulo": "My orders",
        "ped_subtitulo": "All the orders you've placed at VitalFarma.",

        // ===== RATE AND COMMENT =====
        "cal_titulo": "Rate and comment",
        "cal_subtitulo": "Your feedback helps us improve.",
        "cal_tab_calificar": "⭐ Rate an order",
        "cal_tab_comentar": "💬 Comment / suggestion",
        "cal_que_pedido": "Which order would you like to rate?",
        "cal_estrellas": "How would you rate the service? (1 to 5 stars)",
        "cal_clasificacion": "Overall rating",
        "cal_excelente": "Excellent",
        "cal_buena": "Good",
        "cal_regular": "Fair",
        "cal_mala": "Poor",
        "cal_comentario_opcional": "Comment (optional)",
        "cal_enviar": "Submit rating",
        "cal_tipo_mensaje": "Message type",
        "cal_tipo_comentario": "💬 Comment",
        "cal_tipo_queja": "⚠️ Complaint",
        "cal_tipo_sugerencia": "💡 Suggestion",
        "cal_tipo_recomendacion": "⭐ Recommendation",
        "cal_tu_mensaje": "Your message",
        "cal_enviar_mensaje": "Send message",
        "ph_cal_experiencia": "Tell us more about your experience...",
        "ph_cal_escribe": "Type here...",
        "cal_gracias": "Thanks for your rating!",
        "cal_gracias_mensaje": "Thanks for your message!",
        "cal_err_pedido": "Select the order you want to rate.",
        "cal_err_estrellas": "Select a star rating.",
        "cal_err_clasificacion": "Select an overall rating (Excellent, Good, Fair or Poor).",
        "cal_min5": "Write a message of at least 5 characters.",

                "cerrar_sesion": "🚪 Log out",
        "mi_perfil": "👤 My profile",
        "mis_direcciones": "📍 My addresses",
        "mis_pedidos": "📦 My orders",
        "historial": "🧾 History",
        "ordenes_medicas": "📋 Medical orders",
        "calificar_atencion": "⭐ Rate service",
        "resumen": "🏠 Summary",

                // ===== STATUSES AND JS-GENERATED TEXT =====
        "est_pendiente": "Pending",
        "est_confirmado": "Confirmed",
        "est_en_camino": "On the way",
        "est_entregado": "Delivered",
        "est_cancelado": "Cancelled",
        "om_est_pendiente": "Pending",
        "om_est_procesada": "Processed",
        "om_est_revisada": "Reviewed",
        "om_est_error": "Error",

        "cargando_detalle": "Loading details...",
        "cargando_direcciones": "Loading addresses...",
        "err_cargar_direcciones": "Your addresses could not be loaded.",
        "err_detalle_pedido": "The details of this order could not be loaded.",
        "err_detalle_orden": "The details of this prescription could not be loaded.",

        "dir_sin_direcciones": "You don't have any saved addresses yet. Add your first one using the form. 📍",
        "dir_badge_pred": "Default",
        "dir_ref_label": "Landmark:",
        "dir_tel_label": "Contact phone:",
        "dir_btn_editar": "✏️ Edit",
        "dir_btn_pred": "⭐ Set as default",
        "dir_btn_eliminar": "🗑️ Delete",
        "dir_editar_titulo": "Edit address",
        "dir_confirmar_eliminar": "Delete this address?",
        "dir_campos_minimos": "Please fill in at least the address, city and contact phone.",

        "ped_vacio": "You haven't placed any orders yet.",
        "hist_vacio": "You don't have any purchases in your history yet.",
        "ir_catalogo_flecha": "Go to catalog →",
        "pedido_num": "Order",
        "orden_num": "Prescription",
        "sin_productos_pedido": "No products recorded in this order.",

        "om_vacio": "You haven't uploaded any prescription yet.",
        "om_subir_primera": "Upload my first prescription →",
        "om_ver_archivo": "📄 View uploaded file",
        "om_texto_doc": "Text detected in the document:",
        "om_productos_detectados": "Detected products:",
        "om_sin_productos": "No catalog products were detected in this document.",
        "om_en_carrito": "Added to cart",
        "om_sin_confirmar": "Not confirmed",

        "cal_sin_pendientes": "You have no orders pending review",
        "cal_selecciona": "Select an order...",
        "cal_err_pedido": "Select the order you want to rate.",
        "cal_err_estrellas": "Select a star rating.",
        "cal_err_clasificacion": "Select an overall rating (Excellent, Good, Fair or Poor).",
        "cal_gracias": "Thanks for your rating!",
        "cal_min5": "Write a message of at least 5 characters.",
        "cal_gracias_mensaje": "Thanks for your message!",

        "perfil_err_nombre": "Enter a valid name (minimum 2 letters).",
        "perfil_err_telefono": "Enter a valid phone number (7 to 10 digits).",
        "perfil_ok": "✅ Your details were updated successfully.",
        "perfil_error": "Error updating your details.",
        "confirmar_logout": "Do you want to log out?",

                // ===== HISTORY AND MEDICAL ORDERS =====
        "hist_titulo": "Purchase history",
        "hist_subtitulo": "All your previous orders, with the detail of what you bought in each one. Click an order to see its products.",
        "om_titulo": "My medical orders",
        "om_subtitulo_html": "The prescriptions you've uploaded and their analysis status. <a href=\"../../pages/orden-medica.html\" style=\"color:var(--color-primario); font-weight:600;\">Upload a new one →</a>",
        "cuenta_titulo": "My account",

        // ===== HOME (index.html) =====
        "nav_medicamentos": "Medications",
        "nav_cuidado_personal": "Personal care",
        "nav_vitaminas": "Vitamins",
        "nav_higiene": "Hygiene",
        "nav_bebes": "Babies",
        "nav_primeros_auxilios": "First aid",

        "banner_etiqueta": "🚚 Same-day delivery",
        "banner_titulo_html": "Your health, <span>one click</span> away",
        "banner_texto": "Medications, personal care and wellness with the trust of a real pharmacy. Upload your prescription and we take care of the rest.",
        "ver_catalogo": "View catalog",
        "banner_originales": "✅ Genuine products",
        "banner_segura": "🔒 Secure checkout",
        "banner_domicilios": "⏱️ Fast delivery",
        "banner_card_titulo": "24/7 virtual assistant",
        "banner_card_texto": "Get instant answers about products, orders and delivery.",

        "categorias_titulo": "Browse by category",
        "destacados_titulo": "Featured products",
        "ver_todo": "View all →",

        "beneficios_titulo": "Why choose VitalFarma?",
        "beneficio1_titulo": "Fast delivery",
        "beneficio1_texto": "Same-day delivery in your city.",
        "beneficio2_titulo": "Secure checkout",
        "beneficio2_texto": "Your data and payments protected at all times.",
        "beneficio3_titulo": "24/7 support",
        "beneficio3_texto": "Our virtual assistant answers your questions.",
        "beneficio4_titulo": "Genuine products",
        "beneficio4_texto": "Quality guaranteed on every product.",

        "chatbot_flotante_title": "Chat with our assistant",

        "footer_tagline": "Your trusted online pharmacy.",
        "footer_enlaces": "Links",
        "footer_nosotros": "About us",
        "footer_contacto": "Contact",
        "footer_crear_cuenta": "Create account",
        "footer_derechos": "© 2026 VitalFarma. All rights reserved.",

        // Catalog
        "catalogo_titulo": "Product catalog",
        "catalogo_subtitulo": "Find medications, personal care and more.",
        "filtros": "Filters",
        "categoria": "Category",
        "precio_maximo": "Max price",
        "disponibilidad": "Availability",
        "solo_disponibles": "Show only available",
        "limpiar_filtros": "Clear filters",
        "buscar_en_catalogo": "Search in catalog...",
        "productos_encontrados": "products found",
        "ordenar_por": "Sort by",
        "relevancia": "Relevance",
        "precio_asc": "Price: low to high",
        "precio_desc": "Price: high to low",
        "mejor_calificados": "Best rated",
        "no_resultados": "No products found with those filters. Try adjusting them.",

        // Products
        "disponible": "Available",
        "agotado": "Out of stock",
        "agregar": "Add",
        "ver": "View",
        "no_disponible": "Not available",
        "stock_disponible": "Stock available",
        "maximo": "Max.",
        "subtotal": "Subtotal",
        "total": "Total",
        "envio": "Shipping",
        "gratis": "Free",
        "te_faltan": "You need",
        "para_envio_gratis": "more for free shipping 🚚",

        // Cart
        "carrito_titulo": "Your cart",
        "carrito_vacio": "Your cart is empty",
        "carrito_vacio_texto": "Add products from the catalog to see them here.",
        "ir_al_catalogo": "Go to catalog",
        "resumen_pedido": "Order summary",
        "confirmar_pedido": "Confirm order",
        "vaciar_carrito": "Empty cart",
        "seguro_vaciar": "Are you sure you want to empty your cart?",
        "producto_agregado": "Product added to cart",
        "inicia_sesion_para_carrito": "Log in to add products to your cart",

        // Checkout
        "checkout_titulo": "Checkout",
        "checkout_subtitulo": "Select delivery address and confirm your order.",
        "direccion_entrega": "Delivery address",
        "agregar_direccion": "+ Add address",
        "seleccionar_direccion": "Please select a delivery address.",
        "confirmar_pedido_btn": "Confirm order",
        "pedido_confirmado": "Order confirmed! Redirecting...",
        "error_pedido": "Error confirming order. Please try again.",
        "carrito_vacio_checkout": "Your cart is empty. You cannot place an order without products.",

        // Profile
        "perfil_titulo": "My profile",
        "perfil_subtitulo": "Update your personal information.",
        "nombre_completo": "Full name",
        "correo_electronico": "Email",
        "telefono": "Phone",
        "guardar_cambios": "Save changes",
        "error_nombre_invalido": "⚠️ Please enter a valid name (minimum 2 letters).",
        "error_telefono_invalido": "⚠️ Please enter a valid phone number (7 to 10 digits).",
        "datos_actualizados": "✅ Your data has been updated successfully.",
        "cambiar_contraseña": "Change password",

        // Chatbot
        "chatbot_titulo": "VitalFarma Assistant",
        "chatbot_en_linea": "Online",
        "chatbot_escribiendo": "Assistant is typing...",
        "chatbot_placeholder": "Type or choose an option...",
        "chatbot_bienvenida": "Hi! 👋 I'm VitalFarma's virtual assistant. Choose an option or type your question:",
        "chatbot_error": "An error occurred processing your message. Please try again.",
        "chatbot_escalado": "🔔 Your case has been escalated to a human agent.",
        "chatbot_volver_menu": "⬅️ Back to menu",
        "chatbot_buscar_producto": "🔍 Search for a product",
        "chatbot_ver_categorias": "📂 View products by category",
        "chatbot_ver_carrito": "🛒 My cart",
        "chatbot_ver_pedidos": "📦 My orders",
        "chatbot_orden_medica": "📋 Medical order",
        "chatbot_domicilios": "🚚 Shipping",
        "chatbot_agente": "💬 Talk to an agent",
        "chatbot_modo_libre": "✏️ Write my question",
        "chatbot_domicilio_costo": "💲 Cost and delivery time",
        "chatbot_domicilio_cobertura": "📍 Coverage areas",
        "chatbot_ir_orden": "📋 Go to upload my order",
        "chatbot_pregunta_producto": "Type the name of the product you're looking for 🔍",
        "chatbot_agregar": "➕ Add",
        "chatbot_seguir_comprando": "🔍 Keep shopping",
        "chatbot_ir_pagar": "🛍️ Go to checkout",
        "chatbot_carrito_vacio": "Your cart is empty. Would you like to browse products?",
        "chatbot_pedidos_vacios": "No orders found in your account yet.",
        "chatbot_no_resultados": "I couldn't find products matching",
        "chatbot_intentar_otro": "Would you like to try another name?",

        // Medical orders
        "orden_medica_titulo": "Upload medical order",
        "orden_medica_subtitulo": "Upload your medical order (image or PDF) and our system will analyze it automatically.",
        "orden_medica_subir": "Upload file",
        "orden_medica_estado": "Order status",
        "orden_medica_pendiente": "Pending",
        "orden_medica_procesada": "Processed",
        "orden_medica_revisada": "Reviewed by user",
        "orden_medica_rechazada": "Rejected",
        "orden_medica_confirmar": "Confirm products",
        "orden_medica_analizando": "Analyzing medical order...",
        "orden_medica_sugerencias": "Suggested products for your medical order:",
        "orden_medica_sin_orden": "You haven't uploaded any medical order.",

        // Admin
        "admin_dashboard": "Dashboard",
        "admin_productos": "Products",
        "admin_pedidos": "Orders",
        "admin_clientes": "Customers",
        "admin_ordenes_medicas": "Medical orders",
        "admin_conversaciones": "Conversations",
        "admin_calificaciones": "Ratings",
        "admin_comentarios": "Comments",
        "admin_recomendaciones": "Recommendations",
        "admin_reportes": "Reports",
        "admin_usuarios": "Users & roles",
        "admin_configuracion": "Settings",
        "admin_cerrar_sesion": "Log out",

                // ===== CART, CHECKOUT AND MEDICAL ORDER =====
        "mi_carrito": "My cart",
        "domicilio": "Delivery",
        "proceder_pedido": "Proceed to order",
        "carrito_seguir": "← Keep shopping",
        "agregar_direccion_nueva": "+ Add new address",
        "orden_titulo": "Upload your prescription",
        "orden_intro": "We automatically analyze your prescription and suggest the medications available in our catalog. We don't diagnose or decide for you — you confirm what goes into the cart.",
        "orden_aviso": "⚠️ This feature is optional. You can buy over-the-counter medications without uploading any prescription.",
        "orden_arrastra": "Drag your image here, or",
        "orden_seleccionar": "📁 Select file",
        "orden_formatos": "JPG, PNG or PDF — 5MB max",
        "orden_analizar": "Analyze prescription",
        "orden_texto_detectado": "Text detected in your prescription:",
        "orden_encontrados": "Medications found in our catalog:",
        "orden_agregar_seleccionados": "Add selected to cart",

                // ===== LOGIN AND SIGN UP =====
        "login_titulo": "Welcome back",
        "login_subtitulo": "Enter your details to access your account.",
        "recordarme": "Remember me",
        "olvidaste_password": "Forgot your password?",
        "no_tienes_cuenta_html": "Don't have an account? <a href=\"registro.html\">Sign up here</a>",
        "ya_tienes_cuenta_html": "Already have an account? <a href=\"login.html\">Log in here</a>",
        "ph_correo": "youremail@example.com",
        "ph_password": "••••••••",
        "login_visual_titulo": "Your health, always one click away",
        "login_visual_texto": "Access your orders, prescriptions and much more.",
        "login_visual_1": "✅ Safe and protected checkout",
        "login_visual_2": "🚚 Same-day delivery",
        "login_visual_3": "💬 24/7 virtual assistant",

        "registro_titulo": "Create your account",
        "registro_subtitulo": "Sign up to shop and track your orders.",
        "confirmar_password": "Confirm password",
        "crear_cuenta": "Create account",
        "ph_nombre": "E.g. María Fernanda Gómez",
        "ph_telefono": "E.g. 3001234567",
        "ph_min8": "Minimum 8 characters",
        "ph_repite": "Repeat your password",
        "terminos_html": "I accept the <a href=\"#\" style=\"color:var(--color-primario); font-weight:600;\">terms and conditions</a> and the processing of my data.",
        "registro_visual_titulo": "Join VitalFarma",
        "registro_visual_texto": "Create your account and enjoy all the benefits.",
        "registro_visual_1": "📦 Track your orders",
        "registro_visual_2": "📋 Upload your prescriptions",
        "registro_visual_3": "⭐ Save your favorite products",

        // ===== ACCOUNT SUMMARY =====
        "saludo_hola": "Hi {nombre}! 👋",
        "cuenta_subtitulo": "This is the summary of your VitalFarma account.",
        "resumen_pedidos_label": "Orders placed",
        "resumen_direcciones_label": "Saved addresses",
        "resumen_ordenes_label": "Medical orders",
        "ver_mis_pedidos": "View my orders",
        "editar_perfil": "Edit profile",

                "modal_titulo": "Log in or sign up",
        "modal_sin_cuenta": "Don't have an account?",
        "modal_con_cuenta": "Already have an account?",
        "modal_err_email": "Enter a valid email address.",
        "modal_err_password": "Enter your password.",
        "modal_err_password_corta": "The password must be at least 8 characters.",
        "modal_err_nombre": "Enter a valid name (minimum 2 letters).",
        "modal_err_telefono": "Enter a valid phone number (7 to 10 digits).",
        "modal_credenciales": "Incorrect email or password.",
        "modal_bienvenido": "Welcome back!",
        "modal_acceso_admin": "Admin access verified. Opening the panel...",
        "modal_cuenta_creada": "Account created successfully!",
        "modal_err_registro": "The account could not be created. Please try again.".

        "banner_etiqueta_texto": "Same-day delivery",
        "banner_originales_texto": "Genuine products",
        "banner_segura_texto": "Secure checkout",
        "banner_domicilios_texto": "Fast delivery",
        "ver_todo_texto": "View all",

                "volver_inicio": "Back to home",
        "login_visual_titulo_html": "Your health, always <span>one click away</span>",
        "login_t1_titulo": "Track your orders",
        "login_t1_texto": "Check the status of every delivery in real time.",
        "login_t2_titulo": "Upload your prescription",
        "login_t2_texto": "We analyze it and suggest the right medications.",
        "login_t3_titulo": "Same-day delivery",
        "login_t3_texto": "Free shipping on purchases over $80,000.",

                "cal_tab_calificar_texto": "Rate an order",
        "cal_tab_comentar_texto": "Comment / suggestion",
        "cal_tipo_comentario_texto": "Comment",
        "cal_tipo_queja_texto": "Complaint",
        "cal_tipo_sugerencia_texto": "Suggestion",
        "cal_tipo_recomendacion_texto": "Recommendation",
        "configuracion_texto": "Settings"

    }
};

// ===== FUNCIONES DE IDIOMA =====

var IDIOMAS_VALIDOS = ['es', 'en'];

// Idioma actual: lo guardado, o el del navegador la primera vez.
function obtenerIdiomaActual() {
    var idioma = localStorage.getItem('idioma');
    if (!idioma) {
        idioma = (navigator.language || 'es').split('-')[0];
        if (IDIOMAS_VALIDOS.indexOf(idioma) === -1) idioma = 'es';
        localStorage.setItem('idioma', idioma);
    }
    return idioma;
}

// Traducir una clave desde otro archivo JS.
// NO la borres: perfil.html la usa como t('idioma_cambiado').
function t(clave) {
    var dic = TRADUCCIONES[obtenerIdiomaActual()] || TRADUCCIONES.es;
    return dic[clave] !== undefined ? dic[clave] : clave;
}

// ===== HELPERS COMPARTIDOS =====


function localeActual() {
    return obtenerIdiomaActual() === 'en' ? 'en-US' : 'es-CO';
}

function fmtPrecio(valor) {
    var idioma = obtenerIdiomaActual();
    var numero = Number(valor || 0).toLocaleString(localeActual(), { maximumFractionDigits: 0 });
    // En inglés el símbolo va pegado sin espacio: $12,000
    return idioma === 'en' ? '$' + numero : '$ ' + numero;
}

function fmtFecha(fecha, conHora) {
    var opciones = { day: 'numeric', month: 'long', year: 'numeric' };
    if (conHora) {
        opciones.hour = '2-digit';
        opciones.minute = '2-digit';
    }
    return new Date(fecha).toLocaleDateString(localeActual(), opciones);
}

// Estado de pedido -> texto traducido + clase del badge
function estadoPedido(clave) {
    var mapa = {
        pendiente:  { clave: 'est_pendiente',  clase: 'badge-estado--advertencia' },
        confirmado: { clave: 'est_confirmado', clase: 'badge-estado--info' },
        en_camino:  { clave: 'est_en_camino',  clase: 'badge-estado--info' },
        entregado:  { clave: 'est_entregado',  clase: 'badge-estado--exito' },
        cancelado:  { clave: 'est_cancelado',  clase: 'badge-estado--error' }
    };
    var e = mapa[clave] || mapa.pendiente;
    return { texto: t(e.clave), clase: e.clase };
}

// Estado de orden médica -> texto traducido + clase del badge
function estadoOrdenMedica(clave) {
    var mapa = {
        pendiente:            { clave: 'om_est_pendiente', clase: 'badge-estado--advertencia' },
        procesada:            { clave: 'om_est_procesada', clase: 'badge-estado--info' },
        revisada_por_usuario: { clave: 'om_est_revisada',  clase: 'badge-estado--exito' },
        error:                { clave: 'om_est_error',     clase: 'badge-estado--error' }
    };
    var e = mapa[clave] || mapa.pendiente;
    return { texto: t(e.clave), clase: e.clase };
}

// Aplica las traducciones a todos los elementos marcados de la página.
function aplicarIdioma(idioma) {
    var dic = TRADUCCIONES[idioma];
    if (!dic) return;

    // 1. Texto plano
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var texto = dic[el.getAttribute('data-i18n')];
        if (texto === undefined) return;

        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            // hasAttribute, no el.placeholder: un placeholder vacío es falsy
            // y la traducción terminaría escrita dentro del value del usuario.
            if (el.hasAttribute('placeholder')) {
                el.placeholder = texto;
            } else {
                el.value = texto;
            }
        } else {
            el.textContent = texto;
        }
    });

    // 2. Contenido con etiquetas dentro (ej. el título del banner con su <span>)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
        var texto = dic[el.getAttribute('data-i18n-html')];
        if (texto !== undefined) el.innerHTML = texto;
    });

    // 3. Solo el tooltip, sin tocar el contenido del elemento
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
        var texto = dic[el.getAttribute('data-i18n-title')];
        if (texto !== undefined) el.title = texto;
    });

    var selector = document.getElementById('selectorIdioma');
    if (selector && selector.value !== idioma) selector.value = idioma;

    document.documentElement.lang = idioma;
    localStorage.setItem('idioma', idioma);

    actualizarBotonIdioma(idioma);

    // Repintar lo que el header maneja por JS, por si algo lo pisó.
    if (typeof actualizarHeaderCuenta === 'function') actualizarHeaderCuenta();
    if (typeof actualizarContadorCarrito === 'function') actualizarContadorCarrito();

    document.dispatchEvent(new CustomEvent('idiomaCambiado', { detail: { idioma: idioma } }));
}

function cambiarIdioma(idioma) {
    if (IDIOMAS_VALIDOS.indexOf(idioma) === -1) return;
    localStorage.setItem('idioma', idioma);
    aplicarIdioma(idioma);
}

// ===== BOTÓN DE IDIOMA EN EL HEADER =====
// Prioridad 1: un elemento con data-idioma-slot (para páginas sin header, como login).
// Prioridad 2: el .header__acciones del header normal.
function insertarBotonIdioma() {
    if (document.getElementById('btnIdioma')) return;

    var contenedor = document.querySelector('[data-idioma-slot]')
                  || document.querySelector('.header__acciones');
    if (!contenedor) return;

    var boton = document.createElement('button');
    boton.type = 'button';
    boton.id = 'btnIdioma';
    boton.className = 'header__idioma';

    boton.addEventListener('click', function () {
        cambiarIdioma(obtenerIdiomaActual() === 'es' ? 'en' : 'es');
    });

    var menu = document.getElementById('menuToggle');
    if (menu && contenedor.contains(menu)) {
        contenedor.insertBefore(boton, menu);
    } else {
        contenedor.appendChild(boton);
    }
}

// El botón muestra el idioma al que vas a cambiar, no el actual.
function actualizarBotonIdioma(idioma) {
    var boton = document.getElementById('btnIdioma');
    if (!boton) return;

    if (idioma === 'es') {
        boton.innerHTML = '<span>🇬🇧</span> EN';
        boton.title = 'Switch to English';
    } else {
        boton.innerHTML = '<span>🇪🇸</span> ES';
        boton.title = 'Cambiar a español';
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function () {
    insertarBotonIdioma();
    aplicarIdioma(obtenerIdiomaActual());
});