

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

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ---------------------------------------------------
   Tarjetas de resumen
--------------------------------------------------- */
async function cargarResumenClientes() {
  const contenedor = document.getElementById('clientesResumen');
  const respuesta = await apiGet('admin.php?recurso=resumen');
  if (!respuesta.exito) return;

  const d = respuesta.datos;

  const tarjetas = [
        { etiqueta: 'Clientes registrados', valor: d.totales.clientes, icono: '<i class="bi bi-people"></i>', color: 'azul' },
    { etiqueta: 'Pedidos realizados',   valor: d.totales.pedidos,  icono: '<i class="bi bi-box-seam"></i>', color: 'verde' },
    { etiqueta: 'Órdenes médicas',      valor: d.totales.ordenes_medicas, icono: '<i class="bi bi-clipboard2-pulse"></i>', color: 'morado' },
    { etiqueta: 'Ticket promedio',      valor: formatearPrecio(d.ventas.ticket_promedio), icono: '<i class="bi bi-credit-card"></i>', color: 'naranja' }
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
   Tabla de clientes
--------------------------------------------------- */
function construirQueryClientes() {
  const parametros = new URLSearchParams({ recurso: 'clientes' });

  const busqueda = document.getElementById('filtroBusqueda').value.trim();
  const activo   = document.getElementById('filtroActivo').value;

  if (busqueda) parametros.append('busqueda', busqueda);
  if (activo !== '') parametros.append('activo', activo);

  return 'admin.php?' + parametros.toString();
}

async function cargarClientes() {
  const tbody = document.getElementById('clientesTabla');
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:var(--espacio-lg);">Cargando...</td></tr>`;

  const respuesta = await apiGet(construirQueryClientes());

  if (!respuesta.exito) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:var(--espacio-lg); color:#DC2626;">
      ${escaparHtml(respuesta.mensaje || 'No se pudieron cargar los clientes.')}</td></tr>`;
    return;
  }

  const clientes = respuesta.datos;

  if (clientes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:var(--espacio-lg); color:var(--color-texto-suave);">
      No hay clientes que coincidan con la búsqueda.</td></tr>`;
    return;
  }

  tbody.innerHTML = clientes.map(c => {
    const inicial = (c.nombre || '?').trim().charAt(0).toUpperCase();
    const activo = Number(c.activo) === 1;

    return `
      <tr>
        <td>
          <div class="admin-tabla__producto">
            <div class="admin-tabla__producto-icono">${escaparHtml(inicial)}</div>
            <div>
              ${escaparHtml(c.nombre)}
              <br><span style="font-size:0.75rem; color:var(--color-texto-suave);">${escaparHtml(c.email)}</span>
            </div>
          </div>
        </td>
        <td>${escaparHtml(c.telefono || '—')}</td>
        <td>${escaparHtml(c.ciudad || '—')}</td>
        <td><strong>${c.total_pedidos}</strong></td>
        <td>${formatearFecha(c.fecha_registro)}</td>
        <td>
          <span class="badge-estado ${activo ? 'badge-estado--exito' : 'badge-estado--neutro'}">
            ${activo ? 'Activa' : 'Desactivada'}
          </span>
        </td>
        <td>
          <div class="admin-tabla__acciones">
            <button class="admin-btn-icono btn-ver-ficha" data-id="${c.id}" title="Ver ficha"><i class="bi bi-eye"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.btn-ver-ficha').forEach(btn => {
    btn.addEventListener('click', () => abrirFichaCliente(btn.dataset.id));
  });
}

/* ---------------------------------------------------
   Ficha individual
--------------------------------------------------- */
async function abrirFichaCliente(id) {
  const fondo = document.getElementById('modalFichaFondo');
  const contenido = document.getElementById('modalFichaContenido');

  contenido.innerHTML = 'Cargando...';
  fondo.classList.add('admin-modal-fondo--visible');

  const respuesta = await apiGet(`admin.php?recurso=cliente&id=${encodeURIComponent(id)}`);

  if (!respuesta.exito) {
    contenido.innerHTML = `<p style="color:#DC2626;">${escaparHtml(respuesta.mensaje)}</p>`;
    return;
  }

  const c = respuesta.datos;
  const a = c.actividad;

  document.getElementById('modalFichaTitulo').textContent = c.nombre;

  const direcciones = c.direcciones.length === 0
    ? '<p style="font-size:0.83rem; color:var(--color-texto-suave);">Sin direcciones registradas.</p>'
    : c.direcciones.map(d => `
        <div style="padding:10px 0; border-bottom:1px solid var(--color-borde); font-size:0.83rem;">
          <strong>${escaparHtml(d.etiqueta || 'Dirección')}</strong>
          ${Number(d.predeterminada) === 1 ? '<span class="badge-estado badge-estado--info" style="margin-left:6px;">Predeterminada</span>' : ''}
          <br>${escaparHtml(d.direccion)}
          <br><span style="color:var(--color-texto-suave);">${escaparHtml(d.barrio || '')} ${escaparHtml(d.ciudad || '')}</span>
        </div>
      `).join('');

  contenido.innerHTML = `
    <p style="font-size:0.85rem; margin-bottom:var(--espacio-lg);">
      ${escaparHtml(c.email)} · ${escaparHtml(c.telefono || 'Sin teléfono')}<br>
      <span style="color:var(--color-texto-suave);">
        ${escaparHtml(c.ciudad || 'Ciudad no registrada')} · Registrado el ${formatearFecha(c.fecha_registro)}
      </span>
    </p>

    <h3 style="font-size:0.9rem; margin-bottom:10px;">Actividad</h3>
    <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-bottom:var(--espacio-lg);">
      <div style="background:var(--color-fondo-alterno); padding:12px; border-radius:var(--radio-md);">
        <div style="font-size:1.3rem; font-weight:700;">${a.total_pedidos}</div>
        <div style="font-size:0.75rem; color:var(--color-texto-suave);">Pedidos</div>
      </div>
      <div style="background:var(--color-fondo-alterno); padding:12px; border-radius:var(--radio-md);">
        <div style="font-size:1.3rem; font-weight:700;">${formatearPrecio(a.monto_comprado)}</div>
        <div style="font-size:0.75rem; color:var(--color-texto-suave);">Total comprado</div>
      </div>
      <div style="background:var(--color-fondo-alterno); padding:12px; border-radius:var(--radio-md);">
        <div style="font-size:1.3rem; font-weight:700;">${a.total_ordenes_medicas}</div>
        <div style="font-size:0.75rem; color:var(--color-texto-suave);">Órdenes médicas</div>
      </div>
      <div style="background:var(--color-fondo-alterno); padding:12px; border-radius:var(--radio-md);">
        <div style="font-size:1.3rem; font-weight:700;">${a.total_comentarios}</div>
        <div style="font-size:0.75rem; color:var(--color-texto-suave);">Comentarios</div>
      </div>
    </div>

    <h3 style="font-size:0.9rem; margin-bottom:6px;">Direcciones de entrega</h3>
    ${direcciones}
  `;
}

function cerrarModalFicha() {
  document.getElementById('modalFichaFondo').classList.remove('admin-modal-fondo--visible');
}

/* ---------------------------------------------------
   Arranque
--------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
  const sesion = await sesionAdminLista;
  if (!sesion) return;

  cargarResumenClientes();
  cargarClientes();

  document.getElementById('filtroActivo').addEventListener('change', cargarClientes);

  let temporizador;
  document.getElementById('filtroBusqueda').addEventListener('input', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(cargarClientes, 400);
  });

  document.getElementById('btnLimpiarFiltros').addEventListener('click', () => {
    document.getElementById('filtroBusqueda').value = '';
    document.getElementById('filtroActivo').value = '';
    cargarClientes();
  });

  document.getElementById('modalFichaCerrar').addEventListener('click', cerrarModalFicha);
  document.getElementById('modalFichaFondo').addEventListener('click', (e) => {
    if (e.target.id === 'modalFichaFondo') cerrarModalFicha();
  });
});