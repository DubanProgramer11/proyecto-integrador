const COSTO_DOMICILIO = 6000;
const ENVIO_GRATIS_DESDE = 80000;

/* ===== Verificación de sesión ===== */
async function haySesionCliente() {
  const respuesta = await apiGet('sesion.php');
  return respuesta.exito ? respuesta.datos : null;
}

/* ===== Agregar producto con validación de stock ===== */
async function agregarAlCarrito(producto, cantidad = 1) {
  const sesion = await haySesionCliente();
  if (!sesion) {
    mostrarNotificacionCarrito('Inicia sesión para agregar productos al carrito', true);
    setTimeout(() => window.location.href = detectarRutaLogin(), 1200);
    return;
  }

  // Validación de stock antes de enviar
  if (producto.stock <= 0) {
    mostrarNotificacionCarrito('Este producto está agotado.', true);
    return;
  }
  if (cantidad > producto.stock) {
    mostrarNotificacionCarrito(`Solo hay ${producto.stock} unidades disponibles.`, true);
    return;
  }

  const respuesta = await apiPost('carrito.php', {
    producto_id: producto.id,
    cantidad: cantidad
  });

  if (!respuesta.exito) {
    mostrarNotificacionCarrito(respuesta.mensaje || 'No se pudo agregar el producto.', true);
    return;
  }

  await actualizarContadorCarrito();
  mostrarNotificacionCarrito(`${producto.nombre} agregado al carrito`);
}

function detectarRutaLogin() {
  const enPages = window.location.pathname.includes('/pages/');
  return enPages ? '../login.html' : 'login.html';
}

/* ===== Contador en el header ===== */
async function actualizarContadorCarrito() {
  const respuesta = await apiGet('carrito.php');
  const totalItems = respuesta.exito
    ? respuesta.datos.reduce((sum, item) => sum + Number(item.cantidad), 0)
    : 0;

  document.querySelectorAll('.header__carrito-contador').forEach(el => {
    el.textContent = totalItems;
    el.style.display = totalItems > 0 ? 'flex' : 'none';
  });
}

/* ===== Notificación flotante ===== */
function mostrarNotificacionCarrito(mensaje, esError = false) {
  const existente = document.querySelector('.notificacion-carrito');
  if (existente) existente.remove();

  const noti = document.createElement('div');
  noti.className = 'notificacion-carrito';
  if (esError) noti.style.background = 'var(--color-error)';
  noti.textContent = `${esError ? '⚠' : '✓'} ${mensaje}`;
  document.body.appendChild(noti);

  setTimeout(() => noti.classList.add('notificacion-carrito--visible'), 10);
  setTimeout(() => {
    noti.classList.remove('notificacion-carrito--visible');
    setTimeout(() => noti.remove(), 300);
  }, 2200);
}

/* ===== Render de la página de carrito con control de stock ===== */
async function renderizarCarrito() {
  const contenedor = document.getElementById('carritoLista');
  if (!contenedor) return;

  const vacioEl = document.getElementById('carritoVacio');
  const resumenEl = document.getElementById('carritoResumen');

  const sesion = await haySesionCliente();
  if (!sesion) {
    contenedor.innerHTML = '';
    vacioEl.style.display = 'block';
    vacioEl.innerHTML = `
      <div class="carrito-vacio__icono">🔒</div>
      <h2>Inicia sesión para ver tu carrito</h2>
      <p>Necesitas una cuenta para agregar y guardar productos.</p>
      <a href="${detectarRutaLogin()}" class="btn btn-primario">Iniciar sesión</a>
    `;
    resumenEl.style.display = 'none';
    return;
  }

  const respuesta = await apiGet('carrito.php');
  const carrito = respuesta.exito ? respuesta.datos : [];

  if (carrito.length === 0) {
    contenedor.innerHTML = '';
    vacioEl.style.display = 'block';
    vacioEl.innerHTML = `
      <div class="carrito-vacio__icono">🛒</div>
      <h2>Tu carrito está vacío</h2>
      <p>Agrega productos desde el catálogo para verlos aquí.</p>
      <a href="catalogo.html" class="btn btn-primario">Ir al catálogo</a>
    `;
    resumenEl.style.display = 'none';
    return;
  }

  vacioEl.style.display = 'none';
  resumenEl.style.display = 'block';

  // Generar HTML mostrando el stock disponible
  contenedor.innerHTML = carrito.map(item => {
    const stock = item.stock || 0;
    const cantidad = item.cantidad || 0;
    const puedeAumentar = cantidad < stock;
    const imagenHTML = item.imagen_url
      ? `<img src="/drogueria-virtual/images/${item.imagen_url}" alt="${item.nombre}" class="carrito-item__img">`
      : `<span style="font-size:2rem;">${item.icono}</span>`;

    return `
      <div class="carrito-item">
        <div class="carrito-item__imagen">${imagenHTML}</div>
        <div class="carrito-item__info">
          <span class="carrito-item__categoria">${item.categoria}</span>
          <h3 class="carrito-item__nombre">${item.nombre}</h3>
          <span class="carrito-item__precio-unitario">${formatearPrecio(item.precio)} c/u</span>
          <div style="font-size:0.75rem; color:var(--color-texto-suave); margin-top:4px;">
            📦 Stock disponible: <strong>${stock}</strong> unidades
          </div>
        </div>
        <div class="carrito-item__cantidad">
          <button class="carrito-item__btn-cantidad" data-accion="restar" data-item="${item.item_id}" data-cant="${cantidad}">−</button>
          <span class="carrito-item__cantidad-valor">${cantidad}</span>
          <button class="carrito-item__btn-cantidad" data-accion="sumar" data-item="${item.item_id}" data-cant="${cantidad}" data-stock="${stock}" ${!puedeAumentar ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>+</button>
          <span style="font-size:0.65rem; color:var(--color-texto-suave); margin-left:4px;">Máx. ${stock}</span>
        </div>
        <div class="carrito-item__subtotal">${formatearPrecio(item.precio * cantidad)}</div>
        <button class="carrito-item__eliminar" data-item="${item.item_id}" title="Eliminar">🗑️</button>
      </div>
    `;
  }).join('');

  // Eventos de cantidad con validación de stock
  contenedor.querySelectorAll('.carrito-item__btn-cantidad').forEach(btn => {
    btn.addEventListener('click', async () => {
      const itemId = btn.dataset.item;
      const actual = Number(btn.dataset.cant);
      const accion = btn.dataset.accion;
      const stock = Number(btn.dataset.stock) || 0;
      let nueva;

      if (accion === 'sumar') {
        if (actual >= stock) {
          mostrarNotificacionCarrito(`Solo hay ${stock} unidades disponibles.`, true);
          return;
        }
        nueva = actual + 1;
      } else {
        nueva = actual - 1;
        if (nueva <= 0) {
          // Si llega a 0, eliminar el item
          await apiDelete(`carrito.php?id=${itemId}`);
          renderizarCarrito();
          actualizarContadorCarrito();
          return;
        }
      }

      // Intentar actualizar la cantidad en el backend (valida stock de nuevo)
      const resp = await apiPut(`carrito.php?id=${itemId}`, { cantidad: nueva });
      if (!resp.exito) {
        mostrarNotificacionCarrito(resp.mensaje || 'Error al actualizar cantidad.', true);
        // Recargar para reflejar el estado real desde el backend
        renderizarCarrito();
        actualizarContadorCarrito();
        return;
      }

      renderizarCarrito();
      actualizarContadorCarrito();
    });
  });

  // Eventos de eliminación
  contenedor.querySelectorAll('.carrito-item__eliminar').forEach(btn => {
    btn.addEventListener('click', async () => {
      await apiDelete(`carrito.php?id=${btn.dataset.item}`);
      renderizarCarrito();
      actualizarContadorCarrito();
    });
  });

  actualizarResumenCarrito(carrito);
}

function actualizarResumenCarrito(carrito) {
  const subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const domicilio = subtotal === 0 || subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_DOMICILIO;
  const total = subtotal + domicilio;

  document.getElementById('carritoSubtotal').textContent = formatearPrecio(subtotal);

  const domicilioEl = document.getElementById('carritoDomicilio');
  domicilioEl.textContent = domicilio === 0 ? 'Gratis' : formatearPrecio(domicilio);
  domicilioEl.classList.toggle('carrito-resumen__gratis', domicilio === 0);

  document.getElementById('carritoTotal').textContent = formatearPrecio(total);

  const faltante = ENVIO_GRATIS_DESDE - subtotal;
  const avisoEnvio = document.getElementById('carritoAvisoEnvio');
  if (avisoEnvio) {
    if (faltante > 0 && subtotal > 0) {
      avisoEnvio.style.display = 'block';
      avisoEnvio.textContent = `Te faltan ${formatearPrecio(faltante)} para envío gratis 🚚`;
    } else {
      avisoEnvio.style.display = 'none';
    }
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  actualizarContadorCarrito();
  renderizarCarrito();

  const btnVaciar = document.getElementById('carritoVaciar');
  if (btnVaciar) {
    btnVaciar.addEventListener('click', async () => {
      if (confirm('¿Seguro que deseas vaciar el carrito?')) {
        await apiPost('carrito.php?accion=vaciar', {});
        renderizarCarrito();
        actualizarContadorCarrito();
      }
    });
  }
});