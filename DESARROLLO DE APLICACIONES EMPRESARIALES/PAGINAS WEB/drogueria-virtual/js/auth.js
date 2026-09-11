/* ===================================================
   FORMULARIO DE REGISTRO
=================================================== */
function inicializarFormularioRegistro() {
  const form = document.getElementById('formRegistro');
  if (!form) return;

  const nombre = document.getElementById('registroNombre');
  const email = document.getElementById('registroEmail');
  const telefono = document.getElementById('registroTelefono');
  const password = document.getElementById('registroPassword');
  const confirmar = document.getElementById('registroConfirmar');
  const terminos = document.getElementById('registroTerminos');
  const mensajeGeneral = document.getElementById('registroMensaje');

  const errNombre = document.getElementById('errorRegistroNombre');
  const errEmail = document.getElementById('errorRegistroEmail');
  const errTelefono = document.getElementById('errorRegistroTelefono');
  const errPassword = document.getElementById('errorRegistroPassword');
  const errConfirmar = document.getElementById('errorRegistroConfirmar');

  const barras = document.querySelectorAll('#fuerzaPassword .auth-fuerza__barra');
  const textoFuerza = document.getElementById('fuerzaPasswordTexto');

  const coloresFuerza = ['#E5E7EB', '#DC2626', '#F59E0B', '#3B82F6', '#16A34A'];
  const etiquetasFuerza = ['', 'Débil', 'Regular', 'Buena', 'Muy segura'];

  nombre.addEventListener('blur', () => {
    if (!validarSoloLetras(nombre.value)) {
      mostrarError(nombre, errNombre, 'Ingresa un nombre válido (mínimo 2 letras).');
    } else {
      marcarValido(nombre, errNombre);
    }
  });

  email.addEventListener('blur', () => {
    if (!validarEmail(email.value)) {
      mostrarError(email, errEmail, 'Ingresa un correo electrónico válido.');
    } else {
      marcarValido(email, errEmail);
    }
  });

  telefono.addEventListener('blur', () => {
    if (!validarTelefono(telefono.value)) {
      mostrarError(telefono, errTelefono, 'Ingresa un teléfono válido (7 a 10 dígitos).');
    } else {
      marcarValido(telefono, errTelefono);
    }
  });

  password.addEventListener('input', () => {
    const fuerza = calcularFuerzaPassword(password.value);
    barras.forEach((barra, i) => {
      barra.style.background = i < fuerza ? coloresFuerza[fuerza] : '#E5E7EB';
    });
    textoFuerza.textContent = password.value ? etiquetasFuerza[fuerza] : '';
    textoFuerza.style.color = coloresFuerza[fuerza];

    if (password.value.length > 0 && password.value.length < 8) {
      mostrarError(password, errPassword, 'La contraseña debe tener mínimo 8 caracteres.');
    } else {
      marcarValido(password, errPassword);
    }
  });

  confirmar.addEventListener('input', () => {
    if (confirmar.value !== password.value) {
      mostrarError(confirmar, errConfirmar, 'Las contraseñas no coinciden.');
    } else {
      marcarValido(confirmar, errConfirmar);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    mensajeGeneral.classList.remove('auth-mensaje-general--visible', 'auth-mensaje-general--exito');

    let valido = true;

    if (!validarSoloLetras(nombre.value)) {
      mostrarError(nombre, errNombre, 'Ingresa un nombre válido (mínimo 2 letras).');
      valido = false;
    }
    if (!validarEmail(email.value)) {
      mostrarError(email, errEmail, 'Ingresa un correo electrónico válido.');
      valido = false;
    }
    if (!validarTelefono(telefono.value)) {
      mostrarError(telefono, errTelefono, 'Ingresa un teléfono válido (7 a 10 dígitos).');
      valido = false;
    }
    if (password.value.length < 8) {
      mostrarError(password, errPassword, 'La contraseña debe tener mínimo 8 caracteres.');
      valido = false;
    }
    if (confirmar.value !== password.value) {
      mostrarError(confirmar, errConfirmar, 'Las contraseñas no coinciden.');
      valido = false;
    }
    if (!terminos.checked) {
      mensajeGeneral.textContent = 'Debes aceptar los términos y condiciones para continuar.';
      mensajeGeneral.classList.add('auth-mensaje-general--visible');
      valido = false;
    }

    if (!valido) return;

    const btnSubmit = form.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Creando cuenta...';

    const respuesta = await apiPost('registro.php', {
      nombre: nombre.value.trim(),
      email: email.value.trim(),
      telefono: telefono.value.trim(),
      password: password.value
    });

    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Crear cuenta';

    if (!respuesta.exito) {
      mensajeGeneral.textContent = respuesta.mensaje || 'Ocurrió un error al crear la cuenta.';
      mensajeGeneral.classList.add('auth-mensaje-general--visible');

      if (respuesta.errores) {
        if (respuesta.errores.nombre) mostrarError(nombre, errNombre, respuesta.errores.nombre);
        if (respuesta.errores.email) mostrarError(email, errEmail, respuesta.errores.email);
        if (respuesta.errores.telefono) mostrarError(telefono, errTelefono, respuesta.errores.telefono);
        if (respuesta.errores.password) mostrarError(password, errPassword, respuesta.errores.password);
      }
      return;
    }

    mensajeGeneral.textContent = '¡Cuenta creada con éxito! Redirigiendo...';
    mensajeGeneral.classList.add('auth-mensaje-general--visible', 'auth-mensaje-general--exito');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
  });
}

/* ===================================================
   FORMULARIO DE LOGIN (CORREGIDO CON LOGS)
=================================================== */
function inicializarFormularioLogin() {
  const form = document.getElementById('formLogin');
  if (!form) {
    console.error('Formulario #formLogin no encontrado');
    return;
    // Limpiar conversación del chat
localStorage.removeItem('vitalfarma_chatbot_conversacion');
localStorage.setItem('chatbot_usuario_id', String(respuesta.datos.id));
  }

  console.log('Formulario de login inicializado');

  const email = document.getElementById('loginEmail');
  const password = document.getElementById('loginPassword');
  const mensajeGeneral = document.getElementById('loginMensaje');

  const errEmail = document.getElementById('errorLoginEmail');
  const errPassword = document.getElementById('errorLoginPassword');

  email.addEventListener('blur', () => {
    if (!validarEmail(email.value)) {
      mostrarError(email, errEmail, 'Ingresa un correo electrónico válido.');
    } else {
      marcarValido(email, errEmail);
    }
  });

  password.addEventListener('input', () => {
    limpiarValidacion(password, errPassword);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('✅ Evento submit del login capturado');

    mensajeGeneral.classList.remove('auth-mensaje-general--visible', 'auth-mensaje-general--exito');

    let valido = true;

    if (!validarEmail(email.value)) {
      mostrarError(email, errEmail, 'Ingresa un correo electrónico válido.');
      valido = false;
    }
    if (password.value.trim() === '') {
      mostrarError(password, errPassword, 'Ingresa tu contraseña.');
      valido = false;
    }

    if (!valido) return;

    const btnSubmit = form.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Ingresando...';

    console.log('📤 Enviando petición POST a login.php con:', { email: email.value.trim() });

    const respuesta = await apiPost('login.php', {
      email: email.value.trim(),
      password: password.value
    });

    console.log('📥 Respuesta del servidor:', respuesta);

    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Iniciar sesión';

    if (!respuesta.exito) {
      mensajeGeneral.textContent = respuesta.mensaje || 'Correo o contraseña incorrectos.';
      mensajeGeneral.classList.add('auth-mensaje-general--visible');
      return;
    }

    const rol = respuesta.datos ? respuesta.datos.rol : 'cliente';
    const esAdministrativo = rol === 'admin' || rol === 'superadmin';

    mensajeGeneral.textContent = esAdministrativo
      ? 'Acceso administrativo verificado. Abriendo el panel...'
      : '¡Bienvenido de nuevo! Redirigiendo...';
    mensajeGeneral.classList.add('auth-mensaje-general--visible', 'auth-mensaje-general--exito');

    setTimeout(() => {
      window.location.href = esAdministrativo ? 'admin/index.html' : 'index.html';
    }, 1000);
  });
}

/* ===== Inicialización ===== */
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOM cargado - inicializando auth');
  inicializarFormularioRegistro();
  inicializarFormularioLogin();
});