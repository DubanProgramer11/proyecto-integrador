

const RUTA_PANEL = '/drogueria-virtual/admin/index.html';

document.addEventListener('DOMContentLoaded', async () => {
  // Si api.js no está cargado, no hacemos nada (evita romper la página)
  if (typeof apiGet !== 'function') return;

  const respuesta = await apiGet('sesion.php');
  if (!respuesta.exito) return; // visitante o cliente sin sesión: sigue normal

  const rol = respuesta.datos.rol;
  if (rol === 'admin' || rol === 'superadmin') {
    window.location.replace(RUTA_PANEL);
  }
});