document.addEventListener('DOMContentLoaded', async () => {
  const zonaSubida = document.getElementById('zonaSubida');
  const inputArchivo = document.getElementById('inputArchivo');
  const previewImagen = document.getElementById('previewImagen');
  const btnAnalizar = document.getElementById('btnAnalizar');
  const mensaje = document.getElementById('ordenMensaje');
  const resultado = document.getElementById('resultadoAnalisis');
  const textoExtraidoEl = document.getElementById('textoExtraido');
  const coincidenciasLista = document.getElementById('coincidenciasLista');
  const btnAgregar = document.getElementById('btnAgregarSeleccionados');

  if (!zonaSubida) return;

  const sesion = await haySesionCliente();
  if (!sesion) {
    window.location.href = '../login.html';
    return;
  }

  let ordenIdActual = null;
  let archivoSeleccionado = null;

  zonaSubida.addEventListener('click', () => inputArchivo.click());

  inputArchivo.addEventListener('change', () => {
    const archivo = inputArchivo.files[0];
    if (!archivo) return;

    archivoSeleccionado = archivo;
    mensaje.classList.remove('auth-mensaje-general--visible');
    resultado.style.display = 'none';

    if (archivo.type.startsWith('image/')) {
      const lector = new FileReader();
      lector.onload = (e) => {
        previewImagen.src = e.target.result;
        previewImagen.style.display = 'block';
      };
      lector.readAsDataURL(archivo);
    } else {
      previewImagen.style.display = 'none';
    }

    zonaSubida.classList.add('orden-medica-upload--activo');
    btnAnalizar.style.display = 'block';
  });

  btnAnalizar.addEventListener('click', async () => {
    if (!archivoSeleccionado) return;

    btnAnalizar.disabled = true;
    btnAnalizar.textContent = 'Analizando tu orden médica...';
    mensaje.classList.remove('auth-mensaje-general--visible');

    const formData = new FormData();
    formData.append('archivo', archivoSeleccionado);

    try {
      const respuesta = await fetch(`${API_BASE_URL}/ordenes-medicas.php`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const data = await respuesta.json();

      btnAnalizar.disabled = false;
      btnAnalizar.textContent = 'Analizar orden médica';

      if (!data.exito) {
        mensaje.textContent = data.mensaje || 'No se pudo procesar la orden.';
        mensaje.classList.add('auth-mensaje-general--visible');
        return;
      }

      ordenIdActual = data.datos.orden_id;
      mostrarResultado(data.datos);

    } catch (error) {
      btnAnalizar.disabled = false;
      btnAnalizar.textContent = 'Analizar orden médica';
      mensaje.textContent = 'Ocurrió un error al conectar con el servidor.';
      mensaje.classList.add('auth-mensaje-general--visible');
    }
  });

  function mostrarResultado(datos) {
    resultado.style.display = 'block';

    textoExtraidoEl.textContent = datos.texto_extraido
      ? datos.texto_extraido
      : 'No pudimos leer texto automáticamente en esta imagen. Puedes buscar tus productos manualmente en el catálogo.';

    if (datos.coincidencias.length === 0) {
      coincidenciasLista.innerHTML = `<p style="color:var(--color-texto-suave); font-size:0.9rem;">No encontramos coincidencias automáticas. Puedes buscar y agregar tus productos manualmente desde el <a href="catalogo.html" style="color:var(--color-primario); font-weight:600;">catálogo</a>.</p>`;
      btnAgregar.style.display = 'none';
      return;
    }

    btnAgregar.style.display = 'block';
    coincidenciasLista.innerHTML = datos.coincidencias.map(p => `
      <label class="orden-medica-coincidencia">
        <input type="checkbox" value="${p.id}" checked>
        <div class="orden-medica-coincidencia__icono">${p.icono}</div>
        <div style="flex:1;">
          <div style="font-weight:600; font-size:0.9rem;">${p.nombre}</div>
          <div style="font-size:0.85rem; color:var(--color-texto-suave);">${formatearPrecio(p.precio)}</div>
        </div>
      </label>
    `).join('');
  }

  btnAgregar.addEventListener('click', async () => {
    const seleccionados = Array.from(coincidenciasLista.querySelectorAll('input:checked')).map(cb => Number(cb.value));

    if (seleccionados.length === 0) {
      mensaje.textContent = 'Selecciona al menos un producto.';
      mensaje.classList.add('auth-mensaje-general--visible');
      return;
    }

    btnAgregar.disabled = true;
    btnAgregar.textContent = 'Agregando...';

    const respuesta = await apiPost(`ordenes-medicas.php?accion=confirmar`, {
      orden_id: ordenIdActual,
      producto_ids: seleccionados
    });

    btnAgregar.disabled = false;
    btnAgregar.textContent = 'Agregar seleccionados al carrito';

    if (!respuesta.exito) {
      mensaje.textContent = respuesta.mensaje || 'No se pudieron agregar los productos.';
      mensaje.classList.add('auth-mensaje-general--visible');
      return;
    }

    mensaje.textContent = '¡Productos agregados a tu carrito! Redirigiendo...';
    mensaje.classList.add('auth-mensaje-general--visible', 'auth-mensaje-general--exito');
    actualizarContadorCarrito();

    setTimeout(() => {
      window.location.href = 'carrito.html';
    }, 1200);
  });
});