const inputBuscador = document.getElementById("buscador");
const panelSugerencias = document.getElementById("sugerencias");

let datosPK = [];


/* Carga de datos para el buscador (coordenadas ya reproyectadas a EPSG:3857) */
fetch(`${geoserverWfsUrl}?service=WFS&version=2.0.0&request=GetFeature&typeNames=bidelan:pk_v0&outputFormat=application/json&srsName=EPSG:3857`)
    .then(function (respuesta) {

        if (!respuesta.ok) {
            throw new Error(
                `No se pudo cargar el WFS: ${respuesta.status}`
            );
        }

        return respuesta.json();
    })
    .then(function (geojson) {

        datosPK = geojson.features;

        console.log(
            "Puntos kilométricos disponibles en el buscador:",
            datosPK
        );

    })
    .catch(function (error) {

        console.error(
            "Error al cargar los puntos kilométricos:",
            error
        );

    });


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

    const resultados = datosPK
        .filter(function (tramo) {

            const etiqueta = normalizarTexto(
                textoEtiquetaTramo(tramo.properties)
            );

            return etiqueta.includes(textoBuscado);

        })
        .slice(0, 8);

    if (resultados.length === 0) {

        panelSugerencias.innerHTML = `
            <div class="sugerencia-vacia">
                No se encontraron puntos kilométricos
            </div>
        `;

        mostrarSugerencias();
        return;
    }

    resultados.forEach(function (tramo) {

        const elemento = document.createElement("button");

        elemento.type = "button";
        elemento.className = "sugerencia-pk";
        elemento.textContent = textoEtiquetaTramo(tramo.properties);

        elemento.addEventListener("click", function () {

            seleccionarTramo(tramo);

        });

        panelSugerencias.appendChild(elemento);

    });

    mostrarSugerencias();

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

    const textoBuscado = normalizarTexto(
        inputBuscador.value
    );

    if (textoBuscado === "") {
        return;
    }

    const tramoEncontrado = datosPK.find(
        function (tramo) {

            const etiqueta = normalizarTexto(
                textoEtiquetaTramo(tramo.properties)
            );

            return etiqueta.includes(textoBuscado);

        }
    );

    if (!tramoEncontrado) {
        alert(
            "No se ha encontrado ningún punto kilométrico con ese criterio."
        );
        return;
    }

    seleccionarTramo(tramoEncontrado);

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


function seleccionarTramo(tramo) {

    const atributos = tramo.properties;

    const coordenadas = tramo.geometry.coordinates;

    mapa.setCenter(coordenadas);
    mapa.setZoom(16);

    mostrarInfoPK(atributos);

    inputBuscador.value = textoEtiquetaTramo(atributos);

    ocultarSugerencias();

}


function textoEtiquetaTramo(atributos) {

    return `${atributos.CARRETERA ?? "?"} · PK ${atributos.PK ?? "?"}`;

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
