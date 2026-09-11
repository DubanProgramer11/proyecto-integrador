// admin/js/productos-admin.js
// CRUD de productos usando la API real

// ============================================================
// Iconos por categoría.
// El emoji sigue guardado en la columna `icono` de la tabla
// productos, pero ya no se muestra en el listado: pintamos el
// icono de la categoría para que combine con las tarjetas del
// inicio. El emoji se conserva por si el catálogo lo usa.
// ============================================================

const ICONOS_CATEGORIA = {
  'medicamentos':      { icono: 'bi-capsule-pill', clase: 'cat-medicamentos' },
  'cuidado personal':  { icono: 'bi-heart-pulse',  clase: 'cat-cuidado-personal' },
  'vitaminas':         { icono: 'bi-capsule',      clase: 'cat-vitaminas' },
  'higiene':           { icono: 'bi-droplet',      clase: 'cat-higiene' },
  'bebes':             { icono: 'bi-emoji-smile',  clase: 'cat-bebes' },
  'primeros auxilios': { icono: 'bi-bandaid',      clase: 'cat-primeros-auxilios' }
};

/** Quita tildes y pasa a minúsculas: "Bebés", "bebes" y "BEBÉS" caen en la misma clave. */
function normalizarTexto(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function iconoDeCategoria(nombreCategoria) {
  return ICONOS_CATEGORIA[normalizarTexto(nombreCategoria)]
      || { icono: 'bi-box-seam', clase: 'cat-otra' };
}

function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Esperar a que admin.js verifique la sesión
  await sesionAdminLista;

  const tablaBody = document.getElementById('productosAdminTabla');
  if (!tablaBody) return;

  const buscador = document.getElementById('productosAdminBuscador');
  const btnNuevo = document.getElementById('btnNuevoProducto');
  const modalFondo = document.getElementById('modalProducto');
  const modalTitulo = document.getElementById('modalProductoTitulo');
  const form = document.getElementById('formProducto');
  const btnCerrarModal = document.getElementById('cerrarModalProducto');
  const btnCancelarModal = document.getElementById('cancelarModalProducto');

  const campos = {
    id: document.getElementById('productoId'),
    nombre: document.getElementById('productoNombre'),
    categoria: document.getElementById('productoCategoria'),
    descripcion: document.getElementById('productoDescripcion'),
    precio: document.getElementById('productoPrecio'),
    precioAnterior: document.getElementById('productoPrecioAnterior'),
    stock: document.getElementById('productoStock'),
    icono: document.getElementById('productoIcono'),
    disponible: document.getElementById('productoDisponible'),
    requiereOrden: document.getElementById('productoRequiereOrden'),
    imagen: document.getElementById('productoImagen'),
    badge: document.getElementById('productoBadge')
  };

  // Cargar categorías desde la BD
  let categorias = [];
  async function cargarCategorias() {
    const resp = await apiGet('categorias.php');
    if (resp.exito) {
      categorias = resp.datos;
      const select = campos.categoria;
      select.innerHTML = categorias.map(c =>
        `<option value="${c.id}">${escaparHtml(c.nombre)}</option>`
      ).join('');
    } else {
      console.error('Error al cargar categorías:', resp.mensaje);
    }
  }

  let terminoBusqueda = '';

  function renderizarTabla(productos) {
    if (!productos || productos.length === 0) {
      tablaBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--color-texto-suave); padding: var(--espacio-lg);">No se encontraron productos.</td></tr>`;
      return;
    }

    tablaBody.innerHTML = productos.map(p => {
      const ic = iconoDeCategoria(p.categoria_nombre);
      return `
      <tr>
        <td>
          <div class="admin-tabla__producto">
            <div class="admin-tabla__producto-icono ${ic.clase}"><i class="bi ${ic.icono}"></i></div>
            <div>
              <div style="font-weight:600;">${escaparHtml(p.nombre)}</div>
              <div style="font-size:0.75rem; color:var(--color-texto-suave);">ID: ${p.id}</div>
            </div>
          </div>
        </td>
        <td>${escaparHtml(p.categoria_nombre || p.categoria_id)}</td>
        <td>$${Number(p.precio).toLocaleString('es-CO')}</td>
        <td>${p.stock ?? 0}</td>
        <td>
          <span class="badge-estado ${p.disponible == 1 ? 'badge-estado--exito' : 'badge-estado--error'}">
            ${p.disponible == 1 ? 'Disponible' : 'Agotado'}
          </span>
        </td>
        <td><span class="admin-estrellas"><i class="bi bi-star-fill"></i></span> ${p.rating_promedio || 0}</td>
        <td>
          <div class="admin-tabla__acciones">
            <button class="admin-btn-icono editar-producto" data-id="${p.id}" title="Editar"><i class="bi bi-pencil"></i></button>
            <button class="admin-btn-icono admin-btn-icono--eliminar eliminar-producto" data-id="${p.id}" title="Eliminar"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');

    tablaBody.querySelectorAll('.editar-producto').forEach(btn => {
      btn.addEventListener('click', () => abrirModalEdicion(Number(btn.dataset.id)));
    });
    tablaBody.querySelectorAll('.eliminar-producto').forEach(btn => {
      btn.addEventListener('click', () => eliminarProducto(Number(btn.dataset.id)));
    });
  }

  async function cargarProductos() {
    const url = terminoBusqueda ? `productos.php?buscar=${encodeURIComponent(terminoBusqueda)}` : 'productos.php';
    const resp = await apiGet(url);
    if (resp.exito) {
      renderizarTabla(resp.datos);
    } else {
      alert('Error al cargar productos: ' + resp.mensaje);
    }
  }

  function abrirModalNuevo() {
    form.reset();
    campos.id.value = '';
    campos.disponible.checked = true;
    campos.requiereOrden.checked = false;
    modalTitulo.textContent = 'Nuevo producto';
    modalFondo.classList.add('admin-modal-fondo--visible');
  }

  async function abrirModalEdicion(id) {
    const resp = await apiGet(`productos.php?id=${id}`);
    if (!resp.exito) {
      alert('Error al obtener el producto: ' + resp.mensaje);
      return;
    }
    const p = resp.datos;
    campos.id.value = p.id;
    campos.nombre.value = p.nombre;
    campos.categoria.value = p.categoria_id;
    campos.descripcion.value = p.descripcion || '';
    campos.precio.value = p.precio;
    campos.precioAnterior.value = p.precio_anterior || '';
    campos.stock.value = p.stock ?? 0;
    // Este campo sigue siendo el emoji guardado en la base de datos.
    campos.icono.value = p.icono || '📦';
    campos.disponible.checked = p.disponible == 1;
    campos.requiereOrden.checked = p.requiere_orden_medica == 1;
    campos.imagen.value = p.imagen_url || '';
    campos.badge.value = p.badge || '';
    modalTitulo.textContent = 'Editar producto';
    modalFondo.classList.add('admin-modal-fondo--visible');
  }

  function cerrarModal() {
    modalFondo.classList.remove('admin-modal-fondo--visible');
  }

  async function eliminarProducto(id) {
    if (!confirm('¿Eliminar este producto del catálogo?')) return;
    const resp = await apiDelete(`productos.php?id=${id}`);
    if (resp.exito) {
      cargarProductos();
    } else {
      alert('Error al eliminar: ' + resp.mensaje);
    }
  }

  // Envío del formulario (crear o editar)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = {
      nombre: campos.nombre.value.trim(),
      categoria_id: parseInt(campos.categoria.value),
      descripcion: campos.descripcion.value.trim(),
      precio: parseFloat(campos.precio.value),
      precio_anterior: campos.precioAnterior.value ? parseFloat(campos.precioAnterior.value) : null,
      stock: parseInt(campos.stock.value) || 0,
      icono: campos.icono.value.trim() || '📦',
      disponible: campos.disponible.checked ? 1 : 0,
      requiere_orden_medica: campos.requiereOrden.checked ? 1 : 0,
      imagen_url: campos.imagen.value.trim(),
      badge: campos.badge.value.trim()
    };

    let resp;
    if (campos.id.value) {
      resp = await apiPut(`productos.php?id=${campos.id.value}`, datos);
    } else {
      resp = await apiPost('productos.php', datos);
    }

    if (resp.exito) {
      cerrarModal();
      cargarProductos();
    } else {
      alert('Error al guardar: ' + (resp.mensaje || 'Error desconocido'));
      if (resp.errores) {
        console.error('Detalles:', resp.errores);
      }
    }
  });

  // Eventos UI
  buscador.addEventListener('input', (e) => {
    terminoBusqueda = e.target.value;
    cargarProductos();
  });

  btnNuevo.addEventListener('click', abrirModalNuevo);
  btnCerrarModal.addEventListener('click', cerrarModal);
  btnCancelarModal.addEventListener('click', cerrarModal);
  modalFondo.addEventListener('click', (e) => {
    if (e.target === modalFondo) cerrarModal();
  });

  // Inicializar
  await cargarCategorias();
  await cargarProductos();
});