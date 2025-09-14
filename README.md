# DMS • Core Map (mod v1)

Base statica per mappe DMS (Leaflet).  
Questo modulo NON dipende da framework e può essere hostato su GitHub Pages.

## Struttura
- index.html — layout + pannello sinistro + comandi
- css/app.css — tema e stili (mobile-friendly)
- js/dms-core.js — logica: init Leaflet, caricamento GeoJSON, geocoding, fit
- data/italy_borders.geojson — confine Italia (semplificato)
- data/sample_markets.geojson — 2 aree demo + posteggi demo

## Avvio
Apri `index.html` (o pubblica la cartella su GitHub Pages).

## Estensioni previste (prossimi moduli)
- dms-areas.js — import PDF → poligono/contorno (SVG/GeoJSON)
- dms-slots.js — generatore slot rettangolari da (larghezza, lunghezza, mq) + georef
- dms-checkin.js — spunta operatore (GPS) con snap al posteggio
- dms-hubs.js — hub urbano (negozi/servizi) + integrazione routing acquisti
- dms-interop.js — export/import GeoJSON/WFS/WMS, EPSG:3003 ↔ WGS84
