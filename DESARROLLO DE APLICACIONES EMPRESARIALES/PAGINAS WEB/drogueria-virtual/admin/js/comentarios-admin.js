async function inicializarTablaComentarios(filtroTipo) {
  const tablaBody = document.getElementById('comentariosTabla');
  if (!tablaBody) return;

  const url = filtroTipo ? `comentarios.php?todos=1&tipo=${filtroTipo}` : 'comentarios.php?todos=1';
  const respuesta = await apiGet(url);
  const comentarios = respuesta.exito ? respuesta.datos : [];

  if (comentarios.length === 0) {
    tablaBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:var(--espacio-lg); color:var(--color-texto-suave);">No hay mensajes registrados en esta categoría.</td></tr>`;
    return;
  }

  const iconosTipo = {
    comentario: '<i class="bi bi-chat-dots"></i>',
    queja: '<i class="bi bi-exclamation-triangle"></i>',
    sugerencia: '<i class="bi bi-lightbulb"></i>',
    recomendacion: '<i class="bi bi-hand-thumbs-up"></i>'
  };

  tablaBody.innerHTML = comentarios.map(c => {
    const fecha = new Date(c.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    return `
      <tr>
        <td>${c.usuario_nombre}<br><span style="font-size:0.75rem; color:var(--color-texto-suave);">${c.usuario_email}</span></td>
        <td>${iconosTipo[c.tipo] || ''} ${c.tipo}</td>
        <td style="max-width:320px;">${c.contenido}</td>
        <td>${fecha}</td>
        <td>
          ${Number(c.revisado) === 1
            ? '<span class="badge-estado badge-estado--exito">Revisado</span>'
            : `<button class="btn btn-secundario btn-marcar-revisado" data-id="${c.id}" style="font-size:0.78rem; padding:6px 12px;">Marcar revisado</button>`
          }
        </td>
      </tr>
    `;
  }).join('');

  tablaBody.querySelectorAll('.btn-marcar-revisado').forEach(btn => {
    btn.addEventListener('click', async () => {
      await apiPut(`comentarios.php?id=${btn.dataset.id}`, {});
      inicializarTablaComentarios(filtroTipo);
    });
  });
}