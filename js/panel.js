function mostrarInfoPK(atributos) {

    const panelInfo = document.getElementById("info");

    panelInfo.innerHTML = `
        <h2>ℹ Información</h2>

        <div class="ficha-pk-panel">
            <h3>🛣 ${atributos.CARRETERA ?? "Sin carretera"}</h3>

            <p><b>PK:</b> ${atributos.PK ?? "-"}</p>
            <p><b>Sentido:</b> ${atributos.SENTIDO ?? "-"}</p>
            <p><b>Tramo:</b> ${atributos.IDCTRAMO ?? "-"}</p>
        </div>
    `;
}
