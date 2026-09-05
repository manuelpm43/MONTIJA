# PROYECTO MONTIJA

## Objetivo

Desarrollar un visor web GIS para la Merindad de Montija, que integre:

- **Direcciones IGN**: coordenadas y nombre oficial (IGN_direcciones).
- **Contadores EPC**: tabla de contadores, diferenciados por geoposicionamiento (booleano T/F) y enriquecidos con datos catastrales cuando el geoposicionamiento es verdadero.
- **Catastro 09219 – Merindad de Montija**: datos oficiales catastrales, con las capas (en este orden): building part, building, other construction, cadastral parcel.
- **Cartografía base**: núcleos, municipios y ortofoto.

Servido desde GeoServer (workspace `montija`, mismo servidor que BIDELAN: `217.71.202.62:8080`), utilizando la API-IDEE.

---

# Arquitectura

La aplicación estará formada por cinco bloques principales:

- Header
- Panel de capas
- Mapa
- Panel de información
- Footer

---

# Estructura del proyecto

MONTIJA/

├── css/

├── datos/

│ ├── geojson/

│ ├── raster/

│ ├── documentos/

│ └── imagenes/

├── img/

├── js/

└── index.html

---

# Convenciones

## Archivos

Todo en minúsculas.

Ejemplo:

direcciones.geojson

contadores.geojson

---

## Variables JavaScript

camelCase

Ejemplo:

const mapa

const capaDirecciones

const geoserverWfsUrl

---

## Clases

PascalCase

---

# Filosofía

Nunca copiar código sin entenderlo.

Primero diseñar.

Después programar.

Finalmente probar.

---

# Versiones

v1.0 Limpieza del esqueleto BIDELAN y esqueleto genérico para MONTIJA

---

# Próximas versiones

- Capa IGN_direcciones (WFS)
- Capa Montija EPC – contadores enriquecida
- Grupo catastral 09219 (building part, building, other construction, cadastral parcel)
- Grupo cartografía base (núcleos, municipios, ortofoto)
- Buscador adaptado a direcciones / contadores / parcelas
- Panel de información por tipo de elemento

---

# Estado del proyecto

En desarrollo.
