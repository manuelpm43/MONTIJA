/**
 * Muestra en el panel lateral las propiedades de un elemento seleccionado.
 * Genérico hasta diseñar una ficha específica por tipo de elemento
 * (dirección, contador, parcela catastral...).
 *
 * @param {object} atributos - Propiedades del elemento (GeoJSON properties).
 */
function mostrarInfoElemento(atributos) {

    const panelInfo = document.getElementById("info");

    const filas = Object.entries(atributos)
        .map(function ([clave, valor]) {
            return `<p><b>${clave}:</b> ${valor ?? "-"}</p>`;
        })
        .join("");

    panelInfo.innerHTML = `
        <h2>ℹ Información</h2>

        <div class="ficha-info-panel">
            ${filas}
        </div>
    `;
}
