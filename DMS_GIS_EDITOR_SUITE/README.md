1) README.md

# DMS GIS Editor Suite
Apri `editor/index.html` (in locale) per:
- caricare PNG/JPG/PDF della pianta
- rendere trasparente lo sfondo (tieni solo posteggi verdi + numeri)
- sovrapporre come overlay distorcibile sulla mappa e **Fissare**
- esportare i **GCP** (quattro angoli + dimensioni immagine)
- caricare un **container JSON** (area_px + stalls_px) e **applicare i GCP**
- esportare **GeoJSON** (area.geojson + stalls.geojson)

Strumento extra:
- `tools/stalls_alpha_tool.html` → solo cromakey/trasparenza in PNG.

Esempio container: `samples/container.sample.json`.

Per zippare:
- macOS/Linux: `zip -r DMS_GIS_EDITOR_SUITE.zip DMS_GIS_EDITOR_SUITE`
- Windows: tasto destro → Invia a → Cartella compressa (zip)

