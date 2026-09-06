const inputBuscador = document.getElementById("buscador");
const panelSugerencias = document.getElementById("sugerencias");
const botonesModoBusqueda = document.querySelectorAll(".modo-busqueda");

// Campos reales de "montija:contadores_enriquecida" para cada modo de búsqueda
const CAMPO_SERIE = "Nº SERIE CONTADOR NUEVO INSTALADO";
const CAMPO_DIRECCION = "dir_completa";

let modoBusqueda = "serie";
let datosContadores = [];


/*
 * Carga de los contadores para el buscador. Se piden todas las propiedades
 * (GeoServer da error si se filtra con propertyName incluyendo el campo
 * "Nº SERIE..."; parece un problema del servidor al decodificar la "º" en
 * ese parámetro) en vez de solo los dos campos buscables.
 */
fetch(`${geoserverWfsUrl}?service=WFS&version=2.0.0&request=GetFeature&typeNames=montija:contadores_enriquecida&outputFormat=application/json&srsName=EPSG:3857`)
    .then(function (respuesta) {

        if (!respuesta.ok) {
            throw new Error(
                `No se pudo cargar el WFS: ${respuesta.status}`
            );
        }

        return respuesta.json();
    })
    .then(function (geojson) {

        datosContadores = geojson.features;

    })
    .catch(function (error) {

        console.error(
            "Error al cargar los contadores para el buscador:",
            error
        );

    });


/* Cambiar entre "Nº de serie" y "Dirección" */
botonesModoBusqueda.forEach(function (boton) {

    boton.addEventListener("click", function () {

        botonesModoBusqueda.forEach(function (b) {
            b.classList.remove("active");
        });

        boton.classList.add("active");
        modoBusqueda = boton.dataset.modo;

        inputBuscador.value = "";
        inputBuscador.placeholder = modoBusqueda === "serie"
            ? "Buscar por número de serie..."
            : "Buscar por dirección...";

        ocultarSugerencias();
        inputBuscador.focus();

    });

});


function campoBusquedaActivo() {
    return modoBusqueda === "serie" ? CAMPO_SERIE : CAMPO_DIRECCION;
}


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

    const campo = campoBusquedaActivo();

    const resultados = datosContadores
        .filter(function (contador) {

            const valor = contador.properties[campo];

            return valor && normalizarTexto(String(valor)).includes(textoBuscado);

        })
        .slice(0, 8);

    if (resultados.length === 0) {

        panelSugerencias.innerHTML = `
            <div class="sugerencia-vacia">
                No se encontraron resultados
            </div>
        `;

        mostrarSugerencias();
        return;
    }

    resultados.forEach(function (contador) {

        const elemento = document.createElement("button");

        elemento.type = "button";
        elemento.className = "sugerencia-resultado";
        elemento.textContent = contador.properties[campo];

        elemento.addEventListener("click", function () {

            seleccionarContador(contador);

        });

        panelSugerencias.appendChild(elemento);

    });

    mostrarSugerencias();

});


/* Buscar al pulsar Enter: selecciona la primera coincidencia */
inputBuscador.addEventListener("keydown", function (evento) {

    if (evento.key === "Escape") {
        ocultarSugerencias();
        return;
    }

    if (evento.key !== "Enter") {
        return;
    }

    const textoBuscado = normalizarTexto(
        inputBuscador.value
    );

    if (textoBuscado === "") {
        return;
    }

    const campo = campoBusquedaActivo();

    const contadorEncontrado = datosContadores.find(
        function (contador) {

            const valor = contador.properties[campo];

            return valor && normalizarTexto(String(valor)).includes(textoBuscado);

        }
    );

    if (!contadorEncontrado) {
        alert("No se ha encontrado ningún contador con ese criterio.");
        return;
    }

    seleccionarContador(contadorEncontrado);

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


function seleccionarContador(contador) {

    const coordenadas = contador.geometry.coordinates;

    mapa.setCenter(coordenadas);
    mapa.setZoom(18);

    inputBuscador.value = contador.properties[campoBusquedaActivo()];
    ocultarSugerencias();

    mostrarInfoElemento(contador.properties);

}


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
