document.addEventListener('DOMContentLoaded', async () => {
  const contenedor = document.getElementById('historialLista');
  if (!contenedor) return;

  const sesion = await protegerPaginaUsuario();
  if (!sesion) return;

  let pedidos = [];
  // Guardamos los datos crudos del detalle, no el HTML: así al cambiar
  // de idioma se puede volver a generar traducido.
  const detallesCache = {};

  const respuesta = await apiGet('pedidos.php');
  pedidos = respuesta.exito ? respuesta.datos : [];

  function pintarLista() {
    if (pedidos.length === 0) {
      contenedor.innerHTML = `
        <div class="direcciones-vacio">
          ${t('hist_vacio')}
          <a href="../../pages/catalogo.html" style="color:var(--color-primario); font-weight:600;">${t('ir_catalogo_flecha')}</a>
        </div>`;
      return;
    }

    contenedor.innerHTML = pedidos.map(p => {
      const estado = estadoPedido(p.estado);
      return `
        <div class="tarjeta-expandible" id="pedido-${p.id}">
          <div class="tarjeta-expandible__cabecera" data-id="${p.id}">
            <div class="tarjeta-expandible__titulo">
              <strong>${t('pedido_num')} #${p.id}</strong>
              <span class="badge-estado ${estado.clase}">${estado.texto}</span>
            </div>
            <div style="display:flex; align-items:center; gap:16px;">
              <span style="font-size:0.85rem; color:var(--color-texto-suave);">📅 ${fmtFecha(p.fecha_pedido)}</span>
              <span style="font-weight:700;">${fmtPrecio(p.total)}</span>
              <span class="tarjeta-expandible__flecha">▼</span>
            </div>
          </div>
          <div class="tarjeta-expandible__cuerpo" id="detalle-${p.id}">
            <p style="text-align:center; color:var(--color-texto-suave); font-size:0.85rem;">${t('cargando_detalle')}</p>
          </div>
        </div>
      `;
    }).join('');

    contenedor.querySelectorAll('.tarjeta-expandible__cabecera').forEach(cabecera => {
      cabecera.addEventListener('click', () => alternarDetalle(cabecera.dataset.id));
    });
  }

  function htmlDetalle(pedido) {
    const items = pedido.items || [];

    const filasItems = items.map(item => `
      <div class="item-linea">
        <span class="item-linea__nombre">
          ${item.imagen_url
            ? `<img src="/drogueria-virtual/images/${item.imagen_url}" alt="${item.nombre}" style="width:30px; height:30px; object-fit:cover; border-radius:4px; vertical-align:middle; margin-right:8px;">`
            : (item.icono || '')}
          ${item.nombre} <span style="color:var(--color-texto-suave);">x${item.cantidad}</span>
        </span>
        <span>${fmtPrecio(item.subtotal)}</span>
      </div>
    `).join('');

    return `
      <div class="direccion-card__texto">📍 ${pedido.direccion}, ${pedido.barrio ? pedido.barrio + ', ' : ''}${pedido.ciudad}</div>
      ${filasItems || `<p style="font-size:0.85rem; color:var(--color-texto-suave);">${t('sin_productos_pedido')}</p>`}
      <div class="item-linea" style="border-bottom:none; padding-top:12px;">
        <span>${t('subtotal')}</span><span>${fmtPrecio(pedido.subtotal)}</span>
      </div>
      <div class="item-linea" style="border-bottom:none; padding-top:0;">
        <span>${t('domicilio')}</span><span>${Number(pedido.costo_domicilio) === 0 ? t('gratis') : fmtPrecio(pedido.costo_domicilio)}</span>
      </div>
      <div class="item-linea" style="border-bottom:none; padding-top:0; font-weight:700; color:var(--color-texto);">
        <span>${t('total')}</span><span>${fmtPrecio(pedido.total)}</span>
      </div>
    `;
  }

  async function alternarDetalle(id) {
    const tarjeta = document.getElementById(`pedido-${id}`);
    const cuerpo = document.getElementById(`detalle-${id}`);
    const abrirla = !tarjeta.classList.contains('tarjeta-expandible--abierta');

    tarjeta.classList.toggle('tarjeta-expandible--abierta', abrirla);
    if (!abrirla) return;

    if (detallesCache[id]) {
      cuerpo.innerHTML = htmlDetalle(detallesCache[id]);
      return;
    }

    const respuestaDetalle = await apiGet(`pedidos.php?id=${encodeURIComponent(id)}`);

    if (!respuestaDetalle.exito) {
      cuerpo.innerHTML = `<p style="color:var(--color-error); font-size:0.85rem;">${respuestaDetalle.mensaje || t('err_detalle_pedido')}</p>`;
      return;
    }

    detallesCache[id] = respuestaDetalle.datos;
    cuerpo.innerHTML = htmlDetalle(respuestaDetalle.datos);
  }

  pintarLista();
  document.addEventListener('idiomaCambiado', pintarLista);
});