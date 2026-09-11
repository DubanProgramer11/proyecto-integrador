const CHATBOT_STORAGE_KEY = 'vitalfarma_chatbot_conversacion';
let conversacionIdActual = localStorage.getItem(CHATBOT_STORAGE_KEY) || null;
let modoActual = 'menu';
let productoSeleccionado = null;

const MENU_PRINCIPAL = [
  { texto: '🔍 Buscar un producto', accion: 'buscar_producto' },
  { texto: '📂 Ver productos por categoría', accion: 'ver_categorias' },
  { texto: '🛒 Mi carrito', accion: 'ver_carrito' },
  { texto: '📦 Mis pedidos', accion: 'ver_pedidos' },
  { texto: '📋 Orden médica', accion: 'info_orden_medica' },
  { texto: '🚚 Domicilios', accion: 'submenu_domicilios' },
  { texto: '💬 Hablar con un agente', accion: 'escalar_humano' },
  { texto: '✏️ Escribir mi pregunta', accion: 'modo_libre' }
];

const MENU_DOMICILIOS = [
  { texto: '💲 Costo y tiempo de entrega', accion: 'domicilio_costo' },
  { texto: '📍 Zonas de cobertura', accion: 'domicilio_cobertura' },
  { texto: '⬅️ Volver al menú', accion: 'menu_principal' }
];

/* ===== CREAR WIDGET ===== */
function crearWidgetChatbot() {
  if (document.getElementById('chatbotWidget')) return;

  const widget = document.createElement('div');
  widget.className = 'chatbot-widget';
  widget.id = 'chatbotWidget';
  widget.innerHTML = `
    <div class="chatbot-widget__header">
      <div class="chatbot-widget__header-info">
        <div class="chatbot-widget__avatar">💬</div>
        <div>
          <div class="chatbot-widget__titulo">Asistente VitalFarma</div>
          <div class="chatbot-widget__estado"><span class="chatbot-widget__estado-punto"></span> En línea</div>
        </div>
      </div>
      <button class="chatbot-widget__cerrar" id="chatbotCerrar">✕</button>
    </div>
    <div class="chatbot-widget__mensajes" id="chatbotMensajes"></div>
    <div class="chatbot-sugerencias" id="chatbotSugerencias"></div>
    <div class="chatbot-widget__input-area">
      <input type="text" id="chatbotInput" placeholder="Escribe o elige una opción...">
      <button class="chatbot-widget__enviar" id="chatbotEnviar">➤</button>
    </div>
  `;
  document.body.appendChild(widget);

  document.getElementById('chatbotCerrar').addEventListener('click', cerrarChatbot);
  document.getElementById('chatbotEnviar').addEventListener('click', manejarEnvioInput);
  document.getElementById('chatbotInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') manejarEnvioInput();
  });
}

/* ===== VERIFICAR REINICIO DE CONVERSACIÓN ===== */
async function verificarReinicioConversacion() {
  const sesion = await haySesionCliente();
  const usuarioGuardado = localStorage.getItem('chatbot_usuario_id');

  // Si hay sesión activa
  if (sesion && sesion.id) {
    // Si el usuario guardado no coincide o no existe, reiniciar (nuevo login)
    if (!usuarioGuardado || usuarioGuardado !== String(sesion.id)) {
      localStorage.removeItem(CHATBOT_STORAGE_KEY);
      conversacionIdActual = null;
      localStorage.setItem('chatbot_usuario_id', String(sesion.id));
      return true; // se reinició
    }
    // Si coincide, mantener conversación
    return false;
  } else {
    // No hay sesión: mantener conversación anónima (no reiniciar)
    // Pero si el usuario guardado existe, limpiarlo (logout)
    if (usuarioGuardado) {
      localStorage.removeItem('chatbot_usuario_id');
      // No reiniciamos conversación para que el historial anónimo persista
    }
    return false;
  }
}

/* ===== ABRIR/CERRAR ===== */
async function abrirChatbot() {
  crearWidgetChatbot();
  const widget = document.getElementById('chatbotWidget');
  widget.classList.add('chatbot-widget--abierto');

  const reiniciado = await verificarReinicioConversacion();

  const contenedor = document.getElementById('chatbotMensajes');
  if (reiniciado || !conversacionIdActual) {
    contenedor.innerHTML = '';
    agregarMensajeAlChat('bot', '¡Hola! 👋 Soy el asistente virtual de VitalFarma. Elige una opción o escribe tu pregunta:');
    mostrarBotones(MENU_PRINCIPAL);
  } else if (contenedor.children.length === 0) {
    await cargarHistorialChatbot();
  }

  document.getElementById('chatbotInput').focus();
}

function cerrarChatbot() {
  document.getElementById('chatbotWidget').classList.remove('chatbot-widget--abierto');
}

/* ===== HISTORIAL ===== */
async function cargarHistorialChatbot() {
  const respuesta = await apiGet(`chatbot.php?conversacion_id=${conversacionIdActual}`);
  if (!respuesta.exito || respuesta.datos.length === 0) {
    mostrarBotones(MENU_PRINCIPAL);
    return;
  }
  const contenedor = document.getElementById('chatbotMensajes');
  contenedor.innerHTML = '';
  respuesta.datos.forEach(msg => agregarMensajeAlChat(msg.emisor === 'usuario' ? 'usuario' : 'bot', msg.contenido));
  mostrarBotones(MENU_PRINCIPAL);
}

/* ===== MENSAJES Y BOTONES ===== */
function agregarMensajeAlChat(tipo, texto) {
  const contenedor = document.getElementById('chatbotMensajes');
  const div = document.createElement('div');
  div.className = `chatbot-mensaje chatbot-mensaje--${tipo}`;
  div.textContent = texto;
  contenedor.appendChild(div);
  contenedor.scrollTop = contenedor.scrollHeight;
}

function mostrarEscribiendo() {
  const contenedor = document.getElementById('chatbotMensajes');
  const div = document.createElement('div');
  div.className = 'chatbot-widget__escribiendo';
  div.id = 'chatbotEscribiendo';
  div.textContent = 'El asistente está escribiendo...';
  contenedor.appendChild(div);
  contenedor.scrollTop = contenedor.scrollHeight;
}

function quitarEscribiendo() {
  const el = document.getElementById('chatbotEscribiendo');
  if (el) el.remove();
}

function mostrarBotones(lista) {
  const contenedor = document.getElementById('chatbotSugerencias');
  contenedor.innerHTML = lista.map(op => `<button class="chatbot-sugerencia" data-accion="${op.accion}">${op.texto}</button>`).join('');
  contenedor.querySelectorAll('.chatbot-sugerencia').forEach(btn => {
    btn.addEventListener('click', () => manejarAccionMenu(btn.dataset.accion));
  });
}

function limpiarBotones() {
  document.getElementById('chatbotSugerencias').innerHTML = '';
}

/* ===== ENRUTADOR DE ACCIONES ===== */
async function manejarAccionMenu(accion) {
  limpiarBotones();

  switch (accion) {
    case 'menu_principal':
      modoActual = 'menu';
      agregarMensajeAlChat('bot', '¿En qué más te ayudo?');
      mostrarBotones(MENU_PRINCIPAL);
      break;

    case 'buscar_producto':
      modoActual = 'buscando_producto';
      agregarMensajeAlChat('bot', 'Escribe el nombre del producto que buscas 🔍 (ej. "acetaminofén" o "protector solar")');
      document.getElementById('chatbotInput').focus();
      break;

    case 'ver_categorias':
      await mostrarCategorias();
      break;

    case 'ver_carrito':
      await mostrarCarritoEnChat();
      break;

    case 'ver_pedidos':
      await mostrarPedidosEnChat();
      break;

    case 'submenu_domicilios':
      agregarMensajeAlChat('bot', '¿Qué te gustaría saber sobre domicilios?');
      mostrarBotones(MENU_DOMICILIOS);
      break;

    case 'domicilio_costo':
      agregarMensajeAlChat('bot', 'El domicilio cuesta $6.000, y es GRATIS en compras desde $80.000. El tiempo estimado de entrega es el mismo día si confirmas antes de las 5:00 p.m.');
      mostrarBotones(MENU_DOMICILIOS);
      break;

    case 'domicilio_cobertura':
      agregarMensajeAlChat('bot', 'Hacemos entregas en el área urbana de Bucaramanga y su área metropolitana.');
      mostrarBotones(MENU_DOMICILIOS);
      break;

    case 'info_orden_medica':
      agregarMensajeAlChat('bot', 'Puedes subir tu orden médica (imagen o PDF, máx. 5MB) y nuestro sistema la analizará automáticamente, sugiriéndote los medicamentos disponibles en el catálogo. Tú confirmas cuáles agregar al carrito.');
      mostrarBotones([
        { texto: '📋 Ir a subir mi orden', accion: 'ir_orden_medica' },
        { texto: '⬅️ Volver al menú', accion: 'menu_principal' }
      ]);
      break;

    case 'ir_orden_medica':
      window.location.href = detectarRutaPagina('orden-medica.html');
      break;

    case 'escalar_humano':
      await escalarConversacionAHumano();
      break;

    case 'modo_libre':
      modoActual = 'libre';
      agregarMensajeAlChat('bot', 'Claro, escribe tu pregunta y haré lo posible por ayudarte 🙂');
      document.getElementById('chatbotInput').focus();
      break;

    default:
      agregarMensajeAlChat('bot', 'Opción no reconocida. Elige una del menú.');
      mostrarBotones(MENU_PRINCIPAL);
  }
}

function detectarRutaPagina(pagina) {
  const enPages = window.location.pathname.includes('/pages/');
  return enPages ? pagina : `pages/${pagina}`;
}

/* ===== MOSTRAR CATEGORÍAS ===== */
async function mostrarCategorias() {
  mostrarEscribiendo();
  const respuesta = await apiGet('categorias.php');
  quitarEscribiendo();

  if (!respuesta.exito || respuesta.datos.length === 0) {
    agregarMensajeAlChat('bot', 'No pude cargar las categorías en este momento.');
    mostrarBotones([{ texto: '⬅️ Volver al menú', accion: 'menu_principal' }]);
    return;
  }

  const categorias = respuesta.datos;
  let mensaje = 'Selecciona una categoría para ver sus productos:\n\n';
  const botones = categorias.map(cat => ({
    texto: `${cat.icono || '📂'} ${cat.nombre}`,
    accion: `categoria_${cat.id}`
  }));
  botones.push({ texto: '⬅️ Volver al menú', accion: 'menu_principal' });

  agregarMensajeAlChat('bot', mensaje);
  mostrarBotones(botones);
}

/* ===== MOSTRAR PRODUCTOS POR CATEGORÍA ===== */
async function mostrarProductosPorCategoria(categoriaId) {
  mostrarEscribiendo();
  const respuesta = await apiGet(`productos.php?categoria_id=${categoriaId}`);
  quitarEscribiendo();

  if (!respuesta.exito || respuesta.datos.length === 0) {
    agregarMensajeAlChat('bot', 'No encontré productos en esta categoría.');
    mostrarBotones([{ texto: '📂 Ver otras categorías', accion: 'ver_categorias' }, { texto: '⬅️ Volver al menú', accion: 'menu_principal' }]);
    return;
  }

  const productos = respuesta.datos.slice(0, 10); // mostrar hasta 10
  let mensaje = 'Productos disponibles:\n\n';
  productos.forEach((p, i) => {
    const disponible = Number(p.disponible) === 1 ? '✅' : '❌';
    mensaje += `${i+1}. ${p.nombre}\n   ${formatearPrecio(p.precio)} ${disponible}\n`;
  });

  agregarMensajeAlChat('bot', mensaje);

  const botones = productos.map(p => ({
    texto: `➕ Agregar "${p.nombre}"`,
    accion: `agregar_${p.id}`
  }));
  botones.push({ texto: '📂 Ver otras categorías', accion: 'ver_categorias' });
  botones.push({ texto: '⬅️ Volver al menú', accion: 'menu_principal' });

  mostrarBotones(botones);
  window._ultimosProductos = productos;
}

/* ===== MOSTRAR CARRITO EN CHAT ===== */
async function mostrarCarritoEnChat() {
  const sesion = await haySesionCliente();
  if (!sesion) {
    agregarMensajeAlChat('bot', 'Para ver tu carrito necesitas iniciar sesión primero.');
    mostrarBotones([{ texto: '⬅️ Volver al menú', accion: 'menu_principal' }]);
    return;
  }

  mostrarEscribiendo();
  const respuesta = await apiGet('carrito.php');
  quitarEscribiendo();

  if (!respuesta.exito || respuesta.datos.length === 0) {
    agregarMensajeAlChat('bot', 'Tu carrito está vacío. ¿Quieres buscar productos para agregar?');
    mostrarBotones([
      { texto: '🔍 Buscar productos', accion: 'buscar_producto' },
      { texto: '📂 Ver categorías', accion: 'ver_categorias' },
      { texto: '⬅️ Volver al menú', accion: 'menu_principal' }
    ]);
    return;
  }

  const carrito = respuesta.datos;
  const subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  const lineas = carrito.map(item => `• ${item.cantidad}x ${item.nombre} — ${formatearPrecio(item.precio * item.cantidad)}`).join('\n');

  agregarMensajeAlChat('bot', `📦 Tu carrito (${totalItems} productos):\n\n${lineas}\n\nSubtotal: ${formatearPrecio(subtotal)}`);

  mostrarBotones([
    { texto: '🛍️ Ir a pagar', accion: 'ir_a_pagar' },
    { texto: '🔍 Seguir comprando', accion: 'buscar_producto' },
    { texto: '📂 Ver categorías', accion: 'ver_categorias' },
    { texto: '⬅️ Volver al menú', accion: 'menu_principal' }
  ]);
}

/* ===== IR A PAGAR ===== */
async function irAPagar() {
  const sesion = await haySesionCliente();
  if (!sesion) {
    agregarMensajeAlChat('bot', 'Necesitas iniciar sesión para hacer un pedido.');
    mostrarBotones([{ texto: '⬅️ Volver al menú', accion: 'menu_principal' }]);
    return;
  }

  const respCarrito = await apiGet('carrito.php');
  if (!respCarrito.exito || respCarrito.datos.length === 0) {
    agregarMensajeAlChat('bot', 'Tu carrito está vacío. Agrega productos primero.');
    mostrarBotones([{ texto: '🔍 Buscar productos', accion: 'buscar_producto' }, { texto: '⬅️ Volver al menú', accion: 'menu_principal' }]);
    return;
  }

  agregarMensajeAlChat('bot', 'Redirigiendo al checkout... 🚀');
  setTimeout(() => window.location.href = detectarRutaPagina('checkout.html'), 1000);
}

/* ===== BUSCAR PRODUCTO ===== */
async function buscarProductoDesdeChat(termino) {
  mostrarEscribiendo();
  const respuesta = await apiGet(`productos.php?buscar=${encodeURIComponent(termino)}`);
  quitarEscribiendo();

  if (!respuesta.exito || respuesta.datos.length === 0) {
    agregarMensajeAlChat('bot', `No encontré productos que coincidan con "${termino}". ¿Quieres intentar con otro nombre?`);
    mostrarBotones([
      { texto: '🔍 Buscar otro producto', accion: 'buscar_producto' },
      { texto: '📂 Ver categorías', accion: 'ver_categorias' },
      { texto: '⬅️ Volver al menú', accion: 'menu_principal' }
    ]);
    modoActual = 'menu';
    return;
  }

  const productos = respuesta.datos.slice(0, 5);
  let mensaje = 'Encontré esto:\n\n';
  productos.forEach((p, i) => {
    const disponible = Number(p.disponible) === 1 ? `✅ Disponible (${p.stock} en stock)` : '❌ Agotado';
    mensaje += `${i+1}. ${p.nombre}\n   ${formatearPrecio(p.precio)} — ${disponible}\n`;
  });

  agregarMensajeAlChat('bot', mensaje);

  const botones = productos.map(p => ({
    texto: `➕ Agregar "${p.nombre}"`,
    accion: `agregar_${p.id}`
  }));
  botones.push({ texto: '🔍 Buscar otro producto', accion: 'buscar_producto' });
  botones.push({ texto: '📂 Ver categorías', accion: 'ver_categorias' });
  botones.push({ texto: '⬅️ Volver al menú', accion: 'menu_principal' });

  mostrarBotones(botones);

  window._ultimosProductos = productos;
  modoActual = 'menu';
}

/* ===== AGREGAR AL CARRITO DESDE CHAT ===== */
async function agregarProductoDesdeChat(productoId, cantidad = 1) {
  const sesion = await haySesionCliente();
  if (!sesion) {
    agregarMensajeAlChat('bot', 'Necesitas iniciar sesión para agregar productos al carrito.');
    mostrarBotones([{ texto: '⬅️ Volver al menú', accion: 'menu_principal' }]);
    return;
  }

  mostrarEscribiendo();
  const respuesta = await apiPost('carrito.php', { producto_id: productoId, cantidad: cantidad });
  quitarEscribiendo();

  if (!respuesta.exito) {
    agregarMensajeAlChat('bot', `No pude agregar el producto: ${respuesta.mensaje}`);
    mostrarBotones([{ texto: '⬅️ Volver al menú', accion: 'menu_principal' }]);
    return;
  }

  agregarMensajeAlChat('bot', '✅ Producto agregado al carrito exitosamente.');
  mostrarBotones([
    { texto: '🛒 Ver mi carrito', accion: 'ver_carrito' },
    { texto: '🔍 Seguir comprando', accion: 'buscar_producto' },
    { texto: '📂 Ver categorías', accion: 'ver_categorias' },
    { texto: '⬅️ Volver al menú', accion: 'menu_principal' }
  ]);
}

/* ===== VER PEDIDOS ===== */
async function mostrarPedidosEnChat() {
  const sesion = await haySesionCliente();
  if (!sesion) {
    agregarMensajeAlChat('bot', 'Para ver tus pedidos necesitas iniciar sesión primero.');
    mostrarBotones([{ texto: '⬅️ Volver al menú', accion: 'menu_principal' }]);
    return;
  }

  mostrarEscribiendo();
  const respuesta = await apiGet('pedidos.php');
  quitarEscribiendo();

  if (!respuesta.exito || respuesta.datos.length === 0) {
    agregarMensajeAlChat('bot', 'No encuentro pedidos registrados en tu cuenta todavía.');
    mostrarBotones([{ texto: '⬅️ Volver al menú', accion: 'menu_principal' }]);
    return;
  }

  const estadosTexto = {
    pendiente: 'Pendiente', confirmado: 'Confirmado', en_camino: 'En camino',
    entregado: 'Entregado', cancelado: 'Cancelado'
  };

  const lineas = respuesta.datos.slice(0, 5).map(p => {
    const fecha = new Date(p.fecha_pedido).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    return `• Pedido #${p.id} — ${estadosTexto[p.estado] || p.estado} — ${formatearPrecio(p.total)} (${fecha})`;
  });

  agregarMensajeAlChat('bot', `Estos son tus pedidos más recientes:\n\n${lineas.join('\n')}`);
  mostrarBotones([{ texto: '⬅️ Volver al menú', accion: 'menu_principal' }]);
}

/* ===== ESCALAR A HUMANO ===== */
async function escalarConversacionAHumano() {
  mostrarEscribiendo();
  const respuesta = await apiPost('chatbot.php?accion=escalar', { conversacion_id: conversacionIdActual });
  quitarEscribiendo();

  if (respuesta.exito) {
    conversacionIdActual = respuesta.datos.conversacion_id;
    localStorage.setItem(CHATBOT_STORAGE_KEY, conversacionIdActual);
  }

  agregarMensajeAlChat('escalado', '🔔 Tu solicitud fue escalada a un agente humano. Te contactaremos pronto.');
  mostrarBotones([{ texto: '⬅️ Volver al menú', accion: 'menu_principal' }]);
}

/* ===== MANEJO DE INPUT DE TEXTO ===== */
async function manejarEnvioInput() {
  const input = document.getElementById('chatbotInput');
  const texto = input.value.trim();
  if (texto === '') return;

  agregarMensajeAlChat('usuario', texto);
  input.value = '';

  if (modoActual === 'buscando_producto') {
    await buscarProductoDesdeChat(texto);
    return;
  }

  if (/^(hola|buenas|hey|saludo)/i.test(texto)) {
    agregarMensajeAlChat('bot', '¡Hola! 👋 ¿En qué puedo ayudarte?');
    mostrarBotones(MENU_PRINCIPAL);
    return;
  }

  limpiarBotones();
  mostrarEscribiendo();

  const respuesta = await apiPost('chatbot.php', { mensaje: texto, conversacion_id: conversacionIdActual });
  quitarEscribiendo();

  if (!respuesta.exito) {
    agregarMensajeAlChat('bot', 'Ocurrió un error al procesar tu mensaje. Intenta de nuevo.');
    mostrarBotones([{ texto: '⬅️ Volver al menú', accion: 'menu_principal' }]);
    return;
  }

  conversacionIdActual = respuesta.datos.conversacion_id;
  localStorage.setItem(CHATBOT_STORAGE_KEY, conversacionIdActual);
  agregarMensajeAlChat('bot', respuesta.datos.respuesta);

  if (respuesta.datos.requiere_humano) {
    agregarMensajeAlChat('escalado', '🔔 Tu caso fue escalado a un agente humano.');
  }

  mostrarBotones([{ texto: '⬅️ Volver al menú', accion: 'menu_principal' }]);
}

// Event delegation para botones dinámicos
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.chatbot-sugerencia');
  if (!btn) return;
  const accion = btn.dataset.accion;
  if (accion && accion.startsWith('agregar_')) {
    const productoId = parseInt(accion.replace('agregar_', ''));
    if (!isNaN(productoId)) {
      await agregarProductoDesdeChat(productoId);
    }
  } else if (accion === 'ir_a_pagar') {
    await irAPagar();
  } else if (accion && accion.startsWith('categoria_')) {
    const categoriaId = parseInt(accion.replace('categoria_', ''));
    if (!isNaN(categoriaId)) {
      await mostrarProductosPorCategoria(categoriaId);
    }
  }
});

/* ===== BOTÓN FLOTANTE ===== */
document.addEventListener('DOMContentLoaded', () => {
  const botonFlotante = document.querySelector('.chatbot-flotante');
  if (botonFlotante) {
    botonFlotante.addEventListener('click', (e) => {
      e.preventDefault();
      abrirChatbot();
    });
  }
});