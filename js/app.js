IDEE.config("backgroundlayers", [
    {
        id: "cartografia",
        title: "Carto",
        layers: [
            "WMTS*https://www.ign.es/wmts/ign-base?*IGNBaseTodo*GoogleMapsCompatible*Callejero*false*image/png*false*false*true"
        ]
    },
    {
        id: "ortofoto",
        title: "Ortofoto",
        // PNOA de un año concreto (2023, el más reciente con cobertura completa
        // de Castilla y León) en vez de "pnoa-ma" (Máxima Actualidad): esta última
        // mezcla vuelos de años distintos por zona y deja costuras visibles en
        // los límites entre campañas.
        layers: [
            "WMS*PNOA 2023*https://www.ign.es/wms/pnoa-historico?*PNOA2023*false*true**1.3.0*true*false*true"
        ]
    },
    {
        id: "hibrido",
        title: "Híbrido",
        layers: [
            "WMS*PNOA 2023*https://www.ign.es/wms/pnoa-historico?*PNOA2023*true*true**1.3.0*true*false*true",
            "WMTS*https://www.ign.es/wmts/ign-base?*IGNBaseOrto*GoogleMapsCompatible*Callejero*true*image/png*false*false*true"
        ]
    }
]);

const mapa = IDEE.map({
    container: 'mapa',
    controls: ['panzoom', 'scale*true', 'scaleline', 'rotate', 'location', 'backgroundlayers*2*true'],
    zoom: 13,
    center: [-387870.19, 5321610.48]
});
console.log(mapa);

// Servicios GeoServer del proyecto MONTIJA (workspace "montija")
const geoserverWmsUrl = "https://geoserver.geospatiallab.xyz/geoserver/montija/wms";
const geoserverWfsUrl = "https://geoserver.geospatiallab.xyz/geoserver/montija/ows";

// Cartografía base
const capaMunicipio = new IDEE.layer.WMS({
    url: geoserverWmsUrl,
    name: "montija:nunicipio_merindad_de_montija",
    legend: "Municipio",
    useCapabilities: false
}, {
    crossOrigin: null,
    visibility: true
});

const capaNucleos = new IDEE.layer.WMS({
    url: geoserverWmsUrl,
    name: "montija:nucleos_merindad_de_montija",
    legend: "Núcleos",
    useCapabilities: false
}, {
    crossOrigin: null,
    visibility: true
});

// Catastro 09219 - Merindad de Montija
const capaCadastralParcel = new IDEE.layer.WMS({
    url: geoserverWmsUrl,
    name: "montija:a_es_sdgc_cp_09219_cadastralparcel",
    legend: "Parcela catastral",
    useCapabilities: false
}, {
    crossOrigin: null,
    visibility: false
});

const capaOtherConstruction = new IDEE.layer.WMS({
    url: geoserverWmsUrl,
    name: "montija:a_es_sdgc_bu_09219_otherconstruction",
    legend: "Otras construcciones",
    useCapabilities: false
}, {
    crossOrigin: null,
    visibility: false
});

const capaBuilding = new IDEE.layer.WMS({
    url: geoserverWmsUrl,
    name: "montija:a_es_sdgc_bu_09219_building",
    legend: "Edificio",
    useCapabilities: false
}, {
    crossOrigin: null,
    visibility: false
});

const capaBuildingPart = new IDEE.layer.WMS({
    url: geoserverWmsUrl,
    name: "montija:a_es_sdgc_bu_09219_buildingpart",
    legend: "Parte de edificio",
    useCapabilities: false
}, {
    crossOrigin: null,
    visibility: false
});

// Direcciones y contadores
const capaDirecciones = new IDEE.layer.WMS({
    url: geoserverWmsUrl,
    name: "montija:ign_direcciones",
    legend: "Direcciones (IGN)",
    useCapabilities: false
}, {
    crossOrigin: null,
    visibility: false
});

const capaContadores = new IDEE.layer.WMS({
    url: geoserverWmsUrl,
    name: "montija:contadores_enriquecida",
    legend: "Montija EPC (enriquecida)",
    useCapabilities: false
}, {
    crossOrigin: null,
    visibility: false
});

// Orden de apilado: base abajo, catastro en medio (parcela -> ... -> building part),
// direcciones y contadores arriba del todo.
mapa.addLayers([
    capaMunicipio,
    capaNucleos,
    capaCadastralParcel,
    capaOtherConstruction,
    capaBuilding,
    capaBuildingPart,
    capaDirecciones,
    capaContadores
]);

// Al abrir el visor, encuadrar sobre la extensión real de los contadores
// (se calcula a partir de los datos vivos, no de un valor fijo, para no
// quedar desactualizado según se añadan o quiten contadores).
fetch(`${geoserverWfsUrl}?service=WFS&version=2.0.0&request=GetFeature&typeNames=montija:contadores_enriquecida&outputFormat=application/json&srsName=EPSG:3857&propertyName=geom`)
    .then(function (respuesta) {

        if (!respuesta.ok) {
            throw new Error(
                `No se pudo consultar el WFS: ${respuesta.status}`
            );
        }

        return respuesta.json();
    })
    .then(function (geojson) {

        const extension = extensionDeFeatures(geojson.features);

        if (extension) {
            mapa.setBbox(extension);
        }

    })
    .catch(function (error) {

        console.error("No se pudo encuadrar sobre los contadores:", error);

    });


/**
 * Calcula el bbox [minX, minY, maxX, maxY] que envuelve las geometrías
 * puntuales de una colección de features GeoJSON.
 *
 * @param {Array<object>} features - Features GeoJSON con geometry.type "Point".
 * @returns {Array<number>|null} Extensión [minX, minY, maxX, maxY], o null si no hay features.
 */
function extensionDeFeatures(features) {

    if (!features || features.length === 0) {
        return null;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    features.forEach(function (feature) {

        const [x, y] = feature.geometry.coordinates;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);

    });

    return [minX, minY, maxX, maxY];

}

// Capa que marca el elemento localizado (por click o por buscador), para
// distinguirlo del resto de puntos de alrededor.
const capaResaltado = new IDEE.layer.Vector({
    name: "resaltado",
    extract: false
});
mapa.addLayers(capaResaltado);

const estiloResaltado = new IDEE.style.Point({
    radius: 14,
    fill: {
        color: "#ffcc00",
        opacity: 0.35
    },
    stroke: {
        color: "#ff6600",
        width: 3
    }
});


/**
 * Marca sobre el mapa el elemento localizado en unas coordenadas,
 * sustituyendo cualquier marca anterior.
 *
 * @param {Array<number>} coordenadas - Coordenadas en la proyección del mapa.
 */
function resaltarElemento(coordenadas) {

    capaResaltado.removeFeatures(capaResaltado.getFeatures());

    const feature = new IDEE.Feature("resaltado", {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: coordenadas
        },
        properties: {}
    });

    feature.setStyle(estiloResaltado);

    capaResaltado.addFeatures([feature]);

}


mapa.on("click", function (evento) {

    const coordenadas = evento.coord;
    const resolucion = evento.vendor.map.getView().getResolution();

    if (document.getElementById("checkContadores").checked) {
        consultarContadores(coordenadas, resolucion);
    }

    // TODO: extender la consulta al resto de capas (direcciones, catastro)
    // cuando también deban responder al click.

});


/**
 * Consulta por WFS el contador más cercano a unas coordenadas,
 * dentro de una tolerancia en píxeles, y muestra su ficha en la ventana emergente.
 *
 * @param {Array<number>} coordenadas - Coordenadas del click, en la proyección del mapa.
 * @param {number} resolucion - Resolución actual del mapa (unidades de mapa por píxel).
 */
function consultarContadores(coordenadas, resolucion) {

    const toleranciaPixeles = 6;
    const buffer = resolucion * toleranciaPixeles;

    const bbox = [
        coordenadas[0] - buffer,
        coordenadas[1] - buffer,
        coordenadas[0] + buffer,
        coordenadas[1] + buffer
    ].join(",");

    const url = `${geoserverWfsUrl}?service=WFS&version=2.0.0&request=GetFeature&typeNames=montija:contadores_enriquecida&outputFormat=application/json&srsName=EPSG:3857&bbox=${bbox},EPSG:3857`;

    fetch(url)
        .then(function (respuesta) {

            if (!respuesta.ok) {
                throw new Error(
                    `No se pudo consultar el WFS: ${respuesta.status}`
                );
            }

            return respuesta.json();
        })
        .then(function (geojson) {

            if (geojson.features.length === 0) {
                console.log("No hay ningún contador en este punto");
                return;
            }

            const featureMasCercana = featureMasCercanaA(
                coordenadas,
                geojson.features
            );

            // Varios contadores pueden compartir el mismo punto (p.ej. un
            // bloque de pisos con un contador por vivienda): se agrupan los
            // que estén casi en la misma posición que el más cercano al
            // click, en vez de quedarnos solo con uno.
            const DISTANCIA_MISMO_PUNTO = 2;

            const elementosCoincidentes = geojson.features.filter(function (feature) {
                return distanciaEntrePuntos(
                    featureMasCercana.geometry.coordinates,
                    feature.geometry.coordinates
                ) <= DISTANCIA_MISMO_PUNTO;
            });

            resaltarElemento(featureMasCercana.geometry.coordinates);

            if (elementosCoincidentes.length > 1) {
                mostrarSelectorElementos(elementosCoincidentes);
            } else {
                mostrarInfoElemento(featureMasCercana.properties);
            }

        })
        .catch(function (error) {

            console.error("Error al consultar el contador:", error);

        });

}


function featureMasCercanaA(coordenadas, features) {

    return features.reduce(function (masCercana, actual) {

        const distanciaActual = distanciaEntrePuntos(
            coordenadas,
            actual.geometry.coordinates
        );

        const distanciaMasCercana = distanciaEntrePuntos(
            coordenadas,
            masCercana.geometry.coordinates
        );

        return distanciaActual < distanciaMasCercana ? actual : masCercana;

    });

}


function distanciaEntrePuntos(a, b) {

    const dx = a[0] - b[0];
    const dy = a[1] - b[1];

    return Math.sqrt(dx * dx + dy * dy);

}
