/**
 * DMS GIS Container Kit - container.js
 * Conversione container → GeoJSON layers
 */

window.DMS = window.DMS || {};

(function() {
  const CRS = L.CRS.EPSG3857;

  /**
   * Converte LatLng in coordinate WebMercator metri
   * @param {L.LatLng} latlng - Punto geografico
   * @returns {{x: number, y: number}} Coordinate WebMercator
   */
  function toXY(latlng) {
    const p = CRS.project(L.latLng(latlng[0], latlng[1]));
    return { x: p.x, y: p.y };
  }

  /**
   * Converte coordinate WebMercator in LatLng
   * @param {{x: number, y: number}} pt - Coordinate WebMercator
   * @returns {L.LatLng} Punto geografico
   */
  function fromXY(pt) {
    return CRS.unproject(L.point(pt.x, pt.y));
  }

  /**
   * Converte container in area + posteggi georeferenziati
   * @param {Object} container - Container JSON
   * @returns {{area: Object, stalls: Object}} GeoJSON area e stalls
   */
  function containerToLayers(container) {
    // Estrai GCP
    const pxs = container.gcp.map(g => ({ x: g.px[0], y: g.px[1] }));
    const wms = container.gcp.map(g => toXY(g.ll));

    // Calcola omografia
    const H = DMS.computeHomography(pxs, wms);

    // Converti area
    const areaCoords = container.area_px.map(pt => {
      const ll = DMS.applyH(H, pt[0], pt[1]);
      return [ll.lng, ll.lat];
    });

    const areaGeoJSON = {
      type: 'Feature',
      properties: {
        id: container.id,
        name: container.name || container.id,
        type: 'market_area'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [areaCoords]
      }
    };

    // Converti posteggi
    const stallsFeatures = container.stalls_px.map(stall => {
      // Centro del posteggio (media dei vertici)
      const cx = stall.poly.reduce((sum, pt) => sum + pt[0], 0) / stall.poly.length;
      const cy = stall.poly.reduce((sum, pt) => sum + pt[1], 0) / stall.poly.length;

      const center = DMS.applyH(H, cx, cy);

      // Converti poligono
      const coords = stall.poly.map(pt => {
        const ll = DMS.applyH(H, pt[0], pt[1]);
        return [ll.lng, ll.lat];
      });

      return {
        type: 'Feature',
        properties: {
          id: stall.id,
          row: stall.row || '',
          width: stall.w || 0,
          height: stall.h || 0,
          center_lat: center.lat,
          center_lng: center.lng,
          type: 'stall'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        }
      };
    });

    const stallsGeoJSON = {
      type: 'FeatureCollection',
      features: stallsFeatures
    };

    return {
      area: areaGeoJSON,
      stalls: stallsGeoJSON
    };
  }

  /**
   * Carica container e genera layers sulla mappa
   * @param {L.Map} map - Mappa Leaflet
   * @param {Object} container - Container JSON
   * @returns {{areaLayer: L.GeoJSON, stallsLayer: L.GeoJSON}} Layers
   */
  function loadContainer(map, container) {
    const { area, stalls } = containerToLayers(container);

    // Layer area
    const areaLayer = L.geoJSON(area, {
      style: {
        color: '#4CAF50',
        weight: 2,
        fillOpacity: 0.1
      }
    }).addTo(map);

    // Layer posteggi
    const stallsLayer = L.geoJSON(stalls, {
      style: {
        color: '#4CAF50',
        weight: 1,
        fillOpacity: 0.3
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        
        // Tooltip
        layer.bindTooltip(String(props.id), {
          permanent: false,
          direction: 'center',
          className: 'stall-label'
        });

        // Popup
        layer.bindPopup(`
          <strong>Posteggio ${props.id}</strong><br>
          Dimensioni: ${props.width}m x ${props.height}m<br>
          ${props.row ? `Fila: ${props.row}<br>` : ''}
          Coordinate: ${props.center_lat.toFixed(6)}, ${props.center_lng.toFixed(6)}
        `);
      }
    }).addTo(map);

    // Zoom su area
    map.fitBounds(areaLayer.getBounds());

    return { areaLayer, stallsLayer };
  }

  // Esporta
  window.DMS = Object.assign(window.DMS, {
    toXY,
    fromXY,
    containerToLayers,
    loadContainer
  });
})();

