document.addEventListener('DOMContentLoaded', async () => {
  const contenedor = document.getElementById('ordenesMedicasLista');
  if (!contenedor) return;

  const sesion = await protegerPaginaUsuario();
  if (!sesion) return;

  let ordenes = [];
  const detallesCache = {};

  const respuesta = await apiGet('ordenes-medicas.php');
  ordenes = respuesta.exito ? respuesta.datos : [];

  function pintarLista() {
    if (ordenes.length === 0) {
      contenedor.innerHTML = `
        <div class="direcciones-vacio">
          ${t('om_vacio')}
          <a href="../../pages/orden-medica.html" style="color:var(--color-primario); font-weight:600;">${t('om_subir_primera')}</a>
        </div>`;
      return;
    }

    contenedor.innerHTML = ordenes.map(o => {
      const estado = estadoOrdenMedica(o.estado_analisis);
      return `
        <div class="tarjeta-expandible" id="orden-${o.id}">
          <div class="tarjeta-expandible__cabecera" data-id="${o.id}">
            <div class="tarjeta-expandible__titulo">
              <strong>${t('orden_num')} #${o.id}</strong>
              <span class="badge-estado ${estado.clase}">${estado.texto}</span>
            </div>
            <div style="display:flex; align-items:center; gap:16px;">
              <span style="font-size:0.85rem; color:var(--color-texto-suave);">📅 ${fmtFecha(o.fecha_carga, true)}</span>
              <span class="tarjeta-expandible__flecha">▼</span>
            </div>
          </div>
          <div class="tarjeta-expandible__cuerpo" id="detalle-orden-${o.id}">
            <p style="text-align:center; color:var(--color-texto-suave); font-size:0.85rem;">${t('cargando_detalle')}</p>
          </div>
        </div>
      `;
    }).join('');

    contenedor.querySelectorAll('.tarjeta-expandible__cabecera').forEach(cabecera => {
      cabecera.addEventListener('click', () => alternarDetalle(cabecera.dataset.id));
    });
  }

  function htmlDetalle(orden) {
    // archivo_url viene relativa a la raíz del proyecto
    const rutaArchivo = '../../' + orden.archivo_url;
    const productos = orden.productos_detectados || [];

    const filasProductos = productos.map(p => `
      <div class="item-linea">
        <span class="item-linea__nombre">${p.icono || ''} ${p.nombre}</span>
        <span style="display:flex; align-items:center; gap:8px;">
          ${fmtPrecio(p.precio)}
          ${Number(p.confirmado_por_usuario) === 1
            ? `<span class="badge-estado badge-estado--exito">${t('om_en_carrito')}</span>`
            : `<span class="badge-estado badge-estado--neutro">${t('om_sin_confirmar')}</span>`}
        </span>
      </div>
    `).join('');

    const textoExtraido = orden.texto_extraido && orden.texto_extraido.trim() !== ''
      ? `<p style="font-size:0.8rem; font-weight:600; margin-bottom:4px;">${t('om_texto_doc')}</p>
         <div class="texto-extraido-caja">${orden.texto_extraido}</div>`
      : '';

    return `
      <p style="margin-bottom:var(--espacio-md);">
        <a href="${rutaArchivo}" target="_blank" rel="noopener" class="btn btn-secundario" style="font-size:0.82rem; padding:8px 16px; display:inline-block;">
          ${t('om_ver_archivo')}
        </a>
      </p>

      ${textoExtraido}

      <p style="font-size:0.8rem; font-weight:600; margin-bottom:4px;">${t('om_productos_detectados')}</p>
      ${filasProductos || `<p style="font-size:0.85rem; color:var(--color-texto-suave);">${t('om_sin_productos')}</p>`}
    `;
  }

  async function alternarDetalle(id) {
    const tarjeta = document.getElementById(`orden-${id}`);
    const cuerpo = document.getElementById(`detalle-orden-${id}`);
    const abrirla = !tarjeta.classList.contains('tarjeta-expandible--abierta');

    tarjeta.classList.toggle('tarjeta-expandible--abierta', abrirla);
    if (!abrirla) return;

    if (detallesCache[id]) {
      cuerpo.innerHTML = htmlDetalle(detallesCache[id]);
      return;
    }

    const respuestaDetalle = await apiGet(`ordenes-medicas.php?id=${encodeURIComponent(id)}`);

    if (!respuestaDetalle.exito) {
      cuerpo.innerHTML = `<p style="color:var(--color-error); font-size:0.85rem;">${respuestaDetalle.mensaje || t('err_detalle_orden')}</p>`;
      return;
    }

    detallesCache[id] = respuestaDetalle.datos;
    cuerpo.innerHTML = htmlDetalle(respuestaDetalle.datos);
  }

  pintarLista();
  document.addEventListener('idiomaCambiado', pintarLista);
});