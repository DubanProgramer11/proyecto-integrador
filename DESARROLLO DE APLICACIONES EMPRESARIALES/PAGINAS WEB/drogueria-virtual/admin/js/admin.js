// ============================================================
// ARCHIVO: admin/js/admin.js
// Sesión, topbar y MENÚ LATERAL del panel administrativo.
//
// El menú se genera aquí y no en cada HTML. Antes estaba
// duplicado en 9 archivos y ya se había desincronizado.
// ============================================================

const ROLES_ADMIN = ['admin', 'superadmin'];

let sesionAdminActual = null;

/* ---------------------------------------------------
   Ocultamos el panel mientras se verifica la sesión.
--------------------------------------------------- */
(function ocultarMientrasVerifica() {
  const estilo = document.createElement('style');
  estilo.id = 'adminEstiloVerificando';
  estilo.textContent = '.admin-layout { visibility: hidden; }';
  document.head.appendChild(estilo);
})();

function mostrarPanel() {
  const estilo = document.getElementById('adminEstiloVerificando');
  if (estilo) estilo.remove();
}

/* ---------------------------------------------------
   ¿Estamos en admin/index.html o en admin/pages/algo.html?
   De eso depende el prefijo de todas las rutas.
--------------------------------------------------- */
function enSubcarpetaAdmin() {
  return window.location.pathname.includes('/admin/pages/');
}

function rutaLoginAdmin() {
  return enSubcarpetaAdmin() ? '../login.html' : 'login.html';
}

/* ===================================================
   DEFINICIÓN DEL MENÚ
   Para agregar una sección nueva, basta con añadir
   una línea aquí. Se refleja en las nueve páginas.
=================================================== */
const MENU_ADMIN = [
  { seccion: 'General', enlaces: [
    { archivo: 'index.html', icono: 'bi-speedometer2', texto: 'Dashboard', raiz: true }
  ]},
  { seccion: 'Catálogo', enlaces: [
    { archivo: 'productos.html', icono: 'bi-capsule', texto: 'Productos' }
  ]},
  { seccion: 'Ventas', enlaces: [
    { archivo: 'pedidos.html', icono: 'bi-box-seam', texto: 'Pedidos' },
    { archivo: 'clientes.html', icono: 'bi-people', texto: 'Clientes' },
    { archivo: 'ordenes-medicas.html', icono: 'bi-clipboard2-pulse', texto: 'Órdenes médicas' }
  ]},
  { seccion: 'Atención al cliente', enlaces: [
    { archivo: 'conversaciones.html', icono: 'bi-chat-dots', texto: 'Conversaciones' },
    { archivo: 'calificaciones.html', icono: 'bi-star', texto: 'Calificaciones' },
    { archivo: 'comentarios.html', icono: 'bi-chat-square-text', texto: 'Comentarios' }
  ]},
  { seccion: 'Administración', enlaces: [
    { archivo: 'reportes.html', icono: 'bi-graph-up', texto: 'Reportes' },
    { archivo: 'usuarios.html', icono: 'bi-key', texto: 'Usuarios y roles', soloSuperadmin: true },
    { archivo: 'permisos.html', icono: 'bi-shield-lock', texto: 'Permisos', soloSuperadmin: true },
    { archivo: 'configuracion.html', icono: 'bi-gear', texto: 'Configuración', soloSuperadmin: true }
  ]}
];

/* ---------------------------------------------------
   Construye el <aside> completo y lo inserta al inicio
   de .admin-layout.
--------------------------------------------------- */
function construirSidebarAdmin(sesion) {
  const layout = document.querySelector('.admin-layout');
  if (!layout || document.querySelector('.admin-sidebar')) return;

  const subcarpeta = enSubcarpetaAdmin();
  const archivoActual = window.location.pathname.split('/').pop() || 'index.html';
  const esSuperadmin = sesion.rol === 'superadmin';

  // Desde index.html: 'pages/x.html'. Desde pages/: 'x.html'.
  const ruta = (enlace) => {
    if (enlace.raiz) return subcarpeta ? '../index.html' : 'index.html';
    return subcarpeta ? enlace.archivo : 'pages/' + enlace.archivo;
  };

  let html = `
    <a href="${subcarpeta ? '../index.html' : 'index.html'}" class="admin-sidebar__logo">
      <span class="admin-sidebar__logo-marca"><i class="bi bi-plus-lg"></i></span>
      <span>Vital<span>Farma</span></span>
    </a>`;

  MENU_ADMIN.forEach(grupo => {
    // Un admin normal no ve las secciones de superadministrador.
    const visibles = grupo.enlaces.filter(e => esSuperadmin || !e.soloSuperadmin);
    if (visibles.length === 0) return;

    html += `<div class="admin-sidebar__seccion-titulo">${grupo.seccion}</div><nav class="admin-sidebar__nav">`;
    visibles.forEach(e => {
      const activo = e.archivo === archivoActual ? ' admin-sidebar__link--activo' : '';
      html += `<a href="${ruta(e)}" class="admin-sidebar__link${activo}"><i class="bi ${e.icono}"></i> ${e.texto}</a>`;
    });
    html += `</nav>`;
  });

  html += `<button class="admin-sidebar__logout" id="adminLogout"><i class="bi bi-box-arrow-right"></i> Cerrar sesión</button>`;

  const aside = document.createElement('aside');
  aside.className = 'admin-sidebar';
  aside.innerHTML = html;
  layout.insertBefore(aside, layout.firstChild);
}

/* ---------------------------------------------------
   Verificación real contra el servidor
--------------------------------------------------- */
async function verificarSesionAdmin() {
  const respuesta = await apiGet('sesion.php');

  if (!respuesta.exito) {
    window.location.href = rutaLoginAdmin() + '?motivo=sesion';
    return null;
  }

  if (!ROLES_ADMIN.includes(respuesta.datos.rol)) {
    window.location.href = rutaLoginAdmin() + '?motivo=permisos';
    return null;
  }

  sesionAdminActual = respuesta.datos;
  return sesionAdminActual;
}

/* ---------------------------------------------------
   Topbar: nombre, avatar y rol del administrador
--------------------------------------------------- */
function inicializarTopbarAdmin(sesion) {
  const avatar = document.getElementById('adminAvatar');
  const nombre = document.getElementById('adminNombre');
  const rol = document.getElementById('adminRol');

  if (avatar) avatar.textContent = sesion.nombre.trim().charAt(0).toUpperCase();
  if (nombre) nombre.textContent = sesion.nombre;
  if (rol) rol.textContent = sesion.rol === 'superadmin' ? 'Superadministrador' : 'Administrador';
}

/* ---------------------------------------------------
   Logout: destruye la sesión PHP en el servidor.
   Se conecta después de construir el sidebar, porque
   el botón nace con él.
--------------------------------------------------- */
function inicializarLogoutAdmin() {
  const btn = document.getElementById('adminLogout');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (!confirm('¿Deseas cerrar sesión del panel administrativo?')) return;

    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Cerrando sesión...';

    try {
      await apiPost('logout.php', {});
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
    window.location.href = rutaLoginAdmin();
  });
}

/* ===================================================
   ARRANQUE
   sesionAdminLista es una promesa global: cualquier
   página puede hacer `await sesionAdminLista;` antes
   de pedir datos.
=================================================== */
let resolverSesionAdmin;
const sesionAdminLista = new Promise(resolve => { resolverSesionAdmin = resolve; });

document.addEventListener('DOMContentLoaded', async () => {
  const sesion = await verificarSesionAdmin();

  if (!sesion) {
    resolverSesionAdmin(null);
    return;
  }

  construirSidebarAdmin(sesion);
  inicializarTopbarAdmin(sesion);
  inicializarLogoutAdmin();
  mostrarPanel();

  resolverSesionAdmin(sesion);
});