
/* DMS Core Map - mod v2
   - Leaflet init
   - Load demo data (Italy borders + sample markets)
   - Layer toggles
   - Simple geocode via Nominatim
   - Fit helpers
   - NUOVO: Slot rendering with L.rectangle (geographic bounds) + colors by status
   - NUOVO: Popup with operator data
*/
(function(){
  const state = {
    map: null,
    layers: {
      italy: L.layerGroup(),
      areas: L.layerGroup(),
      slots: L.layerGroup(),
      slotLabels: L.layerGroup() // Layer separato per numeri
    },
    data: {
      areas: null,
      slots: null
    }
  };

  function init(){
    state.map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    });
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(state.map);

    // Start on Italy
    const italyBounds = L.latLngBounds([[36.6,6.6],[47.2,18.8]]);
    state.map.fitBounds(italyBounds, {padding:[20,20]});

    // add groups
    state.layers.italy.addTo(state.map);
    state.layers.areas.addTo(state.map);
    state.layers.slots.addTo(state.map);
    state.layers.slotLabels.addTo(state.map);

    // load data
    Promise.all([
      fetch('data/italy_borders.geojson').then(r=>r.json()).catch(()=>null),
      fetch('data/sample_markets.geojson').then(r=>r.json()).catch(()=>null)
    ]).then(([italy, markets])=>{
      if(italy){
        L.geoJSON(italy, {style:{color:'#0FA3A3', weight:1, fill:false}}).addTo(state.layers.italy);
      }
      if(markets){
        renderMarkets(markets);
        fitToData();
      }
    });

    // UI bindings
    document.getElementById('fit').onclick = fitToData;
    document.getElementById('reset').onclick = ()=>{
      const b = L.latLngBounds([[36.6,6.6],[47.2,18.8]]); state.map.fitBounds(b, {padding:[20,20]});
    };
    document.getElementById('chkAreas').onchange = (e)=> toggleLayer('areas', e.target.checked);
    document.getElementById('chkSlots').onchange = (e)=> {
      toggleLayer('slots', e.target.checked);
      toggleLayer('slotLabels', e.target.checked);
    };
    document.getElementById('chkItaly').onchange = (e)=> toggleLayer('italy', e.target.checked);
    document.getElementById('go').onclick = geocode;
    document.getElementById('addr').addEventListener('keydown', (ev)=>{
      if(ev.key==='Enter'){ geocode(); }
    });

    // === PATCH ESPOSIZIONE API GLOBALE DMS (mod23) ===
    window.DMS = window.DMS || {};
    // Event bus leggero
    (function(){
      const _ev = {};
      window.DMS.Bus = {
        on(evt, fn){ (_ev[evt] = _ev[evt] || []).push(fn); },
        emit(evt, payload){ (_ev[evt]||[]).forEach(fn => { try{ fn(payload); }catch(e){} }); }
      };
    })();

    // Stato & API core
    window.DMS.Core = window.DMS.Core || {};
    window.DMS.Core.state = window.DMS.Core.state || { map: state.map, layers:{}, cfg:{ r_global:8, hysteresis_m:2 } };
    window.DMS.Map = state.map;

    // Helper: fit Italia e fit su dati
    window.DMS.Core.fitItaly = function(){
      const b = [[47.1,6.6],[36.6,18.6]];
      state.map.fitBounds(L.latLngBounds([ [b[1][0], b[0][1]],[b[0][0], b[1][1]] ]), { padding:[20,20] });
    };
    window.DMS.Core.fitData = function(){
      const g = window.DMS.Core._dataBounds;
      if(g) state.map.fitBounds(g, { padding:[20,20] });
    };
  }

  function toggleLayer(name, on){
    const grp = state.layers[name];
    if(!grp) return;
    if(on){ grp.addTo(state.map); } else { state.map.removeLayer(grp); }
  }

  function renderMarkets(fc){
    // clear
    state.layers.areas.clearLayers();
    state.layers.slots.clearLayers();
    state.layers.slotLabels.clearLayers();

    // split features
    const areas = [];
    const slots = [];
    fc.features.forEach(f=>{
      if(!f || !f.geometry) return;
      if(f.properties && f.properties.kind==='area') areas.push(f);
      else if(f.properties && f.properties.kind==='slot') slots.push(f);
    });

    // areas polygons
    areas.forEach(f=>{
      const poly = L.geoJSON(f, {style: {className:'dms-area'}});
      poly.addTo(state.layers.areas);
    });

    // NUOVO: slot rectangles as geographic bounds
    slots.forEach(f=>{
      const p = f.geometry.coordinates; // [lon,lat]
      const lat = p[1];
      const lon = p[0];
      const num = f.properties.number;
      const status = f.properties.status || 'free';
      const market = f.properties.market || '-';
      const widthM = f.properties.width_m || 3; // Default 3m
      const lengthM = f.properties.length_m || 6; // Default 6m
      const rotation = f.properties.rotation || 0; // Gradi
      
      // Calcola bounds rettangolo geografico
      const bounds = getSlotBounds(lat, lon, widthM, lengthM, rotation);
      
      // Colore basato su stato
      const color = getColorByStatus(status);
      
      // Crea rettangolo geografico
      const rect = L.rectangle(bounds, {
        color: color,
        fillColor: color,
        fillOpacity: 0.7,
        weight: 2,
        className: `dms-slot-rect ${status}`
      });
      
      // Popup con dati posteggio
      const popupContent = createSlotPopup(num, market, status, widthM, lengthM, f.properties.operator);
      rect.bindPopup(popupContent);
      
      // Tooltip al hover
      rect.bindTooltip(`<b>Posteggio ${num}</b><br>Stato: ${status}`, {
        direction:'top',
        offset:[0,-10]
      });
      
      rect.addTo(state.layers.slots);
      
      // Aggiungi numero al centro del rettangolo
      const center = bounds.getCenter();
      const label = L.marker(center, {
        icon: L.divIcon({
          className: 'slot-label',
          html: `<div class="slot-number">${num}</div>`,
          iconSize: [24, 16],
          iconAnchor: [12, 8]
        }),
        interactive: false // Non intercetta click
      });
      label.addTo(state.layers.slotLabels);
    });

    state.data.areas = areas; state.data.slots = slots;
  }

  // NUOVO: Calcola bounds rettangolo da coordinate centro + dimensioni
  function getSlotBounds(lat, lon, widthM, lengthM, rotation = 0) {
    // Converti metri in gradi (approssimazione sferica)
    // 1 grado latitudine ≈ 111.32 km
    // 1 grado longitudine ≈ 111.32 km * cos(lat)
    const latDelta = lengthM / 111320; // metri → gradi lat
    const lonDelta = widthM / (111320 * Math.cos(lat * Math.PI / 180)); // metri → gradi lon
    
    // Calcola 4 angoli rettangolo (senza rotazione per ora)
    const sw = L.latLng(lat - latDelta/2, lon - lonDelta/2);
    const ne = L.latLng(lat + latDelta/2, lon + lonDelta/2);
    
    // TODO: Implementare rotazione se necessario
    // Per ora rettangoli allineati a N-S / E-W
    
    return L.latLngBounds(sw, ne);
  }

  // NUOVO: Colori per stato posteggio
  function getColorByStatus(status) {
    const colors = {
      'free': '#9E9E9E',      // Grigio - libero
      'busy': '#4CAF50',      // Verde - occupato
      'taken': '#F44336',     // Rosso - assente
      'checked': '#FFC107',   // Giallo - spunta effettuata
      'reserved': '#2196F3'   // Blu - riservato
    };
    return colors[status] || '#9E9E9E';
  }

  // NUOVO: Crea contenuto popup posteggio
  function createSlotPopup(num, market, status, widthM, lengthM, operator) {
    const color = getColorByStatus(status);
    const statusLabels = {
      'free': 'Libero',
      'busy': 'Occupato',
      'taken': 'Assente',
      'checked': 'Spunta effettuata',
      'reserved': 'Riservato'
    };
    
    let html = `
      <div class="slot-popup">
        <h4 style="margin:0 0 8px 0; color:#0FA3A3;">Posteggio ${num}</h4>
        <p style="margin:4px 0;"><strong>Mercato:</strong> ${market}</p>
        <p style="margin:4px 0;"><strong>Dimensioni:</strong> ${widthM}m × ${lengthM}m (${widthM * lengthM}m²)</p>
        <p style="margin:4px 0;">
          <strong>Stato:</strong> 
          <span style="color:${color}; font-weight:bold;">
            ${statusLabels[status] || status}
          </span>
        </p>
    `;
    
    // Se c'è operatore assegnato, mostra dati aziendali
    if(operator) {
      html += `
        <hr style="margin:8px 0; border:none; border-top:1px solid #ddd;">
        <h5 style="margin:8px 0 4px 0; color:#0FA3A3;">${operator.nome || 'Operatore'}</h5>
        <p style="margin:4px 0; font-size:0.9em;">
          <strong>P.IVA:</strong> ${operator.piva || '-'}<br>
          <strong>Categoria:</strong> ${operator.categoria || '-'}<br>
          <strong>Telefono:</strong> ${operator.telefono || '-'}
        </p>
        <button onclick="window.openVetrina && window.openVetrina(${operator.id})" 
                style="margin-top:8px; padding:6px 12px; background:#0FA3A3; color:#fff; border:none; border-radius:4px; cursor:pointer; width:100%;">
          📦 Vedi Vetrina
        </button>
      `;
    } else {
      html += `
        <p style="margin:8px 0; font-style:italic; color:#999;">Posteggio libero</p>
      `;
    }
    
    html += `</div>`;
    return html;
  }

  function fitToData(){
    const g = L.featureGroup([state.layers.areas, state.layers.slots]);
    try{
      const b = g.getBounds();
      if(b.isValid()) state.map.fitBounds(b.pad(0.12));
    }catch(e){/* ignore */}
  }

  async function geocode(){
    const q = (document.getElementById('addr').value || '').trim();
    const msg = document.getElementById('msg');
    if(!q){ msg.textContent = 'Inserisci un indirizzo o città'; return; }
    msg.textContent = 'Cerco…';
    try{
      const url = `https://nominatim.openstreetmap.org/search?format=geojson&limit=1&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, {headers:{'Accept-Language':'it', 'User-Agent':'DMS-Core-Map/2.0 (demo)'}});
      const js = await res.json();
      const feat = js.features && js.features[0];
      if(!feat){ msg.textContent = 'Nessun risultato'; return; }
      const [lon,lat] = feat.geometry.coordinates;
      const box = feat.bbox;
      if(box && box.length===4){
        const b = L.latLngBounds([[box[1],box[0]],[box[3],box[2]]]);
        state.map.fitBounds(b.pad(0.1));
      }else{
        state.map.setView([lat,lon], 15);
      }
      msg.textContent = feat.properties.display_name || 'OK';
    }catch(err){
      msg.textContent = 'Errore geocoding';
    }
  }

  // Funzione globale per aprire vetrina (placeholder)
  window.openVetrina = function(operatorId) {
    alert(`Apertura vetrina operatore ID: ${operatorId}\n\nQuesta funzione sarà integrata con la WebApp Negozianti.`);
    // TODO: Integrare con sistema vetrine DMS
  };

  document.addEventListener('DOMContentLoaded', init);
})();

