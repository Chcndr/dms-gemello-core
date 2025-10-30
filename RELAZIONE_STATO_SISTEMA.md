# RELAZIONE TECNICA - SISTEMA DMS GEMELLO DIGITALE
## Mercato Esperanto Grosseto - Overlay Georeferenziato

**Data**: 29 Ottobre 2025  
**Versione Sistema**: 2.0  
**Stato**: In sviluppo - Richiede intervento esterno per completamento

---

## 📋 EXECUTIVE SUMMARY

Il sistema DMS Gemello Digitale per il Mercato Esperanto di Grosseto è stato sviluppato per visualizzare i 159 posteggi del mercato su una mappa GIS interattiva. Sono stati risolti con successo i problemi di drag nell'overlay editor e implementata la georeferenziazione. Tuttavia, rimane aperta la sfida di creare un'immagine pulita della pianta del mercato senza sfondo e con rettangoli perfetti.

---

## 🎯 OBIETTIVO DEL PROGETTO

Creare un sistema che:
1. ✅ Mostri la pianta del mercato come overlay georeferenziato sulla mappa
2. ✅ Permetta di allineare la pianta con le strade reali (overlay editor)
3. ❌ Visualizzi i 159 posteggi come aree cliccabili perfettamente allineate
4. ✅ Gestisca stati dinamici (libero/occupato/assegnato)
5. ✅ Fornisca coordinate GPS per navigazione cliente

---

## ✅ RISULTATI RAGGIUNTI

### 1. **Overlay Editor Funzionante**
**File**: `overlay-editor.html`

**Funzionalità implementate:**
- ✅ Caricamento pianta mercato trasparente
- ✅ **Drag & drop fluido** (risolto bug salti con CSS transform)
- ✅ Slider precisi:
  - Scala: step 0.05 (0.5x - 3.0x)
  - Rotazione: step 0.5° (0° - 360°)
  - Opacità: step 1% (0% - 100%)
- ✅ Salvataggio georeferenziazione (4 corner geografici)
- ✅ Modale con copia appunti (iPad-friendly) e download file
- ✅ Zoom automatico su Grosseto quando si cerca

**Link**: https://chcndr.github.io/dms-gemello-core/overlay-editor.html

**Formato output**:
```json
{
  "mercato": "Grosseto - Mercato Esperanto",
  "timestamp": "2025-10-29T18:57:01.854Z",
  "corners": {
    "nw": [42.75976, 11.11172],
    "ne": [42.75976, 11.11668],
    "se": [42.75734, 11.11668],
    "sw": [42.75734, 11.11172]
  },
  "center": [42.75855, 11.11420],
  "transform": {
    "scale": 1.85,
    "rotation": 1,
    "translateX": -177,
    "translateY": -68
  }
}
```

### 2. **Mappa Principale con Overlay**
**File**: `index-grosseto.html`

**Funzionalità implementate:**
- ✅ ImageOverlay georeferenziato (pianta trasparente)
- ✅ Layer toggle per mostrare/nascondere overlay
- ✅ Zoom automatico quando si cerca "Grosseto"
- ✅ Sistema di ricerca indirizzo funzionante
- ✅ Check-in GPS con anti-spoofing

**Link**: https://chcndr.github.io/dms-gemello-core/index-grosseto.html?locale=it

### 3. **Trasformazione Affine per Coordinate**
**File**: `fix_stalls_affine.py`

**Implementazione matematica**:
- ✅ Conversione pixel → coordinate geografiche
- ✅ Gestisce rotazione, scala, traslazione
- ✅ Precisione assoluta sui 4 corner di riferimento

**Formula**:
```
lng = a * px + b * py + tx
lat = c * px + d * py + ty
```

Dove la matrice [a,b,c,d,tx,ty] viene calcolata risolvendo il sistema lineare con i 4 corner noti.

---

## ❌ PROBLEMA PRINCIPALE: IMMAGINE PIANTA

### Situazione Attuale

**Immagine originale**: `data/grosseto_pianta_transparent.png`
- Dimensioni: 1801 x 1200 px
- Formato: PNG con trasparenza
- **PROBLEMA**: Ha sfondo bianco/grigio con linee bianche interne ai rettangoli
- Contiene 159 posteggi numerati (rettangoli verdi con numeri neri)

**Visualizzazione attuale**:
- ❌ Sfondo bianco visibile (brutto esteticamente)
- ❌ Linee bianche interne ai rettangoli (divisioni)
- ❌ Numeri neri originali (non leggibili su tutti gli zoom)

### Obiettivo Desiderato

**Immagine ideale**:
- ✅ Sfondo completamente trasparente
- ✅ SOLO rettangoli verdi pieni (senza linee bianche)
- ✅ Numeri bianchi con bordo nero (leggibili)
- ✅ 159 posteggi separati e identificabili

---

## 🔧 TOOL SVILUPPATI

### 1. **clean_image.py**
**Approccio**: Rilevamento colore verde

**Logica**:
```python
# Identifica pixel verdi
is_green = (r < 150) & (g > 100) & (b < 150)
# Rende trasparente tutto il resto
alpha_new = np.where(is_green, 255, 0)
```

**Risultato**: ❌ Mantiene numeri bianchi e linee interne

### 2. **clean_image_v2.py**
**Approccio**: Rilevamento contorni + riempimento

**Logica**:
```python
# Rileva contorni rettangoli verdi
contours = cv2.findContours(mask_verde, ...)
# Ridisegna poligoni pieni
for contour in contours:
    draw.polygon(points, fill=verde_pieno)
```

**Risultato**: ❌ Mantiene buchi/linee bianche interne (164 contorni rilevati)

### 3. **recreate_clean_map.py** (Fotocopiatrice Digitale)
**Approccio**: Contorni + morphological closing

**Logica**:
```python
# Chiude buchi con morphological operations
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
mask_closed = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
# Rileva e ridisegna
contours = cv2.findContours(mask_closed, ...)
```

**Risultato**: ❌ Unisce troppi rettangoli vicini (da 159 a 52 posteggi)

### 4. **recreate_clean_map_v3.py**
**Approccio**: Rettangoli geometrici perfetti

**Logica**:
```python
# Approssima ogni contorno a rettangolo geometrico
rect = cv2.minAreaRect(contour)
box = cv2.boxPoints(rect)
# Ridisegna rettangolo perfetto
draw.polygon(box, fill=verde)
```

**Risultato**: ⚠️ Rettangoli puliti MA include aree verdi grandi (erba, aiuole) - 153 elementi invece di 159

### 5. **recreate_clean_map_v4.py**
**Approccio**: Filtro per dimensione + aspect ratio

**Logica**:
```python
# Filtra per area posteggio
if min_area < area < max_area:
    # Filtra per forma (esclude posteggi fusi)
    aspect = max(w, h) / min(w, h)
    if aspect < max_aspect:
        # OK, è un posteggio singolo
```

**Risultato**: ❌ Troppo restrittivo, solo 22 posteggi rilevati (molti posteggi reali hanno aspect alto)

---

## 🔍 ANALISI TECNICA DEL PROBLEMA

### Perché l'Estrazione Automatica Fallisce

**1. Linee Bianche Interne**
- I rettangoli verdi nell'originale hanno linee bianche che li dividono
- OpenCV rileva queste linee come "buchi" nei contorni
- Impossibile distinguere tra:
  - Linea bianca interna (da ignorare)
  - Spazio bianco tra posteggi (da mantenere)

**2. Posteggi Fusi**
- Molti posteggi sono disegnati attaccati (senza spazio)
- OpenCV li rileva come un unico contorno
- Esempio: 5 posteggi in fila → rilevati come 1 rettangolo lungo

**3. Aree Verdi Non-Posteggi**
- L'immagine contiene aree verdi grandi (aiuole, erba)
- Stesso colore verde dei posteggi
- Impossibile distinguere automaticamente senza contesto

**4. Variabilità Dimensioni**
- I posteggi hanno dimensioni molto variabili
- Alcuni sono 2x5m, altri 3x3m, altri 4x8m
- Difficile definire un range di area/aspect ratio universale

### Tentativi di Soluzione e Limiti

| Approccio | Pro | Contro | Risultato |
|-----------|-----|--------|-----------|
| **Color detection** | Semplice | Mantiene linee bianche | ❌ Non utilizzabile |
| **Contour filling** | Riempie buchi | Mantiene buchi grandi | ❌ Non utilizzabile |
| **Morphological closing** | Chiude buchi | Unisce posteggi vicini | ❌ Troppi posteggi persi |
| **Geometric rectangles** | Rettangoli perfetti | Include aree verdi | ⚠️ Parziale |
| **Size + aspect filter** | Esclude aree verdi | Troppo restrittivo | ❌ Troppi posteggi persi |

---

## 💡 SOLUZIONI PROPOSTE

### Opzione A: Ritocco Manuale (RACCOMANDATO)
**Strumento**: Photoshop, GIMP, Inkscape

**Processo**:
1. Aprire `grosseto_pianta_transparent.png`
2. Selezionare e cancellare sfondo bianco/grigio
3. Selezionare e riempire rettangoli verdi (rimuovere linee bianche)
4. Cancellare numeri neri originali
5. Salvare come PNG trasparente

**Tempo stimato**: 30-60 minuti  
**Qualità**: ⭐⭐⭐⭐⭐ Perfetta  
**Riutilizzabilità**: ✅ Una volta fatto, vale per sempre

### Opzione B: Ricostruzione da Zero
**Strumento**: Illustrator, Inkscape, Python + PIL

**Processo**:
1. Estrarre coordinate dei 159 posteggi dall'originale (manualmente o semi-automatico)
2. Ridisegnare ogni posteggio come rettangolo vettoriale
3. Aggiungere numeri con font chiaro
4. Esportare come PNG trasparente

**Tempo stimato**: 2-4 ore  
**Qualità**: ⭐⭐⭐⭐⭐ Perfetta  
**Riutilizzabilità**: ✅ Vettoriale, scalabile

### Opzione C: Uso Immagine Originale
**Processo**: Accettare l'immagine con sfondo bianco

**Pro**:
- ✅ Funziona subito
- ✅ Nessun lavoro extra

**Contro**:
- ❌ Esteticamente brutta
- ❌ Sfondo bianco visibile sulla mappa
- ❌ Non professionale

### Opzione D: Overlay Solo Visivo
**Processo**: Usare overlay come riferimento, posteggi gestiti manualmente

**Pro**:
- ✅ Overlay georeferenziato funziona
- ✅ Posteggi posizionati manualmente (precisi)

**Contro**:
- ❌ Richiede posizionare 159 posteggi a mano
- ❌ Tempo: 3-5 ore
- ❌ Soggetto a errori umani

---

## 📊 STATO ATTUALE DEI FILE

### File Funzionanti
```
✅ overlay-editor.html          - Editor georeferenziazione
✅ index-grosseto.html           - Mappa principale
✅ js/dms-core.js                - Logica sistema
✅ data/grosseto_overlay_georef.json - Georeferenziazione salvata
✅ fix_stalls_affine.py          - Conversione coordinate
```

### File Problematici
```
❌ data/grosseto_pianta_transparent.png - Immagine con sfondo bianco
⚠️ data/extracted_stalls_clean.json    - Solo 22 posteggi (incompleto)
```

### Tool Sviluppati (Archivio)
```
📁 clean_image.py                - V1: Color detection
📁 clean_image_v2.py             - V2: Contour filling
📁 recreate_clean_map.py         - V3: Morphological closing
📁 recreate_clean_map_v3.py      - V4: Geometric rectangles
📁 recreate_clean_map_v4.py      - V5: Size + aspect filter
```

---

## 🎯 PROSSIMI PASSI RACCOMANDATI

### Soluzione Immediata (1-2 ore)
1. **Ritocco manuale immagine** con Photoshop/GIMP
   - Rimuovere sfondo bianco
   - Riempire rettangoli verdi (no linee bianche)
   - Cancellare numeri neri
2. **Aggiungere numeri bianchi** con script Python
3. **Testare overlay** sulla mappa
4. **Validare allineamento** con trasformazione affine

### Soluzione Definitiva (2-4 ore)
1. **Ricostruire pianta in vettoriale** (Illustrator/Inkscape)
   - 159 rettangoli precisi
   - Numeri chiari e leggibili
   - Scalabile e modificabile
2. **Esportare PNG** ad alta risoluzione
3. **Georeferenziare** con overlay editor
4. **Generare coordinate** con trasformazione affine
5. **Deploy sistema completo**

---

## 🔧 REQUISITI TECNICI PER SOLUZIONE

### Software Necessario
- **Photoshop** o **GIMP** (gratuito) - Per ritocco manuale
- **Illustrator** o **Inkscape** (gratuito) - Per ricostruzione vettoriale
- **Python 3.11** + OpenCV + PIL - Per elaborazione automatica

### Competenze Richieste
- Grafica raster (Photoshop/GIMP) - Livello base
- Grafica vettoriale (Illustrator/Inkscape) - Livello intermedio (opzionale)
- Python - Livello base (già disponibile nel sistema)

### Tempo Stimato
- Ritocco manuale: **30-60 minuti**
- Ricostruzione vettoriale: **2-4 ore**
- Test e validazione: **30 minuti**

---

## 📞 SUPPORTO E CONTATTI

**Repository GitHub**: https://github.com/Chcndr/dms-gemello-core

**File chiave da condividere**:
- `data/grosseto_pianta_transparent.png` (originale)
- `overlay-editor.html` (per georeferenziazione)
- Questa relazione

**Informazioni per collaboratori esterni**:
1. Immagine originale: 1801x1200 px, PNG
2. Obiettivo: Sfondo trasparente + rettangoli verdi pieni + numeri bianchi
3. Numero posteggi: 159
4. Formato output: PNG trasparente, stesse dimensioni

---

## 📝 NOTE FINALI

Il sistema è **funzionalmente completo** per quanto riguarda:
- ✅ Georeferenziazione
- ✅ Overlay editor
- ✅ Trasformazione coordinate
- ✅ Mappa interattiva

L'unico blocco è la **qualità dell'immagine della pianta**, che richiede un intervento di grafica manuale o semi-automatico.

**Raccomandazione**: Procedere con **Opzione A (Ritocco Manuale)** come soluzione più rapida ed efficace.

---

**Fine Relazione**  
*Documento generato automaticamente dal sistema Manus AI*  
*Data: 29 Ottobre 2025*

