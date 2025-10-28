
/* DMS Core Map - mod v1
   - Leaflet init
   - Load demo data (Italy borders + sample markets)
   - Layer toggles
   - Simple geocode via Nominatim
   - Fit helpers
   - Slot rendering with L.divIcon rectangles + number
*/
(function(){
  const state = {
    map: null,
    layers: {
      italy: L.layerGroup(),
      areas: L.layerGroup(),
      slots: L.layerGroup()
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
    // Bounds roughly Italy
    const italyBounds = L.latLngBounds([[36.6,6.6],[47.2,18.8]]);
    state.map.fitBounds(italyBounds, {padding:[20,20]});

    // add groups
    state.layers.italy.addTo(state.map);
    state.layers.areas.addTo(state.map);
    state.layers.slots.addTo(state.map);

    // load data
    // Rileva se siamo su pagina Grosseto
    const isGrossetoPage = window.location.pathname.includes('grosseto');
    const marketsFile = isGrossetoPage ? 'data/grosseto_full.geojson' : 'data/sample_markets.geojson';
    
    Promise.all([
      fetch('data/italy_borders.geojson').then(r=>r.json()).catch(()=>null),
      fetch(marketsFile).then(r=>r.json()).catch(()=>null)
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
    document.getElementById('chkSlots').onchange = (e)=> toggleLayer('slots', e.target.checked);
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
      // bbox Italia approssimato
      const b = [[47.1,6.6],[36.6,18.6]]; // [lat,lon] [N,O]/[S,E] — swap sotto
      state.map.fitBounds(L.latLngBounds([ [b[1][0], b[0][1]],[b[0][0], b[1][1]] ]), { padding:[20,20] });
    };
    window.DMS.Core.fitData = function(){
      const g = window.DMS.Core._dataBounds;
      if(g) state.map.fitBounds(g, { padding:[20,20] });
    };

    // Aggancio bounds demo se già calcolati
    if(!window.DMS.Core._dataBounds && typeof L!=='undefined'){
      // verrà settato da moduli quando aggiungono layer
    }
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

    // slot markers with fixed pixel size (not geographic)
    slots.forEach(f=>{
      const p = f.geometry.coordinates; // [lon,lat]
      const latlng = L.latLng(p[1], p[0]);
      const num = f.properties.number;
      const status = f.properties.status || 'free'; // free | busy | taken
      const width = f.properties.width_m || 3;
      const length = f.properties.length_m || 6;
      const codInt = f.properties.cod_int || `POST-${num}`;
      const statusText = status === 'free' ? 'Libero' : status === 'busy' ? 'Occupato' : 'Prenotato';
      
      // Color based on status
      const colors = {
        free: '#4CAF50',
        busy: '#FFC107',
        taken: '#F44336'
      };
      
      // Create marker with divIcon (fixed pixel size)
      const marker = L.marker(latlng, {
        icon: L.divIcon({
          className: 'dms-slot',
          html: `<div class="slot-rect" style="background:${colors[status]};color:white;border:2px solid white;width:40px;height:60px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.4);">${num}</div>`,
          iconSize: [40, 60],
          iconAnchor: [20, 30]
        })
      });
      
      marker.bindPopup(`
        <div style="font-family: system-ui; padding: 4px;">
          <h3 style="margin: 0 0 8px; color: ${colors[status]};">Posteggio ${num}</h3>
          <p style="margin: 4px 0;"><b>Mercato:</b> ${f.properties.market || 'Esperanto Settimanale'}</p>
          <p style="margin: 4px 0;"><b>Dimensioni:</b> ${width}m × ${length}m</p>
          <p style="margin: 4px 0;"><b>Stato:</b> ${statusText}</p>
          <p style="margin: 4px 0;"><b>Codice:</b> ${codInt}</p>
          <p style="margin: 4px 0; font-style: italic; color: #666;">Posteggio ${statusText.toLowerCase()}</p>
        </div>
      `);
      
      marker.addTo(state.layers.slots);
    });

    state.data.areas = areas; state.data.slots = slots;
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
      const res = await fetch(url, {headers:{'Accept-Language':'it', 'User-Agent':'DMS-Core-Map/1.0 (demo)'}});
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

  document.addEventListener('DOMContentLoaded', init);
})();
