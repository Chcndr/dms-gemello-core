#!/usr/bin/env python3
"""
TOOL "FOTOCOPIATRICE DIGITALE"
Ricrea la pianta del mercato da zero:
- Rileva rettangoli verdi dall'originale
- Li ridisegna puliti su sfondo trasparente
- Aggiunge numeri chiari e leggibili
"""

from PIL import Image, ImageDraw, ImageFont
import numpy as np
import cv2
import json

print("🖨️  FOTOCOPIATRICE DIGITALE - Mercato Grosseto")
print("=" * 60)

# Carica immagine originale
img = Image.open('data/grosseto_pianta_transparent.png').convert('RGB')
img_np = np.array(img)
height, width = img_np.shape[:2]

print(f"📐 Dimensioni immagine: {width}x{height}")

# Converti in HSV per rilevamento verde
hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)

# Range per verde
lower_green = np.array([35, 40, 40])
upper_green = np.array([85, 255, 255])
mask = cv2.inRange(hsv, lower_green, upper_green)

print(f"✅ Pixel verdi rilevati: {np.sum(mask > 0)}")

# Applica morphological closing per riempire buchi
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
mask_closed = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=1)

# Trova contorni
contours, _ = cv2.findContours(mask_closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Filtra e ordina contorni
min_area = 100
contours_filtered = []

for c in contours:
    area = cv2.contourArea(c)
    if area > min_area:
        # Calcola bounding box
        x, y, w, h = cv2.boundingRect(c)
        
        # Calcola centro
        M = cv2.moments(c)
        if M['m00'] > 0:
            cx = int(M['m10'] / M['m00'])
            cy = int(M['m01'] / M['m00'])
        else:
            cx, cy = x + w//2, y + h//2
        
        contours_filtered.append({
            'contour': c,
            'area': area,
            'bbox': (x, y, w, h),
            'center': (cx, cy)
        })

print(f"✅ Rettangoli validi trovati: {len(contours_filtered)}")

# Ordina per posizione (top-left to bottom-right)
contours_filtered.sort(key=lambda c: (c['center'][1] // 50, c['center'][0]))

print(f"✅ Rettangoli ordinati per posizione")

# Crea immagine pulita
img_clean = Image.new('RGBA', (width, height), (0, 0, 0, 0))
draw = ImageDraw.Draw(img_clean)

# Colore verde Material Design
verde = (76, 175, 80, 255)

# Font per numeri (prova diversi font)
try:
    # Prova font di sistema
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
except:
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 16)
    except:
        # Fallback a font di default
        font = ImageFont.load_default()

print(f"✅ Font caricato")

# Disegna rettangoli e numeri
stalls_data = []

for idx, item in enumerate(contours_filtered):
    num = idx + 1
    contour = item['contour']
    cx, cy = item['center']
    
    # Converti contorno in lista di punti
    points = [(int(pt[0][0]), int(pt[0][1])) for pt in contour]
    
    # Disegna rettangolo pieno
    draw.polygon(points, fill=verde, outline=verde)
    
    # Disegna numero bianco al centro
    text = str(num)
    
    # Calcola dimensioni testo per centrarlo
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
    except:
        # Fallback per versioni vecchie di Pillow
        text_width, text_height = 20, 20
    
    text_x = cx - text_width // 2
    text_y = cy - text_height // 2
    
    # Disegna numero con bordo nero per leggibilità
    # Bordo nero
    for dx, dy in [(-1,-1), (-1,1), (1,-1), (1,1)]:
        draw.text((text_x+dx, text_y+dy), text, fill=(0, 0, 0, 255), font=font)
    
    # Testo bianco
    draw.text((text_x, text_y), text, fill=(255, 255, 255, 255), font=font)
    
    # Salva dati posteggio
    stalls_data.append({
        'id': num,
        'center_px': [cx, cy],
        'bbox': item['bbox'],
        'area': item['area']
    })
    
    if (idx + 1) % 50 == 0:
        print(f"   Processati {idx + 1}/{len(contours_filtered)} rettangoli...")

print(f"✅ Disegnati {len(contours_filtered)} rettangoli con numeri")

# Salva immagine
output_path = 'data/grosseto_pianta_clean.png'
img_clean.save(output_path, 'PNG')

print(f"✅ Immagine salvata: {output_path}")

# Salva dati posteggi
stalls_output = {
    'total': len(stalls_data),
    'stalls': stalls_data,
    'image': {
        'width': width,
        'height': height,
        'source': output_path
    }
}

with open('data/extracted_stalls_clean.json', 'w') as f:
    json.dump(stalls_output, f, indent=2)

print(f"✅ Dati posteggi salvati: data/extracted_stalls_clean.json")

print("\n" + "=" * 60)
print(f"🎉 COMPLETATO!")
print(f"📊 Posteggi totali: {len(stalls_data)}")
print(f"📁 Immagine pulita: {output_path}")
print(f"📁 Dati JSON: data/extracted_stalls_clean.json")

