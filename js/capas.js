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


// TODO: crear las capas (direcciones, contadores, catastro, cartografía base)
// y enlazar cada checkbox del árbol de capas (index.html) con su capa
// mediante cambiarVisibilidadCapa, quitando el atributo "disabled" del input.
