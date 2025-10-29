#!/usr/bin/env python3
"""
Estrae le coordinate dei posteggi dalla pianta georeferenziata del mercato.
"""

import cv2
import numpy as np
import json
from pathlib import Path

# Carica la georeferenziazione
with open('data/grosseto_overlay_georef.json', 'r') as f:
    georef = json.load(f)

# Carica l'immagine
img_path = 'data/grosseto_pianta_transparent.png'
img = cv2.imread(img_path)
if img is None:
    print(f"❌ Errore: impossibile caricare {img_path}")
    exit(1)

print(f"✅ Immagine caricata: {img.shape[1]}x{img.shape[0]} px")

# Converti in HSV per rilevare il verde
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

# Range per il verde dei posteggi (da calibrare)
# Verde chiaro/scuro
lower_green = np.array([35, 40, 40])
upper_green = np.array([85, 255, 255])

# Crea maschera per il verde
mask = cv2.inRange(hsv, lower_green, upper_green)

# Trova i contorni
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

print(f"🔍 Trovati {len(contours)} contorni verdi")

# Filtra i contorni per dimensione (i posteggi dovrebbero essere rettangoli di dimensioni simili)
stalls = []
min_area = 30  # Area minima in pixel (ridotto da 50)
max_area = 8000  # Area massima in pixel (aumentato da 5000)

for i, cnt in enumerate(contours):
    area = cv2.contourArea(cnt)
    if min_area < area < max_area:
        # Ottieni il rettangolo minimo
        rect = cv2.minAreaRect(cnt)
        center, (width, height), angle = rect
        
        # I posteggi dovrebbero essere rettangoli allungati
        aspect_ratio = max(width, height) / (min(width, height) + 0.001)
        
        if aspect_ratio > 1.1 and aspect_ratio < 8:  # Rettangoli allungati (rilassato)
            stalls.append({
                'id': i + 1,
                'center_px': [float(center[0]), float(center[1])],
                'width_px': float(width),
                'height_px': float(height),
                'angle': float(angle),
                'area': float(area)
            })

print(f"✅ Filtrati {len(stalls)} posteggi validi")

# Funzione per convertire coordinate pixel → geografiche
def pixel_to_geo(px, py, img_width, img_height, georef):
    """
    Converte coordinate pixel in coordinate geografiche.
    """
    # Normalizza coordinate pixel (0-1)
    norm_x = px / img_width
    norm_y = py / img_height
    
    # Interpola tra i corner
    nw = georef['corners']['nw']
    ne = georef['corners']['ne']
    sw = georef['corners']['sw']
    se = georef['corners']['se']
    
    # Interpolazione bilineare
    top = [
        nw[0] + (ne[0] - nw[0]) * norm_x,
        nw[1] + (ne[1] - nw[1]) * norm_x
    ]
    bottom = [
        sw[0] + (se[0] - sw[0]) * norm_x,
        sw[1] + (se[1] - sw[1]) * norm_x
    ]
    
    lat = top[0] + (bottom[0] - top[0]) * norm_y
    lng = top[1] + (bottom[1] - top[1]) * norm_y
    
    return [lat, lng]

# Converti tutti i posteggi in coordinate geografiche
img_height, img_width = img.shape[:2]

for stall in stalls:
    px, py = stall['center_px']
    geo_coords = pixel_to_geo(px, py, img_width, img_height, georef)
    stall['lat'] = geo_coords[0]
    stall['lng'] = geo_coords[1]
    
    # Calcola orientamento (0° = Nord, 90° = Est)
    # L'angolo di OpenCV è relativo all'asse X
    # Dobbiamo convertirlo in bearing geografico
    angle = stall['angle']
    
    # Aggiungi la rotazione dell'overlay
    overlay_rotation = georef['transform']['rotation']
    total_angle = (angle + overlay_rotation) % 360
    
    stall['orientation'] = int(total_angle)

# Salva i risultati
output_path = 'data/extracted_stalls.json'
with open(output_path, 'w') as f:
    json.dump({
        'mercato': 'Grosseto - Mercato Esperanto',
        'extraction_date': georef['timestamp'],
        'total_stalls': len(stalls),
        'stalls': stalls
    }, f, indent=2)

print(f"✅ Posteggi estratti salvati in: {output_path}")
print(f"📊 Totale posteggi: {len(stalls)}")

# Statistiche
if stalls:
    areas = [s['area'] for s in stalls]
    print(f"📏 Area media: {np.mean(areas):.1f} px²")
    print(f"📏 Area min/max: {min(areas):.1f} / {max(areas):.1f} px²")

