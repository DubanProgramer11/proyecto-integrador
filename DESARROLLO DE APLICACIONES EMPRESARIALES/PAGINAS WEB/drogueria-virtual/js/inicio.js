// ============================================================
// ARCHIVO: js/inicio.js
// Carrusel de propagandas, carrusel de productos y modal de
// detalle. Solo se activa en el index: cada función revisa
// que su contenedor exista antes de hacer nada.
// ============================================================

/* ===== CARRUSEL DE PROPAGANDAS ===== */
function iniciarCarruselPromos() {
  const pista = document.getElementById('promoPista');
  if (!pista) return;

  const slides = pista.children.length;
  const puntos = document.getElementById('promoPuntos');
  let actual = 0;
  let temporizador;

  // Los puntos se generan según cuántas propagandas haya:
  // si agregas una quinta, aparece sola.
  puntos.innerHTML = Array.from({ length: slides }, (_, i) =>
    `<button class="promo-punto${i === 0 ? ' promo-punto--activo' : ''}" data-i="${i}" aria-label="Ir a la promoción ${i + 1}"></button>`
  ).join('');

  function mostrar(indice) {
    actual = (indice + slides) % slides;
    pista.style.transform = `translateX(-${actual * 100}%)`;
    puntos.querySelectorAll('.promo-punto').forEach((p, i) => {
      p.classList.toggle('promo-punto--activo', i === actual);
    });
  }

  function reiniciarAuto() {
    clearInterval(temporizador);
    temporizador = setInterval(() => mostrar(actual + 1), 5000);
  }

  document.getElementById('promoAnterior').addEventListener('click', () => { mostrar(actual - 1); reiniciarAuto(); });
  document.getElementById('promoSiguiente').addEventListener('click', () => { mostrar(actual + 1); reiniciarAuto(); });

  puntos.addEventListener('click', (e) => {
    const btn = e.target.closest('.promo-punto');
    if (!btn) return;
    mostrar(Number(btn.dataset.i));
    reiniciarAuto();
  });

  // Se detiene al pasar el mouse: molesta que cambie mientras lees
  const carrusel = document.getElementById('promoCarrusel');
  carrusel.addEventListener('mouseenter', () => clearInterval(temporizador));
  carrusel.addEventListener('mouseleave', reiniciarAuto);

  reiniciarAuto();
}

/* ===== FLECHAS DEL CARRUSEL DE PRODUCTOS ===== */
function iniciarCarruselProductos() {
  const pista = document.getElementById('productosDestacados');
  if (!pista) return;

  const izq = document.getElementById('prodAnterior');
  const der = document.getElementById('prodSiguiente');
  if (!izq || !der) return;

  // Una tarjeta (262px) más el gap
  const salto = 286;

  izq.addEventListener('click', () => pista.scrollBy({ left: -salto * 2, behavior: 'smooth' }));
  der.addEventListener('click', () => pista.scrollBy({ left: salto * 2, behavior: 'smooth' }));

  // Las flechas se ocultan cuando ya no hay a dónde ir
  function actualizarFlechas() {
    const fin = pista.scrollWidth - pista.clientWidth - 4;
    izq.style.opacity = pista.scrollLeft <= 4 ? '0.35' : '1';
    der.style.opacity = pista.scrollLeft >= fin ? '0.35' : '1';
  }

  pista.addEventListener('scroll', actualizarFlechas);
  setTimeout(actualizarFlechas, 400);
}

/* ===== MODAL DE DETALLE DE PRODUCTO ===== */
function abrirDetalleProducto(producto) {
  const fondo = document.getElementById('pmodalFondo');
  const cuerpo = document.getElementById('pmodalCuerpo');
  if (!fondo || !cuerpo) return;

  const disponible = Number(producto.disponible) === 1;

  const media = producto.imagen_url
    ? `<img src="/drogueria-virtual/images/${producto.imagen_url}" alt="${producto.nombre}">`
    : `<i class="bi bi-capsule"></i>`;

  const precioAnterior = producto.precio_anterior
    ? `<span class="pmodal__precio-anterior">${formatearPrecio(producto.precio_anterior)}</span>`
    : '';

  const descripcion = producto.descripcion && producto.descripcion.trim() !== ''
    ? producto.descripcion
    : 'Este producto aún no tiene una descripción detallada. Consulta con nuestro asistente virtual si necesitas más información.';

  cuerpo.innerHTML = `
    <div class="pmodal__media">${media}</div>
    <div>
      <div class="pmodal__categoria">${producto.categoria_nombre || 'Sin categoría'}</div>
      <h2 class="pmodal__nombre">${producto.nombre}</h2>

      <div class="pmodal__rating">
        <i class="bi bi-star-fill"></i> ${producto.rating_promedio || 0}
        <span>·</span>
        <span>${disponible ? 'Disponible' : 'Agotado'}</span>
      </div>

      <div class="pmodal__precios">
        <span class="pmodal__precio">${formatearPrecio(producto.precio)}</span>
        ${precioAnterior}
      </div>

      <p class="pmodal__descripcion">${descripcion}</p>

      <div class="pmodal__datos">
        <div class="pmodal__dato"><i class="bi bi-box-seam"></i> ${producto.stock ?? 0} unidades en inventario</div>
        <div class="pmodal__dato"><i class="bi bi-truck"></i> Envío gratis en compras superiores a $80.000</div>
        ${Number(producto.requiere_orden_medica) === 1
          ? `<div class="pmodal__dato"><i class="bi bi-clipboard2-pulse"></i> Requiere orden médica</div>`
          : `<div class="pmodal__dato"><i class="bi bi-patch-check"></i> Venta libre, sin orden médica</div>`}
      </div>

      <div class="pmodal__acciones">
        ${disponible
          ? `<button class="btn btn-primario" id="pmodalAgregar">Agregar al carrito</button>`
          : `<button class="btn btn-secundario" disabled>No disponible</button>`}
        <a href="pages/catalogo.html" class="btn btn-secundario">Ver catálogo</a>
      </div>
    </div>`;

  const btnAgregar = document.getElementById('pmodalAgregar');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', () => {
      agregarAlCarrito(producto);
      cerrarDetalleProducto();
    });
  }

  fondo.classList.add('pmodal-fondo--visible');
  document.body.style.overflow = 'hidden';
}

function cerrarDetalleProducto() {
  const fondo = document.getElementById('pmodalFondo');
  if (!fondo) return;
  fondo.classList.remove('pmodal-fondo--visible');
  document.body.style.overflow = '';
}

/* ===== ARRANQUE ===== */
document.addEventListener('DOMContentLoaded', () => {
  iniciarCarruselPromos();

  const fondo = document.getElementById('pmodalFondo');
  if (fondo) {
    document.getElementById('pmodalCerrar').addEventListener('click', cerrarDetalleProducto);
    fondo.addEventListener('click', (e) => {
      if (e.target === fondo) cerrarDetalleProducto();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cerrarDetalleProducto();
    });
  }

  // Las tarjetas las pinta productos.js de forma asíncrona,
  // así que esperamos un poco antes de conectar las flechas.
  setTimeout(iniciarCarruselProductos, 700);
});