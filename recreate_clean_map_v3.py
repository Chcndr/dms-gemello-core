#!/usr/bin/env python3
"""
FOTOCOPIATRICE DIGITALE V3
Strategia: Approssima ogni contorno a un rettangolo geometrico perfetto
"""

from PIL import Image, ImageDraw, ImageFont
import numpy as np
import cv2
import json

print("🖨️  FOTOCOPIATRICE DIGITALE V3 - Rettangoli Geometrici")
print("=" * 60)

# Carica immagine originale
img = Image.open('data/grosseto_pianta_transparent.png').convert('RGB')
img_np = np.array(img)
height, width = img_np.shape[:2]

print(f"📐 Dimensioni immagine: {width}x{height}")

# Converti in HSV
hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)

# Range per verde
lower_green = np.array([35, 40, 40])
upper_green = np.array([85, 255, 255])
mask = cv2.inRange(hsv, lower_green, upper_green)

print(f"✅ Pixel verdi rilevati: {np.sum(mask > 0)}")

# Trova contorni (SENZA morphological operations)
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

print(f"✅ Contorni trovati: {len(contours)}")

# Filtra e approssima a rettangoli
min_area = 100
rectangles = []

for c in contours:
    area = cv2.contourArea(c)
    if area > min_area:
        # Approssima a rettangolo ruotato (minAreaRect)
        rect = cv2.minAreaRect(c)
        box = cv2.boxPoints(rect)
        box = np.intp(box)
        
        # Calcola centro
        center = rect[0]
        cx, cy = int(center[0]), int(center[1])
        
        rectangles.append({
            'box': box,
            'center': (cx, cy),
            'area': area,
            'rect': rect
        })

print(f"✅ Rettangoli validi: {len(rectangles)}")

# Ordina per posizione
rectangles.sort(key=lambda r: (r['center'][1] // 50, r['center'][0]))

print(f"✅ Rettangoli ordinati")

# Crea immagine pulita
img_clean = Image.new('RGBA', (width, height), (0, 0, 0, 0))
draw = ImageDraw.Draw(img_clean)

# Colore verde
verde = (76, 175, 80, 255)

# Font
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
except:
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 16)
    except:
        font = ImageFont.load_default()

print(f"✅ Font caricato")

# Disegna rettangoli geometrici perfetti
stalls_data = []

for idx, item in enumerate(rectangles):
    num = idx + 1
    box = item['box']
    cx, cy = item['center']
    
    # Converti box in lista di tuple per PIL
    points = [(int(pt[0]), int(pt[1])) for pt in box]
    
    # Disegna rettangolo PIENO (geometrico perfetto)
    draw.polygon(points, fill=verde, outline=verde)
    
    # Disegna numero
    text = str(num)
    
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
    except:
        text_width, text_height = 20, 20
    
    text_x = cx - text_width // 2
    text_y = cy - text_height // 2
    
    # Bordo nero
    for dx, dy in [(-1,-1), (-1,1), (1,-1), (1,1)]:
        draw.text((text_x+dx, text_y+dy), text, fill=(0, 0, 0, 255), font=font)
    
    # Testo bianco
    draw.text((text_x, text_y), text, fill=(255, 255, 255, 255), font=font)
    
    # Salva dati
    stalls_data.append({
        'id': num,
        'center_px': [cx, cy],
        'box': box.tolist(),
        'area': item['area']
    })
    
    if (idx + 1) % 50 == 0:
        print(f"   Processati {idx + 1}/{len(rectangles)} rettangoli...")

print(f"✅ Disegnati {len(rectangles)} rettangoli geometrici")

# Salva
output_path = 'data/grosseto_pianta_clean.png'
img_clean.save(output_path, 'PNG')

print(f"✅ Immagine salvata: {output_path}")

# Salva JSON
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

print(f"✅ Dati salvati: data/extracted_stalls_clean.json")

print("\n" + "=" * 60)
print(f"🎉 COMPLETATO!")
print(f"📊 Posteggi totali: {len(stalls_data)}")
print(f"📁 Immagine: {output_path}")

