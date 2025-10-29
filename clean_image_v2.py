#!/usr/bin/env python3
"""
Pulisce l'immagine della pianta (v2):
- Rileva i rettangoli verdi
- Li riempie completamente (senza numeri)
- Rimuove tutto il resto
"""

from PIL import Image, ImageDraw
import numpy as np
import cv2

# Carica immagine
img = Image.open('data/grosseto_pianta_transparent.png').convert('RGB')
img_np = np.array(img)

print(f"📐 Dimensioni immagine: {img_np.shape}")

# Converti in HSV per miglior rilevamento verde
hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)

# Range per verde (HSV)
# Hue: 35-85 (verde)
# Saturation: 40-255 (non troppo grigio)
# Value: 40-255 (non troppo scuro)
lower_green = np.array([35, 40, 40])
upper_green = np.array([85, 255, 255])

# Crea maschera verde
mask = cv2.inRange(hsv, lower_green, upper_green)

print(f"✅ Pixel verdi rilevati: {np.sum(mask > 0)}")

# Trova contorni dei rettangoli verdi
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

print(f"✅ Contorni trovati: {len(contours)}")

# Filtra contorni troppo piccoli (rumore)
min_area = 50  # pixel
contours_filtered = [c for c in contours if cv2.contourArea(c) > min_area]

print(f"✅ Contorni validi (area > {min_area}): {len(contours_filtered)}")

# Crea immagine pulita (trasparente)
img_clean = Image.new('RGBA', img.size, (0, 0, 0, 0))
draw = ImageDraw.Draw(img_clean)

# Disegna rettangoli verdi PIENI (senza numeri)
verde_pieno = (76, 175, 80, 255)  # Verde Material Design

for contour in contours_filtered:
    # Converti contorno in lista di punti
    points = [(int(pt[0][0]), int(pt[0][1])) for pt in contour]
    
    # Disegna poligono pieno
    draw.polygon(points, fill=verde_pieno, outline=verde_pieno)

# Salva
output_path = 'data/grosseto_pianta_clean.png'
img_clean.save(output_path, 'PNG')

print(f"✅ Immagine pulita salvata: {output_path}")
print(f"✅ Rettangoli verdi disegnati: {len(contours_filtered)}")

