# Analisi WebGIS Comune di Grosseto

## Sistema Originale: webgis.comune.grosseto.it

### Tecnologia
- **Framework**: g3wsuite (QGIS Web Client)
- **Backend**: QGIS Server + PostgreSQL/PostGIS
- **Frontend**: Leaflet.js + g3w-client
- **Versione**: g3w-admin v3.10.2, g3w-client v4.0.2

### Caratteristiche Chiave

#### 1. Geometrie Posteggi
- **Tipo**: `MultiPolygonZ` (poligoni 3D)
- **Non** semplici Point come nel nostro sistema
- **Rendering**: Poligoni vettoriali che si scalano con lo zoom
- **Orientamento**: Calcolato automaticamente per seguire le strade

#### 2. Tile Layers Multiple
- **OSM**: OpenStreetMap standard
- **Bing Strade**: Mappa stradale Microsoft
- **Ortofoto 2023 20cm**: Immagini satellitari ad alta risoluzione
- **CTR 10K**: Carta Tecnica Regionale
- **Nessuna mappa di base**: Fondo bianco/trasparente

#### 3. Zoom e Navigazione
- **MaxZoom**: 22+ (contro il nostro 19)
- **Scala**: Arriva fino a 1:501 (molto più dettagliato)
- **Fluidità**: Zoom continuo senza scatti
- **Scala visibile**: Indicatore in basso a destra (es. "10 m", "5 m")

#### 4. Metadati Layer
**Posteggi Mercati**:
- EPSG: 3003
- Geometria: MultiPolygonZ
- BBOX: [1672738.645893, 4736081.244796, 1673230.797900115, 4736791.914771514]
- Attributi:
  - `id` (int4)
  - `numero` (int8) - Numero posteggio
  - `nome_mer` (varchar) - Mercato
  - `cod_int` (varchar) - Codice mercato

**Mercati**:
- EPSG: 3003
- Geometria: Polygon
- Attributi:
  - `oid` (int8)
  - `nome_mercato` (varchar)

#### 5. Sistema di Coordinate
- **EPSG:3003**: Monte Mario / Italy zone 1
- **Conversione**: Necessaria da WGS84 (EPSG:4326) usato nel nostro sistema

### Differenze con il Nostro Sistema

| Caratteristica | Nostro Sistema | Sistema Originale |
|----------------|----------------|-------------------|
| Geometria posteggi | Point | MultiPolygonZ |
| Rendering | Marker/Rectangle fissi | Poligoni vettoriali |
| Orientamento | Manuale (0°) | Automatico |
| MaxZoom | 19 | 22+ |
| Tile layers | Solo OSM | 5 opzioni |
| Fondo | OSM colorato | Bianco/trasparente |
| Backend | File GeoJSON statici | QGIS Server + PostGIS |
| Scala zoom | 1:1173 min | 1:501 min |

### Miglioramenti da Implementare

#### Fase 1: Geometrie Posteggi
1. Convertire posteggi da Point a Polygon nel GeoJSON
2. Calcolare 4 vertici per ogni posteggio (rettangolo ruotato)
3. Usare `L.polygon()` invece di `L.rectangle()`
4. Implementare orientamento automatico

#### Fase 2: Tile Layers
1. Aggiungere layer bianco/trasparente come default
2. Aggiungere Bing Maps (richiede API key)
3. Aggiungere layer satellitare (es. Esri World Imagery)
4. Creare controllo per switch tra layers

#### Fase 3: Zoom e Navigazione
1. Aumentare `maxZoom` da 19 a 22
2. Aggiungere indicatore scala in basso a destra
3. Ottimizzare rendering per zoom elevati

#### Fase 4: Allineamento Automatico
1. Calcolare perimetro area mercato
2. Distribuire posteggi lungo il perimetro
3. Calcolare orientamento tangente al perimetro
4. Aggiungere spaziatura tra posteggi

### Note Tecniche

**Conversione Coordinate EPSG:3003 → EPSG:4326**:
```javascript
// Usare proj4js per conversione
proj4.defs("EPSG:3003", "+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl +towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs");
```

**Calcolo Orientamento Automatico**:
```javascript
// Per ogni posteggio, trovare il segmento più vicino del perimetro
// Calcolare l'angolo del segmento
// Ruotare il rettangolo di quell'angolo
```

**Dimensioni Posteggi Realistiche**:
- Larghezza: 3-4 metri
- Lunghezza: 6-8 metri
- Spaziatura: 0.5-1 metro tra posteggi

### Riferimenti
- g3wsuite: https://g3wsuite.it/
- QGIS Server: https://docs.qgis.org/latest/en/docs/server_manual/
- Leaflet.js: https://leafletjs.com/
- proj4js: http://proj4js.org/

