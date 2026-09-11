// Menú móvil (hamburguesa) + estado de sesión en el header (consultado al backend)
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const navLista = document.getElementById('navLista');

  if (menuToggle && navLista) {
    menuToggle.addEventListener('click', () => {
      navLista.classList.toggle('nav__lista--abierta');
    });
  }

  // Actualizar el ícono de cuenta según la sesión
  actualizarHeaderCuenta();
});

/* ===== Header: icono de cuenta según sesión activa en el servidor ===== */
async function actualizarHeaderCuenta() {
  const headerCuenta = document.getElementById('headerCuenta');
  if (!headerCuenta) return;

  try {
    const respuesta = await apiGet('sesion.php');

    if (respuesta.exito && respuesta.datos) {
      // Usuario logueado → mostrar inicial y redirigir a user/index.html
      const sesion = respuesta.datos;
      const inicial = sesion.nombre ? sesion.nombre.trim().charAt(0).toUpperCase() : 'U';

      headerCuenta.innerHTML = `<span class="header__avatar">${inicial}</span>`;
      headerCuenta.href = '/drogueria-virtual/user/index.html';
      headerCuenta.title = `Mi cuenta - ${sesion.nombre}`;
    } else {
      // Usuario no logueado → mostrar ícono y redirigir a login
      headerCuenta.innerHTML = '👤';
      headerCuenta.href = '/drogueria-virtual/login.html';
      headerCuenta.title = 'Iniciar sesión';
      
      // Limpiar datos del chat (logout)
      localStorage.removeItem('vitalfarma_chatbot_conversacion');
      localStorage.removeItem('chatbot_usuario_id');
    }
  } catch (error) {
    console.error('Error al obtener la sesión:', error);
    // En caso de error, dejar el estado por defecto (no logueado)
    headerCuenta.innerHTML = '👤';
    headerCuenta.href = '/drogueria-virtual/login.html';
    headerCuenta.title = 'Iniciar sesión';
  }
}