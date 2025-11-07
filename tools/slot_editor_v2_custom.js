// Sistema unificato per marker e aree personalizzabili

// Funzione per creare marker personalizzabile
function createCustomMarker(latlng, config) {
  const {
    letter = 'M',
    size = 30,
    bgColor = '#4CAF50',
    textColor = '#FFFFFF',
    borderColor = '#2E7D32',
    borderWidth = 3
  } = config;
  
  return L.marker(latlng, {
    icon: L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: ${size}px; 
        height: ${size}px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        background: ${bgColor}; 
        border: ${borderWidth}px solid ${borderColor}; 
        border-radius: 4px; 
        font-weight: bold; 
        font-size: ${size * 0.5}px; 
        color: ${textColor};
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${letter}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    }),
    draggable: true
  });
}

// Funzione per creare form popup marker personalizzabile
function createCustomMarkerForm(marker) {
  return `
    <div style="min-width: 300px; max-width: 400px;">
      <h3 style="margin: 0 0 12px 0;">📍 Marker Personalizzabile #${marker.number}</h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div>
          <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Lettera/Simbolo:</label>
          <input type="text" id="marker-letter-${marker.number}" value="${marker.letter || 'M'}" maxlength="2" style="width: 100%; padding: 6px; font-size: 14px; text-align: center;" placeholder="M" />
        </div>
        <div>
          <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Dimensione (px):</label>
          <input type="number" id="marker-size-${marker.number}" value="${marker.size || 30}" min="20" max="60" style="width: 100%; padding: 6px;" />
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div>
          <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Colore Sfondo:</label>
          <input type="color" id="marker-bgcolor-${marker.number}" value="${marker.bgColor || '#4CAF50'}" style="width: 100%; height: 36px; cursor: pointer;" />
        </div>
        <div>
          <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Colore Testo:</label>
          <input type="color" id="marker-textcolor-${marker.number}" value="${marker.textColor || '#FFFFFF'}" style="width: 100%; height: 36px; cursor: pointer;" />
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div>
          <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Colore Bordo:</label>
          <input type="color" id="marker-bordercolor-${marker.number}" value="${marker.borderColor || '#2E7D32'}" style="width: 100%; height: 36px; cursor: pointer;" />
        </div>
        <div>
          <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Spessore Bordo (px):</label>
          <input type="number" id="marker-borderwidth-${marker.number}" value="${marker.borderWidth || 3}" min="1" max="10" style="width: 100%; padding: 6px;" />
        </div>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Nome:</label>
        <input type="text" id="marker-name-${marker.number}" value="${marker.name || ''}" style="width: 100%; padding: 6px;" placeholder="Es: Pizzeria Da Mario" />
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Tipo:</label>
        <select id="marker-type-${marker.number}" style="width: 100%; padding: 6px;">
          <option value="shop" ${marker.type === 'shop' ? 'selected' : ''}>🏪 Negozio</option>
          <option value="service" ${marker.type === 'service' ? 'selected' : ''}>🚻 Servizio</option>
          <option value="poi" ${marker.type === 'poi' ? 'selected' : ''}>📍 Punto di Interesse</option>
          <option value="parking" ${marker.type === 'parking' ? 'selected' : ''}>🅿️ Parcheggio</option>
          <option value="info" ${marker.type === 'info' ? 'selected' : ''}>ℹ️ Info Point</option>
          <option value="other" ${marker.type === 'other' ? 'selected' : ''}>📌 Altro</option>
        </select>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Descrizione:</label>
        <textarea id="marker-desc-${marker.number}" style="width: 100%; padding: 6px; min-height: 60px; resize: vertical;" placeholder="Descrizione...">${marker.description || ''}</textarea>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Info Extra (JSON):</label>
        <textarea id="marker-extra-${marker.number}" style="width: 100%; padding: 6px; min-height: 40px; font-family: monospace; font-size: 11px; resize: vertical;" placeholder='{"orari": "9-22", "telefono": "+39..."}'>${marker.extra ? JSON.stringify(marker.extra) : ''}</textarea>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Status:</label>
        <select id="marker-status-${marker.number}" style="width: 100%; padding: 6px;">
          <option value="active" ${marker.status === 'active' ? 'selected' : ''}>🟢 Attivo</option>
          <option value="inactive" ${marker.status === 'inactive' ? 'selected' : ''}>🔴 Inattivo</option>
          <option value="maintenance" ${marker.status === 'maintenance' ? 'selected' : ''}>🟡 Manutenzione</option>
        </select>
      </div>
      
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
        <strong>Coordinate:</strong><br>
        Lat: ${marker.lat.toFixed(8)}<br>
        Lng: ${marker.lng.toFixed(8)}
      </div>
    </div>
  `;
}

// Funzione per creare area personalizzabile
function createCustomArea(latlngs, config) {
  const {
    fillColor = '#4CAF50',
    fillOpacity = 0.3,
    borderColor = '#2E7D32',
    borderWidth = 3
  } = config;
  
  return L.polygon(latlngs, {
    color: borderColor,
    weight: borderWidth,
    fillColor: fillColor,
    fillOpacity: fillOpacity,
    interactive: true
  });
}

// Funzione per creare form popup area personalizzabile
function createCustomAreaForm(area) {
  return `
    <div style="min-width: 300px; max-width: 400px;">
      <h3 style="margin: 0 0 12px 0;">📐 Area Personalizzabile #${area.number}</h3>
      
      <div style="margin-bottom: 12px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Nome:</label>
        <input type="text" id="area-name-${area.number}" value="${area.name || ''}" style="width: 100%; padding: 6px;" placeholder="Es: Area Mercato" />
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Tipo:</label>
        <select id="area-type-${area.number}" style="width: 100%; padding: 6px;">
          <option value="market" ${area.type === 'market' ? 'selected' : ''}>🏪 Mercato</option>
          <option value="hub" ${area.type === 'hub' ? 'selected' : ''}>🚌 Hub</option>
          <option value="parking" ${area.type === 'parking' ? 'selected' : ''}>🅿️ Parcheggio</option>
          <option value="green" ${area.type === 'green' ? 'selected' : ''}>🌳 Area Verde</option>
          <option value="restricted" ${area.type === 'restricted' ? 'selected' : ''}>🚫 Zona Riservata</option>
          <option value="other" ${area.type === 'other' ? 'selected' : ''}>📍 Altro</option>
        </select>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div>
          <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Colore Riempimento:</label>
          <input type="color" id="area-fillcolor-${area.number}" value="${area.fillColor || '#4CAF50'}" style="width: 100%; height: 36px; cursor: pointer;" />
        </div>
        <div>
          <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Opacità (%):</label>
          <input type="number" id="area-opacity-${area.number}" value="${(area.fillOpacity || 0.3) * 100}" min="0" max="100" style="width: 100%; padding: 6px;" />
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div>
          <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Colore Bordo:</label>
          <input type="color" id="area-bordercolor-${area.number}" value="${area.borderColor || '#2E7D32'}" style="width: 100%; height: 36px; cursor: pointer;" />
        </div>
        <div>
          <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Spessore Bordo (px):</label>
          <input type="number" id="area-borderwidth-${area.number}" value="${area.borderWidth || 3}" min="1" max="10" style="width: 100%; padding: 6px;" />
        </div>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 12px;">Descrizione:</label>
        <textarea id="area-desc-${area.number}" style="width: 100%; padding: 6px; min-height: 60px; resize: vertical;" placeholder="Descrizione area...">${area.description || ''}</textarea>
      </div>
      
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
        <strong>Vertici:</strong> ${area.coordinates ? area.coordinates.length : 0}<br>
        <strong>Area:</strong> ~${area.area ? area.area.toFixed(0) : 0} m²
      </div>
    </div>
  `;
}
