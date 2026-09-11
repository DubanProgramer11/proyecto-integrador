// Los productos ahora vienen del backend/MySQL (antes eran un arreglo fijo).
let CATALOGO_PRODUCTOS = [];

function formatearPrecio(valor) {
  return Number(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
}

function crearTarjetaProducto(producto) {
  const badgeHTML = producto.badge
    ? `<span class="producto-card__badge ${producto.badge === 'Descuento' ? 'producto-card__badge--descuento' : ''}">${producto.badge}</span>`
    : '';

  const precioAnteriorHTML = producto.precio_anterior
    ? `<span class="producto-card__precio-anterior">${formatearPrecio(producto.precio_anterior)}</span>`
    : '';

  const disponible = Number(producto.disponible) === 1;

  const disponibilidadHTML = disponible
    ? `<span class="producto-card__disponibilidad">Disponible</span>`
    : `<span class="producto-card__disponibilidad producto-card__disponibilidad--agotado">Agotado</span>`;

  const botonHTML = disponible
    ? `<button class="btn btn-primario">Agregar</button>`
    : `<button class="btn btn-secundario" disabled>No disponible</button>`;

  // IMAGEN: si tiene imagen_url, la usamos; si no, mostramos el icono
  const imagenHTML = producto.imagen_url
    ? `<img src="/drogueria-virtual/images/${producto.imagen_url}" alt="${producto.nombre}" class="producto-card__img">`
    : `<div class="producto-card__imagen">${producto.icono || '📦'}</div>`;

  return `
    <div class="producto-card tarjeta">
      ${badgeHTML}
      <span class="producto-card__fav"><i class="bi bi-heart"></i></span>
      ${imagenHTML}
      <div class="producto-card__info">
        <span class="producto-card__categoria">${producto.categoria_nombre || 'Sin categoría'}</span>
        <h3 class="producto-card__nombre">${producto.nombre}</h3>
        <div class="producto-card__rating">
          <span class="estrellas">★★★★★</span> ${producto.rating_promedio || 0}
        </div>
        <div class="producto-card__precios">
          <span class="producto-card__precio">${formatearPrecio(producto.precio)}</span>
          ${precioAnteriorHTML}
        </div>
        ${disponibilidadHTML}
        <div class="producto-card__acciones">
          ${botonHTML}
          <button class="btn btn-secundario btn-ver-producto">Ver</button>
        </div>
      </div>
    </div>
  `;
}

/* ===== Página principal: productos destacados ===== */
async function renderizarProductosDestacados() {
  const contenedor = document.getElementById('productosDestacados');
  if (!contenedor) return;

  contenedor.innerHTML = `<p style="text-align:center; color:var(--color-texto-suave); padding:var(--espacio-xl);">Cargando productos...</p>`;

  const respuesta = await apiGet('productos.php');
  if (!respuesta.exito) {
    contenedor.innerHTML = `<p style="text-align:center; color:var(--color-error); padding:var(--espacio-xl);">No se pudieron cargar los productos.</p>`;
    return;
  }

  CATALOGO_PRODUCTOS = respuesta.datos;
  // 10 en vez de 4: el carrusel necesita tarjetas para desplazar
  const destacados = CATALOGO_PRODUCTOS.slice(0, 10);
  contenedor.innerHTML = destacados.map(crearTarjetaProducto).join('');
  activarBotonesAgregar(contenedor, destacados);
}

/* ===== Página de catálogo: filtros, buscador, orden ===== */
const estadoCatalogo = {
  categorias: [],
  precioMax: 60000,
  soloDisponibles: false,
  busqueda: '',
  orden: 'relevancia'
};

function aplicarFiltrosCatalogo() {
  let resultado = [...CATALOGO_PRODUCTOS];

  if (estadoCatalogo.categorias.length > 0) {
    resultado = resultado.filter(p => estadoCatalogo.categorias.includes(p.categoria_nombre));
  }

  resultado = resultado.filter(p => Number(p.precio) <= estadoCatalogo.precioMax);

  if (estadoCatalogo.soloDisponibles) {
    resultado = resultado.filter(p => Number(p.disponible) === 1);
  }

  if (estadoCatalogo.busqueda.trim() !== '') {
    const termino = estadoCatalogo.busqueda.toLowerCase();
    resultado = resultado.filter(p => p.nombre.toLowerCase().includes(termino));
  }

  switch (estadoCatalogo.orden) {
    case 'precio-asc':
      resultado.sort((a, b) => a.precio - b.precio);
      break;
    case 'precio-desc':
      resultado.sort((a, b) => b.precio - a.precio);
      break;
    case 'rating':
      resultado.sort((a, b) => b.rating_promedio - a.rating_promedio);
      break;
    default:
      break;
  }

  return resultado;
}

function renderizarCatalogo() {
  const grid = document.getElementById('catalogoGrid');
  const contador = document.getElementById('catalogoContador');
  if (!grid) return;

  const resultado = aplicarFiltrosCatalogo();

  contador.textContent = `${resultado.length} producto${resultado.length !== 1 ? 's' : ''} encontrado${resultado.length !== 1 ? 's' : ''}`;

  grid.innerHTML = resultado.length > 0
    ? resultado.map(crearTarjetaProducto).join('')
    : `<p class="catalogo-vacio">No encontramos productos con esos filtros. Intenta ajustarlos.</p>`;

  activarBotonesAgregar(grid, resultado);
}

async function inicializarCatalogo() {
  const grid = document.getElementById('catalogoGrid');
  if (!grid) return;

  grid.innerHTML = `<p style="grid-column:1/-1; text-align:center;">Cargando catálogo...</p>`;
  const respuesta = await apiGet('productos.php');
  if (respuesta.exito) {
    CATALOGO_PRODUCTOS = respuesta.datos;
  }

  document.querySelectorAll('.filtro-categoria').forEach(input => {
    input.addEventListener('change', () => {
      estadoCatalogo.categorias = Array.from(document.querySelectorAll('.filtro-categoria:checked')).map(el => el.value);
      renderizarCatalogo();
    });
  });

  const sliderPrecio = document.getElementById('filtroPrecio');
  const etiquetaPrecio = document.getElementById('filtroPrecioValor');
  if (sliderPrecio) {
    sliderPrecio.addEventListener('input', (e) => {
      estadoCatalogo.precioMax = Number(e.target.value);
      etiquetaPrecio.textContent = formatearPrecio(estadoCatalogo.precioMax);
      renderizarCatalogo();
    });
  }

  const soloDisponibles = document.getElementById('filtroDisponibilidad');
  if (soloDisponibles) {
    soloDisponibles.addEventListener('change', (e) => {
      estadoCatalogo.soloDisponibles = e.target.checked;
      renderizarCatalogo();
    });
  }

  const buscador = document.getElementById('catalogoBuscador');
  if (buscador) {
    buscador.addEventListener('input', (e) => {
      estadoCatalogo.busqueda = e.target.value;
      renderizarCatalogo();
    });
  }

  const orden = document.getElementById('catalogoOrden');
  if (orden) {
    orden.addEventListener('change', (e) => {
      estadoCatalogo.orden = e.target.value;
      renderizarCatalogo();
    });
  }

  const btnLimpiar = document.getElementById('catalogoLimpiar');
  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => {
      estadoCatalogo.categorias = [];
      estadoCatalogo.precioMax = 60000;
      estadoCatalogo.soloDisponibles = false;
      estadoCatalogo.busqueda = '';
      estadoCatalogo.orden = 'relevancia';

      document.querySelectorAll('.filtro-categoria').forEach(el => el.checked = false);
      if (sliderPrecio) sliderPrecio.value = 60000;
      if (etiquetaPrecio) etiquetaPrecio.textContent = formatearPrecio(60000);
      if (soloDisponibles) soloDisponibles.checked = false;
      if (buscador) buscador.value = '';
      if (orden) orden.value = 'relevancia';

      renderizarCatalogo();
    });
  }

  // Categoría precargada desde la URL (?categoria=Medicamentos)
  const categoriaUrl = new URLSearchParams(window.location.search).get('categoria');
  if (categoriaUrl) {
    const casilla = document.querySelector(`.filtro-categoria[value="${categoriaUrl}"]`);
    if (casilla) {
      casilla.checked = true;
      estadoCatalogo.categorias = [categoriaUrl];
    }
  }

  renderizarCatalogo();
}

/* ===== Conectar botones "Agregar" y "Ver" ===== */
function activarBotonesAgregar(contenedor, listaProductos) {
  if (!contenedor) return;
  contenedor.querySelectorAll('.producto-card').forEach((card, index) => {
    const btnAgregar = card.querySelector('.producto-card__acciones .btn-primario');
    if (btnAgregar) {
      btnAgregar.addEventListener('click', () => agregarAlCarrito(listaProductos[index]));
    }

    // El botón "Ver" abre el modal de detalle. La función vive en
    // inicio.js; si la página no lo carga, el botón no hace nada.
    const btnVer = card.querySelector('.btn-ver-producto');
    if (btnVer && typeof abrirDetalleProducto === 'function') {
      btnVer.addEventListener('click', () => abrirDetalleProducto(listaProductos[index]));
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarProductosDestacados();
  inicializarCatalogo();
});