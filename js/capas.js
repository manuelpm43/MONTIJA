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


/**
 * Filtra por WMS (CQL_FILTER) los contadores mostrados según el atributo
 * booleano "geoposicionado", en función de las casillas "Falso" / "Verdadero".
 */
function actualizarFiltroContadores() {

    const mostrarFalso = document.getElementById("checkContadoresFalso").checked;
    const mostrarVerdadero = document.getElementById("checkContadoresVerdadero").checked;

    let cqlFilter;

    if (mostrarFalso && mostrarVerdadero) {
        cqlFilter = "INCLUDE";
    } else if (mostrarFalso) {
        cqlFilter = "geoposicionado = false";
    } else if (mostrarVerdadero) {
        cqlFilter = "geoposicionado = true";
    } else {
        cqlFilter = "EXCLUDE";
    }

    capaContadores
        .getImpl()
        .getOL3Layer()
        .getSource()
        .updateParams({ CQL_FILTER: cqlFilter });

}


// Direcciones y contadores
enlazarCheckboxCapa("checkDirecciones", capaDirecciones);
enlazarCheckboxCapa("checkContadores", capaContadores);

document.getElementById("checkContadoresFalso").addEventListener("change", actualizarFiltroContadores);
document.getElementById("checkContadoresVerdadero").addEventListener("change", actualizarFiltroContadores);

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
