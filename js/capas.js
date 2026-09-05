/**
 * Activa o desactiva una capa API-IDEE.
 *
 * @param {object} capa - Capa creada con API-IDEE.
 * @param {boolean} visible - Estado de visibilidad.
 */
function cambiarVisibilidadCapa(capa, visible) {

    if (!capa) {
        console.error("La capa indicada no existe.");
        return;
    }

    const capaOpenLayers = capa
        .getImpl()
        .getOL3Layer();

    capaOpenLayers.setVisible(visible);
}


function enlazarCheckboxCapa(idCheckbox, capa) {

    const checkbox = document.getElementById(idCheckbox);

    checkbox.addEventListener("change", function () {
        cambiarVisibilidadCapa(capa, checkbox.checked);
    });

}


// Direcciones y contadores
enlazarCheckboxCapa("checkDirecciones", capaDirecciones);
enlazarCheckboxCapa("checkContadores", capaContadores);

// Catastro 09219 - Merindad de Montija
enlazarCheckboxCapa("checkBuildingPart", capaBuildingPart);
enlazarCheckboxCapa("checkBuilding", capaBuilding);
enlazarCheckboxCapa("checkOtherConstruction", capaOtherConstruction);
enlazarCheckboxCapa("checkCadastralParcel", capaCadastralParcel);

// Cartografía base
enlazarCheckboxCapa("checkNucleos", capaNucleos);
enlazarCheckboxCapa("checkMunicipios", capaMunicipio);

// La ortofoto no es una capa WMS del workspace montija: ya está disponible
// mediante el selector de fondos del mapa (control "backgroundlayers").
