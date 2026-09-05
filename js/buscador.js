const inputBuscador = document.getElementById("buscador");
const panelSugerencias = document.getElementById("sugerencias");

let datosBuscador = [];

// TODO: cargar y unificar aquí los datos buscables una vez estén
// diseñadas las capas (direcciones, contadores, catastro).


/* Mostrar sugerencias mientras se escribe */
inputBuscador.addEventListener("input", function () {

    const textoBuscado = normalizarTexto(
        inputBuscador.value
    );

    panelSugerencias.innerHTML = "";

    if (textoBuscado === "") {
        ocultarSugerencias();
        return;
    }

    // TODO: filtrar datosBuscador según el texto introducido
    // y renderizar las sugerencias resultantes.

});


/* Buscar al pulsar Enter */
inputBuscador.addEventListener("keydown", function (evento) {

    if (evento.key === "Escape") {
        ocultarSugerencias();
        return;
    }

    if (evento.key !== "Enter") {
        return;
    }

    // TODO: buscar el elemento que coincida con el texto introducido.

});


/* Cerrar sugerencias al pulsar fuera */
document.addEventListener("click", function (evento) {

    const contenedor = document.querySelector(
        ".contenedor-buscador"
    );

    if (!contenedor.contains(evento.target)) {
        ocultarSugerencias();
    }

});


function mostrarSugerencias() {
    panelSugerencias.classList.add("visible");
}


function ocultarSugerencias() {
    panelSugerencias.classList.remove("visible");
}


function normalizarTexto(texto) {

    return texto
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}
