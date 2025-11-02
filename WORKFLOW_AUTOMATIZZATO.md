# 🎯 DMS GIS Editor Suite - Workflow Automatizzato

**Versione:** 2.0 (Completamente Automatizzato)  
**Data:** 2 Novembre 2025  
**Commit:** `f9c52ea`

---

## 🚀 Workflow Completo (3 Passi)

### 1️⃣ PNG Trasparente - Rimuovi Sfondo

**URL:** https://chcndr.github.io/dms-gemello-core/tools/stalls_alpha_tool.html

**Obiettivo:** Rimuovere lo sfondo dalla pianta e renderla trasparente.

**Output:**
- `png_transparent` (Blob) - Immagine PNG trasparente
- `png_meta` (JSON) - Dimensioni e rotazione

---

### 2️⃣ Area Editor - Allinea e Disegna Area

**URL:** https://chcndr.github.io/dms-gemello-core/tools/area_editor.html

**Obiettivo:** Allineare la pianta sulla mappa e disegnare l'area del mercato.

**Passi:**

1. **Allinea Pianta (4 Click)**
   - Click su "📍 Allinea Pianta (4 Click)"
   - Click sui 4 angoli della pianta sulla mappa:
     1. Nord-Ovest (in alto a sinistra)
     2. Nord-Est (in alto a destra)
     3. Sud-Est (in basso a destra)
     4. Sud-Ovest (in basso a sinistra)
   - L'overlay appare automaticamente georeferenziato

2. **Disegna Area Mercato**
   - Usa "Draw a polygon" per disegnare il perimetro
   - Compila proprietà (nome, tipo, descrizione, colori)

3. **Salva nel Bus**
   - Click su "💾 Salva nel Bus"

**Output:**
- `gcp` (JSON) - 4 punti di controllo georeferenziati
- `area_geojson` (JSON) - Poligono area mercato
- `container` (JSON) - **Container con GCP e struttura per posteggi**

**Formato container.json:**
```json
{
  "id": "mercato-esperanto",
  "name": "Mercato Esperanto",
  "type": "mercato",
  "description": "Settimanale - Giovedì 07:00-14:00",
  "timestamp": "2025-11-02T...",
  "image": {
    "width": 1223,
    "height": 2431
  },
  "gcp": [
    { "px": [0, 0], "ll": [42.759, 11.111], "note": "NW" },
    { "px": [1223, 0], "ll": [42.759, 11.116], "note": "NE" },
    { "px": [1223, 2431], "ll": [42.757, 11.116], "note": "SE" },
    { "px": [0, 2431], "ll": [42.757, 11.111], "note": "SW" }
  ],
  "area_px": [[0,0], [1223,0], [1223,2431], [0,2431]],
  "stalls_px": []
}
```

---

### 3️⃣ Slot Editor - Digitalizza Posteggi

**URL:** https://chcndr.github.io/dms-gemello-core/tools/slot_editor.html

**Obiettivo:** Digitalizzare i posteggi sulla mappa.

**Passi:**

1. **Caricamento Automatico**
   - Area mercato e pianta allineata appaiono automaticamente
   - Container caricato dal bus

2. **Aggiungi Posteggi**
   - Click su "📍 Modalità Aggiungi Posteggio"
   - Configura numero e orientamento
   - Click sulla mappa per aggiungere posteggi
   - **I posteggi vengono salvati automaticamente in container.json con coordinate pixel!**

3. **Salva nel Bus**
   - Click su "💾 Salva nel Bus"

**Output:**
- `stalls_geojson` (JSON) - Rettangoli posteggi georeferenziati
- `container` (JSON) - **Container aggiornato con posteggi in coordinate pixel**

**Formato stalls_px nel container:**
```json
{
  "stalls_px": [
    {
      "id": 1,
      "center_px": [100.5, 200.3],
      "width_px": 3,
      "height_px": 6,
      "angle": 90,
      "orientation": 90
    },
    {
      "id": 2,
      "center_px": [150.2, 205.8],
      "width_px": 3,
      "height_px": 6,
      "angle": 90,
      "orientation": 90
    }
  ]
}
```

---

### 4️⃣ Result Viewer - Visualizza Risultato

**URL:** https://chcndr.github.io/dms-gemello-core/tools/result_viewer.html

**Obiettivo:** Visualizzare il risultato finale.

**Passi:**
1. Click su "📥 Carica GeoJSON"
2. Verifica area e posteggi sulla mappa

---

## 🔄 Flusso Dati nel Bus

```
┌─────────────────────┐
│  PNG Trasparente    │
└──────────┬──────────┘
           │
           ├─→ png_transparent (Blob)
           └─→ png_meta (JSON: {w, h, rotation})
           │
           ▼
┌─────────────────────┐
│   Area Editor       │
└──────────┬──────────┘
           │
           ├─→ gcp (JSON: 4 corner)
           ├─→ area_geojson (JSON: poligono)
           └─→ container (JSON: GCP + area_px + stalls_px:[])
           │
           ▼
┌─────────────────────┐
│   Slot Editor       │
└──────────┬──────────┘
           │
           ├─→ stalls_geojson (JSON: rettangoli)
           └─→ container (JSON: aggiornato con stalls_px)
           │
           ▼
┌─────────────────────┐
│  Result Viewer      │
└─────────────────────┘
```

---

## 🆕 Novità Versione 2.0

### Area Editor
✅ **Sistema allineamento 4 click integrato**
- Non serve più l'Allineatore separato
- Click direttamente sulla mappa per posizionare angoli
- Marker con label (NW, NE, SE, SW)
- Overlay creato automaticamente

✅ **Creazione automatica container.json**
- Quando salvi l'area, crea automaticamente il container
- Include GCP, dimensioni immagine, metadati
- Pronto per essere popolato con posteggi

### Slot Editor
✅ **Salvataggio automatico in container**
- Ogni posteggio aggiunto viene salvato in `container.stalls_px`
- Conversione automatica lat/lng → coordinate pixel
- Container aggiornato in tempo reale nel bus

✅ **Conversione coordinate geografiche → pixel**
- Funzione `latLngToPixel()` per trasformazione inversa
- Usa i GCP per calcolare coordinate pixel precise
- Compatibile con Container Kit per georeferenziazione

---

## 📊 Dati nel Bus (Completo)

| Chiave | Tipo | Descrizione | Creato da | Usato da |
|--------|------|-------------|-----------|----------|
| `png_transparent` | Blob | Immagine PNG trasparente | PNG Trasparente | Area Editor, Slot Editor |
| `png_meta` | JSON | Dimensioni e rotazione | PNG Trasparente | Area Editor, Slot Editor |
| `gcp` | JSON | 4 punti di controllo | Area Editor | Slot Editor, Container Kit |
| `area_geojson` | JSON | Poligono area mercato | Area Editor | Slot Editor, Result Viewer |
| `container` | JSON | Container completo | Area Editor | Slot Editor, Container Kit |
| `stalls_geojson` | JSON | Rettangoli posteggi | Slot Editor | Result Viewer |

---

## 🎯 Vantaggi Workflow Automatizzato

### Rispetto alla versione 1.0:
- ❌ **Eliminato:** Allineatore separato (integrato in Area Editor)
- ✅ **Aggiunto:** Creazione automatica container.json
- ✅ **Aggiunto:** Salvataggio posteggi in coordinate pixel
- ✅ **Aggiunto:** Conversione automatica lat/lng ↔ pixel

### Workflow più semplice:
- **Prima:** 5 tool (PNG → Allineatore → Area → Slot → Viewer)
- **Ora:** 3 tool (PNG → Area → Slot → Viewer)

### Dati più completi:
- **Prima:** Solo GeoJSON (lat/lng)
- **Ora:** GeoJSON + Container (pixel + lat/lng)

### Compatibilità:
- ✅ Container Kit può usare `container` dal bus
- ✅ Formato compatibile con Grosseto
- ✅ Pronto per export in altri formati

---

## 💡 Consigli Utili

### Area Editor
- Fai zoom sulla mappa prima di allineare per maggiore precisione
- Posiziona i 4 angoli nell'ordine: NW → NE → SE → SW
- Usa "🔄 Riallinea Pianta" se sbagli
- Compila tutti i metadati prima di salvare

### Slot Editor
- Inizia da un angolo e procedi in ordine
- Verifica l'orientamento prima di cliccare
- I posteggi vengono salvati automaticamente in container
- Controlla la lista a sinistra per verificare

---

## 🔗 Link Rapidi

- **HUB:** https://chcndr.github.io/dms-gemello-core/editor/index.html
- **PNG Trasparente:** https://chcndr.github.io/dms-gemello-core/tools/stalls_alpha_tool.html
- **Area Editor:** https://chcndr.github.io/dms-gemello-core/tools/area_editor.html
- **Slot Editor:** https://chcndr.github.io/dms-gemello-core/tools/slot_editor.html
- **Result Viewer:** https://chcndr.github.io/dms-gemello-core/tools/result_viewer.html

---

## 📈 Roadmap Futura

### Possibili miglioramenti:
- [ ] Export container.json come file scaricabile
- [ ] Import container.json esistente per editing
- [ ] Conversione automatica poligono area in coordinate pixel
- [ ] Validazione dati container prima del salvataggio
- [ ] Anteprima 3D dei posteggi
- [ ] Batch import posteggi da CSV

---

**Buon lavoro! 🎉**

Per supporto o segnalazioni: https://help.manus.im

