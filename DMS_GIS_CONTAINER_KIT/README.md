# DMS GIS Container Kit

**Digitalizza un mercato partendo dalla pianta: fissa 4 punti di controllo e genera area + posteggi georeferenziati.**

I posteggi sono poligoni metrici che scalano con lo zoom (Leaflet Canvas/SVG).

---

## 📦 Contenuto

```
DMS_GIS_CONTAINER_KIT/
├── README.md                           (questo file)
├── demo/
│   └── index.html                      (demo completa)
├── js/
│   ├── rectMeters.js                   (rettangoli in metri)
│   ├── zoomStyle.js                    (stile adattivo su zoom)
│   ├── applyHomography.js              (omografia px→mappa)
│   └── container.js                    (container→GeoJSON)
├── schema/
│   └── container-schema.json           (schema del container)
└── sample/
    ├── container.sample.json           (esempio container)
    └── sample_plan.png                 (pianta esempio - segnaposto)
```

---

## 🎯 Workflow

### 1. Prepara il Container

Crea un file JSON con:
- Immagine della pianta (PNG/PDF)
- 4 punti di controllo (GCP - Ground Control Points)
- Area mercato (poligono in pixel)
- Posteggi (rettangoli in pixel)

**Esempio**: `sample/container.sample.json`

### 2. Carica nell'Editor

Apri `demo/index.html` e:
1. Carica il container JSON
2. Posiziona i 4 marker sui punti di controllo reali sulla mappa
3. Clicca "Applica Omografia"
4. Salva `area.geojson` e `stalls.geojson`

### 3. Usa nella Mappa

Carica i GeoJSON nella tua mappa:

```javascript
// Area mercato
L.geoJSON(areaData, {
  style: { color: 'green', fillOpacity: 0.1 }
}).addTo(map);

// Posteggi (con rettangoli metrici)
const stallsLayer = DMS.addRectLayer(map, stallsData);
DMS.attachZoomStyling(map, stallsLayer);
```

I posteggi scalano automaticamente con lo zoom! 🎉

---

## 📐 Rettangoli Metrici

I posteggi sono definiti in **metri** (non pixel) e scalano con la mappa.

**Esempio**:
```javascript
// Posteggio 3m x 8m ruotato 12° al centro [42.76327, 11.11048]
const center = L.latLng(42.76327, 11.11048);
DMS.rectMeters(center, 3, 8, 12).addTo(map);
```

**Vantaggi**:
- ✅ Scala automaticamente con lo zoom
- ✅ Dimensioni reali in metri
- ✅ Rotazione precisa
- ✅ Cliccabile e interattivo

---

## 🔧 API

### `DMS.rectMeters(latlngCenter, width, height, angleDeg)`

Crea un rettangolo metrico.

**Parametri**:
- `latlngCenter`: Centro del rettangolo (L.LatLng)
- `width`: Larghezza in metri
- `height`: Altezza in metri
- `angleDeg`: Rotazione in gradi (opzionale, default 0)

**Ritorna**: `L.Polygon`

---

### `DMS.addRectLayer(map, stallsList)`

Crea un layer con rettangoli metrici da una lista.

**Parametri**:
- `map`: Mappa Leaflet
- `stallsList`: Array di oggetti `{lat, lng, w, h, angle, id, ...}`

**Ritorna**: `L.FeatureGroup`

---

### `DMS.attachZoomStyling(map, vectorLayer, baseZoom)`

Adatta lo stile (bordi, font) allo zoom.

**Parametri**:
- `map`: Mappa Leaflet
- `vectorLayer`: Layer vettoriale (L.GeoJSON, L.FeatureGroup)
- `baseZoom`: Zoom di riferimento (default 18)

---

### `DMS.computeHomography(pxs, lls)`

Calcola matrice omografica H da 4 punti.

**Parametri**:
- `pxs`: Array di 4 punti pixel `[{x,y}, ...]`
- `lls`: Array di 4 punti geografici `[{x,y}, ...]` (WebMercator metri)

**Ritorna**: Matrice H 3x3

---

### `DMS.applyH(H, x, y)`

Applica omografia a un punto pixel.

**Parametri**:
- `H`: Matrice omografica 3x3
- `x, y`: Coordinate pixel

**Ritorna**: `L.LatLng`

---

### `DMS.containerToLayers(map, container)`

Converte container in area + posteggi georeferenziati.

**Parametri**:
- `map`: Mappa Leaflet (per GCP positioning)
- `container`: Oggetto container JSON

**Ritorna**: `{area: GeoJSON, stalls: GeoJSON}`

---

## 📋 Schema Container

```json
{
  "id": "grosseto-mercato-esperanto",
  "image": "pianta.png",
  "gcp": [
    {"px": [x1, y1], "ll": [lat1, lng1]},
    {"px": [x2, y2], "ll": [lat2, lng2]},
    {"px": [x3, y3], "ll": [lat3, lng3]},
    {"px": [x4, y4], "ll": [lat4, lng4]}
  ],
  "area_px": [[x, y], ...],
  "stalls_px": [
    {
      "id": 1,
      "poly": [[x, y], ...],
      "w": 3,
      "h": 8,
      "row": "A"
    }
  ]
}
```

---

## 🚀 Scalabilità

**Per ogni nuovo mercato**:
1. Ottieni pianta (PDF/PNG)
2. Crea container JSON (manuale o semi-auto con OpenCV.js)
3. Georeferenzia con 4 punti
4. Esporta GeoJSON
5. Carica nella mappa

**Tempo**: ~10 minuti per mercato!

---

## 📞 Supporto

Repository: https://github.com/Chcndr/dms-gemello-core

---

**Creato da Andrea + Manus AI**  
**Data**: 29 Ottobre 2025

