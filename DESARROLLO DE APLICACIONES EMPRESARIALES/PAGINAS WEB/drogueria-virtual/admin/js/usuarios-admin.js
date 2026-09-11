

function escaparHtml(texto) {
  if (texto === null || texto === undefined) return '';
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

const ROLES = {
  cliente:    { etiqueta: 'Cliente',            clase: 'badge-estado--neutro' },
  admin:      { etiqueta: 'Administrador',      clase: 'badge-estado--info' },
  superadmin: { etiqueta: 'Superadministrador', clase: 'badge-estado--exito' }
};

/* Id del usuario en sesión: lo usamos para no dejar que
   se modifique a sí mismo desde la interfaz. */
let miUsuarioId = null;

/* ---------------------------------------------------
   Tarjetas de resumen
--------------------------------------------------- */
async function cargarResumenUsuarios() {
  const contenedor = document.getElementById('usuariosResumen');
  const respuesta = await apiGet('admin.php?recurso=resumen');
  if (!respuesta.exito) return;

  const porRol = respuesta.datos.usuarios_por_rol;

  const tarjetas = [
       { etiqueta: 'Clientes',              valor: porRol.cliente    || 0, icono: '<i class="bi bi-people"></i>', color: 'azul' },
    { etiqueta: 'Administradores',       valor: porRol.admin      || 0, icono: '<i class="bi bi-shield-check"></i>', color: 'verde' },
    { etiqueta: 'Superadministradores',  valor: porRol.superadmin || 0, icono: '<i class="bi bi-key"></i>', color: 'morado' }
  ];

  contenedor.innerHTML = tarjetas.map(t => `
    <div class="admin-stat-card">
      <div class="admin-stat-card__icono admin-stat-card__icono--${t.color}">${t.icono}</div>
      <div>
        <div class="admin-stat-card__valor">${escaparHtml(t.valor)}</div>
        <div class="admin-stat-card__etiqueta">${t.etiqueta}</div>
      </div>
    </div>
  `).join('');
}

/* ---------------------------------------------------
   Tabla
--------------------------------------------------- */
function construirQueryUsuarios() {
  const parametros = new URLSearchParams();

  const busqueda = document.getElementById('filtroBusqueda').value.trim();
  const rol      = document.getElementById('filtroRol').value;

  if (busqueda) parametros.append('busqueda', busqueda);
  if (rol)      parametros.append('rol', rol);

  const query = parametros.toString();
  return query ? `usuarios.php?${query}` : 'usuarios.php';
}

async function cargarUsuarios() {
  const tbody = document.getElementById('usuariosTabla');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:var(--espacio-lg);">Cargando...</td></tr>`;

  const respuesta = await apiGet(construirQueryUsuarios());

  if (!respuesta.exito) {
    // 403: la cuenta actual es admin, no superadmin
    const mensaje = respuesta.status === 403
      ? 'Esta sección requiere permisos de superadministrador. Tu cuenta tiene rol de administrador.'
      : (respuesta.mensaje || 'No se pudieron cargar los usuarios.');

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:var(--espacio-xl); color:var(--color-texto-suave);">
            <i class="bi bi-lock"></i> ${escaparHtml(mensaje)}</td></tr>`;
    return;
  }

  const usuarios = respuesta.datos;

  if (usuarios.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:var(--espacio-lg); color:var(--color-texto-suave);">
      No hay usuarios que coincidan con la búsqueda.</td></tr>`;
    return;
  }

  tbody.innerHTML = usuarios.map(u => {
    const inicial = (u.nombre || '?').trim().charAt(0).toUpperCase();
    const activo = Number(u.activo) === 1;
    const esYo = Number(u.id) === Number(miUsuarioId);

    return `
      <tr${esYo ? ' style="background:var(--color-fondo-alterno);"' : ''}>
        <td>
          <div class="admin-tabla__producto">
            <div class="admin-tabla__producto-icono">${escaparHtml(inicial)}</div>
            <div>
              ${escaparHtml(u.nombre)} ${esYo ? '<span style="font-size:0.72rem; color:var(--color-primario);">(tú)</span>' : ''}
              <br><span style="font-size:0.75rem; color:var(--color-texto-suave);">${escaparHtml(u.email)}</span>
            </div>
          </div>
        </td>
        <td>${escaparHtml(u.telefono || '—')}</td>
        <td>${formatearFecha(u.fecha_registro)}</td>
        <td>
          ${esYo
            ? `<span class="badge-estado ${ROLES[u.rol_nombre].clase}">${ROLES[u.rol_nombre].etiqueta}</span>`
            : `<select class="selector-rol" data-id="${u.id}" data-rol-actual="${escaparHtml(u.rol_nombre)}"
                      style="padding:5px 8px; border:1px solid var(--color-borde); border-radius:var(--radio-sm); font-size:0.78rem;">
                 ${Object.keys(ROLES).map(clave => `
                   <option value="${clave}" ${u.rol_nombre === clave ? 'selected' : ''}>${ROLES[clave].etiqueta}</option>
                 `).join('')}
               </select>`
          }
        </td>
        <td>
          <span class="badge-estado ${activo ? 'badge-estado--exito' : 'badge-estado--error'}">
            ${activo ? 'Activa' : 'Desactivada'}
          </span>
        </td>
        <td>
          <div class="admin-tabla__acciones">
            ${esYo
              ? '<span style="font-size:0.72rem; color:var(--color-texto-suave);">Tu cuenta</span>'
              : `<button class="admin-btn-icono btn-estado ${activo ? 'admin-btn-icono--eliminar' : ''}"
                         data-id="${u.id}" data-activo="${activo ? 1 : 0}"
                         title="${activo ? 'Desactivar cuenta' : 'Activar cuenta'}">
                          ${activo ? '<i class="bi bi-slash-circle"></i>' : '<i class="bi bi-check-lg"></i>'}
                 </button>`
            }
          </div>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.selector-rol').forEach(select => {
    select.addEventListener('change', manejarCambioRol);
  });
  document.querySelectorAll('.btn-estado').forEach(btn => {
    btn.addEventListener('click', () => manejarCambioEstado(btn.dataset.id, Number(btn.dataset.activo)));
  });
}

/* ---------------------------------------------------
   Cambio de rol
--------------------------------------------------- */
async function manejarCambioRol(evento) {
  const select = evento.target;
  const id = select.dataset.id;
  const rolAnterior = select.dataset.rolActual;
  const nuevoRol = select.value;

  if (!confirm(`¿Cambiar el rol de este usuario a "${ROLES[nuevoRol].etiqueta}"?`)) {
    select.value = rolAnterior;
    return;
  }

  select.disabled = true;
  const respuesta = await apiPut('usuarios.php?accion=rol', { id: Number(id), rol: nuevoRol });
  select.disabled = false;

  if (!respuesta.exito) {
    alert(respuesta.mensaje || 'No se pudo cambiar el rol.');
    select.value = rolAnterior;
    return;
  }

  select.dataset.rolActual = nuevoRol;
  cargarResumenUsuarios();
}

/* ---------------------------------------------------
   Activar / desactivar cuenta
--------------------------------------------------- */
async function manejarCambioEstado(id, activoActual) {
  const nuevoValor = activoActual === 1 ? 0 : 1;
  const accion = nuevoValor === 1 ? 'activar' : 'desactivar';

  if (!confirm(`¿Deseas ${accion} esta cuenta?`)) return;

  const respuesta = await apiPut('usuarios.php?accion=estado', { id: Number(id), activo: nuevoValor });

  if (!respuesta.exito) {
    alert(respuesta.mensaje || 'No se pudo cambiar el estado de la cuenta.');
    return;
  }

  cargarUsuarios();
  cargarResumenUsuarios();
}

/* ---------------------------------------------------
   Arranque
--------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
  const sesion = await sesionAdminLista;
  if (!sesion) return;

  miUsuarioId = sesion.id;

  cargarResumenUsuarios();
  cargarUsuarios();

  document.getElementById('filtroRol').addEventListener('change', cargarUsuarios);

  let temporizador;
  document.getElementById('filtroBusqueda').addEventListener('input', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(cargarUsuarios, 400);
  });

  document.getElementById('btnLimpiarFiltros').addEventListener('click', () => {
    document.getElementById('filtroBusqueda').value = '';
    document.getElementById('filtroRol').value = '';
    cargarUsuarios();
  });
});