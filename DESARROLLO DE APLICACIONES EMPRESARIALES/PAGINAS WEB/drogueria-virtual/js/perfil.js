document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('formPerfil');
  if (!form) return;

  const sesion = await protegerPaginaUsuario();
  if (!sesion) return;

  inicializarSidebarUsuario(sesion);
  inicializarLogout();

  const nombre = document.getElementById('perfilNombre');
  const email = document.getElementById('perfilEmail');
  const telefono = document.getElementById('perfilTelefono');
  const errNombre = document.getElementById('errorPerfilNombre');
  const errTelefono = document.getElementById('errorPerfilTelefono');
  const mensaje = document.getElementById('perfilMensaje');

  // Precargar datos actuales (la sesión ya trae nombre y email; el teléfono lo consultamos)
  nombre.value = sesion.nombre;
  email.value = sesion.email;
  // Nota: el endpoint sesion.php no devuelve teléfono todavía;
  // se deja vacío y el usuario lo completa si quiere actualizarlo.

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let valido = true;

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(nombre.value.trim())) {
      nombre.classList.add('campo-error');
      errNombre.textContent = 'Ingresa un nombre válido.';
      errNombre.classList.add('user-form__error--visible');
      valido = false;
    } else {
      nombre.classList.remove('campo-error');
      errNombre.classList.remove('user-form__error--visible');
    }

    if (!/^[0-9]{7,10}$/.test(telefono.value.trim())) {
      telefono.classList.add('campo-error');
      errTelefono.textContent = 'Ingresa un teléfono válido (7 a 10 dígitos).';
      errTelefono.classList.add('user-form__error--visible');
      valido = false;
    } else {
      telefono.classList.remove('campo-error');
      errTelefono.classList.remove('user-form__error--visible');
    }

    if (!valido) return;

    const respuesta = await apiPost('perfil.php', {
      nombre: nombre.value.trim(),
      telefono: telefono.value.trim()
    });

    if (!respuesta.exito) {
      mensaje.textContent = respuesta.mensaje || 'Ocurrió un error al actualizar tus datos.';
      mensaje.style.background = '#FEE2E2';
      mensaje.style.color = 'var(--color-error)';
      mensaje.classList.add('user-form__mensaje--visible');
      return;
    }

    mensaje.style.background = '#DCFCE7';
    mensaje.style.color = 'var(--color-exito)';
    mensaje.textContent = 'Tus datos se actualizaron correctamente.';
    mensaje.classList.add('user-form__mensaje--visible');
    setTimeout(() => mensaje.classList.remove('user-form__mensaje--visible'), 2500);
  });
});