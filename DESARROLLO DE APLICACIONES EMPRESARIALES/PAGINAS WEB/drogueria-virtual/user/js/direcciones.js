document.addEventListener('DOMContentLoaded', async () => {
  const listaEl = document.getElementById('direccionesLista');
  if (!listaEl) return;

  const sesion = await protegerPaginaUsuario();
  if (!sesion) return;

  const form = document.getElementById('formDireccion');
  const idEditando = document.getElementById('direccionId');
  const tituloForm = document.getElementById('direccionFormTitulo');
  const btnCancelar = document.getElementById('direccionCancelarEdicion');

  const campos = {
    etiqueta: document.getElementById('direccionEtiqueta'),
    direccion: document.getElementById('direccionTexto'),
    ciudad: document.getElementById('direccionCiudad'),
    barrio: document.getElementById('direccionBarrio'),
    referencia: document.getElementById('direccionReferencia'),
    telefono: document.getElementById('direccionTelefono'),
    predeterminada: document.getElementById('direccionPredeterminada')
  };

  let direcciones = [];

  async function cargarDirecciones() {
    listaEl.innerHTML = `<p style="color:var(--color-texto-suave);">${t('cargando_direcciones')}</p>`;
    const respuesta = await apiGet('direcciones.php');

    if (!respuesta.exito) {
      listaEl.innerHTML = `<p style="color:var(--color-error);">${t('err_cargar_direcciones')}</p>`;
      return;
    }

    direcciones = respuesta.datos;
    pintarDirecciones();
  }

  function pintarDirecciones() {
    if (direcciones.length === 0) {
      listaEl.innerHTML = `<div class="direcciones-vacio">${t('dir_sin_direcciones')}</div>`;
      return;
    }

    listaEl.innerHTML = direcciones.map(d => `
      <div class="direccion-card ${Number(d.predeterminada) === 1 ? 'direccion-card--predeterminada' : ''}">
        ${Number(d.predeterminada) === 1 ? `<span class="direccion-card__badge">${t('dir_badge_pred')}</span>` : ''}
        <div class="direccion-card__etiqueta">📍 ${d.etiqueta}</div>
        <div class="direccion-card__texto">${d.direccion}</div>
        <div class="direccion-card__texto">${d.barrio ? d.barrio + ', ' : ''}${d.ciudad}</div>
        ${d.referencia ? `<div class="direccion-card__texto">${t('dir_ref_label')} ${d.referencia}</div>` : ''}
        <div class="direccion-card__texto">${t('dir_tel_label')} ${d.telefono_contacto}</div>
        <div class="direccion-card__acciones">
          <button class="editar" data-id="${d.id}">${t('dir_btn_editar')}</button>
          ${Number(d.predeterminada) !== 1 ? `<button class="predeterminar" data-id="${d.id}">${t('dir_btn_pred')}</button>` : ''}
          <button class="eliminar" data-id="${d.id}">${t('dir_btn_eliminar')}</button>
        </div>
      </div>
    `).join('');

    listaEl.querySelectorAll('.editar').forEach(btn => {
      btn.addEventListener('click', () => cargarDireccionEnFormulario(Number(btn.dataset.id)));
    });
    listaEl.querySelectorAll('.eliminar').forEach(btn => {
      btn.addEventListener('click', () => eliminarDireccion(Number(btn.dataset.id)));
    });
    listaEl.querySelectorAll('.predeterminar').forEach(btn => {
      btn.addEventListener('click', () => marcarPredeterminada(Number(btn.dataset.id)));
    });
  }

  function cargarDireccionEnFormulario(id) {
    const direccion = direcciones.find(d => d.id === id);
    if (!direccion) return;

    idEditando.value = direccion.id;
    campos.etiqueta.value = direccion.etiqueta;
    campos.direccion.value = direccion.direccion;
    campos.ciudad.value = direccion.ciudad;
    campos.barrio.value = direccion.barrio;
    campos.referencia.value = direccion.referencia;
    campos.telefono.value = direccion.telefono_contacto;
    campos.predeterminada.checked = Number(direccion.predeterminada) === 1;

    tituloForm.textContent = t('dir_editar_titulo');
    btnCancelar.style.display = 'inline-block';
    form.scrollIntoView({ behavior: 'smooth' });
  }

  async function eliminarDireccion(id) {
    if (!confirm(t('dir_confirmar_eliminar'))) return;
    await apiDelete(`direcciones.php?id=${id}`);
    cargarDirecciones();
  }

  async function marcarPredeterminada(id) {
    const direccion = direcciones.find(d => d.id === id);
    if (!direccion) return;

    await apiPut(`direcciones.php?id=${id}`, {
      etiqueta: direccion.etiqueta,
      direccion: direccion.direccion,
      ciudad: direccion.ciudad,
      barrio: direccion.barrio,
      referencia: direccion.referencia,
      telefono: direccion.telefono_contacto,
      predeterminada: true
    });
    cargarDirecciones();
  }

  function limpiarFormulario() {
    form.reset();
    idEditando.value = '';
    tituloForm.textContent = t('dir_form_titulo');
    btnCancelar.style.display = 'none';
  }

  btnCancelar.addEventListener('click', limpiarFormulario);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!campos.direccion.value.trim() || !campos.ciudad.value.trim() || !campos.telefono.value.trim()) {
      alert(t('dir_campos_minimos'));
      return;
    }

    const payload = {
      etiqueta: campos.etiqueta.value,
      direccion: campos.direccion.value.trim(),
      ciudad: campos.ciudad.value.trim(),
      barrio: campos.barrio.value.trim(),
      referencia: campos.referencia.value.trim(),
      telefono: campos.telefono.value.trim(),
      predeterminada: campos.predeterminada.checked
    };

    if (idEditando.value) {
      await apiPut(`direcciones.php?id=${idEditando.value}`, payload);
    } else {
      await apiPost('direcciones.php', payload);
    }

    limpiarFormulario();
    cargarDirecciones();
  });

  document.addEventListener('idiomaCambiado', () => {
    pintarDirecciones();
    // El título del formulario también depende del modo (crear vs editar)
    tituloForm.textContent = idEditando.value ? t('dir_editar_titulo') : t('dir_form_titulo');
  });

  cargarDirecciones();
});