/**
 * DMS GIS Container Kit - zoomStyle.js
 * Stile adattivo su zoom (bordi, font)
 */

window.DMS = window.DMS || {};

(function() {
  /**
   * Adatta lo stile (bordi, font) allo zoom
   * @param {L.Map} map - Mappa Leaflet
   * @param {L.Layer} vectorLayer - Layer vettoriale (GeoJSON, FeatureGroup)
   * @param {number} baseZoom - Zoom di riferimento (default 18)
   */
  function attachZoomStyling(map, vectorLayer, baseZoom = 18) {
    function restyle() {
      const z = map.getZoom();
      const scale = Math.pow(2, z - baseZoom);

      // Aggiorna bordi
      if (vectorLayer.setStyle) {
        vectorLayer.setStyle({
          weight: Math.max(0.5, 1 / scale)
        });
      }

      // Aggiorna font label
      document.querySelectorAll('.leaflet-tooltip').forEach(el => {
        const fs = Math.max(10, 12 / scale);
        el.style.fontSize = fs + 'px';
      });
    }

    map.on('zoomend', restyle);
    restyle(); // Applica subito
  }

  // Esporta
  window.DMS = Object.assign(window.DMS, {
    attachZoomStyling
  });
})();

