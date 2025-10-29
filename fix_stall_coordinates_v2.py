#!/usr/bin/env python3
"""
Ricalcola le coordinate geografiche dei posteggi scalando correttamente i pixel.
"""

import json

# Carica dati
with open('data/grosseto_overlay_georef.json', 'r') as f:
    georef = json.load(f)

with open('data/extracted_stalls.json', 'r') as f:
    stalls_data = json.load(f)

# Dimensioni reali dell'immagine
REAL_WIDTH = 1801
REAL_HEIGHT = 1200

# Dimensioni nell'overlay editor (base, prima della scala)
EDITOR_BASE_WIDTH = georef['image']['width']  # 500
EDITOR_BASE_HEIGHT = georef['image']['height']  # 333

# Scala applicata nell'editor
EDITOR_SCALE = georef['transform']['scale']  # 1.8

# Dimensioni effettive nell'editor (dopo la scala)
EDITOR_SCALED_WIDTH = EDITOR_BASE_WIDTH * EDITOR_SCALE  # 500 * 1.8 = 900
EDITOR_SCALED_HEIGHT = EDITOR_BASE_HEIGHT * EDITOR_SCALE  # 333 * 1.8 = 599

print(f"📐 Dimensioni reali immagine: {REAL_WIDTH}x{REAL_HEIGHT}")
print(f"📐 Dimensioni editor (base): {EDITOR_BASE_WIDTH}x{EDITOR_BASE_HEIGHT}")
print(f"📐 Scala editor: {EDITOR_SCALE}x")
print(f"📐 Dimensioni editor (scalate): {EDITOR_SCALED_WIDTH:.0f}x{EDITOR_SCALED_HEIGHT:.0f}")
print(f"📏 Fattore scala: {EDITOR_SCALED_WIDTH/REAL_WIDTH:.4f}x, {EDITOR_SCALED_HEIGHT/REAL_HEIGHT:.4f}x")

# Funzione per convertire coordinate pixel → geografiche
def pixel_to_geo(px, py, img_width, img_height, georef):
    """
    Converte coordinate pixel in coordinate geografiche.
    px, py sono coordinate nell'immagine scalata dell'editor.
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
    top_lat = nw[0] + (ne[0] - nw[0]) * norm_x
    top_lng = nw[1] + (ne[1] - nw[1]) * norm_x
    
    bottom_lat = sw[0] + (se[0] - sw[0]) * norm_x
    bottom_lng = sw[1] + (se[1] - sw[1]) * norm_x
    
    lat = top_lat + (bottom_lat - top_lat) * norm_y
    lng = top_lng + (bottom_lng - top_lng) * norm_y
    
    return [lat, lng]

# Ricalcola coordinate per tutti i posteggi
stalls = stalls_data['stalls']
print(f"\n🔄 Ricalcolo coordinate per {len(stalls)} posteggi...")

for stall in stalls:
    px_real, py_real = stall['center_px']
    
    # SCALA le coordinate dall'immagine reale a quella dell'editor
    px_editor = px_real * (EDITOR_SCALED_WIDTH / REAL_WIDTH)
    py_editor = py_real * (EDITOR_SCALED_HEIGHT / REAL_HEIGHT)
    
    # Converti usando le dimensioni SCALATE dell'editor
    geo_coords = pixel_to_geo(px_editor, py_editor, EDITOR_SCALED_WIDTH, EDITOR_SCALED_HEIGHT, georef)
    
    stall['lat'] = geo_coords[0]
    stall['lng'] = geo_coords[1]

# Salva i dati corretti
output_path = 'data/extracted_stalls.json'
with open(output_path, 'w') as f:
    json.dump(stalls_data, f, indent=2)

print(f"✅ Coordinate corrette salvate in: {output_path}")
print(f"\n📊 Esempio posteggio #1:")
print(f"   Pixel reali: {stalls[0]['center_px']}")
print(f"   Geo: {stalls[0]['lat']:.6f}, {stalls[0]['lng']:.6f}")

