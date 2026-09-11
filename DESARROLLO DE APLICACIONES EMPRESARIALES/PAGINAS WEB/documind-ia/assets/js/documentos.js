// assets/js/documentos.js
// Maneja la selección de archivo, el efecto de arrastrar-y-soltar,
// y el envío automático del formulario de carga.

const zonaCarga = document.getElementById("zonaCarga");
const inputArchivo = document.getElementById("archivoInput");
const nombreElegido = document.getElementById("nombreElegido");
const formCarga = document.getElementById("formCarga");

// Cuando el usuario elige un archivo con el botón "Elegir archivo"
inputArchivo.addEventListener("change", function () {
    if (inputArchivo.files.length > 0) {
        nombreElegido.textContent = "Subiendo: " + inputArchivo.files[0].name + "...";
        formCarga.submit(); // envía el formulario automáticamente
    }
});

// Efecto visual al arrastrar un archivo sobre la zona
["dragenter", "dragover"].forEach(function (evento) {
    zonaCarga.addEventListener(evento, function (e) {
        e.preventDefault();
        zonaCarga.classList.add("arrastrando");
    });
});

["dragleave", "drop"].forEach(function (evento) {
    zonaCarga.addEventListener(evento, function (e) {
        e.preventDefault();
        zonaCarga.classList.remove("arrastrando");
    });
});

// Cuando se suelta el archivo arrastrado
zonaCarga.addEventListener("drop", function (e) {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
        inputArchivo.files = e.dataTransfer.files;
        nombreElegido.textContent = "Subiendo: " + e.dataTransfer.files[0].name + "...";
        formCarga.submit();
    }
});