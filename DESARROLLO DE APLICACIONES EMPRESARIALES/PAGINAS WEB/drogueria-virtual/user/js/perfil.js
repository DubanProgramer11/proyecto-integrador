document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('formPerfil');
  if (!form) return;

  const sesion = await protegerPaginaUsuario();
  if (!sesion) return;
  // sidebar y logout ya los inicializa user.js

  const nombre = document.getElementById('perfilNombre');
  const email = document.getElementById('perfilEmail');
  const telefono = document.getElementById('perfilTelefono');
  const errNombre = document.getElementById('errorPerfilNombre');
  const errTelefono = document.getElementById('errorPerfilTelefono');
  const mensaje = document.getElementById('perfilMensaje');

  // OJO: NO se usa usuarios.php. Ese endpoint exige rol superadmin
  // (exigirRol(['superadmin']) en UsuarioController) y a un cliente
  // normal le devuelve 403. sesion.php ya trae los datos propios.
  nombre.value = sesion.nombre || '';
  email.value = sesion.email || '';
  telefono.value = sesion.telefono || '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valido = true;

    errNombre.textContent = '';
    errTelefono.textContent = '';
    nombre.classList.remove('campo-error');
    telefono.classList.remove('campo-error');

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(nombre.value.trim())) {
      nombre.classList.add('campo-error');
      errNombre.textContent = t('perfil_err_nombre');
      valido = false;
    }
    if (!/^[0-9]{7,10}$/.test(telefono.value.trim())) {
      telefono.classList.add('campo-error');
      errTelefono.textContent = t('perfil_err_telefono');
      valido = false;
    }
    if (!valido) return;

    // perfil.php sí acepta clientes: solo actualiza el usuario en sesión.
    const respuesta = await apiPut('perfil.php', {
      nombre: nombre.value.trim(),
      telefono: telefono.value.trim()
    });

    if (!respuesta.exito) {
      mensaje.textContent = respuesta.mensaje || t('perfil_error');
      mensaje.className = 'user-form__mensaje user-form__mensaje--visible';
      mensaje.style.background = '#FEE2E2';
      mensaje.style.color = 'var(--color-error)';
      return;
    }

    mensaje.textContent = t('perfil_ok');
    mensaje.className = 'user-form__mensaje user-form__mensaje--visible';
    mensaje.style.background = '#DCFCE7';
    mensaje.style.color = 'var(--color-exito)';

    sesion.nombre = nombre.value.trim();
    inicializarSidebarUsuario(sesion);

    setTimeout(() => {
      mensaje.className = 'user-form__mensaje';
      mensaje.textContent = '';
    }, 3000);
  });
});