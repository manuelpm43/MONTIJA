const overlayFicha = document.getElementById("overlayFicha");
const btnCerrarFicha = document.getElementById("btnCerrarFicha");
const contenidoFicha = document.getElementById("contenidoFicha");
const popupFicha = document.querySelector(".popup-ficha");
const cabeceraFicha = document.querySelector(".cabecera-ficha");


// Agrupación de los campos de "montija:contadores_enriquecida" en las
// cuatro pestañas de la ficha. Si en el futuro se conecta el click a otras
// capas (direcciones, catastro por sí solas...) esta agrupación habrá que
// revisarla, porque está pensada para el esquema de la capa de contadores.
const PESTANAS_FICHA = [
    {
        id: "localidad",
        etiqueta: "LOCALIDAD",
        campos: ["LOCALIDAD", "CAT_INM-nucleo", "CAT_INM-municipio", "CAT_INM-cod_postal"]
    },
    {
        id: "contador",
        etiqueta: "CONTADOR",
        campos: [
            "COD.", "NOMBRE", "DNI", "COMENTARIOS",
            "LECTURA CONTADOR ANTERIOR",
            "MODELO CONTADOR RETIRADO", "Nº SERIE CONTADOR RETIRADO",
            "MODELO CONTADOR NUEVO INSTALADO", "Nº SERIE CONTADOR NUEVO INSTALADO",
            "geoposicionado", "REVISAR", "TIPO_CRUCE", "N_CANDIDATOS", "INMUEBLES_CANDIDATOS"
        ]
    },
    {
        id: "direccion",
        etiqueta: "DIRECCION",
        campos: [
            "dir_completa", "CALLE_ORIGINAL",
            "CAT_INM-tipo_via", "CAT_INM-nombre_via", "CAT_INM-num_policia",
            "CAT_INM-bloque", "CAT_INM-escalera", "CAT_INM-planta", "CAT_INM-puerta",
            "CAT_INM-direccion", "CAT_INM-dir_tributaria"
        ]
    },
    {
        id: "catastro",
        etiqueta: "CATASTRO",
        campos: [
            "ref_cat_parcela", "ref_cat_inmueble",
            "BUILDING-informationSystem", "BUILDING-documentLink",
            "CAT_INM-ref_parcela", "CAT_INM-ref_inmueble",
            "CAT_INM-tipo", "CAT_INM-uso", "CAT_INM-superficie", "CAT_INM-anio_const"
        ]
    }
];


/**
 * Escapa caracteres HTML especiales para poder insertar texto de forma segura.
 *
 * @param {string} texto - Texto a escapar.
 * @returns {string} Texto con los caracteres HTML especiales escapados.
 */
function escaparHtml(texto) {

    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

}


/**
 * Da formato a un valor de la ficha: si es una URL, la convierte en un
 * enlace clicable que abre en una pestaña nueva; en caso contrario, lo
 * muestra como texto (escapado).
 *
 * @param {*} valor - Valor del atributo.
 * @returns {string} HTML a insertar en la ficha.
 */
function formatearValorFicha(valor) {

    if (valor === null || valor === undefined || valor === "") {
        return "-";
    }

    const texto = String(valor);

    if (/^https?:\/\/\S+$/i.test(texto)) {
        const url = escaparHtml(texto);
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    }

    return escaparHtml(texto);

}


/**
 * Muestra en la ventana emergente las propiedades de un elemento seleccionado,
 * organizadas en las pestañas LOCALIDAD / CONTADOR / DIRECCION / CATASTRO.
 *
 * @param {object} atributos - Propiedades del elemento (GeoJSON properties).
 */
function mostrarInfoElemento(atributos) {

    const camposAsignados = PESTANAS_FICHA.flatMap(function (pestana) {
        return pestana.campos;
    });

    const camposSinAsignar = Object.keys(atributos).filter(function (clave) {
        return !camposAsignados.includes(clave);
    });

    const pestanasHtml = PESTANAS_FICHA
        .map(function (pestana, indice) {
            return `<button type="button" class="tab-ficha${indice === 0 ? " active" : ""}" data-tab="${pestana.id}">${pestana.etiqueta}</button>`;
        })
        .join("");

    const panelesHtml = PESTANAS_FICHA
        .map(function (pestana, indice) {

            // Los campos que no encajan en ninguna categoría se listan en CONTADOR
            const campos = pestana.id === "contador"
                ? pestana.campos.concat(camposSinAsignar)
                : pestana.campos;

            const filas = campos
                .filter(function (clave) {
                    return clave in atributos;
                })
                .map(function (clave) {
                    return `<p><b>${clave}:</b> ${formatearValorFicha(atributos[clave])}</p>`;
                })
                .join("") || "<p>Sin datos.</p>";

            return `<div class="panel-tab-ficha ficha-info-panel${indice === 0 ? " active" : ""}" data-tab="${pestana.id}">${filas}</div>`;

        })
        .join("");

    contenidoFicha.innerHTML = `
        <div class="tabs-ficha">${pestanasHtml}</div>
        <div class="paneles-ficha">${panelesHtml}</div>
    `;

    contenidoFicha.querySelectorAll(".tab-ficha").forEach(function (boton) {

        boton.addEventListener("click", function () {

            contenidoFicha.querySelectorAll(".tab-ficha").forEach(function (b) {
                b.classList.remove("active");
            });

            contenidoFicha.querySelectorAll(".panel-tab-ficha").forEach(function (panel) {
                panel.classList.remove("active");
            });

            boton.classList.add("active");

            contenidoFicha
                .querySelector(`.panel-tab-ficha[data-tab="${boton.dataset.tab}"]`)
                .classList.add("active");

        });

    });

    mostrarFicha();
}


function mostrarFicha() {

    popupFicha.style.left = "";
    popupFicha.style.top = "";
    popupFicha.style.transform = "";

    overlayFicha.classList.add("active");

}


function ocultarFicha() {
    overlayFicha.classList.remove("active");
}


/* Cerrar con el botón X */
btnCerrarFicha.addEventListener("click", ocultarFicha);


/* Cerrar con la tecla Escape */
document.addEventListener("keydown", function (evento) {

    if (evento.key === "Escape") {
        ocultarFicha();
    }

});


/* Arrastrar la ventana emergente */
let arrastrandoFicha = false;
let offsetArrastreX = 0;
let offsetArrastreY = 0;

cabeceraFicha.addEventListener("mousedown", function (evento) {

    if (evento.target.closest(".btn-cerrar-ficha")) {
        return;
    }

    const rect = popupFicha.getBoundingClientRect();

    offsetArrastreX = evento.clientX - rect.left;
    offsetArrastreY = evento.clientY - rect.top;

    popupFicha.style.left = `${rect.left}px`;
    popupFicha.style.top = `${rect.top}px`;
    popupFicha.style.transform = "none";

    arrastrandoFicha = true;
    popupFicha.classList.add("arrastrando");

});

document.addEventListener("mousemove", function (evento) {

    if (!arrastrandoFicha) {
        return;
    }

    popupFicha.style.left = `${evento.clientX - offsetArrastreX}px`;
    popupFicha.style.top = `${evento.clientY - offsetArrastreY}px`;

});

document.addEventListener("mouseup", function () {

    arrastrandoFicha = false;
    popupFicha.classList.remove("arrastrando");

});
