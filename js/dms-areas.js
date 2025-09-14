(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DMS = root.DMS || {};
    root.DMS.Areas = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ui = (html) => {
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    return tpl.content.firstChild;
  };

  function mount(map, opts={}) {
    const sidebar = document.querySelector(opts.sidebarSelector || '#sidebar') || document.body;
    const box = ui(`
      <div class="dms-areas" style="margin-top:14px;border-top:1px solid rgba(255,255,255,0.08);padding-top:14px">
        <h3 style="margin:0 0 8px;font-size:14px">Modulo 2 — Pianta & Area</h3>
        <div style="display:grid;gap:8px">
          <label style="font-size:12px">Pianta mercato (PNG/JPG estratta dal PDF)</label>
          <input type="file" accept="image/*" class="dms-img-file"/>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn btn-sm dms-place-img">Posiziona immagine (2 punti)</button>
            <button class="btn btn-sm dms-remove-img" disabled>Rimuovi immagine</button>
          </div>
          <label style="font-size:12px">Opacità pianta: <span class="dms-opacity-val">0.6</span></label>
          <input type="range" min="0" max="1" step="0.05" value="0.6" class="dms-opacity"/>
          <hr style="opacity:.15">
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn btn-sm dms-draw">Disegna area</button>
            <button class="btn btn-sm dms-close" disabled>Chiudi area</button>
            <button class="btn btn-sm dms-cancel" disabled>Annulla</button>
          </div>
          <button class="btn btn-sm dms-export">Esporta Area (GeoJSON)</button>
          <p class="dms-hint" style="font-size:12px;opacity:.8;margin:4px 0 0;"></p>
        </div>
      </div>`);
    sidebar.appendChild(box);

    // State
    let imageUrl = null;
    let imageOverlay = null;
    let placingImage = false;
    let imgClicks = [];
    let drawMode = false;
    let drawLatLngs = [];
    let ghostLine = null;
    let poly = null;

    const $ = (sel) => box.querySelector(sel);
    const imgInput = $('.dms-img-file');
    const placeBtn = $('.dms-place-img');
    const removeBtn = $('.dms-remove-img');
    const opacityRange = $('.dms-opacity');
    const opacityVal = $('.dms-opacity-val');
    const hint = $('.dms-hint');
    const drawBtn = $('.dms-draw');
    const closeBtn = $('.dms-close');
    const cancelBtn = $('.dms-cancel');
    const exportBtn = $('.dms-export');

    // Helpers
    function setHint(msg) { hint.textContent = msg || ''; }
    function enable(el, on) { el.disabled = !on; }
    function clearGhost() {
      if (ghostLine) { ghostLine.remove(); ghostLine = null; }
    }
    function resetDraw() {
      drawMode = false;
      drawLatLngs = [];
      clearGhost();
      enable(closeBtn, false);
      enable(cancelBtn, false);
      setHint('');
    }
    function resetImage() {
      if (imageOverlay) { imageOverlay.remove(); imageOverlay = null; }
      imageUrl = null;
      imgClicks = [];
      placingImage = false;
      enable(removeBtn, false);
      setHint('');
    }

    // Image input
    imgInput.addEventListener('change', () => {
      const f = imgInput.files && imgInput.files[0];
      if (!f) { imageUrl = null; return; }
      imageUrl = URL.createObjectURL(f);
      setHint('Immagine caricata. Clicca "Posiziona immagine (2 punti)" e poi scegli 2 punti opposti (angoli Nord-Ovest e Sud-Est).');
    });

    placeBtn.addEventListener('click', () => {
      if (!imageUrl) { setHint('Carica prima una immagine.'); return; }
      placingImage = true;
      imgClicks = [];
      setHint('Seleziona 2 punti in mappa: primo click → angolo Nord‑Ovest, secondo click → angolo Sud‑Est.');
    });

    removeBtn.addEventListener('click', () => {
      resetImage();
    });

    opacityRange.addEventListener('input', () => {
      const v = parseFloat(opacityRange.value);
      opacityVal.textContent = v.toFixed(2);
      if (imageOverlay) imageOverlay.setOpacity(v);
    });

    // Map interactions
    map.on('click', (e) => {
      if (placingImage) {
        imgClicks.push(e.latlng);
        if (imgClicks.length === 2) {
          const lats = [imgClicks[0].lat, imgClicks[1].lat];
          const lngs = [imgClicks[0].lng, imgClicks[1].lng];
          const north = Math.max.apply(null, lats);
          const south = Math.min.apply(null, lats);
          const east  = Math.max.apply(null, lngs);
          const west  = Math.min.apply(null, lngs);
          const bounds = L.latLngBounds([south, west], [north, east]);
          if (imageOverlay) imageOverlay.remove();
          imageOverlay = L.imageOverlay(imageUrl, bounds, {opacity: parseFloat(opacityRange.value)}).addTo(map);
          map.fitBounds(bounds.pad(0.1));
          placingImage = false;
          imgClicks = [];
          enable(removeBtn, true);
          setHint('Immagine posizionata. Regola l’opacità se serve.');
        }
        return;
      }
      if (drawMode) {
        drawLatLngs.push(e.latlng);
        if (ghostLine) ghostLine.addLatLng(e.latlng);
        else ghostLine = L.polyline([e.latlng], {color:'#18a999', weight:2, dashArray:'4,4'}).addTo(map);
        enable(closeBtn, drawLatLngs.length >= 3);
      }
    });

    map.on('mousemove', (e) => {
      if (drawMode && ghostLine && drawLatLngs.length > 0) {
        const pts = drawLatLngs.concat([e.latlng]);
        ghostLine.setLatLngs(pts);
      }
    });

    drawBtn.addEventListener('click', () => {
      resetDraw();
      drawMode = true;
      enable(cancelBtn, true);
      setHint('Modalità disegno: clicca per aggiungere vertici. Minimo 3 punti, poi "Chiudi area".');
    });

    closeBtn.addEventListener('click', () => {
      if (!drawMode || drawLatLngs.length < 3) return;
      if (poly) poly.remove();
      poly = L.polygon(drawLatLngs, {
        color:'#00b3a4',
        weight:2,
        fillColor:'#00b3a4',
        fillOpacity:0.12
      }).addTo(map);
      map.fitBounds(poly.getBounds().pad(0.1));
      resetDraw();
      setHint('Area creata. Puoi esportarla come GeoJSON.');
    });

    cancelBtn.addEventListener('click', () => {
      clearGhost();
      drawLatLngs = [];
      setHint('Disegno annullato.');
      enable(closeBtn, false);
      enable(cancelBtn, false);
      drawMode = false;
    });

    exportBtn.addEventListener('click', () => {
      const fc = { type:'FeatureCollection', features: [] };
      if (poly) {
        const coords = poly.getLatLngs()[0].map(ll => [ll.lng, ll.lat]);
        // close ring
        if (coords.length > 0 && (coords[0][0] !== coords[coords.length-1][0] || coords[0][1] !== coords[coords.length-1][1])) {
          coords.push(coords[0]);
        }
        fc.features.push({
          type:'Feature',
          properties:{kind:'market_area'},
          geometry:{ type:'Polygon', coordinates:[coords] }
        });
      }
      if (imageOverlay) {
        const b = imageOverlay.getBounds();
        const ring = [
          [b.getWest(), b.getSouth()],
          [b.getEast(), b.getSouth()],
          [b.getEast(), b.getNorth()],
          [b.getWest(), b.getNorth()],
          [b.getWest(), b.getSouth()],
        ];
        fc.features.push({
          type:'Feature',
          properties:{kind:'image_bounds'},
          geometry:{ type:'Polygon', coordinates:[ring] }
        });
      }
      const blob = new Blob([JSON.stringify(fc,null,2)], {type:'application/geo+json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'market_area.geojson';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

    // Expose small API
    return {
      get image() { return imageOverlay; },
      get area() { return poly; }
    };
  }

  return { mount };
}));
