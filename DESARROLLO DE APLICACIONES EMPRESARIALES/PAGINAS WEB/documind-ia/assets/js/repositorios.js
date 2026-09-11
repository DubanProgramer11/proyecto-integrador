// assets/js/repositorios.js
// Controla la apertura/cierre de los modales de editar y eliminar,
// llenando sus campos con los datos del repositorio seleccionado.

function abrirEditar(id, nombre, descripcion) {
    document.getElementById("idEditar").value = id;
    document.getElementById("nombreEditar").value = nombre;
    document.getElementById("descripcionEditar").value = descripcion;
    document.getElementById("modalEditar").classList.add("activo");
}

function confirmarEliminar(id, nombre) {
    document.getElementById("idEliminar").value = id;
    document.getElementById("textoEliminar").textContent =
        'Vas a eliminar "' + nombre + '" junto con todos los documentos que contenga. Esta acción no se puede deshacer.';
    document.getElementById("modalEliminar").classList.add("activo");
}

// Permite cerrar un modal haciendo clic fuera de la caja blanca
document.querySelectorAll(".modal-fondo").forEach(function (fondo) {
    fondo.addEventListener("click", function (evento) {
        if (evento.target === fondo) {
            fondo.classList.remove("activo");
        }
    });
});