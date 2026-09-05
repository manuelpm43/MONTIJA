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
    zoom: 5,
    center: [-467062.8225, 4983459.6216]
});
console.log(mapa);

// Servicio GeoServer del proyecto MONTIJA
const geoserverWfsUrl = "http://217.71.202.62:8080/geoserver/montija/ows";

// TODO: capas pendientes de diseño e implementación
// - IGN_direcciones (WFS)
// - Montija EPC - contadores enriquecida
// - Catastro 09219 Merindad de Montija: building part, building, other construction, cadastral parcel
// - Cartografía base: núcleos, municipios, ortofoto

mapa.on("click", function (evento) {

    const coordenadas = evento.coord;
    const resolucion = evento.vendor.map.getView().getResolution();

    // TODO: consultar por WFS el elemento (dirección / contador / parcela)
    // más cercano a las coordenadas del click y mostrar su ficha en el panel.

});
