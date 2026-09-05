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
        layers: [
            "WMTS*https://www.ign.es/wmts/pnoa-ma?*OI.OrthoimageCoverage*GoogleMapsCompatible*imagen*false*image/jpeg*false*false*true"
        ]
    },
    {
        id: "hibrido",
        title: "Híbrido",
        layers: [
            "WMTS*https://www.ign.es/wmts/pnoa-ma?*OI.OrthoimageCoverage*GoogleMapsCompatible*imagen*true*image/jpeg*false*false*true",
            "WMTS*https://www.ign.es/wmts/ign-base?*IGNBaseOrto*GoogleMapsCompatible*Callejero*true*image/png*false*false*true"
        ]
    }
]);

const mapa = IDEE.map({
    container: 'mapa',
    controls: ['panzoom', 'scale*true', 'scaleline', 'rotate', 'location', 'backgroundlayers'],
    zoom: 13,
    center: [-387870.19, 5321610.48]
});
console.log(mapa);

// Servicios GeoServer del proyecto MONTIJA (workspace "montija")
const geoserverWmsUrl = "http://217.71.202.62:8080/geoserver/montija/wms";
const geoserverWfsUrl = "http://217.71.202.62:8080/geoserver/montija/ows";

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

mapa.on("click", function (evento) {

    const coordenadas = evento.coord;
    const resolucion = evento.vendor.map.getView().getResolution();

    // TODO: consultar por WFS el elemento (dirección / contador / parcela)
    // más cercano a las coordenadas del click y mostrar su ficha en el panel.

});
