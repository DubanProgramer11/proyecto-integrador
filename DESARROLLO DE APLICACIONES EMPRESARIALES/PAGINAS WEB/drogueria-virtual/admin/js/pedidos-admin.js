/* ===================================================
   GESTIÓN DE PEDIDOS — Panel administrativo (Fase 16.3)
   ---------------------------------------------------
   Consume backend/api/admin.php?recurso=pedidos
   Todos los datos vienen de MySQL; aquí no hay nada simulado.
=================================================== */

/* Guardamos la última respuesta para no volver a pedirla
   cuando el usuario solo abre el detalle de un pedido. */
let pedidosCargados = [];

/* ---------------------------------------------------
   Utilidades
--------------------------------------------------- */

/* Escapa el HTML antes de inyectarlo en la tabla.
   Protección XSS (requisito 17): si un cliente se registrara con
   un nombre como <script>...</script>, aquí queda neutralizado. */
function escaparHtml(texto) {
  if (texto === null || texto === undefined) return '';
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatearPrecio(valor) {
  return '$' + Number(valor || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

function formatearFecha(fecha, conHora = false) {
  const opciones = { day: 'numeric', month: 'short', year: 'numeric' };
  if (conHora) { opciones.hour = '2-digit'; opciones.minute = '2-digit'; }
  return new Date(fecha).toLocaleDateString('es-CO', opciones);
}

/* Cada estado tiene su color y su etiqueta legible */
const ESTADOS_PEDIDO = {
  pendiente:  { etiqueta: 'Pendiente',  clase: 'badge-estado--advertencia' },
  confirmado: { etiqueta: 'Confirmado', clase: 'badge-estado--info' },
  en_camino:  { etiqueta: 'En camino',  clase: 'badge-estado--info' },
  entregado:  { etiqueta: 'Entregado',  clase: 'badge-estado--exito' },
  cancelado:  { etiqueta: 'Cancelado',  clase: 'badge-estado--error' }
};

function badgeEstado(estado) {
  const config = ESTADOS_PEDIDO[estado] || { etiqueta: estado, clase: 'badge-estado--neutro' };
  return `<span class="badge-estado ${config.clase}">${escaparHtml(config.etiqueta)}</span>`;
}

/* ---------------------------------------------------
   Tarjetas de resumen (cuántos pedidos por estado)
--------------------------------------------------- */
async function cargarResumenPedidos() {
  const contenedor = document.getElementById('pedidosResumen');
  const respuesta = await apiGet('admin.php?recurso=resumen');
  if (!respuesta.exito) return;

  const porEstado = respuesta.datos.pedidos_por_estado;
  const ventas = respuesta.datos.ventas;

  const tarjetas = [
        { etiqueta: 'Pedidos pendientes', valor: porEstado.pendiente, icono: '<i class="bi bi-hourglass-split"></i>', color: 'naranja' },
    { etiqueta: 'En camino',          valor: porEstado.en_camino, icono: '<i class="bi bi-truck"></i>', color: 'azul' },
    { etiqueta: 'Entregados',         valor: porEstado.entregado, icono: '<i class="bi bi-check-circle"></i>', color: 'verde' },
    { etiqueta: 'Total vendido',      valor: formatearPrecio(ventas.monto_total), icono: '<i class="bi bi-cash-coin"></i>', color: 'morado' }
  ];
  contenedor.innerHTML = tarjetas.map(t => `
    <div class="admin-stat-card">
      <div class="admin-stat-card__icono admin-stat-card__icono--${t.color}">${t.icono}</div>
      <div>
        <div class="admin-stat-card__valor">${escaparHtml(t.valor)}</div>
        <div class="admin-stat-card__etiqueta">${t.etiqueta}</div>
      </div>
    </div>
  `).join('');
}

/* ---------------------------------------------------
   Tabla principal
--------------------------------------------------- */
function construirQueryFiltros() {
  const parametros = new URLSearchParams({ recurso: 'pedidos' });

  const estado   = document.getElementById('filtroEstado').value;
  const desde    = document.getElementById('filtroDesde').value;
  const hasta    = document.getElementById('filtroHasta').value;
  const busqueda = document.getElementById('filtroBusqueda').value.trim();

  if (estado)   parametros.append('estado', estado);
  if (desde)    parametros.append('desde', desde);
  if (hasta)    parametros.append('hasta', hasta);
  if (busqueda) parametros.append('busqueda', busqueda);

  return 'admin.php?' + parametros.toString();
}

async function cargarPedidos() {
  const tbody = document.getElementById('pedidosTabla');
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:var(--espacio-lg);">Cargando...</td></tr>`;

  const respuesta = await apiGet(construirQueryFiltros());

  if (!respuesta.exito) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:var(--espacio-lg); color:#DC2626;">
      ${escaparHtml(respuesta.mensaje || 'No se pudieron cargar los pedidos.')}</td></tr>`;
    return;
  }

  pedidosCargados = respuesta.datos;

  if (pedidosCargados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:var(--espacio-lg); color:var(--color-texto-suave);">
      No hay pedidos que coincidan con los filtros.</td></tr>`;
    return;
  }

  tbody.innerHTML = pedidosCargados.map(p => `
    <tr>
      <td><strong>#${p.id}</strong></td>
      <td>
        ${escaparHtml(p.cliente_nombre)}
        <br><span style="font-size:0.75rem; color:var(--color-texto-suave);">${escaparHtml(p.cliente_email)}</span>
      </td>
      <td>${p.total_items}</td>
      <td><strong>${formatearPrecio(p.total)}</strong></td>
      <td>${formatearFecha(p.fecha_pedido)}</td>
      <td>
        <select class="selector-estado" data-id="${p.id}"
                style="padding:5px 8px; border:1px solid var(--color-borde); border-radius:var(--radio-sm); font-size:0.78rem;">
          ${Object.keys(ESTADOS_PEDIDO).map(clave => `
            <option value="${clave}" ${p.estado === clave ? 'selected' : ''}>
              ${ESTADOS_PEDIDO[clave].etiqueta}
            </option>`).join('')}
        </select>
      </td>
      <td>
        <div class="admin-tabla__acciones">
          <button class="admin-btn-icono btn-ver-detalle" data-id="${p.id}" title="Ver detalle"><i class="bi bi-eye"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  // Conectamos los eventos DESPUÉS de dibujar las filas
  document.querySelectorAll('.selector-estado').forEach(select => {
    select.addEventListener('change', manejarCambioEstado);
  });
  document.querySelectorAll('.btn-ver-detalle').forEach(btn => {
    btn.addEventListener('click', () => abrirDetallePedido(btn.dataset.id));
  });
}

/* ---------------------------------------------------
   Cambio de estado del pedido
--------------------------------------------------- */
async function manejarCambioEstado(evento) {
  const select = evento.target;
  const id = select.dataset.id;
  const nuevoEstado = select.value;
  const estadoAnterior = pedidosCargados.find(p => String(p.id) === String(id))?.estado;

  const etiqueta = ESTADOS_PEDIDO[nuevoEstado].etiqueta;
  if (!confirm(`¿Cambiar el pedido #${id} a "${etiqueta}"?`)) {
    select.value = estadoAnterior; // el usuario canceló: devolvemos el selector
    return;
  }

  select.disabled = true;
  const respuesta = await apiPut('admin.php?recurso=pedido-estado', { id: Number(id), estado: nuevoEstado });
  select.disabled = false;

  if (!respuesta.exito) {
    alert(respuesta.mensaje || 'No se pudo actualizar el estado.');
    select.value = estadoAnterior;
    return;
  }

  // Actualizamos la copia local y refrescamos las tarjetas
  const pedido = pedidosCargados.find(p => String(p.id) === String(id));
  if (pedido) pedido.estado = nuevoEstado;
  cargarResumenPedidos();
}

/* ---------------------------------------------------
   Modal de detalle
--------------------------------------------------- */
async function abrirDetallePedido(id) {
  const fondo = document.getElementById('modalDetalleFondo');
  const contenido = document.getElementById('modalDetalleContenido');

  document.getElementById('modalDetalleTitulo').textContent = `Pedido #${id}`;
  contenido.innerHTML = 'Cargando...';
  fondo.classList.add('admin-modal-fondo--visible');

  const respuesta = await apiGet(`admin.php?recurso=pedido&id=${encodeURIComponent(id)}`);

  if (!respuesta.exito) {
    contenido.innerHTML = `<p style="color:#DC2626;">${escaparHtml(respuesta.mensaje)}</p>`;
    return;
  }

  const p = respuesta.datos;

  const filasItems = p.items.map(item => `
    <tr>
      <td>${escaparHtml(item.icono || '')} ${escaparHtml(item.nombre)}</td>
      <td style="text-align:center;">${item.cantidad}</td>
      <td style="text-align:right;">${formatearPrecio(item.precio_unitario)}</td>
      <td style="text-align:right;"><strong>${formatearPrecio(item.subtotal)}</strong></td>
    </tr>
  `).join('');

  contenido.innerHTML = `
    <div style="margin-bottom:var(--espacio-lg);">
      ${badgeEstado(p.estado)}
      <span style="font-size:0.8rem; color:var(--color-texto-suave); margin-left:10px;">
        ${formatearFecha(p.fecha_pedido, true)}
      </span>
    </div>

    <h3 style="font-size:0.9rem; margin-bottom:8px;">Cliente</h3>
    <p style="font-size:0.85rem; margin-bottom:var(--espacio-lg);">
      ${escaparHtml(p.cliente_nombre)}<br>
      <span style="color:var(--color-texto-suave);">${escaparHtml(p.cliente_email)} · ${escaparHtml(p.cliente_telefono || 'Sin teléfono')}</span>
    </p>

    <h3 style="font-size:0.9rem; margin-bottom:8px;">Entrega</h3>
    <p style="font-size:0.85rem; margin-bottom:var(--espacio-lg);">
      ${escaparHtml(p.direccion || 'Sin dirección registrada')}<br>
      <span style="color:var(--color-texto-suave);">
        ${escaparHtml(p.barrio || '')} ${escaparHtml(p.ciudad || '')}
        ${p.referencia ? '· ' + escaparHtml(p.referencia) : ''}
      </span><br>
      <span style="color:var(--color-texto-suave);">Tel. contacto: ${escaparHtml(p.telefono_contacto || 'No registrado')}</span>
    </p>

    <h3 style="font-size:0.9rem; margin-bottom:8px;">Productos</h3>
    <table class="admin-tabla" style="font-size:0.82rem;">
      <thead>
        <tr><th>Producto</th><th style="text-align:center;">Cant.</th><th style="text-align:right;">Precio</th><th style="text-align:right;">Subtotal</th></tr>
      </thead>
      <tbody>${filasItems}</tbody>
    </table>

    <div style="margin-top:var(--espacio-lg); text-align:right; font-size:0.88rem;">
      <div>Subtotal: ${formatearPrecio(p.subtotal)}</div>
      <div>Domicilio: ${Number(p.costo_domicilio) === 0 ? '<strong style="color:#16A34A;">Gratis</strong>' : formatearPrecio(p.costo_domicilio)}</div>
      <div style="font-size:1.05rem; font-weight:700; margin-top:6px;">Total: ${formatearPrecio(p.total)}</div>
    </div>
  `;
}

function cerrarModalDetalle() {
  document.getElementById('modalDetalleFondo').classList.remove('admin-modal-fondo--visible');
}

/* ---------------------------------------------------
   Arranque
--------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
  // Esperamos a que admin.js confirme que hay sesión con rol válido.
  const sesion = await sesionAdminLista;
  if (!sesion) return; // sin permisos: admin.js ya está redirigiendo

  cargarResumenPedidos();
  cargarPedidos();

  // Filtros
  document.getElementById('filtroEstado').addEventListener('change', cargarPedidos);
  document.getElementById('filtroDesde').addEventListener('change', cargarPedidos);
  document.getElementById('filtroHasta').addEventListener('change', cargarPedidos);

  // El buscador espera 400 ms tras la última tecla para no consultar en cada letra
  let temporizador;
  document.getElementById('filtroBusqueda').addEventListener('input', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(cargarPedidos, 400);
  });

  document.getElementById('btnLimpiarFiltros').addEventListener('click', () => {
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroDesde').value = '';
    document.getElementById('filtroHasta').value = '';
    document.getElementById('filtroBusqueda').value = '';
    cargarPedidos();
  });

  // Cierre del modal
  document.getElementById('modalDetalleCerrar').addEventListener('click', cerrarModalDetalle);
  document.getElementById('modalDetalleFondo').addEventListener('click', (e) => {
    if (e.target.id === 'modalDetalleFondo') cerrarModalDetalle();
  });
});