# 🎯 DMS GIS Editor Suite - Workflow Completo

**Guida passo-passo per creare un nuovo mercato georeferenziato da zero**

---

## 📋 Prerequisiti

- Pianta del mercato in formato **PDF** o **PNG**
- Browser moderno (Chrome, Firefox, Safari, Edge)
- Connessione internet

---

## 🔄 Workflow Completo (5 Passi)

### 1️⃣ PNG Trasparente - Rimuovi Sfondo

**URL:** https://chcndr.github.io/dms-gemello-core/tools/stalls_alpha_tool.html

**Obiettivo:** Rimuovere lo sfondo dalla pianta e renderla trasparente.

**Passi:**

1. **Carica PDF o PNG**
   - Click su "Choose File" o drag & drop
   - Se PDF, verrà convertito automaticamente in PNG

2. **Regola Chroma Key** (rimozione sfondo)
   - **Hue Min/Max:** Range di tonalità da rimuovere (default 70-160° per verde)
   - **Saturation Min:** Saturazione minima (default 25%)
   - **Value Min:** Luminosità minima (default 25%)
   - Usa gli slider fino a vedere lo sfondo trasparente nella preview

3. **Opzioni aggiuntive**
   - ✅ **Mantieni numeri scuri:** Preserva testo/numeri neri
   - 🔄 **Ruota 90°:** Se la pianta è in landscape, ruotala in portrait

4. **Salva**
   - Click su **"📤 Invia ad Allineatore"**
   - Si apre automaticamente l'Allineatore con l'immagine caricata

**Output nel Bus:**
- `png_transparent` (Blob)
- `png_meta` (JSON: dimensioni + rotazione)

---

### 2️⃣ Allineatore - Posiziona sulla Mappa

**URL:** https://chcndr.github.io/dms-gemello-core/tools/align_editor.html

**Obiettivo:** Posizionare, ruotare e scalare l'immagine sulla mappa GIS.

**Passi:**

1. **Carica PNG dal Bus**
   - Click su **"📂 Carica dal Bus"**
   - L'immagine appare centrata sulla mappa

2. **Posiziona l'immagine**
   - **Trascina** il marker invisibile al centro dell'immagine
   - Muovi l'immagine fino a sovrapporla alla posizione corretta sulla mappa

3. **Ruota l'immagine**
   - Usa lo slider **"Rotazione"** o i pulsanti **+/-** (step 5°)
   - Allinea l'immagine con l'orientamento delle strade

4. **Scala l'immagine**
   - Usa lo slider **"Scala"** o i pulsanti **+/-** (step 0.1x)
   - Adatta le dimensioni dell'immagine alla mappa

5. **Regola opacità** (opzionale)
   - Usa lo slider **"Opacità"** per vedere meglio la mappa sotto

6. **Salva GCP**
   - Click su **"💾 Salva GCP nel Bus"**
   - I 4 angoli dell'immagine vengono salvati come punti di controllo georeferenziati

**Output nel Bus:**
- `gcp` (JSON: 4 angoli NW/NE/SW/SE con coordinate geografiche)

---

### 3️⃣ Area Editor - Disegna Area Mercato

**URL:** https://chcndr.github.io/dms-gemello-core/tools/area_editor.html

**Obiettivo:** Disegnare il perimetro dell'area del mercato.

**Passi:**

1. **Caricamento automatico**
   - L'immagine allineata appare automaticamente sulla mappa
   - Se non appare, verifica di aver completato i passi 1 e 2

2. **Disegna area**
   - Click sul pulsante **"Draw a polygon"** (icona poligono)
   - Click sulla mappa per creare i vertici del poligono
   - Doppio-click per chiudere il poligono
   - **Alternativa:** Usa "Draw a rectangle" per un'area rettangolare

3. **Compila proprietà**
   - **Nome Area/Mercato:** Es. "Mercato Esperanto"
   - **Tipo:** Mercato / Hub Urbano / Zona Interesse
   - **Descrizione:** Es. "Settimanale - Giovedì 07:00-14:00"
   - **Colori:** Scegli colore riempimento e bordo

4. **Modifica** (opzionale)
   - Click su **"Edit layers"** per modificare il poligono
   - Trascina i vertici per aggiustare la forma

5. **Salva nel Bus**
   - Click su **"💾 Salva nel Bus"**

**Output nel Bus:**
- `area_geojson` (GeoJSON: poligono area mercato)

---

### 4️⃣ Slot Editor - Digitalizza Posteggi

**URL:** https://chcndr.github.io/dms-gemello-core/tools/slot_editor.html

**Obiettivo:** Digitalizzare i singoli posteggi sulla mappa.

**Passi:**

1. **Caricamento automatico**
   - L'area mercato e l'immagine allineata appaiono automaticamente
   - Se non appaiono, verifica di aver completato i passi 1, 2 e 3

2. **Attiva modalità aggiungi**
   - Click su **"📍 Modalità Aggiungi Posteggio"**
   - Il pulsante diventa verde

3. **Configura posteggio**
   - **Numero Posteggio:** Incrementa automaticamente (1, 2, 3, ...)
   - **Orientamento:** 
     - Orizzontale (0°)
     - Verticale (90°)
     - Obliquo 45° / 135°
     - Personalizzato (inserisci angolo)

4. **Aggiungi posteggi**
   - Click sulla mappa dove vuoi posizionare il posteggio
   - Appare un rettangolo verde (3m x 8m di default)
   - Il numero incrementa automaticamente

5. **Gestisci posteggi**
   - La lista a sinistra mostra tutti i posteggi aggiunti
   - Click su **"✏️"** per modificare
   - Click su **"🗑️"** per eliminare

6. **Salva nel Bus**
   - Click su **"💾 Salva nel Bus"**

**Output nel Bus:**
- `stalls_geojson` (GeoJSON: rettangoli posteggi)

---

### 5️⃣ Result Viewer - Visualizza Risultato

**URL:** https://chcndr.github.io/dms-gemello-core/tools/result_viewer.html

**Obiettivo:** Visualizzare il risultato finale e verificare il lavoro.

**Passi:**

1. **Carica dal Bus**
   - Click su **"📥 Carica GeoJSON"**
   - Area e posteggi appaiono sulla mappa

2. **Verifica**
   - Zoom sulla mappa per controllare i dettagli
   - Click sui posteggi per vedere i popup con informazioni
   - Hover sui posteggi per vedere i numeri

3. **Statistiche**
   - Controlla il numero di aree e posteggi nella sezione "Statistiche"

4. **Export** (opzionale)
   - I GeoJSON sono già nel bus
   - Puoi scaricarli manualmente dai tool precedenti se necessario

---

## 🎯 Riepilogo Dati nel Bus

Al termine del workflow, il bus contiene:

| Chiave | Tipo | Descrizione | Creato da |
|--------|------|-------------|-----------|
| `png_transparent` | Blob | Immagine PNG trasparente | PNG Trasparente |
| `png_meta` | JSON | Dimensioni e rotazione | PNG Trasparente |
| `gcp` | JSON | 4 punti di controllo georeferenziati | Allineatore |
| `area_geojson` | JSON | Poligono area mercato | Area Editor |
| `stalls_geojson` | JSON | Rettangoli posteggi | Slot Editor |

---

## 💡 Consigli Utili

### PNG Trasparente
- Se lo sfondo è verde, usa Hue 70-160°
- Se lo sfondo è bianco/grigio, abbassa Saturation Min e Value Min
- Usa "Mantieni numeri scuri" per preservare i numeri dei posteggi

### Allineatore
- Usa lo zoom mappa per vedere meglio i dettagli
- Allinea prima grossolanamente, poi affina con zoom alto
- Usa opacità 0.5-0.7 per vedere bene sia l'immagine che la mappa

### Area Editor
- Disegna il poligono seguendo il perimetro esterno del mercato
- Puoi modificare i vertici dopo averlo disegnato
- Salva nel bus prima di chiudere la pagina!

### Slot Editor
- Inizia da un angolo e procedi in ordine
- Usa orientamenti standard (0°, 90°) quando possibile
- Controlla la lista a sinistra per verificare i posteggi aggiunti
- Salva nel bus frequentemente per non perdere il lavoro

---

## ⚠️ Risoluzione Problemi

### L'immagine non appare nell'Allineatore
- Verifica di aver completato il passo 1 (PNG Trasparente)
- Click su "📂 Carica dal Bus" nell'Allineatore
- Controlla la console del browser (F12) per errori

### L'overlay non appare in Area Editor / Slot Editor
- Verifica di aver completato i passi 1 e 2
- Ricarica la pagina (F5)
- Controlla che i dati siano nel bus (apri HUB e verifica stato bus)

### L'area non appare in Slot Editor
- Verifica di aver completato il passo 3 (Area Editor)
- Ricarica la pagina (F5)
- Controlla che `area_geojson` sia nel bus

### I posteggi non si salvano
- Verifica di aver aggiunto almeno 1 posteggio
- Click su "💾 Salva nel Bus" prima di chiudere
- Controlla la console del browser per errori

---

## 🔗 Link Rapidi

- **HUB:** https://chcndr.github.io/dms-gemello-core/editor/index.html
- **PNG Trasparente:** https://chcndr.github.io/dms-gemello-core/tools/stalls_alpha_tool.html
- **Allineatore:** https://chcndr.github.io/dms-gemello-core/tools/align_editor.html
- **Area Editor:** https://chcndr.github.io/dms-gemello-core/tools/area_editor.html
- **Slot Editor:** https://chcndr.github.io/dms-gemello-core/tools/slot_editor.html
- **Result Viewer:** https://chcndr.github.io/dms-gemello-core/tools/result_viewer.html

---

## 📊 Diagramma Workflow

```
┌─────────────────────┐
│  PDF/PNG Pianta     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 1. PNG Trasparente  │ → png_transparent + png_meta
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. Allineatore      │ → gcp (4 angoli)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 3. Area Editor      │ → area_geojson
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 4. Slot Editor      │ → stalls_geojson
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 5. Result Viewer    │ → Visualizzazione finale
└─────────────────────┘
```

---

**Buon lavoro! 🎉**

Per supporto o segnalazioni: https://help.manus.im

