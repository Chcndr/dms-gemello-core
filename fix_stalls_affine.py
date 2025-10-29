#!/usr/bin/env python3
"""
Rigenera le coordinate dei posteggi usando trasformazione affine.
Questo metodo è matematicamente corretto e gestisce rotazione, scala e traslazione.
"""

import json
import numpy as np

# Carica dati
with open('data/grosseto_overlay_georef_NEW.json', 'r') as f:
    georef = json.load(f)

with open('data/extracted_stalls.json', 'r') as f:
    stalls_data = json.load(f)

# Dimensioni immagine reale
REAL_WIDTH = 1801
REAL_HEIGHT = 1200

# Dimensioni immagine nell'editor (scalata)
EDITOR_WIDTH = georef['image']['width']  # 500
EDITOR_HEIGHT = georef['image']['height']  # 333
EDITOR_SCALE = georef['transform']['scale']  # 1.85

# Dimensioni finali nell'editor dopo la scala
SCALED_WIDTH = EDITOR_WIDTH * EDITOR_SCALE  # 925
SCALED_HEIGHT = EDITOR_HEIGHT * EDITOR_SCALE  # 616.05

# Corner geografici (lat, lng)
nw = georef['corners']['nw']  # [lat, lng]
ne = georef['corners']['ne']
se = georef['corners']['se']
sw = georef['corners']['sw']

print(f"📐 Dimensioni immagine reale: {REAL_WIDTH}x{REAL_HEIGHT}")
print(f"📐 Dimensioni editor scalato: {SCALED_WIDTH:.1f}x{SCALED_HEIGHT:.1f}")
print(f"🌍 Corner NW: {nw}")
print(f"🌍 Corner NE: {ne}")
print(f"🌍 Corner SE: {se}")
print(f"🌍 Corner SW: {sw}")

# TRASFORMAZIONE AFFINE
# Punti sorgente: corner dell'immagine nell'editor (pixel)
# Punti destinazione: corner geografici (lat, lng)

# Scala pixel dall'immagine reale all'immagine editor
scale_x = SCALED_WIDTH / REAL_WIDTH
scale_y = SCALED_HEIGHT / REAL_HEIGHT

print(f"\n📏 Scala X: {scale_x:.6f}")
print(f"📏 Scala Y: {scale_y:.6f}")

# Corner dell'immagine nell'editor (pixel dell'editor)
# Origine in alto a sinistra
src_corners = np.array([
    [0, 0],                          # NW (top-left)
    [SCALED_WIDTH, 0],               # NE (top-right)
    [SCALED_WIDTH, SCALED_HEIGHT],   # SE (bottom-right)
    [0, SCALED_HEIGHT]               # SW (bottom-left)
], dtype=np.float32)

# Corner geografici corrispondenti
# ATTENZIONE: Leaflet usa [lat, lng] ma per la trasformazione usiamo [lng, lat] (x, y)
dst_corners = np.array([
    [nw[1], nw[0]],  # NW: [lng, lat]
    [ne[1], ne[0]],  # NE: [lng, lat]
    [se[1], se[0]],  # SE: [lng, lat]
    [sw[1], sw[0]]   # SW: [lng, lat]
], dtype=np.float64)

print(f"\n🔢 Corner sorgente (pixel editor):")
print(src_corners)
print(f"\n🌍 Corner destinazione (geografici [lng, lat]):")
print(dst_corners)

# Calcola matrice di trasformazione affine usando i primi 3 punti
# (3 punti sono sufficienti per una trasformazione affine)
src_3 = src_corners[:3]
dst_3 = dst_corners[:3]

# Risolvi il sistema lineare per trovare la matrice di trasformazione
# [x', y'] = [a, b] * [x] + [tx]
#            [c, d]   [y]   [ty]
#
# x' = a*x + b*y + tx
# y' = c*x + d*y + ty

# Costruisci il sistema lineare
A = np.c_[src_3, np.ones(3)]  # [x, y, 1]
B_lng = dst_3[:, 0]  # lng (x')
B_lat = dst_3[:, 1]  # lat (y')

# Risolvi per lng
params_lng = np.linalg.lstsq(A, B_lng, rcond=None)[0]
a, b, tx = params_lng

# Risolvi per lat
params_lat = np.linalg.lstsq(A, B_lat, rcond=None)[0]
c, d, ty = params_lat

print(f"\n🔧 Matrice di trasformazione affine:")
print(f"   lng = {a:.10f} * x + {b:.10f} * y + {tx:.10f}")
print(f"   lat = {c:.10f} * x + {d:.10f} * y + {ty:.10f}")

# Funzione di trasformazione
def pixel_to_geo_affine(px, py):
    """Converte coordinate pixel (immagine reale) in coordinate geografiche"""
    # Scala pixel dall'immagine reale all'editor
    px_editor = px * scale_x
    py_editor = py * scale_y
    
    # Applica trasformazione affine
    lng = a * px_editor + b * py_editor + tx
    lat = c * px_editor + d * py_editor + ty
    
    return lat, lng

# Verifica trasformazione sui corner
print(f"\n✅ VERIFICA TRASFORMAZIONE SUI CORNER:")
test_points = [
    (0, 0, "NW"),
    (REAL_WIDTH, 0, "NE"),
    (REAL_WIDTH, REAL_HEIGHT, "SE"),
    (0, REAL_HEIGHT, "SW")
]

for px, py, name in test_points:
    lat, lng = pixel_to_geo_affine(px, py)
    print(f"   {name}: pixel ({px}, {py}) → geo ({lat:.8f}, {lng:.8f})")

# Rigenera coordinate posteggi
print(f"\n🔄 RIGENERAZIONE COORDINATE {len(stalls_data['stalls'])} POSTEGGI...")

for stall in stalls_data['stalls']:
    px, py = stall['center_px']
    lat, lng = pixel_to_geo_affine(px, py)
    stall['lat'] = lat
    stall['lng'] = lng

# Crea JSON completo
complete_data = {
    'mercato': georef['mercato'],
    'timestamp': georef['timestamp'],
    'georef': georef,
    'stalls': {
        'total': len(stalls_data['stalls']),
        'items': stalls_data['stalls']
    },
    'transform_method': 'affine',
    'transform_matrix': {
        'lng': {'a': float(a), 'b': float(b), 'tx': float(tx)},
        'lat': {'c': float(c), 'd': float(d), 'ty': float(ty)}
    }
}

# Salva
with open('data/grosseto_complete.json', 'w') as f:
    json.dump(complete_data, f, indent=2)

print(f"\n✅ COMPLETATO!")
print(f"📁 File salvato: data/grosseto_complete.json")
print(f"📍 Posteggi totali: {len(stalls_data['stalls'])}")
print(f"🎯 Centro mercato: {georef['center']}")

