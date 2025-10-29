#!/usr/bin/env python3
"""
Visualizza i posteggi rilevati sull'immagine per debug.
"""

import cv2
import numpy as np
import json

# Carica l'immagine
img = cv2.imread('data/grosseto_pianta_transparent.png')
debug_img = img.copy()

# Carica i posteggi estratti
with open('data/extracted_stalls.json', 'r') as f:
    data = json.load(f)

stalls = data['stalls']

print(f"📊 Visualizzazione di {len(stalls)} posteggi")

# Disegna ogni posteggio
for stall in stalls:
    cx, cy = stall['center_px']
    w, h = stall['width_px'], stall['height_px']
    angle = stall['angle']
    
    # Calcola i 4 vertici del rettangolo ruotato
    rect = ((cx, cy), (w, h), angle)
    box = cv2.boxPoints(rect)
    box = box.astype(int)
    
    # Disegna il rettangolo
    cv2.drawContours(debug_img, [box], 0, (0, 0, 255), 2)  # Rosso
    
    # Disegna il centro
    cv2.circle(debug_img, (int(cx), int(cy)), 3, (255, 0, 0), -1)  # Blu
    
    # Disegna l'ID
    cv2.putText(debug_img, str(stall['id']), (int(cx)-10, int(cy)-10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 0), 1)

# Salva l'immagine debug
output_path = 'data/debug_detection.png'
cv2.imwrite(output_path, debug_img)
print(f"✅ Immagine debug salvata: {output_path}")

# Crea anche una versione con la maschera verde
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
lower_green = np.array([35, 40, 40])
upper_green = np.array([85, 255, 255])
mask = cv2.inRange(hsv, lower_green, upper_green)

# Salva la maschera
cv2.imwrite('data/debug_green_mask.png', mask)
print(f"✅ Maschera verde salvata: data/debug_green_mask.png")

# Statistiche sui posteggi non rilevati
# Conta i pixel verdi totali
green_pixels = np.sum(mask > 0)
detected_pixels = sum(stall['area'] for stall in stalls)

print(f"\n📊 STATISTICHE:")
print(f"Pixel verdi totali: {green_pixels}")
print(f"Pixel rilevati: {int(detected_pixels)}")
print(f"Copertura: {detected_pixels/green_pixels*100:.1f}%")

