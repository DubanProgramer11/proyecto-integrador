// ============================================================
// ARCHIVO: admin/js/conversaciones-admin.js
// Conversaciones del chatbot vistas desde el panel.
// ============================================================

const ESTADOS_CONV = {
  abierta:  { texto: 'Abierta',  clase: 'badge-estado--exito',       icono: 'bi-chat-left-dots' },
  escalada: { texto: 'Escalada', clase: 'badge-estado--advertencia', icono: 'bi-person-raised-hand' },
  cerrada:  { texto: 'Cerrada',  clase: 'badge-estado--neutro',      icono: 'bi-check2-circle' }
};

let conversaciones = [];
let idSeleccionada = null;

function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

function fechaCorta(valor) {
  return new Date(valor).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function hora(valor) {
  return new Date(valor).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

/* ===== LISTA ===== */
function pintarLista() {
  const caja = document.getElementById('convLista');
  const contador = document.getElementById('convContador');

  contador.textContent = conversaciones.length + (conversaciones.length === 1 ? ' conversación' : ' conversaciones');

  if (conversaciones.length === 0) {
    caja.innerHTML = `<div class="conv-vacio" style="padding:var(--espacio-xl);">
        <i class="bi bi-inbox"></i>No hay conversaciones con estos filtros.</div>`;
    return;
  }

  caja.innerHTML = conversaciones.map(c => {
    const estado = ESTADOS_CONV[c.estado] || { texto: c.estado, clase: 'badge-estado--neutro' };
    const nombre = c.usuario_nombre || 'Visitante sin cuenta';
    const inicial = nombre.trim().charAt(0).toUpperCase();
    const activa = c.id == idSeleccionada ? ' conv-item--activa' : '';

    return `
      <div class="conv-item${activa}" data-id="${c.id}">
        <div class="conv-item__avatar">${escaparHtml(inicial)}</div>
        <div class="conv-item__cuerpo">
          <div class="conv-item__fila">
            <span class="conv-item__nombre">${escaparHtml(nombre)}</span>
            <span class="badge-estado ${estado.clase}">${estado.texto}</span>
          </div>
          <div class="conv-item__meta">
            <span><i class="bi bi-hash"></i>${c.id}</span>
            <span><i class="bi bi-chat"></i> ${c.total_mensajes}</span>
            <span><i class="bi bi-calendar3"></i> ${fechaCorta(c.fecha_inicio)}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  caja.querySelectorAll('.conv-item').forEach(item => {
    item.addEventListener('click', () => abrirConversacion(item.dataset.id));
  });
}

/* ===== DETALLE ===== */
async function abrirConversacion(id) {
  idSeleccionada = id;
  pintarLista();

  const panel = document.getElementById('convPanel');
  panel.innerHTML = `<div class="dash-cargando"><span class="dash-spinner"></span> Cargando mensajes...</div>`;

  const respuesta = await apiGet('conversaciones-admin.php?id=' + encodeURIComponent(id));

  if (!respuesta.exito) {
    panel.innerHTML = `<div class="conv-vacio"><i class="bi bi-exclamation-triangle"></i>
        ${escaparHtml(respuesta.mensaje || 'No se pudo cargar la conversación.')}</div>`;
    return;
  }

  const c = respuesta.datos;
  const estado = ESTADOS_CONV[c.estado] || { texto: c.estado, clase: 'badge-estado--neutro' };
  const nombre = c.usuario_nombre || 'Visitante sin cuenta';

  panel.innerHTML = `
    <div class="conv-chat__cabecera">
      <div class="conv-chat__info">
        <div class="conv-item__avatar">${escaparHtml(nombre.trim().charAt(0).toUpperCase())}</div>
        <div>
          <div class="conv-chat__nombre">${escaparHtml(nombre)}</div>
          <div class="conv-chat__email">${escaparHtml(c.usuario_email || 'Sin correo registrado')}</div>
        </div>
        <span class="badge-estado ${estado.clase}">${estado.texto}</span>
      </div>
      <div class="conv-chat__acciones">
        ${c.estado !== 'escalada' ? `<button class="dash-btn dash-btn--claro" data-estado="escalada"><i class="bi bi-person-raised-hand"></i> Escalar</button>` : ''}
        ${c.estado !== 'abierta' ? `<button class="dash-btn dash-btn--claro" data-estado="abierta"><i class="bi bi-arrow-counterclockwise"></i> Reabrir</button>` : ''}
        ${c.estado !== 'cerrada' ? `<button class="dash-btn dash-btn--primario" data-estado="cerrada"><i class="bi bi-check2"></i> Cerrar</button>` : ''}
      </div>
    </div>
    <div class="conv-chat__mensajes" id="convMensajes">${pintarMensajes(c.mensajes || [])}</div>`;

  // Bajamos al último mensaje, como en cualquier chat
  const caja = document.getElementById('convMensajes');
  caja.scrollTop = caja.scrollHeight;

  panel.querySelectorAll('[data-estado]').forEach(btn => {
    btn.addEventListener('click', () => cambiarEstado(c.id, btn.dataset.estado));
  });
}

function pintarMensajes(mensajes) {
  if (mensajes.length === 0) {
    return `<div class="conv-vacio"><i class="bi bi-chat"></i>Esta conversación no tiene mensajes.</div>`;
  }

  let ultimoDia = '';
  return mensajes.map(m => {
    let separador = '';
    const dia = fechaCorta(m.fecha_envio);
    if (dia !== ultimoDia) {
      ultimoDia = dia;
      separador = `<span class="conv-dia">${dia}</span>`;
    }

    // El emisor decide de qué lado va y con qué color.
    let clase = 'conv-burbuja--bot';
    if (m.emisor === 'usuario') clase = 'conv-burbuja--usuario';
    else if (m.emisor === 'agente') clase = 'conv-burbuja--agente';

    return `${separador}
      <div class="conv-burbuja ${clase}">
        ${escaparHtml(m.contenido)}
        <span class="conv-burbuja__hora">${hora(m.fecha_envio)}</span>
      </div>`;
  }).join('');
}

async function cambiarEstado(id, estado) {
  const respuesta = await apiPut('conversaciones-admin.php?id=' + encodeURIComponent(id), { estado });

  if (!respuesta.exito) {
    alert(respuesta.mensaje || 'No se pudo cambiar el estado.');
    return;
  }

  await cargarConversaciones();
  abrirConversacion(id);
}

/* ===== CARGA ===== */
async function cargarConversaciones() {
  const parametros = new URLSearchParams();
  const busqueda = document.getElementById('convBuscar').value.trim();
  const estado = document.getElementById('convEstado').value;

  if (busqueda) parametros.set('busqueda', busqueda);
  if (estado) parametros.set('estado', estado);

  const url = 'conversaciones-admin.php' + (parametros.toString() ? '?' + parametros.toString() : '');
  const respuesta = await apiGet(url);

  if (!respuesta.exito) {
    document.getElementById('convLista').innerHTML =
      `<div class="conv-vacio" style="padding:var(--espacio-xl);"><i class="bi bi-exclamation-triangle"></i>
        ${escaparHtml(respuesta.mensaje || 'No se pudieron cargar las conversaciones.')}</div>`;
    return;
  }

  const d = respuesta.datos;
  conversaciones = d.conversaciones;

  document.getElementById('statTotal').textContent = d.total;
  document.getElementById('statAbiertas').textContent = d.por_estado.abierta || 0;
  document.getElementById('statEscaladas').textContent = d.por_estado.escalada || 0;
  document.getElementById('statCerradas').textContent = d.por_estado.cerrada || 0;

  pintarLista();
}

/* ===== ARRANQUE ===== */
document.addEventListener('DOMContentLoaded', async () => {
  const sesion = await sesionAdminLista;
  if (!sesion) return;

  document.getElementById('convActualizar').addEventListener('click', cargarConversaciones);
  document.getElementById('convEstado').addEventListener('change', cargarConversaciones);

  // Buscar con Enter, para no consultar en cada tecla
  document.getElementById('convBuscar').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') cargarConversaciones();
  });

  document.getElementById('convLimpiar').addEventListener('click', () => {
    document.getElementById('convBuscar').value = '';
    document.getElementById('convEstado').value = '';
    cargarConversaciones();
  });

  cargarConversaciones();
});
