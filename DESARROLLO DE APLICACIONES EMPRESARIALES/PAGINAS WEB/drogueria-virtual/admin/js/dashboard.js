// ============================================================
// ARCHIVO: admin/js/dashboard.js
// Dashboard del panel administrativo.
//
// Toda la información sale de UNA sola petición a
// admin.php?recurso=resumen, que ya devuelve todo junto.
// ============================================================

const PALETA = {
  primario:  '#0B7A75',
  secundario:'#1C6DD0',
  acento:    '#FF6B4A',
  exito:     '#16A34A',
  aviso:     '#F59E0B',
  error:     '#DC2626',
  morado:    '#7C3AED',
  gris:      '#9CA3AF'
};

// Guardamos las instancias para destruirlas antes de redibujar.
// Sin esto, Chart.js apila gráficas y la página se pone lentísima.
const graficas = {};

function moneda(valor) {
  return '$ ' + Number(valor || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

function fecha(valor, conHora) {
  const opciones = { day: 'numeric', month: 'short', year: 'numeric' };
  if (conHora) { opciones.hour = '2-digit'; opciones.minute = '2-digit'; }
  return new Date(valor).toLocaleDateString('es-CO', opciones);
}

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

const ESTADOS = {
  pendiente:  { texto: 'Pendiente',  clase: 'badge-estado--advertencia', color: PALETA.aviso },
  confirmado: { texto: 'Confirmado', clase: 'badge-estado--info',        color: PALETA.secundario },
  en_camino:  { texto: 'En camino',  clase: 'badge-estado--info',        color: PALETA.primario },
  entregado:  { texto: 'Entregado',  clase: 'badge-estado--exito',       color: PALETA.exito },
  cancelado:  { texto: 'Cancelado',  clase: 'badge-estado--error',       color: PALETA.error }
};

const ESTADOS_ORDEN = {
  pendiente:            { texto: 'Pendiente', color: PALETA.aviso },
  procesada:            { texto: 'Procesada', color: PALETA.secundario },
  revisada_por_usuario: { texto: 'Revisada',  color: PALETA.exito },
  error:                { texto: 'Con error', color: PALETA.error }
};

/* ===== Ajustes comunes de Chart.js ===== */
function baseOpciones() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { font: { family: 'Inter', size: 12 }, usePointStyle: true, padding: 16 } },
      tooltip: {
        backgroundColor: '#1F2937',
        padding: 11,
        cornerRadius: 8,
        titleFont: { family: 'Poppins', size: 13 },
        bodyFont: { family: 'Inter', size: 12 }
      }
    }
  };
}

/* ===== GRÁFICA 1: ventas por día ===== */
function pintarVentas(porDia) {
  const lienzo = document.getElementById('graficaVentas');
  const vacio = document.getElementById('ventasVacio');

  if (graficas.ventas) graficas.ventas.destroy();

  if (!porDia || porDia.length === 0) {
    lienzo.style.display = 'none';
    vacio.style.display = 'block';
    return;
  }
  lienzo.style.display = 'block';
  vacio.style.display = 'none';

  const contexto = lienzo.getContext('2d');
  // Degradado bajo la línea: le da el acabado de dashboard profesional
  const degradado = contexto.createLinearGradient(0, 0, 0, 280);
  degradado.addColorStop(0, 'rgba(11, 122, 117, 0.28)');
  degradado.addColorStop(1, 'rgba(11, 122, 117, 0)');

  const opciones = baseOpciones();
  opciones.plugins.legend.display = false;
  opciones.plugins.tooltip.callbacks = {
    label: (ctx) => ' ' + moneda(ctx.parsed.y)
  };
  opciones.scales = {
    y: {
      beginAtZero: true,
      ticks: {
        font: { family: 'Inter', size: 11 },
        callback: (valor) => '$ ' + (valor / 1000) + 'k'
      },
      grid: { color: '#F1F3F5' }
    },
    x: {
      ticks: { font: { family: 'Inter', size: 11 } },
      grid: { display: false }
    }
  };

  graficas.ventas = new Chart(contexto, {
    type: 'line',
    data: {
      labels: porDia.map(d => fecha(d.dia)),
      datasets: [{
        label: 'Ventas',
        data: porDia.map(d => Number(d.monto)),
        borderColor: PALETA.primario,
        backgroundColor: degradado,
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#fff',
        pointBorderColor: PALETA.primario,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: opciones
  });
}

/* ===== GRÁFICA 2: pedidos por estado (dona) ===== */
function pintarEstados(porEstado) {
  const lienzo = document.getElementById('graficaEstados');
  const vacio = document.getElementById('estadosVacio');

  if (graficas.estados) graficas.estados.destroy();

  if (!porEstado || porEstado.length === 0) {
    lienzo.style.display = 'none';
    vacio.style.display = 'block';
    return;
  }
  lienzo.style.display = 'block';
  vacio.style.display = 'none';

  const opciones = baseOpciones();
  opciones.cutout = '62%';
  opciones.plugins.legend.position = 'bottom';

  graficas.estados = new Chart(lienzo, {
    type: 'doughnut',
    data: {
      labels: porEstado.map(e => (ESTADOS[e.estado] || { texto: e.estado }).texto),
      datasets: [{
        data: porEstado.map(e => Number(e.total)),
        backgroundColor: porEstado.map(e => (ESTADOS[e.estado] || { color: PALETA.gris }).color),
        borderWidth: 3,
        borderColor: '#fff'
      }]
    },
    options: opciones
  });
}

/* ===== GRÁFICA 3: órdenes médicas por estado ===== */
function pintarOrdenes(porEstado) {
  const lienzo = document.getElementById('graficaOrdenes');
  const vacio = document.getElementById('ordenesVacio');

  if (graficas.ordenes) graficas.ordenes.destroy();

  if (!porEstado || porEstado.length === 0) {
    lienzo.style.display = 'none';
    vacio.style.display = 'block';
    return;
  }
  lienzo.style.display = 'block';
  vacio.style.display = 'none';

  const opciones = baseOpciones();
  opciones.plugins.legend.display = false;
  opciones.scales = {
    y: { beginAtZero: true, ticks: { precision: 0, font: { family: 'Inter', size: 11 } }, grid: { color: '#F1F3F5' } },
    x: { ticks: { font: { family: 'Inter', size: 11 } }, grid: { display: false } }
  };

  graficas.ordenes = new Chart(lienzo, {
    type: 'bar',
    data: {
      labels: porEstado.map(e => (ESTADOS_ORDEN[e.estado_analisis] || { texto: e.estado_analisis }).texto),
      datasets: [{
        data: porEstado.map(e => Number(e.total)),
        backgroundColor: porEstado.map(e => (ESTADOS_ORDEN[e.estado_analisis] || { color: PALETA.gris }).color),
        borderRadius: 7,
        maxBarThickness: 54
      }]
    },
    options: opciones
  });
}

/* ===== GRÁFICA 4: satisfacción ===== */
function pintarCalificaciones(stats) {
  const lienzo = document.getElementById('graficaCalificaciones');
  const vacio = document.getElementById('calificacionesVacio');

  if (graficas.calificaciones) graficas.calificaciones.destroy();

  if (!stats || Number(stats.total) === 0) {
    lienzo.style.display = 'none';
    vacio.style.display = 'block';
    return;
  }
  lienzo.style.display = 'block';
  vacio.style.display = 'none';

  const etiquetas = ['Excelente', 'Buena', 'Regular', 'Mala'];
  const colores = [PALETA.exito, PALETA.secundario, PALETA.aviso, PALETA.error];

  const opciones = baseOpciones();
  opciones.indexAxis = 'y';
  opciones.plugins.legend.display = false;
  opciones.plugins.tooltip.callbacks = { label: (ctx) => ' ' + ctx.parsed.x + '%' };
  opciones.scales = {
    x: { beginAtZero: true, max: 100, ticks: { callback: (v) => v + '%', font: { family: 'Inter', size: 11 } }, grid: { color: '#F1F3F5' } },
    y: { ticks: { font: { family: 'Inter', size: 12 } }, grid: { display: false } }
  };

  graficas.calificaciones = new Chart(lienzo, {
    type: 'bar',
    data: {
      labels: etiquetas,
      datasets: [{
        data: etiquetas.map(e => Number(stats.porcentajes[e] || 0)),
        backgroundColor: colores,
        borderRadius: 7,
        maxBarThickness: 26
      }]
    },
    options: opciones
  });
}

/* ===== TABLA: pedidos recientes ===== */
function pintarRecientes(pedidos) {
  const caja = document.getElementById('tablaRecientes');

  if (!pedidos || pedidos.length === 0) {
    caja.innerHTML = `<div class="dash-vacio"><i class="bi bi-inbox"></i>Todavía no hay pedidos registrados.</div>`;
    return;
  }

  caja.innerHTML = `
    <div class="admin-tabla-wrapper">
      <table class="admin-tabla">
        <thead>
          <tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Estado</th><th style="text-align:right;">Total</th></tr>
        </thead>
        <tbody>
          ${pedidos.map(p => {
            const estado = ESTADOS[p.estado] || { texto: p.estado, clase: 'badge-estado--neutro' };
            return `
              <tr>
                <td><strong>#${p.id}</strong></td>
                <td>${escapar(p.cliente_nombre)}</td>
                <td style="white-space:nowrap;">${fecha(p.fecha_pedido)}</td>
                <td><span class="badge-estado ${estado.clase}">${estado.texto}</span></td>
                <td style="text-align:right; font-weight:700; white-space:nowrap;">${moneda(p.total)}</td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ===== LISTA: productos más vendidos ===== */
function pintarTopProductos(productos) {
  const caja = document.getElementById('topProductos');

  if (!productos || productos.length === 0) {
    caja.innerHTML = `<div class="dash-vacio"><i class="bi bi-graph-down"></i>Aún no hay ventas de productos.</div>`;
    return;
  }

  caja.innerHTML = productos.map((p, i) => `
    <div class="dash-top-fila">
      <span class="dash-top-fila__puesto">${i + 1}</span>
      <span class="dash-top-fila__nombre">${escapar(p.nombre)}</span>
      <span class="dash-top-fila__datos">
        <div class="dash-top-fila__unidades">${p.unidades} und.</div>
        <div class="dash-top-fila__ingresos">${moneda(p.ingresos)}</div>
      </span>
    </div>`).join('');
}

/* ===== CARGA PRINCIPAL ===== */
async function cargarDashboard() {
  const boton = document.getElementById('dashAplicar');
  boton.disabled = true;

  const desde = document.getElementById('dashDesde').value;
  const hasta = document.getElementById('dashHasta').value;

  const parametros = new URLSearchParams({ recurso: 'resumen' });
  if (desde) parametros.set('desde', desde);
  if (hasta) parametros.set('hasta', hasta);

  const respuesta = await apiGet('admin.php?' + parametros.toString());
  boton.disabled = false;

  if (!respuesta.exito) {
    document.getElementById('tablaRecientes').innerHTML =
      `<div class="dash-vacio"><i class="bi bi-exclamation-triangle"></i>${escapar(respuesta.mensaje || 'No se pudo cargar el resumen.')}</div>`;
    return;
  }

  const d = respuesta.datos;

  // Métricas
  document.getElementById('statVentas').textContent = moneda(d.ventas.total_vendido);
  document.getElementById('statTicket').textContent = 'Ticket promedio: ' + moneda(d.ventas.ticket_promedio);
  document.getElementById('statPedidos').textContent = d.totales.pedidos;
  document.getElementById('statPedidosPeriodo').textContent = d.ventas.total_pedidos + ' en el periodo';
  document.getElementById('statClientes').textContent = d.totales.clientes;
  document.getElementById('statClientesNuevos').textContent = (d.nuevos_en_rango.clientes || 0) + ' nuevos';
  document.getElementById('statProductos').textContent = d.totales.productos;
  document.getElementById('statOrdenes').textContent = d.totales.ordenes_medicas + ' órdenes médicas';
  document.getElementById('statCalificacion').textContent = d.atencion.calificaciones.promedio;
  document.getElementById('statCalificacionTotal').textContent = d.atencion.calificaciones.total + ' calificaciones';

  // Gráficas y tablas
  pintarVentas(d.ventas.por_dia);
  pintarEstados(d.pedidos_por_estado);
  pintarOrdenes(d.ordenes_por_estado);
  pintarCalificaciones(d.atencion.calificaciones);
  pintarRecientes(d.pedidos_recientes);
  pintarTopProductos(d.productos_top);
}

/* ===== ARRANQUE ===== */
document.addEventListener('DOMContentLoaded', async () => {
  // admin.js expone esta promesa: no pedimos datos hasta que
  // la sesión de administrador esté verificada.
  const sesion = await sesionAdminLista;
  if (!sesion) return;

  document.getElementById('dashAplicar').addEventListener('click', cargarDashboard);

  document.getElementById('dashLimpiar').addEventListener('click', () => {
    document.getElementById('dashDesde').value = '';
    document.getElementById('dashHasta').value = '';
    cargarDashboard();
  });

  cargarDashboard();
});