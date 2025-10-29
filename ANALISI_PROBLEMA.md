# ANALISI PROBLEMA POSTEGGI SBALLATI

## SITUAZIONE
- L'utente ha georeferenziato la pianta nell'overlay editor
- Ho estratto 151 posteggi dall'immagine con OpenCV
- Ho convertito le coordinate pixel → geografiche
- **RISULTATO: I MARKER SONO SBALLATI**

## DALLE IMMAGINI DELL'UTENTE
- I posteggi overlay (numeri piccoli) sono visibili
- Sono FUORI dall'area verde del mercato
- Sono distribuiti in modo casuale
- NON corrispondono ai rettangoli verdi della pianta

## CAUSE POSSIBILI
1. **Errore nella conversione pixel → geografiche**
   - La formula di interpolazione lineare potrebbe essere sbagliata
   - I corner potrebbero essere in ordine sbagliato (NW, NE, SE, SW)
   
2. **Mismatch tra immagine usata per estrazione e quella nell'editor**
   - Immagine reale: 1801x1200 px
   - Immagine editor: 500x333 px (scalata)
   - Scala applicata: 1.85x nell'editor
   
3. **Rotazione non considerata**
   - L'utente ha ruotato di 1° nell'editor
   - La conversione pixel → geo non tiene conto della rotazione!

## SOLUZIONE
**PROBLEMA PRINCIPALE: ROTAZIONE!**

La formula attuale converte pixel → geo assumendo che l'immagine sia allineata con i corner (rettangolo perfetto).

Ma se l'utente ha ruotato di 1°, i corner NON sono più allineati con l'immagine!

**DEVO USARE TRASFORMAZIONE AFFINE:**
1. Calcolare la matrice di trasformazione affine dai 4 corner
2. Applicare la trasformazione a ogni punto pixel
3. Ottenere coordinate geografiche corrette

## PROSSIMI PASSI
1. Implementare trasformazione affine
2. Rigenerare le coordinate
3. Testare

