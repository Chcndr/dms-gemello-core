#!/usr/bin/env python3
"""
Ricalcola le coordinate geografiche dei posteggi usando le dimensioni corrette dell'immagine.
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

# Dimensioni nell'overlay editor (quelle nel georef)
EDITOR_WIDTH = georef['image']['width']  # 500
EDITOR_HEIGHT = georef['image']['height']  # 333

print(f"📐 Dimensioni reali: {REAL_WIDTH}x{REAL_HEIGHT}")
print(f"📐 Dimensioni editor: {EDITOR_WIDTH}x{EDITOR_HEIGHT}")
print(f"📏 Scala: {REAL_WIDTH/EDITOR_WIDTH:.3f}x, {REAL_HEIGHT/EDITOR_HEIGHT:.3f}x")

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
    px, py = stall['center_px']
    
    # Converti usando le dimensioni REALI dell'immagine
    geo_coords = pixel_to_geo(px, py, REAL_WIDTH, REAL_HEIGHT, georef)
    
    stall['lat'] = geo_coords[0]
    stall['lng'] = geo_coords[1]

# Salva i dati corretti
output_path = 'data/extracted_stalls.json'
with open(output_path, 'w') as f:
    json.dump(stalls_data, f, indent=2)

print(f"✅ Coordinate corrette salvate in: {output_path}")
print(f"\n📊 Esempio posteggio #1:")
print(f"   Pixel: {stalls[0]['center_px']}")
print(f"   Geo: {stalls[0]['lat']:.6f}, {stalls[0]['lng']:.6f}")

