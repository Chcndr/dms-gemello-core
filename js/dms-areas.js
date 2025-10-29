/* js/dms-areas.js  — mod23 */
window.DMS = window.DMS || {};
(function(NS){
  const Areas = NS.Areas = NS.Areas || {};
  let map, layerAreas, anchorStyle;

  Areas.mount = function(_map, opts={}){
    map = _map;
    anchorStyle = (opts.anchorStyle || { className:'dms-anchor' });

    layerAreas = L.geoJSON(null, {
      style: f => ({ color:'#34d1b6', weight:2, fillColor:'#34d1b6', fillOpacity:0.10, className:'dms-area' }),
      onEachFeature: (f, layer) => {
        layer.on('click', (e)=>{
          const centroid = turf.centroid(f);
          const c = centroid.geometry.coordinates; // [lon,lat]
          // init anchor se non esiste
          if(!f.properties) f.properties = {};
          if(!f.properties.anchor_point) f.properties.anchor_point = c;

          NS.Bus.emit('object:selected', { type:'area', feature:f, layer, anchor:f.properties.anchor_point });
          showAreaPopover(e.latlng, f, layer);
        });
      }
    }).addTo(map);

    // Removed I/F controls - using sidebar buttons instead

    NS.Core.state.layers.areas = layerAreas;
    NS.Bus.emit('areas:mounted', { layer: layerAreas });

    // se c'è demo pre-caricata
    if(window.DMS_DEMO && Array.isArray(window.DMS_DEMO.areas)){
      Areas.add(window.DMS_DEMO.areas);
    }
  };

  Areas.add = function(geojsonArray){
    const gj = { type:'FeatureCollection', features: geojsonArray };
    const added = layerAreas.addData(gj);
    // bounds
    const b = added.getBounds();
    NS.Core._dataBounds = b;

    NS.Bus.emit('areas:added', { layer: layerAreas, bounds: b });
  };

  function showAreaPopover(latlng, feat, layer){
    const p = feat.properties || {};
    const html = `
      <div class="dms-pop">
        <div class="row"><b>Codice:</b> ${p.code||'-'}</div>
        <div class="row"><b>Nome:</b> ${p.name||'-'}</div>
        <div class="row"><b>Categoria:</b> ${p.category||'mercato'}</div>
        <hr/>
        <div class="row"><small>Anchor:</small> <code>${fmtAnchor(p.anchor_point)}</code></div>
        <button id="dms-move-anchor" class="dms-btn">Sposta ancora</button>
      </div>`;
    const pop = L.popup({ closeOnClick:true, autoClose:true }).setLatLng(latlng).setContent(html).openOn(map);

    setTimeout(()=>{
      const btn = document.getElementById('dms-move-anchor');
      if(btn){
        btn.onclick = ()=>{
          pop.remove();
          map.once('click', (e2)=>{
            const lnglat = [e2.latlng.lng, e2.latlng.lat];
            feat.properties.anchor_point = lnglat;
            NS.Bus.emit('area:anchor:changed', { feature:feat, anchor:lnglat });
            L.popup().setLatLng(e2.latlng).setContent('✔ Ancora aggiornata').openOn(map);
          });
        };
      }
    },0);
  }

  function fmtAnchor(a){
    if(!a) return '-';
    return `${a[1].toFixed(6)}, ${a[0].toFixed(6)}`;
  }
})(window.DMS);

