/* ===== Funciones de validación reutilizables ===== */

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

function validarTelefono(telefono) {
  const regex = /^[0-9]{7,10}$/;
  return regex.test(telefono.trim());
}

function validarSoloLetras(texto) {
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/;
  return regex.test(texto.trim());
}

function calcularFuerzaPassword(password) {
  let puntos = 0;
  if (password.length >= 8) puntos++;
  if (/[A-Z]/.test(password)) puntos++;
  if (/[0-9]/.test(password)) puntos++;
  if (/[^A-Za-z0-9]/.test(password)) puntos++;
  return puntos; // 0 a 4
}

function mostrarError(inputEl, mensajeEl, mensaje) {
  inputEl.classList.add('campo-error');
  inputEl.classList.remove('campo-valido');
  if (mensajeEl) {
    mensajeEl.textContent = mensaje;
    mensajeEl.classList.add('auth-campo__mensaje-error--visible');
  }
}

function marcarValido(inputEl, mensajeEl) {
  inputEl.classList.remove('campo-error');
  inputEl.classList.add('campo-valido');
  if (mensajeEl) {
    mensajeEl.textContent = '';
    mensajeEl.classList.remove('auth-campo__mensaje-error--visible');
  }
}

function limpiarValidacion(inputEl, mensajeEl) {
  inputEl.classList.remove('campo-error', 'campo-valido');
  if (mensajeEl) {
    mensajeEl.textContent = '';
    mensajeEl.classList.remove('auth-campo__mensaje-error--visible');
  }
}

/* ===== Toggle de mostrar/ocultar contraseña ===== */
function inicializarTogglesPassword() {
  document.querySelectorAll('.auth-campo__toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else {
        input.type = 'password';
        btn.textContent = '👁️';
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', inicializarTogglesPassword);