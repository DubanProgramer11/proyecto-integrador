document.addEventListener('DOMContentLoaded', async () => {
  const contenedor = document.getElementById('calificarContenido');
  if (!contenedor) return;

  const sesion = await protegerPaginaUsuario();
  if (!sesion) return;

  let puntuacionSeleccionada = 0;
  let clasificacionSeleccionada = '';
  let tipoComentarioSeleccionado = 'comentario';
  let pedidos = [];

  /* ===== Tabs ===== */
  document.querySelectorAll('.tab-switcher__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-switcher__btn').forEach(b => b.classList.remove('tab-switcher__btn--activo'));
      btn.classList.add('tab-switcher__btn--activo');
      document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
      document.getElementById(btn.dataset.tab).style.display = 'block';
    });
  });

  /* ===== Pedidos pendientes por calificar ===== */
  const selectPedido = document.getElementById('calificarPedido');
  const respPedidos = await apiGet('calificaciones.php?pendientes=1');
  pedidos = respPedidos.exito ? respPedidos.datos : [];

  function pintarSelectPedidos() {
    const seleccionado = selectPedido.value;

    if (pedidos.length === 0) {
      selectPedido.innerHTML = `<option value="">${t('cal_sin_pendientes')}</option>`;
      document.getElementById('formCalificacion').querySelector('button[type="submit"]').disabled = true;
      return;
    }

    selectPedido.innerHTML = `<option value="">${t('cal_selecciona')}</option>` +
      pedidos.map(p => `<option value="${p.id}">${t('pedido_num')} #${p.id} — ${fmtPrecio(p.total)}</option>`).join('');

    // No perder la selección del usuario al cambiar de idioma
    if (seleccionado) selectPedido.value = seleccionado;
  }

  pintarSelectPedidos();
  document.addEventListener('idiomaCambiado', pintarSelectPedidos);

  /* ===== Mensajes ===== */
  function mostrarMensaje(el, texto, esError) {
    el.className = 'user-form__mensaje user-form__mensaje--visible';
    el.style.background = esError ? '#FEE2E2' : '#DCFCE7';
    el.style.color = esError ? 'var(--color-error)' : 'var(--color-exito)';
    el.textContent = texto;
  }

  /* ===== Selector de estrellas ===== */
  const estrellasContenedor = document.getElementById('estrellasSelector');
  estrellasContenedor.querySelectorAll('.estrella-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      puntuacionSeleccionada = Number(btn.dataset.valor);
      estrellasContenedor.querySelectorAll('.estrella-btn').forEach(b => {
        b.classList.toggle('estrella-btn--activa', Number(b.dataset.valor) <= puntuacionSeleccionada);
      });
    });
  });

  /* ===== Selector de clasificación =====
     Se guarda el data-valor en español, NO el texto visible:
     así la base de datos queda consistente aunque el usuario esté en inglés. */
  document.querySelectorAll('.clasificacion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      clasificacionSeleccionada = chip.dataset.valor;
      document.querySelectorAll('.clasificacion-chip').forEach(c => c.classList.remove('clasificacion-chip--activa'));
      chip.classList.add('clasificacion-chip--activa');
    });
  });

  /* ===== Envío de la calificación ===== */
  document.getElementById('formCalificacion').addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensaje = document.getElementById('calificacionMensaje');
    const pedidoId = selectPedido.value;
    const comentario = document.getElementById('calificacionComentario').value.trim();

    if (!pedidoId) {
      mostrarMensaje(mensaje, t('cal_err_pedido'), true);
      return;
    }
    if (puntuacionSeleccionada === 0) {
      mostrarMensaje(mensaje, t('cal_err_estrellas'), true);
      return;
    }
    if (!clasificacionSeleccionada) {
      mostrarMensaje(mensaje, t('cal_err_clasificacion'), true);
      return;
    }

    const respuesta = await apiPost('calificaciones.php', {
      pedido_id: Number(pedidoId),
      puntuacion: puntuacionSeleccionada,
      clasificacion: clasificacionSeleccionada,
      comentario: comentario
    });

    if (!respuesta.exito) {
      mostrarMensaje(mensaje, respuesta.mensaje, true);
      return;
    }

    mostrarMensaje(mensaje, t('cal_gracias'), false);
    document.getElementById('formCalificacion').reset();
    pintarSelectPedidos();
    estrellasContenedor.querySelectorAll('.estrella-btn').forEach(b => b.classList.remove('estrella-btn--activa'));
    document.querySelectorAll('.clasificacion-chip').forEach(c => c.classList.remove('clasificacion-chip--activa'));
    puntuacionSeleccionada = 0;
    clasificacionSeleccionada = '';
  });

  /* ===== Tipo de comentario ===== */
  document.querySelectorAll('.tipo-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      tipoComentarioSeleccionado = chip.dataset.valor;
      document.querySelectorAll('.tipo-chip').forEach(c => c.classList.remove('tipo-chip--activa'));
      chip.classList.add('tipo-chip--activa');
    });
  });
  document.querySelector('.tipo-chip[data-valor="comentario"]').classList.add('tipo-chip--activa');

  /* ===== Envío del comentario ===== */
  document.getElementById('formComentario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensaje = document.getElementById('comentarioMensaje');
    const contenido = document.getElementById('comentarioTexto').value.trim();

    if (contenido.length < 5) {
      mostrarMensaje(mensaje, t('cal_min5'), true);
      return;
    }

    const respuesta = await apiPost('comentarios.php', {
      tipo: tipoComentarioSeleccionado,
      contenido: contenido
    });

    if (!respuesta.exito) {
      mostrarMensaje(mensaje, respuesta.mensaje, true);
      return;
    }

    mostrarMensaje(mensaje, t('cal_gracias_mensaje'), false);
    document.getElementById('comentarioTexto').value = '';
  });
});