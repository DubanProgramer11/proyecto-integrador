document.addEventListener('DOMContentLoaded', async () => {
  const contenedor = document.getElementById('pedidosLista');
  if (!contenedor) return;

  const sesion = await protegerPaginaUsuario();
  if (!sesion) return;
  // sidebar y logout ya están inicializados por user.js

  let pedidos = [];

  const respuesta = await apiGet('pedidos.php');
  pedidos = respuesta.exito ? respuesta.datos : [];

  function pintar() {
    if (pedidos.length === 0) {
      contenedor.innerHTML = `
        <div class="direcciones-vacio">
          ${t('ped_vacio')}
          <a href="../../pages/catalogo.html" style="color:var(--color-primario); font-weight:600;">${t('ir_catalogo_flecha')}</a>
        </div>`;
      return;
    }

    contenedor.innerHTML = pedidos.map(p => {
      const estado = estadoPedido(p.estado);
      return `
        <div class="pedido-card">
          <div class="pedido-card__header">
            <span><strong>${t('pedido_num')} #${p.id}</strong></span>
            <span class="badge-estado ${estado.clase}">${estado.texto}</span>
          </div>
          <div class="pedido-card__body">
            <p><span>📅</span> ${fmtFecha(p.fecha_pedido)}</p>
            <p><span>💰</span> ${fmtPrecio(p.total)}</p>
            <p><span>📍</span> ${p.direccion}, ${p.ciudad}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  pintar();
  // Al cambiar el idioma, volvemos a dibujar con los datos ya cargados.
  document.addEventListener('idiomaCambiado', pintar);
});