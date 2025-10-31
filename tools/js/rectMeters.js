/**
 * DMS GIS Container Kit - rectMeters.js
 * Rettangoli metrici che scalano con lo zoom
 */

window.DMS = window.DMS || {};

(function() {
  const CRS = L.CRS.EPSG3857;

  /**
   * Offset metrico rispetto a un LatLng
   * @param {L.LatLng} latlng - Punto di partenza
   * @param {number} dx_m - Offset est-ovest in metri
   * @param {number} dy_m - Offset nord-sud in metri
   * @returns {L.LatLng} Nuovo punto
   */
  function offsetMeters(latlng, dx_m, dy_m) {
    const p = CRS.project(latlng); // metri WebMercator
    const p2 = L.point(p.x + dx_m, p.y + dy_m);
    return CRS.unproject(p2);
  }

  /**
   * Crea un rettangolo metrico ruotato
   * @param {L.LatLng} latlngCenter - Centro del rettangolo
   * @param {number} w - Larghezza in metri
   * @param {number} h - Altezza in metri
   * @param {number} angleDeg - Rotazione in gradi (default 0)
   * @returns {L.Polygon} Poligono rettangolare
   */
  function rectMeters(latlngCenter, w, h, angleDeg = 0) {
    const a = (angleDeg || 0) * Math.PI / 180;
    const hw = w / 2;
    const hh = h / 2;

    const corners = [
      L.point(-hw, -hh),
      L.point(+hw, -hh),
      L.point(+hw, +hh),
      L.point(-hw, +hh)
    ].map(pt => {
      // Rotazione
      const x = Math.cos(a) * pt.x - Math.sin(a) * pt.y;
      const y = Math.sin(a) * pt.x + Math.cos(a) * pt.y;
      return offsetMeters(latlngCenter, x, y);
    });

    return L.polygon(corners, {
      pane: 'stalls',
      weight: 1,
      color: '#4CAF50',
      fillColor: '#4CAF50',
      fillOpacity: 0.3
    });
  }

  /**
   * Crea un layer con rettangoli metrici da una lista
   * @param {L.Map} map - Mappa Leaflet
   * @param {Array} list - Array di oggetti {lat, lng, w, h, angle, id, ...}
   * @returns {L.FeatureGroup} Layer con rettangoli
   */
  function addRectLayer(map, list) {
    const layer = L.featureGroup([], { pane: 'stalls' }).addTo(map);

    list.forEach(r => {
      const rect = rectMeters(
        L.latLng(r.lat, r.lng),
        r.w,
        r.h,
        r.angle || 0
      );

      // Tooltip con ID
      rect.bindTooltip(String(r.id), {
        permanent: false,
        direction: 'center',
        className: 'stall-label'
      });

      // Popup con info
      rect.bindPopup(`
        <strong>Posteggio ${r.id}</strong><br>
        Dimensioni: ${r.w}m x ${r.h}m<br>
        ${r.row ? `Fila: ${r.row}<br>` : ''}
        ${r.status ? `Stato: ${r.status}` : ''}
      `);

      rect.addTo(layer);
    });

    return layer;
  }

  // Esporta
  window.DMS = Object.assign(window.DMS, {
    offsetMeters,
    rectMeters,
    addRectLayer
  });
})();

