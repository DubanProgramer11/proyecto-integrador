document.addEventListener('DOMContentLoaded', async () => {
  const tablaBody = document.getElementById('calificacionesTabla');
  const barrasContenedor = document.getElementById('calificacionesBarras');
  if (!tablaBody) return;

  const respEstadisticas = await apiGet('calificaciones.php?estadisticas=1');
  if (respEstadisticas.exito) {
    const stats = respEstadisticas.datos;
    document.getElementById('promedioGeneral').textContent = stats.promedio;
    document.getElementById('totalCalificaciones').textContent = stats.total;

    const colores = { Excelente: '#16A34A', Buena: '#3B82F6', Regular: '#F59E0B', Mala: '#DC2626' };
    barrasContenedor.innerHTML = Object.entries(stats.porcentajes).map(([clasificacion, porcentaje]) => `
      <div class="admin-barra-fila">
        <span class="admin-barra-fila__etiqueta">${clasificacion}</span>
        <div class="admin-barra-track"><div class="admin-barra-fill" style="width:${porcentaje}%; background:${colores[clasificacion]};"></div></div>
        <span class="admin-barra-fila__valor">${porcentaje}%</span>
      </div>
    `).join('');
  }

  const respuesta = await apiGet('calificaciones.php?todas=1');
  const calificaciones = respuesta.exito ? respuesta.datos : [];

  if (calificaciones.length === 0) {
    tablaBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:var(--espacio-lg); color:var(--color-texto-suave);">Aún no hay calificaciones registradas.</td></tr>`;
    return;
  }

  const clasesBadge = { Excelente: 'badge-estado--exito', Buena: 'badge-estado--info', Regular: 'badge-estado--advertencia', Mala: 'badge-estado--error' };

  tablaBody.innerHTML = calificaciones.map(c => `
    <tr>
      <td>${c.usuario_nombre}<br><span style="font-size:0.75rem; color:var(--color-texto-suave);">${c.usuario_email}</span></td>
      <td>${c.pedido_id ? '#' + c.pedido_id : '—'}</td>
      <td>${'★'.repeat(c.puntuacion)}${'☆'.repeat(5 - c.puntuacion)}</td>
      <td><span class="badge-estado ${clasesBadge[c.clasificacion]}">${c.clasificacion}</span></td>
      <td style="max-width:280px;">${c.comentario || '<span style="color:var(--color-texto-suave);">Sin comentario</span>'}</td>
    </tr>
  `).join('');
});