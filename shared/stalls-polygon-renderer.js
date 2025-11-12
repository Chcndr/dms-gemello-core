/**
 * DMS Stalls Polygon Renderer
 * Modulo riutilizzabile per renderizzare posteggi come Polygon geografici
 * Copiato dallo Slot Editor v3 - FUNZIONANTE AL 100%
 */

(function(window) {
  'use strict';

  /**
   * Calcola i 4 corner geografici di un posteggio rettangolare
   * @param {Object} center - {lat, lng} centro del posteggio
   * @param {number} widthMeters - Larghezza in metri
   * @param {number} heightMeters - Altezza in metri
   * @param {number} rotation - Rotazione in gradi (0-360)
   * @returns {Array} Array di [lat, lng] per i 4 corner
   */
  function calculateSlotBounds(center, widthMeters, heightMeters, rotation) {
    // Calcola offset in metri (conversione metri → gradi lat/lng)
    const latOffset = (heightMeters / 2) / 111320; // 1 grado lat ≈ 111.32 km
    const lngOffset = (widthMeters / 2) / (111320 * Math.cos(center.lat * Math.PI / 180));
    
    // Corner base (senza rotazione)
    const corners = [
      [center.lat + latOffset, center.lng - lngOffset], // top-left
      [center.lat + latOffset, center.lng + lngOffset], // top-right
      [center.lat - latOffset, center.lng + lngOffset], // bottom-right
      [center.lat - latOffset, center.lng - lngOffset]  // bottom-left
    ];
    
    // Applica rotazione (compensando proiezione Mercatore)
    if (rotation !== 0) {
      const rad = rotation * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      
      // Fattore di compensazione Mercatore alla latitudine corrente
      const mercatorFactor = Math.cos(center.lat * Math.PI / 180);
      
      return corners.map(([lat, lng]) => {
        const dLat = lat - center.lat;
        const dLng = (lng - center.lng) * mercatorFactor; // Scala lng per compensare
        
        // Ruota in spazio "piatto"
        const rotatedLat = dLat * cos - dLng * sin;
        const rotatedLng = (dLat * sin + dLng * cos) / mercatorFactor; // Descala lng
        
        return [
          center.lat + rotatedLat,
          center.lng + rotatedLng
        ];
      });
    }
    
    return corners;
  }

  /**
   * Renderizza un posteggio come Polygon su mappa Leaflet
   * @param {Object} map - Istanza mappa Leaflet
   * @param {Object} stallData - Dati posteggio
   * @param {Object} options - Opzioni rendering
   * @returns {Object} {polygon, tooltip} - Oggetti Leaflet creati
   */
  function renderStallPolygon(map, stallData, options = {}) {
    const {
      number,
      lat,
      lng,
      width = 4.0,
      height = 7.6,
      rotation = 0,
      status = 'free',
      color = null,
      fillColor = null,
      showNumber = true,
      interactive = true
    } = stallData;

    // Colori default per stato
    const statusColors = {
      free: { color: '#4CAF50', fillColor: '#4CAF50' },
      busy: { color: '#FFC107', fillColor: '#FFC107' },
      taken: { color: '#F44336', fillColor: '#F44336' },
      reserved: { color: '#2196F3', fillColor: '#2196F3' }
    };

    const colors = statusColors[status] || statusColors.free;
    const finalColor = color || colors.color;
    const finalFillColor = fillColor || colors.fillColor;

    // Calcola corner geografici
    const center = { lat, lng };
    const corners = calculateSlotBounds(center, width, height, rotation);
    
    // Crea polygon
    const polygon = L.polygon(corners, {
      color: finalColor,
      weight: 2,
      fillColor: finalFillColor,
      fillOpacity: 0.9,
      className: `stall-polygon stall-${status}`,
      interactive: interactive
    }).addTo(map);
    
    // Aggiungi tooltip con numero (se richiesto)
    let tooltip = null;
    if (showNumber && number) {
      tooltip = L.tooltip({
        permanent: true,
        direction: 'center',
        className: 'stall-number-label',
        offset: [0, 0]
      })
      .setContent(`<div style="font-weight: bold; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">${number}</div>`)
      .setLatLng(center);
      
      polygon.bindTooltip(tooltip).openTooltip();
    }
    
    // Aggiungi popup con intestazione impresa
    const businessName = stallData.businessName || stallData.impresa || 'Posteggio Libero';
    const marketName = stallData.marketName || 'Mercato';
    
    const popupContent = `
      <div style="min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 16px; border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">
          🏪 ${businessName}
        </h3>
        <div style="font-size: 14px; color: #555;">
          <p style="margin: 5px 0;"><strong>📍 Posteggio:</strong> #${number}</p>
          <p style="margin: 5px 0;"><strong>🗺️ Mercato:</strong> ${marketName}</p>
          <p style="margin: 5px 0;"><strong>📏 Dimensioni:</strong> ${width.toFixed(1)}m × ${height.toFixed(1)}m</p>
          <p style="margin: 5px 0;"><strong>🧭 Coordinate:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
          <p style="margin: 5px 0;"><strong>🔄 Rotazione:</strong> ${rotation.toFixed(1)}°</p>
          <p style="margin: 5px 0;"><strong>📊 Stato:</strong> <span style="color: ${finalFillColor}; font-weight: bold;">${status === 'free' ? 'Libero' : status === 'busy' ? 'Occupato' : status === 'taken' ? 'Assegnato' : 'Riservato'}</span></p>
        </div>
      </div>
    `;
    
    polygon.bindPopup(popupContent, { maxWidth: 300 });
    
    return { polygon, tooltip };
  }

  /**
   * Renderizza un array di posteggi da GeoJSON
   * @param {Object} map - Istanza mappa Leaflet
   * @param {Object} stallsGeoJSON - FeatureCollection GeoJSON
   * @param {Object} options - Opzioni rendering
   * @returns {Array} Array di {polygon, tooltip, data}
   */
  function renderStallsFromGeoJSON(map, stallsGeoJSON, options = {}) {
    if (!stallsGeoJSON || !stallsGeoJSON.features) {
      console.warn('⚠️ GeoJSON posteggi non valido');
      return [];
    }

    const rendered = [];

    stallsGeoJSON.features.forEach(feature => {
      const props = feature.properties;
      const geom = feature.geometry;

      // Se è già un Polygon, usa il centro
      let lat, lng;
      if (geom.type === 'Polygon') {
        const coords = geom.coordinates[0];
        lat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
        lng = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
      } else if (geom.type === 'Point') {
        [lng, lat] = geom.coordinates;
      } else {
        console.warn('⚠️ Tipo geometria non supportato:', geom.type);
        return;
      }

      // Estrai dimensioni
      const dims = props.dimensions || '4.0m × 7.6m';
      const dimMatch = dims.match(/([\d.]+).*?([\d.]+)/);
      const width = dimMatch ? parseFloat(dimMatch[1]) : 4.0;
      const height = dimMatch ? parseFloat(dimMatch[2]) : 7.6;

      const stallData = {
        number: props.number,
        lat,
        lng,
        width,
        height,
        rotation: props.orientation || 0,
        status: props.status || 'free'
      };

      const result = renderStallPolygon(map, stallData, options);
      rendered.push({
        ...result,
        data: stallData
      });
    });

    console.log(`✅ Renderizzati ${rendered.length} posteggi come Polygon`);
    return rendered;
  }

  // Esponi API globale
  window.DMSStallsRenderer = {
    calculateSlotBounds,
    renderStallPolygon,
    renderStallsFromGeoJSON
  };

})(window);
