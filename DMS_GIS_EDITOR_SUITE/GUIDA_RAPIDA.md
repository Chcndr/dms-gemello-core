# 🎯 Guida Rapida - DMS GIS Editor Suite

## 📋 Panoramica

L'**Editor All-in-One** permette di creare un sistema GIS per mercati in **10-15 minuti**, partendo da una semplice pianta PDF o immagine.

---

## 🚀 Workflow Completo

### **Step 1: Carica la Pianta**
1. Clicca su **"Carica Pianta (PNG/JPG o PDF)"**
2. Seleziona il file della pianta del mercato
3. L'immagine apparirà sulla mappa

### **Step 2: Rimuovi lo Sfondo (Chroma Key)**
1. Usa il **🎯 Contagocce** per campionare il colore dello sfondo (verde/bianco)
2. Regola gli slider:
   - **Hue min/max**: Range di tonalità da rendere trasparente
   - **Saturazione minima**: Soglia di saturazione
   - **Luminosità minima**: Soglia di luminosità
3. Spunta **"Mantieni numeri/contorni scuri"** per preservare i dettagli
4. Clicca **↻ Applica** per vedere l'anteprima
5. Scarica il risultato con **⬇️ PNG trasparente**

### **Step 3: Posiziona l'Overlay sulla Mappa**
1. L'immagine è ora **distorcibile** sulla mappa
2. Trascina i **4 angoli** per allinearla perfettamente alle strade reali
3. Quando sei soddisfatto, clicca **📌 Fissa** per bloccare la posizione
4. Se serve modificare, usa **✏️ Sblocca**

### **Step 4: Esporta i Ground Control Points (GCP)**
1. Clicca **⬇️ Esporta GCP**
2. Salva il file JSON con le coordinate dei 4 angoli
3. Questi punti saranno usati per la georeferenziazione matematica

### **Step 5: Crea il Container JSON**
1. Carica un **Container JSON** (o usa il sample)
2. Il container contiene:
   - **Area**: Poligono del mercato in coordinate pixel
   - **Stalls**: Rettangoli dei posteggi in coordinate pixel
3. Clicca **Applica GCP → mappa** per convertire pixel → coordinate geografiche

### **Step 6: Esporta GeoJSON Georeferenziato**
1. Clicca **⬇️ Area GeoJSON** per esportare il perimetro del mercato
2. Clicca **⬇️ Stalls GeoJSON** per esportare tutti i posteggi
3. I file GeoJSON sono pronti per essere usati in qualsiasi sistema GIS

---

## 🛠️ Tool Separato: Trasparenza

Nella cartella `tools/` trovi **stalls_alpha_tool.html** - un tool dedicato solo alla rimozione dello sfondo:

- Carica immagine
- Applica chroma key
- Scarica PNG trasparente
- **Più veloce** se serve solo pulire l'immagine

---

## 📦 Struttura Container JSON

```json
{
  "area": {
    "type": "polygon",
    "coords": [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
  },
  "stalls": [
    {
      "id": "A1",
      "type": "rect",
      "x": 100,
      "y": 200,
      "w": 50,
      "h": 30,
      "status": "free"
    }
  ],
  "gcp": [
    {"px": [0,0], "geo": [lat1,lng1]},
    {"px": [w,0], "geo": [lat2,lng2]},
    {"px": [w,h], "geo": [lat3,lng3]},
    {"px": [0,h], "geo": [lat4,lng4]}
  ]
}
```

---

## 🎨 Parametri Chroma Key

### **Colori Tipici**

**Sfondo Verde (chroma key video):**
- Hue: 70-160
- Saturazione: 25+
- Luminosità: 25+

**Sfondo Bianco (piante tecniche):**
- Hue: 0-360 (tutto)
- Saturazione: 0-15 (bassa)
- Luminosità: 85+ (alta)

**Sfondo Grigio Chiaro:**
- Hue: 0-360
- Saturazione: 0-20
- Luminosità: 60-85

---

## 🔗 Link Utili

- **Editor All-in-One**: `/DMS_GIS_EDITOR_SUITE/editor/index.html`
- **Tool Trasparenza**: `/DMS_GIS_EDITOR_SUITE/tools/stalls_alpha_tool.html`
- **Sample Container**: `/DMS_GIS_EDITOR_SUITE/samples/container.sample.json`
- **Demo Container Kit**: `/DMS_GIS_CONTAINER_KIT/demo/index.html`

---

## ⚡ Tips & Tricks

1. **Allineamento Preciso**: Usa i riferimenti delle strade sulla mappa OSM per allineare perfettamente la pianta
2. **Zoom Appropriato**: Posiziona la mappa al livello di zoom corretto prima di fissare l'overlay
3. **Mantieni Proporzioni**: Non distorcere troppo l'immagine, cerca di mantenere le proporzioni originali
4. **Test Incrementale**: Prova con pochi posteggi prima di definire tutti i 159 stalli
5. **Backup GCP**: Salva sempre il file GCP prima di procedere - è il riferimento matematico fondamentale

---

## 🐛 Troubleshooting

**L'immagine non si vede sulla mappa:**
- Verifica che il file sia PNG/JPG o PDF valido
- Controlla la console del browser per errori

**Lo sfondo non diventa trasparente:**
- Usa il contagocce per campionare il colore esatto
- Regola gli slider con incrementi piccoli
- Prova a disabilitare "Mantieni numeri/contorni scuri"

**I posteggi non si allineano:**
- Verifica che i 4 GCP siano corretti
- Controlla che il container JSON abbia coordinate pixel corrette
- Riprova l'allineamento dell'overlay sulla mappa

**GitHub Pages dà 404:**
- Attendi 5-10 minuti dopo il push
- Verifica che il file sia stato committato correttamente
- Controlla che GitHub Pages sia abilitato nelle impostazioni del repo

---

## 📞 Supporto

Per problemi o domande, consulta:
- `README.md` nella root del progetto
- `IMPLEMENTAZIONE_SOLUZIONE_ANDREA.md` per dettagli tecnici
- `RELAZIONE_STATO_SISTEMA.md` per lo stato del sistema

---

**Creato da**: DMS GIS Team  
**Versione**: 1.0  
**Data**: Ottobre 2024

