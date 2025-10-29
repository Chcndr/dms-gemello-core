#!/usr/bin/env python3
"""
Processa automaticamente l'immagine della pianta e genera JSON completo
con georeferenziazione + posteggi estratti e scalati correttamente.
"""

import cv2
import numpy as np
import json
from pathlib import Path

def extract_stalls_from_image(img_path):
    """Estrae i posteggi dall'immagine."""
    img = cv2.imread(img_path)
    if img is None:
        raise ValueError(f"Impossibile caricare {img_path}")
    
    print(f"✅ Immagine caricata: {img.shape[1]}x{img.shape[0]} px")
    
    # Converti in HSV per rilevare il verde
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Range per il verde dei posteggi
    lower_green = np.array([35, 40, 40])
    upper_green = np.array([85, 255, 255])
    
    # Crea maschera
    mask = cv2.inRange(hsv, lower_green, upper_green)
    
    # Trova contorni
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    print(f"🔍 Trovati {len(contours)} contorni verdi")
    
    # Filtra per dimensione e forma
    stalls = []
    min_area = 30
    max_area = 8000
    
    for i, cnt in enumerate(contours):
        area = cv2.contourArea(cnt)
        if min_area < area < max_area:
            rect = cv2.minAreaRect(cnt)
            center, (width, height), angle = rect
            
            aspect_ratio = max(width, height) / (min(width, height) + 0.001)
            
            if aspect_ratio > 1.1 and aspect_ratio < 8:
                stalls.append({
                    'id': i + 1,
                    'center_px': [float(center[0]), float(center[1])],
                    'width_px': float(width),
                    'height_px': float(height),
                    'angle': float(angle),
                    'area': float(area)
                })
    
    print(f"✅ Filtrati {len(stalls)} posteggi validi")
    return stalls, img.shape[1], img.shape[0]

def scale_and_convert_to_geo(stalls, real_width, real_height, georef):
    """Scala le coordinate e converte in geografiche."""
    
    # Dimensioni nell'editor
    editor_base_width = georef['image']['width']
    editor_base_height = georef['image']['height']
    editor_scale = georef['transform']['scale']
    
    editor_scaled_width = editor_base_width * editor_scale
    editor_scaled_height = editor_base_height * editor_scale
    
    print(f"📐 Scala: {real_width}x{real_height} → {editor_scaled_width:.0f}x{editor_scaled_height:.0f}")
    
    # Fattore di scala
    scale_x = editor_scaled_width / real_width
    scale_y = editor_scaled_height / real_height
    
    for stall in stalls:
        px_real, py_real = stall['center_px']
        
        # Scala le coordinate
        px_editor = px_real * scale_x
        py_editor = py_real * scale_y
        
        # Normalizza (0-1)
        norm_x = px_editor / editor_scaled_width
        norm_y = py_editor / editor_scaled_height
        
        # Interpola tra i corner
        nw = georef['corners']['nw']
        ne = georef['corners']['ne']
        sw = georef['corners']['sw']
        se = georef['corners']['se']
        
        top_lat = nw[0] + (ne[0] - nw[0]) * norm_x
        top_lng = nw[1] + (ne[1] - nw[1]) * norm_x
        
        bottom_lat = sw[0] + (se[0] - sw[0]) * norm_x
        bottom_lng = sw[1] + (se[1] - sw[1]) * norm_x
        
        lat = top_lat + (bottom_lat - top_lat) * norm_y
        lng = top_lng + (bottom_lng - top_lng) * norm_y
        
        stall['lat'] = lat
        stall['lng'] = lng
    
    return stalls

def main():
    # Carica georeferenziazione esistente
    georef_path = 'data/grosseto_overlay_georef.json'
    with open(georef_path, 'r') as f:
        georef = json.load(f)
    
    print(f"✅ Georeferenziazione caricata: {georef_path}")
    
    # Estrai posteggi dall'immagine
    img_path = 'data/grosseto_pianta_transparent.png'
    stalls, real_width, real_height = extract_stalls_from_image(img_path)
    
    # Scala e converti in geografiche
    stalls = scale_and_convert_to_geo(stalls, real_width, real_height, georef)
    
    # Crea JSON completo
    output = {
        'mercato': georef['mercato'],
        'timestamp': georef['timestamp'],
        'georef': georef,
        'stalls': {
            'total': len(stalls),
            'items': stalls
        }
    }
    
    # Salva
    output_path = 'data/grosseto_complete.json'
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ JSON completo salvato: {output_path}")
    print(f"📊 Totale posteggi: {len(stalls)}")
    print(f"📍 Esempio posteggio #1: {stalls[0]['lat']:.6f}, {stalls[0]['lng']:.6f}")

if __name__ == '__main__':
    main()

