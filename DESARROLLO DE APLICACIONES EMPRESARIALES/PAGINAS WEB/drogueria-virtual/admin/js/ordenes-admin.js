

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

const ESTADOS_ORDEN = {
  pendiente:            { etiqueta: 'Pendiente',   clase: 'badge-estado--advertencia' },
  procesada:            { etiqueta: 'Procesada',   clase: 'badge-estado--info' },
  revisada_por_usuario: { etiqueta: 'Revisada',    clase: 'badge-estado--exito' },
  error:                { etiqueta: 'Con error',   clase: 'badge-estado--error' }
};

function badgeEstadoOrden(estado) {
  const config = ESTADOS_ORDEN[estado] || { etiqueta: estado, clase: 'badge-estado--neutro' };
  return `<span class="badge-estado ${config.clase}">${escaparHtml(config.etiqueta)}</span>`;
}

/* ---------------------------------------------------
   Tarjetas de resumen
--------------------------------------------------- */
async function cargarResumenOrdenes() {
  const contenedor = document.getElementById('ordenesResumen');
  const respuesta = await apiGet('admin.php?recurso=resumen');
  if (!respuesta.exito) return;

  const porEstado = respuesta.datos.ordenes_por_estado;
  const total = respuesta.datos.totales.ordenes_medicas;

  const tarjetas = [
    { etiqueta: 'Total de órdenes',   valor: total, icono: '<i class="bi bi-clipboard2-pulse"></i>', color: 'morado' },
    { etiqueta: 'Pendientes',         valor: porEstado.pendiente || 0, icono: '⏳', color: 'naranja' },
    { etiqueta: 'Procesadas por OCR', valor: porEstado.procesada || 0, icono: '<i class="bi bi-search"></i>', color: 'azul' },
    { etiqueta: 'Revisadas',          valor: porEstado.revisada_por_usuario || 0, icono: '<i class="bi bi-check-circle"></i>', color: 'verde' }
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
   Tabla
--------------------------------------------------- */
function construirQueryOrdenes() {
  const parametros = new URLSearchParams({ recurso: 'ordenes-medicas' });

  const estado = document.getElementById('filtroEstado').value;
  const desde  = document.getElementById('filtroDesde').value;
  const hasta  = document.getElementById('filtroHasta').value;

  if (estado) parametros.append('estado', estado);
  if (desde)  parametros.append('desde', desde);
  if (hasta)  parametros.append('hasta', hasta);

  return 'admin.php?' + parametros.toString();
}

async function cargarOrdenes() {
  const tbody = document.getElementById('ordenesTabla');
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:var(--espacio-lg);">Cargando...</td></tr>`;

  const respuesta = await apiGet(construirQueryOrdenes());

  if (!respuesta.exito) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:var(--espacio-lg); color:#DC2626;">
      ${escaparHtml(respuesta.mensaje || 'No se pudieron cargar las órdenes.')}</td></tr>`;
    return;
  }

  const ordenes = respuesta.datos;

  if (ordenes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:var(--espacio-lg); color:var(--color-texto-suave);">
      No hay órdenes médicas que coincidan con los filtros.</td></tr>`;
    return;
  }

  tbody.innerHTML = ordenes.map(o => `
    <tr>
      <td><strong>#${o.id}</strong></td>
      <td>
        ${escaparHtml(o.cliente_nombre)}
        <br><span style="font-size:0.75rem; color:var(--color-texto-suave);">${escaparHtml(o.cliente_email)}</span>
      </td>
      <td>${formatearFecha(o.fecha_carga, true)}</td>
      <td>${o.productos_detectados}</td>
      <td>${o.productos_confirmados}</td>
      <td>${badgeEstadoOrden(o.estado_analisis)}</td>
      <td>
        <div class="admin-tabla__acciones">
          <button class="admin-btn-icono btn-ver-orden" data-id="${o.id}" title="Ver detalle"><i class="bi bi-eye"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.btn-ver-orden').forEach(btn => {
    btn.addEventListener('click', () => abrirDetalleOrden(btn.dataset.id));
  });
}

/* ---------------------------------------------------
   Detalle
--------------------------------------------------- */
async function abrirDetalleOrden(id) {
  const fondo = document.getElementById('modalOrdenFondo');
  const contenido = document.getElementById('modalOrdenContenido');

  document.getElementById('modalOrdenTitulo').textContent = `Orden médica #${id}`;
  contenido.innerHTML = 'Cargando...';
  fondo.classList.add('admin-modal-fondo--visible');

  const respuesta = await apiGet(`admin.php?recurso=orden-medica&id=${encodeURIComponent(id)}`);

  if (!respuesta.exito) {
    contenido.innerHTML = `<p style="color:#DC2626;">${escaparHtml(respuesta.mensaje)}</p>`;
    return;
  }

  const o = respuesta.datos;

  // archivo_url viene como 'uploads/ordenes_medicas/xxx.jpg' (relativa a la raíz del proyecto)
  const rutaArchivo = '../../' + o.archivo_url;

  const productos = (o.productos_detectados || []).length === 0
    ? '<p style="font-size:0.83rem; color:var(--color-texto-suave);">El sistema no detectó productos del catálogo en este documento.</p>'
    : o.productos_detectados.map(p => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--color-borde); font-size:0.83rem;">
          <span>${escaparHtml(p.icono || '')} ${escaparHtml(p.nombre)}</span>
          <span>
            ${formatearPrecio(p.precio)}
            ${Number(p.confirmado_por_usuario) === 1
              ? '<span class="badge-estado badge-estado--exito" style="margin-left:8px;">Confirmado</span>'
              : '<span class="badge-estado badge-estado--neutro" style="margin-left:8px;">Sin confirmar</span>'}
          </span>
        </div>
      `).join('');

  const textoExtraido = o.texto_extraido && o.texto_extraido.trim() !== ''
    ? `<pre style="background:var(--color-fondo-alterno); padding:12px; border-radius:var(--radio-md); font-size:0.78rem; white-space:pre-wrap; max-height:180px; overflow-y:auto; font-family:inherit;">${escaparHtml(o.texto_extraido)}</pre>`
    : '<p style="font-size:0.83rem; color:var(--color-texto-suave);">No se extrajo texto de este documento.</p>';

  contenido.innerHTML = `
    <div style="margin-bottom:var(--espacio-lg);">
      ${badgeEstadoOrden(o.estado_analisis)}
      <span style="font-size:0.8rem; color:var(--color-texto-suave); margin-left:10px;">
        ${formatearFecha(o.fecha_carga, true)}
      </span>
    </div>

    <h3 style="font-size:0.9rem; margin-bottom:8px;">Cliente</h3>
    <p style="font-size:0.85rem; margin-bottom:var(--espacio-lg);">
      ${escaparHtml(o.cliente_nombre)}<br>
      <span style="color:var(--color-texto-suave);">${escaparHtml(o.cliente_email)} · ${escaparHtml(o.cliente_telefono || 'Sin teléfono')}</span>
    </p>

    <h3 style="font-size:0.9rem; margin-bottom:8px;">Documento</h3>
    <p style="margin-bottom:var(--espacio-lg);">
      <a href="${escaparHtml(rutaArchivo)}" target="_blank" rel="noopener"
         class="btn btn-secundario" style="font-size:0.82rem; padding:8px 16px; display:inline-block;">
                <i class="bi bi-file-earmark-text"></i> Abrir archivo en otra pestaña
      </a>
    </p>

    <h3 style="font-size:0.9rem; margin-bottom:8px;">Texto extraído por OCR</h3>
    ${textoExtraido}

    <h3 style="font-size:0.9rem; margin:var(--espacio-lg) 0 6px;">Productos detectados en el catálogo</h3>
    ${productos}

    <p style="font-size:0.75rem; color:var(--color-texto-suave); margin-top:var(--espacio-lg);">
      El sistema únicamente extrae texto y busca coincidencias en el catálogo.
      No interpreta diagnósticos ni decide tratamientos.
    </p>
  `;
}

function cerrarModalOrden() {
  document.getElementById('modalOrdenFondo').classList.remove('admin-modal-fondo--visible');
}

/* ---------------------------------------------------
   Arranque
--------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
  const sesion = await sesionAdminLista;
  if (!sesion) return;

  cargarResumenOrdenes();
  cargarOrdenes();

  document.getElementById('filtroEstado').addEventListener('change', cargarOrdenes);
  document.getElementById('filtroDesde').addEventListener('change', cargarOrdenes);
  document.getElementById('filtroHasta').addEventListener('change', cargarOrdenes);

  document.getElementById('btnLimpiarFiltros').addEventListener('click', () => {
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroDesde').value = '';
    document.getElementById('filtroHasta').value = '';
    cargarOrdenes();
  });

  document.getElementById('modalOrdenCerrar').addEventListener('click', cerrarModalOrden);
  document.getElementById('modalOrdenFondo').addEventListener('click', (e) => {
    if (e.target.id === 'modalOrdenFondo') cerrarModalOrden();
  });
});