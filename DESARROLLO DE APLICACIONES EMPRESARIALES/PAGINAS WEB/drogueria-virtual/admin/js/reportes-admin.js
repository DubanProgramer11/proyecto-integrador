// ============================================================
// ARCHIVO: admin/js/reportes-admin.js
// Reportes mensuales con exportación a PDF y CSV.
//
// No necesita backend nuevo: reutiliza admin.php?recurso=resumen
// y admin.php?recurso=pedidos, que ya aceptan rango de fechas.
// ============================================================

/* ===== DATOS DE LA EMPRESA (cabecera del PDF) ===== */
const EMPRESA = {
  nombre:    'VitalFarma',
  eslogan:   'Droguería virtual de confianza',
  nit:       'NIT 901.234.567-8',
  direccion: 'Calle 45 # 12-30, Bucaramanga, Santander',
  telefono:  '+57 300 000 0000',
  correo:    'info@vitalfarma.com',
  web:       'www.vitalfarma.com'
};

const COLOR_PRIMARIO = [11, 122, 117];   // #0B7A75
const COLOR_TEXTO    = [31, 41, 55];
const COLOR_SUAVE    = [107, 114, 128];

let datosReporte = null;
let pedidosReporte = [];

/* ===== UTILIDADES ===== */
function moneda(valor) {
  return '$ ' + Number(valor || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

function fechaCorta(valor) {
  return new Date(valor).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fechaLarga(valor) {
  return new Date(valor).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

function aIso(fecha) {
  // toISOString usa UTC y en Colombia adelanta un día. Se arma a mano.
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

const ESTADOS = {
  pendiente:  'Pendiente',
  confirmado: 'Confirmado',
  en_camino:  'En camino',
  entregado:  'Entregado',
  cancelado:  'Cancelado'
};

/* ===== ATAJOS DE PERIODO ===== */
function aplicarAtajo(meses) {
  const hoy = new Date();
  let desde, hasta;

  if (meses === 0) {
    // Del primero del mes actual hasta hoy
    desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    hasta = hoy;
  } else if (meses === 1) {
    // Mes calendario anterior completo
    desde = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    hasta = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
  } else {
    desde = new Date(hoy.getFullYear(), hoy.getMonth() - (meses - 1), 1);
    hasta = hoy;
  }

  document.getElementById('repDesde').value = aIso(desde);
  document.getElementById('repHasta').value = aIso(hasta);
}

/* ===== CARGA DE DATOS ===== */
async function cargarDatos() {
  const previa = document.getElementById('repPrevia');
  previa.innerHTML = `<div class="dash-cargando"><span class="dash-spinner"></span> Cargando datos...</div>`;

  const desde = document.getElementById('repDesde').value;
  const hasta = document.getElementById('repHasta').value;

  const p = new URLSearchParams({ recurso: 'resumen' });
  if (desde) p.set('desde', desde);
  if (hasta) p.set('hasta', hasta);

  const pPedidos = new URLSearchParams({ recurso: 'pedidos' });
  if (desde) pPedidos.set('desde', desde);
  if (hasta) pPedidos.set('hasta', hasta);

  // Las dos peticiones a la vez: más rápido que una tras otra
  const [resumen, pedidos] = await Promise.all([
    apiGet('admin.php?' + p.toString()),
    apiGet('admin.php?' + pPedidos.toString())
  ]);

  if (!resumen.exito) {
    previa.innerHTML = `<div class="rep-vacio"><i class="bi bi-exclamation-triangle"></i>
      ${escaparHtml(resumen.mensaje || 'No se pudieron cargar los datos.')}</div>`;
    return;
  }

  datosReporte = resumen.datos;
  pedidosReporte = pedidos.exito ? pedidos.datos : [];

  pintarPrevia();
}

/* ===== VISTA PREVIA ===== */
function textoPeriodo() {
  const desde = document.getElementById('repDesde').value;
  const hasta = document.getElementById('repHasta').value;

  if (!desde && !hasta) return 'Histórico completo';
  if (desde && hasta) return `Del ${fechaLarga(desde + 'T12:00')} al ${fechaLarga(hasta + 'T12:00')}`;
  if (desde) return `Desde el ${fechaLarga(desde + 'T12:00')}`;
  return `Hasta el ${fechaLarga(hasta + 'T12:00')}`;
}

function pintarPrevia() {
  const d = datosReporte;
  const previa = document.getElementById('repPrevia');

  let html = `
    <div class="rep-previa__titulo">Reporte de operación — ${EMPRESA.nombre}</div>
    <div class="rep-previa__periodo">${textoPeriodo()}</div>

    <div class="rep-kpis">
      <div class="rep-kpi">
        <div class="rep-kpi__etiqueta">Ventas del periodo</div>
        <div class="rep-kpi__valor">${moneda(d.ventas.total_vendido)}</div>
      </div>
      <div class="rep-kpi">
        <div class="rep-kpi__etiqueta">Pedidos</div>
        <div class="rep-kpi__valor">${d.ventas.total_pedidos}</div>
      </div>
      <div class="rep-kpi">
        <div class="rep-kpi__etiqueta">Ticket promedio</div>
        <div class="rep-kpi__valor">${moneda(d.ventas.ticket_promedio)}</div>
      </div>
      <div class="rep-kpi">
        <div class="rep-kpi__etiqueta">Clientes nuevos</div>
        <div class="rep-kpi__valor">${d.nuevos_en_rango.clientes || 0}</div>
      </div>
    </div>`;

  // Ventas por día
  if (d.ventas.por_dia && d.ventas.por_dia.length > 0) {
    html += `
      <div class="rep-bloque">
        <div class="rep-bloque__titulo"><i class="bi bi-graph-up"></i> Ventas por día</div>
        <div class="admin-tabla-wrapper">
          <table class="admin-tabla">
            <thead><tr><th>Fecha</th><th>Pedidos</th><th style="text-align:right;">Monto</th></tr></thead>
            <tbody>
              ${d.ventas.por_dia.map(v => `
                <tr>
                  <td>${fechaCorta(v.dia)}</td>
                  <td>${v.pedidos}</td>
                  <td style="text-align:right; font-weight:600;">${moneda(v.monto)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  // Productos más vendidos
  if (d.productos_top && d.productos_top.length > 0) {
    html += `
      <div class="rep-bloque">
        <div class="rep-bloque__titulo"><i class="bi bi-trophy"></i> Productos más vendidos</div>
        <div class="admin-tabla-wrapper">
          <table class="admin-tabla">
            <thead><tr><th>#</th><th>Producto</th><th>Unidades</th><th style="text-align:right;">Ingresos</th></tr></thead>
            <tbody>
              ${d.productos_top.map((p, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${escaparHtml(p.nombre)}</td>
                  <td>${p.unidades}</td>
                  <td style="text-align:right; font-weight:600;">${moneda(p.ingresos)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  // Detalle de pedidos
  if (pedidosReporte.length > 0) {
    html += `
      <div class="rep-bloque">
        <div class="rep-bloque__titulo"><i class="bi bi-receipt"></i> Detalle de pedidos (${pedidosReporte.length})</div>
        <div class="admin-tabla-wrapper" style="max-height:340px; overflow-y:auto;">
          <table class="admin-tabla">
            <thead><tr><th>#</th><th>Cliente</th><th>Fecha</th><th>Estado</th><th style="text-align:right;">Total</th></tr></thead>
            <tbody>
              ${pedidosReporte.map(p => `
                <tr>
                  <td><strong>${p.id}</strong></td>
                  <td>${escaparHtml(p.cliente_nombre)}</td>
                  <td>${fechaCorta(p.fecha_pedido)}</td>
                  <td>${ESTADOS[p.estado] || p.estado}</td>
                  <td style="text-align:right; font-weight:600;">${moneda(p.total)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  } else {
    html += `<div class="rep-vacio"><i class="bi bi-inbox"></i>No hay pedidos en este periodo.</div>`;
  }

  previa.innerHTML = html;
}

/* ============================================================
   GENERACIÓN DEL PDF
   ============================================================ */

/** Cabecera con logo dibujado: no depende de ningún archivo de imagen. */
function cabeceraPDF(doc, ancho) {
  doc.setFillColor(...COLOR_PRIMARIO);
  doc.rect(0, 0, ancho, 34, 'F');

  // Cuadro del logo
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 8, 18, 18, 4, 4, 'F');

  // Cruz médica dentro del cuadro
  doc.setFillColor(...COLOR_PRIMARIO);
  doc.rect(21.4, 11.5, 3.2, 11, 'F');
  doc.rect(17.5, 15.4, 11, 3.2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(EMPRESA.nombre, 38, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(EMPRESA.eslogan, 38, 23);

  // Datos de la empresa, alineados a la derecha
  doc.setFontSize(7.5);
  const derecha = ancho - 14;
  doc.text(EMPRESA.nit, derecha, 12, { align: 'right' });
  doc.text(EMPRESA.direccion, derecha, 16.5, { align: 'right' });
  doc.text(`${EMPRESA.telefono}  |  ${EMPRESA.correo}`, derecha, 21, { align: 'right' });
  doc.text(EMPRESA.web, derecha, 25.5, { align: 'right' });
}

function tituloBloquePDF(doc, texto, y) {
  doc.setFillColor(...COLOR_PRIMARIO);
  doc.rect(14, y - 4, 3, 5, 'F');
  doc.setTextColor(...COLOR_TEXTO);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(texto, 20, y);
  return y + 6;
}

function pieDePagina(doc, ancho, alto) {
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 223, 228);
    doc.line(14, alto - 14, ancho - 14, alto - 14);
    doc.setTextColor(...COLOR_SUAVE);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`${EMPRESA.nombre} — Documento generado automáticamente`, 14, alto - 9);
    doc.text(`Página ${i} de ${total}`, ancho - 14, alto - 9, { align: 'right' });
  }
}

async function generarPDF() {
  if (!datosReporte) {
    alert('Primero carga los datos con "Actualizar vista previa".');
    return;
  }

  const boton = document.getElementById('repGenerar');
  boton.disabled = true;
  boton.innerHTML = '<i class="bi bi-hourglass-split"></i> Generando...';

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const ancho = doc.internal.pageSize.getWidth();
    const alto = doc.internal.pageSize.getHeight();
    const d = datosReporte;

    cabeceraPDF(doc, ancho);

    // Título del documento
    let y = 46;
    doc.setTextColor(...COLOR_TEXTO);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('Reporte de operación', 14, y);

    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_SUAVE);
    doc.text(textoPeriodo(), 14, y);

    y += 4.5;
    doc.text('Generado el ' + fechaLarga(new Date()) + ' por ' + (sesionAdminActual?.nombre || 'administrador'), 14, y);

    y += 10;

    /* ---- Resumen ejecutivo ---- */
    if (document.getElementById('secResumen').checked) {
      y = tituloBloquePDF(doc, 'Resumen ejecutivo', y);

      doc.autoTable({
        startY: y,
        head: [['Indicador', 'Valor']],
        body: [
          ['Ventas del periodo', moneda(d.ventas.total_vendido)],
          ['Pedidos del periodo', String(d.ventas.total_pedidos)],
          ['Ticket promedio', moneda(d.ventas.ticket_promedio)],
          ['Clientes nuevos', String(d.nuevos_en_rango.clientes || 0)],
          ['Órdenes médicas cargadas', String(d.nuevos_en_rango.ordenes_medicas || 0)],
          ['Total de clientes registrados', String(d.totales.clientes)],
          ['Productos en catálogo', String(d.totales.productos)],
          ['Calificación promedio', d.atencion.calificaciones.promedio + ' / 5']
        ],
        theme: 'striped',
        headStyles: { fillColor: COLOR_PRIMARIO, fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
        margin: { left: 14, right: 14 }
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    /* ---- Ventas por día ---- */
    if (document.getElementById('secVentas').checked && d.ventas.por_dia?.length) {
      if (y > alto - 60) { doc.addPage(); y = 20; }
      y = tituloBloquePDF(doc, 'Ventas por día', y);

      const totalMonto = d.ventas.por_dia.reduce((s, v) => s + Number(v.monto), 0);
      const totalPedidos = d.ventas.por_dia.reduce((s, v) => s + Number(v.pedidos), 0);

      doc.autoTable({
        startY: y,
        head: [['Fecha', 'Pedidos', 'Monto']],
        body: d.ventas.por_dia.map(v => [fechaCorta(v.dia), String(v.pedidos), moneda(v.monto)]),
        foot: [['TOTAL', String(totalPedidos), moneda(totalMonto)]],
        theme: 'striped',
        headStyles: { fillColor: COLOR_PRIMARIO, fontSize: 9 },
        footStyles: { fillColor: [240, 242, 245], textColor: COLOR_TEXTO, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' } },
        margin: { left: 14, right: 14 }
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    /* ---- Pedidos por estado ---- */
    if (document.getElementById('secEstados').checked && d.pedidos_por_estado?.length) {
      if (y > alto - 60) { doc.addPage(); y = 20; }
      y = tituloBloquePDF(doc, 'Pedidos por estado', y);

      const total = d.pedidos_por_estado.reduce((s, e) => s + Number(e.total), 0);

      doc.autoTable({
        startY: y,
        head: [['Estado', 'Cantidad', 'Participación']],
        body: d.pedidos_por_estado.map(e => [
          ESTADOS[e.estado] || e.estado,
          String(e.total),
          total ? ((e.total / total) * 100).toFixed(1) + ' %' : '0 %'
        ]),
        theme: 'striped',
        headStyles: { fillColor: COLOR_PRIMARIO, fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' } },
        margin: { left: 14, right: 14 }
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    /* ---- Productos más vendidos ---- */
    if (document.getElementById('secProductos').checked && d.productos_top?.length) {
      if (y > alto - 60) { doc.addPage(); y = 20; }
      y = tituloBloquePDF(doc, 'Productos más vendidos', y);

      doc.autoTable({
        startY: y,
        head: [['#', 'Producto', 'Unidades', 'Ingresos']],
        body: d.productos_top.map((p, i) => [String(i + 1), p.nombre, String(p.unidades), moneda(p.ingresos)]),
        theme: 'striped',
        headStyles: { fillColor: COLOR_PRIMARIO, fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' } },
        margin: { left: 14, right: 14 }
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    /* ---- Detalle de pedidos ---- */
    if (document.getElementById('secPedidos').checked && pedidosReporte.length) {
      if (y > alto - 60) { doc.addPage(); y = 20; }
      y = tituloBloquePDF(doc, `Detalle de pedidos (${pedidosReporte.length})`, y);

      const totalPedidos = pedidosReporte
        .filter(p => p.estado !== 'cancelado')
        .reduce((s, p) => s + Number(p.total), 0);

      doc.autoTable({
        startY: y,
        head: [['#', 'Cliente', 'Ciudad', 'Fecha', 'Estado', 'Total']],
        body: pedidosReporte.map(p => [
          String(p.id),
          p.cliente_nombre || '',
          p.ciudad || '—',
          fechaCorta(p.fecha_pedido),
          ESTADOS[p.estado] || p.estado,
          moneda(p.total)
        ]),
        foot: [['', '', '', '', 'TOTAL (sin cancelados)', moneda(totalPedidos)]],
        theme: 'striped',
        headStyles: { fillColor: COLOR_PRIMARIO, fontSize: 8.5 },
        footStyles: { fillColor: [240, 242, 245], textColor: COLOR_TEXTO, fontStyle: 'bold', fontSize: 8.5 },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          3: { cellWidth: 22 },
          5: { halign: 'right' }
        },
        margin: { left: 14, right: 14 }
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    /* ---- Atención al cliente ---- */
    if (document.getElementById('secAtencion').checked) {
      if (y > alto - 60) { doc.addPage(); y = 20; }
      y = tituloBloquePDF(doc, 'Atención al cliente', y);

      const cal = d.atencion.calificaciones;
      const cuerpo = [
        ['Calificación promedio', cal.promedio + ' / 5'],
        ['Total de calificaciones', String(cal.total)],
        ['Comentarios sin revisar', String(d.atencion.comentarios_pendientes)],
        ['Conversaciones del chatbot', String(d.totales.conversaciones)]
      ];

      ['Excelente', 'Buena', 'Regular', 'Mala'].forEach(nivel => {
        cuerpo.push([`Clasificación "${nivel}"`, (cal.porcentajes[nivel] || 0) + ' %']);
      });

      doc.autoTable({
        startY: y,
        head: [['Indicador', 'Valor']],
        body: cuerpo,
        theme: 'striped',
        headStyles: { fillColor: COLOR_PRIMARIO, fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
        margin: { left: 14, right: 14 }
      });
    }

    pieDePagina(doc, ancho, alto);

    const desde = document.getElementById('repDesde').value || 'inicio';
    const hasta = document.getElementById('repHasta').value || 'hoy';
    doc.save(`VitalFarma_Reporte_${desde}_a_${hasta}.pdf`);

  } catch (error) {
    console.error('Error generando el PDF:', error);
    alert('No se pudo generar el PDF. Revisa la consola para más detalle.');
  } finally {
    boton.disabled = false;
    boton.innerHTML = '<i class="bi bi-file-earmark-pdf"></i> Descargar PDF';
  }
}

/* ===== EXPORTAR A CSV ===== */
function exportarCsv() {
  if (pedidosReporte.length === 0) {
    alert('No hay pedidos en este periodo para exportar.');
    return;
  }

  const filas = [['ID', 'Cliente', 'Correo', 'Ciudad', 'Fecha', 'Estado', 'Subtotal', 'Domicilio', 'Total']];

  pedidosReporte.forEach(p => {
    filas.push([
      p.id, p.cliente_nombre || '', p.cliente_email || '', p.ciudad || '',
      fechaCorta(p.fecha_pedido), ESTADOS[p.estado] || p.estado,
      p.subtotal, p.costo_domicilio, p.total
    ]);
  });

  // Punto y coma: Excel en español no separa bien con comas.
  const csv = filas.map(f =>
    f.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')
  ).join('\n');

  // BOM para que Excel respete las tildes
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = `VitalFarma_Pedidos_${document.getElementById('repDesde').value || 'todo'}.csv`;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

/* ===== ARRANQUE ===== */
document.addEventListener('DOMContentLoaded', async () => {
  const sesion = await sesionAdminLista;
  if (!sesion) return;

  aplicarAtajo(0); // arranca con el mes en curso

  document.querySelectorAll('.rep-atajo').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rep-atajo').forEach(b => b.classList.remove('rep-atajo--activo'));
      btn.classList.add('rep-atajo--activo');
      aplicarAtajo(Number(btn.dataset.meses));
      cargarDatos();
    });
  });

  document.getElementById('repActualizar').addEventListener('click', cargarDatos);
  document.getElementById('repGenerar').addEventListener('click', generarPDF);
  document.getElementById('repCsv').addEventListener('click', exportarCsv);

  cargarDatos();
});