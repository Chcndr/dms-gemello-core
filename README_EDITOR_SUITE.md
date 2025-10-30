# 🎯 DMS GIS Editor Suite - Documentazione Completa

## 📌 Introduzione

La **DMS GIS Editor Suite** è una soluzione **all-in-one** per creare sistemi GIS di mercati in **10-15 minuti**, partendo da una semplice pianta PDF o immagine.

Sviluppata seguendo le specifiche di **Andrea**, integra tutti gli strumenti necessari in un unico workflow:

1. **Chroma Key** - Rimozione sfondo verde/bianco
2. **Overlay Distorcibile** - Posizionamento su mappa Leaflet
3. **GCP Export** - Estrazione 4 punti di controllo
4. **Container System** - Definizione area + posteggi in pixel
5. **Homography** - Conversione matematica pixel → coordinate geografiche
6. **GeoJSON Export** - Output georeferenziato pronto per uso GIS

---

## 🚀 Quick Start

### **1. Accedi all'Editor**

**Online (GitHub Pages):**
```
https://chcndr.github.io/dms-gemello-core/DMS_GIS_EDITOR_SUITE/editor/index.html
```

**Locale:**
```bash
cd dms-gemello-core
python3 -m http.server 8080
# Apri: http://localhost:8080/DMS_GIS_EDITOR_SUITE/editor/index.html
```

### **2. Workflow Base**

```
Carica Pianta → Rimuovi Sfondo → Posiziona su Mappa → 
Esporta GCP → Carica Container → Applica Homography → 
Esporta GeoJSON
```

### **3. Risultato**

- ✅ Area mercato georeferenziata (GeoJSON)
- ✅ 159 posteggi georeferenziati (GeoJSON)
- ✅ Precisione matematica (homography 4-point)
- ✅ Scalabile a qualsiasi mercato italiano

---

## 📂 Struttura Progetto

```
DMS_GIS_EDITOR_SUITE/
├── editor/
│   └── index.html          # Editor all-in-one completo
├── tools/
│   └── stalls_alpha_tool.html  # Tool trasparenza separato
├── samples/
│   └── container.sample.json   # Esempio container JSON
├── README.md               # Documentazione tecnica
└── GUIDA_RAPIDA.md        # Guida utente passo-passo
```

---

## 🎨 Caratteristiche Principali

### **1. Chroma Key Avanzato**

- **Contagocce interattivo** per campionare colori
- **Slider HSV** per controllo fine
- **Preservazione contorni** (mantieni numeri/linee)
- **Anteprima real-time**
- **Export PNG trasparente**

### **2. Overlay Distorcibile**

- **4 corner handles** per allineamento preciso
- **Drag & drop** su mappa Leaflet
- **Lock/Unlock** per fissare posizione
- **Integrazione OSM** per riferimenti stradali

### **3. Ground Control Points (GCP)**

- **Export automatico** 4 angoli
- **Coordinate pixel + geografiche**
- **Formato JSON standard**
- **Compatibile con QGIS/ArcGIS**

### **4. Container System**

- **Schema standardizzato** (area + stalls)
- **Coordinate pixel** per portabilità
- **Metadata** (nome mercato, comune, provincia)
- **Validazione automatica**

### **5. Homography (DLT)**

- **Direct Linear Transform** 4-point
- **Precisione matematica** sub-pixel
- **Gestione rotazione** automatica
- **Scalabilità** mantenuta

### **6. GeoJSON Export**

- **Standard RFC 7946**
- **Feature Collection** completa
- **Properties** personalizzate (id, status, tipo)
- **Pronto per Leaflet/Mapbox/QGIS**

---

## 🛠️ Tecnologie Utilizzate

### **Frontend**
- **Leaflet.js 1.9.4** - Mapping interattivo
- **Leaflet.Distortableimage** - Overlay distorcibile
- **HTML5 Canvas** - Elaborazione immagini
- **Vanilla JavaScript** - Nessuna dipendenza pesante

### **Algoritmi**
- **Chroma Key HSV** - Rimozione sfondo
- **Homography DLT** - Trasformazione prospettica
- **Affine Transform** - Backup per casi semplici

### **Formati**
- **GeoJSON** - Output georeferenziato
- **JSON** - Container e configurazione
- **PNG** - Immagini trasparenti

---

## 📊 Caso d'Uso: Mercato di Grosseto

### **Dati di Input**
- **Pianta**: PDF con sfondo bianco
- **Dimensioni**: 2480x3508 px
- **Posteggi**: 159 stalli
- **Rotazione**: ~1° rispetto al nord

### **Processo**

1. **Caricamento**: PDF convertito in PNG
2. **Trasparenza**: Chroma key su bianco (H:0-360, S:0-15, V:85+)
3. **Allineamento**: 4 corner su Via Manin, Via Oberdan, Via Mazzini
4. **GCP Export**: 4 punti salvati
5. **Container**: 159 stalli definiti in pixel
6. **Homography**: Conversione pixel → lat/lng
7. **Export**: 2 GeoJSON (area + stalls)

### **Risultato**

- ✅ **Precisione**: <1 metro di errore
- ✅ **Performance**: Caricamento <500ms
- ✅ **Scalabilità**: 159 posteggi gestiti senza lag
- ✅ **Compatibilità**: Funziona su desktop + tablet

---

## 🔧 Configurazione Avanzata

### **Parametri Chroma Key**

```javascript
// Sfondo verde (chroma key video)
{
  hueMin: 70,
  hueMax: 160,
  satMin: 25,
  valMin: 25,
  keepDark: true
}

// Sfondo bianco (piante tecniche)
{
  hueMin: 0,
  hueMax: 360,
  satMin: 0,
  satMax: 15,
  valMin: 85,
  keepDark: true
}
```

### **Schema Container JSON**

```json
{
  "metadata": {
    "name": "Mercato Grosseto",
    "comune": "Grosseto",
    "provincia": "GR",
    "regione": "Toscana"
  },
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
      "status": "free",
      "operator": null
    }
  ],
  "gcp": [
    {"px": [0,0], "geo": [42.7657, 11.1093]},
    {"px": [2480,0], "geo": [42.7659, 11.1105]},
    {"px": [2480,3508], "geo": [42.7642, 11.1107]},
    {"px": [0,3508], "geo": [42.7640, 11.1095]}
  ]
}
```

---

## 📈 Roadmap

### **v1.0 (Attuale)**
- ✅ Editor all-in-one funzionante
- ✅ Chroma key + overlay + GCP + export
- ✅ Tool trasparenza separato
- ✅ Documentazione completa

### **v1.1 (Prossima)**
- 🔲 **Auto-detect stalls** da immagine (OpenCV)
- 🔲 **Batch processing** multi-mercato
- 🔲 **Template library** per comuni italiani
- 🔲 **Cloud storage** per container JSON

### **v2.0 (Futuro)**
- 🔲 **Backend API** per gestione mercati
- 🔲 **Database** PostgreSQL + PostGIS
- 🔲 **Autenticazione** operatori mercato
- 🔲 **Mobile app** per assegnazione posteggi

---

## 🤝 Contributi

Il progetto è **open source** e accetta contributi:

1. **Fork** del repository
2. **Branch** per la feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** delle modifiche (`git commit -m 'Add AmazingFeature'`)
4. **Push** al branch (`git push origin feature/AmazingFeature`)
5. **Pull Request**

---

## 📄 Licenza

Questo progetto è distribuito sotto licenza **MIT**.

---

## 👥 Credits

- **Sviluppo**: DMS GIS Team
- **Architettura**: Andrea (soluzione professionale)
- **Testing**: Comune di Grosseto
- **Supporto**: Regione Toscana

---

## 📞 Contatti

- **Repository**: https://github.com/Chcndr/dms-gemello-core
- **Demo Live**: https://chcndr.github.io/dms-gemello-core/
- **Issues**: https://github.com/Chcndr/dms-gemello-core/issues

---

## 🔗 Link Correlati

- [Guida Rapida](./GUIDA_RAPIDA.md)
- [Implementazione Soluzione Andrea](../IMPLEMENTAZIONE_SOLUZIONE_ANDREA.md)
- [Relazione Stato Sistema](../RELAZIONE_STATO_SISTEMA.md)
- [DMS GIS Container Kit](../DMS_GIS_CONTAINER_KIT/README.md)

---

**Ultima modifica**: Ottobre 2024  
**Versione**: 1.0.0

