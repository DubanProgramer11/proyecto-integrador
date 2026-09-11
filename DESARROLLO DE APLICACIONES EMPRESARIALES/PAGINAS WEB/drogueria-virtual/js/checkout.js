let direccionSeleccionadaId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const contenedorDirecciones = document.getElementById('checkoutDirecciones');
  const mensaje = document.getElementById('checkoutMensaje');
  const btnConfirmar = document.getElementById('btnConfirmarPedido');

  if (!contenedorDirecciones) return;

  // ===== 1. Verificar sesión =====
  const sesion = await haySesionCliente();
  if (!sesion) {
    window.location.href = '../login.html';
    return;
  }

  // ===== 2. Cargar direcciones =====
  async function cargarDirecciones() {
    const resp = await apiGet('direcciones.php');
    const direcciones = resp.exito ? resp.datos : [];

    if (direcciones.length === 0) {
      contenedorDirecciones.innerHTML = `
        <p style="color:var(--color-texto-suave); font-size:0.9rem;">No tienes direcciones guardadas.</p>
        <a href="../user/pages/direcciones.html" class="seccion__ver-todo" style="font-size:0.85rem;">+ Agregar dirección</a>
      `;
      return;
    }

    contenedorDirecciones.innerHTML = direcciones.map(d => `
      <div class="checkout-direccion-card ${Number(d.predeterminada) === 1 ? 'checkout-direccion-card--seleccionada' : ''}" data-id="${d.id}">
        <div class="checkout-direccion-card__radio">
          <input type="radio" name="direccionCheckout" ${Number(d.predeterminada) === 1 ? 'checked' : ''}>
          📍 ${d.etiqueta}
        </div>
        <div style="font-size:0.85rem; color:var(--color-texto-suave);">${d.direccion}, ${d.barrio ? d.barrio + ', ' : ''}${d.ciudad}</div>
        <div style="font-size:0.75rem; color:var(--color-texto-suave);">📞 ${d.telefono_contacto}</div>
      </div>
    `).join('');

    // Seleccionar predeterminada o primera
    const predeterminada = direcciones.find(d => Number(d.predeterminada) === 1) || direcciones[0];
    direccionSeleccionadaId = predeterminada.id;

    // Eventos de selección
    contenedorDirecciones.querySelectorAll('.checkout-direccion-card').forEach(card => {
      card.addEventListener('click', () => {
        direccionSeleccionadaId = Number(card.dataset.id);
        contenedorDirecciones.querySelectorAll('.checkout-direccion-card').forEach(c => {
          c.classList.remove('checkout-direccion-card--seleccionada');
          c.querySelector('input').checked = false;
        });
        card.classList.add('checkout-direccion-card--seleccionada');
        card.querySelector('input').checked = true;
      });
    });
  }

  await cargarDirecciones();

  // ===== 3. Cargar resumen del carrito =====
  const respCarrito = await apiGet('carrito.php');
  const carrito = respCarrito.exito ? respCarrito.datos : [];

  if (carrito.length === 0) {
    document.getElementById('checkoutItems').innerHTML = `
      <p style="color:var(--color-texto-suave); text-align:center; padding:10px 0;">
        Tu carrito está vacío. <a href="catalogo.html">Ir al catálogo</a>
      </p>
    `;
    btnConfirmar.disabled = true;
  } else {
    document.getElementById('checkoutItems').innerHTML = carrito.map(item => `
      <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--color-borde);">
        <span>${item.cantidad}x ${item.nombre}</span>
        <span>${formatearPrecio(item.precio * item.cantidad)}</span>
      </div>
    `).join('');

    // Calcular totales
    const subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    const domicilio = subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_DOMICILIO;
    const total = subtotal + domicilio;

    document.getElementById('checkoutSubtotal').textContent = formatearPrecio(subtotal);
    const domicilioEl = document.getElementById('checkoutDomicilio');
    domicilioEl.textContent = domicilio === 0 ? 'Gratis' : formatearPrecio(domicilio);
    domicilioEl.classList.toggle('checkout-domicilio-gratis', domicilio === 0);
    document.getElementById('checkoutTotal').textContent = formatearPrecio(total);

    // Aviso de envío gratis (opcional)
    const aviso = document.getElementById('checkoutAvisoEnvio');
    const faltante = ENVIO_GRATIS_DESDE - subtotal;
    if (aviso) {
      if (faltante > 0) {
        aviso.style.display = 'block';
        aviso.textContent = `Agrega ${formatearPrecio(faltante)} más para envío gratis 🚚`;
      } else {
        aviso.style.display = 'none';
      }
    }

    btnConfirmar.disabled = false;
  }

  // ===== 4. Confirmar pedido =====
  btnConfirmar.addEventListener('click', async () => {
    mensaje.classList.remove('auth-mensaje-general--visible', 'auth-mensaje-general--exito');
    mensaje.textContent = '';

    if (!direccionSeleccionadaId) {
      mensaje.textContent = 'Selecciona una dirección de entrega.';
      mensaje.classList.add('auth-mensaje-general--visible');
      return;
    }

    // 🔍 Validación extra: verificar que ningún producto supere el stock actual (por si el usuario abrió otra pestaña)
    const respCarritoActual = await apiGet('carrito.php');
    if (!respCarritoActual.exito) {
      mensaje.textContent = 'Error al verificar el carrito. Intenta de nuevo.';
      mensaje.classList.add('auth-mensaje-general--visible');
      return;
    }
    const carritoActual = respCarritoActual.datos;
    for (const item of carritoActual) {
      if (item.cantidad > item.stock) {
        mensaje.textContent = `"${item.nombre}" solo tiene ${item.stock} unidades disponibles. Ajusta la cantidad.`;
        mensaje.classList.add('auth-mensaje-general--visible');
        return;
      }
    }

    btnConfirmar.disabled = true;
    btnConfirmar.textContent = 'Procesando...';

    try {
      const respuesta = await apiPost('pedidos.php', { direccion_id: direccionSeleccionadaId });

      if (!respuesta.exito) {
        mensaje.textContent = respuesta.mensaje || 'No se pudo procesar el pedido.';
        mensaje.classList.add('auth-mensaje-general--visible');
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = 'Confirmar pedido';
        return;
      }

      mensaje.textContent = '¡Pedido confirmado con éxito! Redirigiendo...';
      mensaje.classList.add('auth-mensaje-general--visible', 'auth-mensaje-general--exito');

      // Actualizar contador del carrito (debe quedar en 0)
      await actualizarContadorCarrito();

      setTimeout(() => {
        window.location.href = '../user/pages/pedidos.html';
      }, 1500);

    } catch (error) {
      console.error('Error al confirmar pedido:', error);
      mensaje.textContent = 'Ocurrió un error inesperado. Intenta de nuevo.';
      mensaje.classList.add('auth-mensaje-general--visible');
      btnConfirmar.disabled = false;
      btnConfirmar.textContent = 'Confirmar pedido';
    }
  });
});