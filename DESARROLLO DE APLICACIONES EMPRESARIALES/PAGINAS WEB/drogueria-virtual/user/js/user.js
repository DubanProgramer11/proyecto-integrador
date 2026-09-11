/* ===== Protección de rutas: ahora verifica la sesión contra el backend ===== */
async function protegerPaginaUsuario() {
  const enSubcarpeta = window.location.pathname.includes('/user/pages/');
  const respuesta = await apiGet('sesion.php');

  if (!respuesta.exito) {
    window.location.href = enSubcarpeta ? '../../login.html' : '../login.html';
    return null;
  }
  return respuesta.datos;
}

/* ===== Rellenar datos del sidebar ===== */
function inicializarSidebarUsuario(sesion) {
  const avatar = document.getElementById('sidebarAvatar');
  const nombre = document.getElementById('sidebarNombre');
  const email = document.getElementById('sidebarEmail');

  if (avatar) avatar.textContent = sesion.nombre.trim().charAt(0).toUpperCase();
  if (nombre) nombre.textContent = sesion.nombre;
  if (email) email.textContent = sesion.email;

  const archivoActual = window.location.pathname.split('/').pop();
  document.querySelectorAll('.user-sidebar__link').forEach(link => {
    const archivoLink = link.getAttribute('href').split('/').pop();
    link.classList.toggle('user-sidebar__link--activo', archivoLink === archivoActual);
  });
}

/* ===== Cerrar sesión (destruye la sesión PHP en el servidor) ===== */
function inicializarLogout() {
  const btn = document.getElementById('btnCerrarSesion');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    // Si idioma.js falló, t() no existe. Con este respaldo el botón
    // sigue funcionando en vez de morir con "t is not defined".
    const pregunta = (typeof t === 'function')
      ? t('confirmar_logout')
      : '¿Deseas cerrar sesión?';

    if (!confirm(pregunta)) return;

    try {
      await apiPost('logout.php', {});
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }

    // Ruta absoluta: no depende de en qué carpeta esté la página.
    window.location.href = '/drogueria-virtual/index.html';
  });
}

/* ===== Inicialización común a todas las páginas de usuario ===== */
document.addEventListener('DOMContentLoaded', async () => {
  const sesion = await protegerPaginaUsuario();
  if (!sesion) return;

  inicializarSidebarUsuario(sesion);
  inicializarLogout();

  // Actualizar el ícono de cuenta en el header (opcional, pero ya lo hace main.js)
});