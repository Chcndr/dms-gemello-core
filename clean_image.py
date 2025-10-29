#!/usr/bin/env python3
"""
Pulisce l'immagine della pianta:
- Rimuove sfondo bianco/grigio
- Rimuove numeri neri
- Lascia SOLO i rettangoli verdi
"""

from PIL import Image
import numpy as np

# Carica immagine
img = Image.open('data/grosseto_pianta_transparent.png').convert('RGBA')
data = np.array(img)

print(f"📐 Dimensioni immagine: {data.shape}")

# Estrai canali RGB
r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

# STEP 1: Identifica i rettangoli verdi
# Verde: R < 150, G > 100, B < 150
is_green = (r < 150) & (g > 100) & (b < 150)

print(f"✅ Pixel verdi trovati: {np.sum(is_green)}")

# STEP 2: Crea maschera trasparente
# Tutto trasparente tranne i verdi
alpha_new = np.where(is_green, 255, 0).astype(np.uint8)

# STEP 3: Mantieni colori originali ma cambia alpha
data_new = data.copy()
data_new[:,:,3] = alpha_new

# Crea nuova immagine
img_clean = Image.fromarray(data_new, 'RGBA')

# Salva
output_path = 'data/grosseto_pianta_clean.png'
img_clean.save(output_path, 'PNG')

print(f"✅ Immagine pulita salvata: {output_path}")
print(f"📊 Pixel trasparenti: {np.sum(alpha_new == 0)}")
print(f"📊 Pixel verdi: {np.sum(alpha_new == 255)}")

