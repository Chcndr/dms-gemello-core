/* js/dms-checkin.js — mod23 */
window.DMS = window.DMS || {};
(function(NS){
  const Checkin = NS.Checkin = NS.Checkin || {};
  let map, panel, watching=false, watchId=null;
  const CFG = NS.Core?.state?.cfg || { r_global:8, hysteresis_m:2 };
  let lastVerdict = null, selectedArea = null;

  Checkin.mount = function(_map, opts={}){
    map = _map;
    injectPanel(opts.sidebarSelector || '.sidebar');

    // ascolta selezione aree da modulo 2
    NS.Bus.on('object:selected', ({type, feature, anchor})=>{
      if(type==='area'){
        selectedArea = { feature, anchor: anchor || centroid(feature) };
        updateInfoSelected();
      }
    });

    NS.Bus.on('areas:added', ({bounds})=>{
      // aggiorna fit su dati
      NS.Core._dataBounds = bounds;
    });
  };

  function injectPanel(sel){
    const host = document.querySelector(sel) || createSidebar();
    const el = document.createElement('section');
    el.className = 'panel panel-checkin';
    el.innerHTML = `
      <h3>Check-in GPS</h3>
      <div class="row">
        <label>Raggio globale: <b id="labR">${CFG.r_global}</b> m</label>
        <input id="rGlob" type="range" min="1" max="30" step="1" value="${CFG.r_global}">
      </div>
      <div class="row">
        <label>Isteresi: <b id="labH">${CFG.hysteresis_m||2}</b> m</label>
        <input id="hyst" type="range" min="0" max="5" step="1" value="${CFG.hysteresis_m||2}">
      </div>
      <div class="row">
        <label><input id="anti" type="checkbox" checked> Anti-spoofing base (2 fix, speed &lt; 3 m/s)</label>
      </div>
      <div class="row">
        <button id="btnWatch" class="dms-btn">Avvia tracking</button>
        <button id="btnStop" class="dms-btn outline">Stop</button>
      </div>
      <div class="badge" id="badge">—</div>
      <div class="mini" id="mini">Nessuna area selezionata.</div>
    `;
    host.appendChild(el);

    el.querySelector('#rGlob').oninput = e => { CFG.r_global = +e.target.value; el.querySelector('#labR').textContent = CFG.r_global; };
    el.querySelector('#hyst').oninput = e => { CFG.hysteresis_m = +e.target.value; el.querySelector('#labH').textContent = CFG.hysteresis_m; };
    el.querySelector('#btnWatch').onclick = startWatch;
    el.querySelector('#btnStop').onclick  = stopWatch;

    // CSS base
    injectCSS();
  }

  function createSidebar(){
    const s = document.createElement('aside');
    s.className = 'sidebar';
    document.body.appendChild(s);
    return s;
  }

  function centroid(feat){
    const c = turf.centroid(feat).geometry.coordinates;
    return [c[0], c[1]];
  }

  function updateInfoSelected(){
    const mini = document.getElementById('mini');
    if(!mini) return;
    const aTxt = selectedArea ? (selectedArea.feature.properties?.name || selectedArea.feature.properties?.code || 'Area') : '—';
    mini.innerHTML = `Area selezionata: <b>${aTxt}</b>`;
  }

  // geo utils
  function resolveTolerance(slot, area){
    const rA = area?.feature?.properties?.tolerance_m;
    const rS = slot?.tolerance_m;
    return (rS ?? rA ?? CFG.r_global) * 1.0;
  }

  function verdict(pos, slot, area){
    const r = resolveTolerance(slot, area);
    const pUser = turf.point([pos.lon, pos.lat]);
    const anchor = area?.anchor ? turf.point(area.anchor) :
                   area?.feature ? turf.centroid(area.feature) : null;
    if(!anchor) return { state:'out', distance_m: Infinity, r_applied:r, hysteresis_m:CFG.hysteresis_m||2 };

    const d = turf.distance(pUser, anchor, { units:'meters' });
    const Δ = CFG.hysteresis_m || 2;
    const state = (d <= r) ? 'present' : (d <= r+Δ) ? 'borderline' : 'out';
    return { state, distance_m:d, r_applied:r, hysteresis_m:Δ };
  }

  // watchPosition
  let lastTwo = [];
  function startWatch(){
    if(watching) return;
    if(!navigator.geolocation){ badge('Geoloc non disponibile', 'out'); return; }
    watching = true;
    lastTwo = [];
    watchId = navigator.geolocation.watchPosition(onPos, onErr, { enableHighAccuracy:true, maximumAge:5000, timeout:10000 });
    badge('Tracking…', 'neutral');
  }
  function stopWatch(){
    if(watchId) navigator.geolocation.clearWatch(watchId);
    watchId = null; watching = false;
    badge('—', 'neutral');
  }

  function onPos(gp){
    const fix = { lat: gp.coords.latitude, lon: gp.coords.longitude, acc_m: gp.coords.accuracy||Infinity, t: gp.timestamp };
    lastTwo.push(fix); if(lastTwo.length>2) lastTwo.shift();

    // Anti-spoofing semplice
    if(document.getElementById('anti')?.checked && lastTwo.length===2){
      const dt = Math.max(1,(lastTwo[1].t - lastTwo[0].t)/1000);
      const d  = turf.distance(turf.point([lastTwo[0].lon,lastTwo[0].lat]), turf.point([lastTwo[1].lon,lastTwo[1].lat]), {units:'meters'});
      const v  = d/dt; // m/s
      if(v>3) { badge('Velocità anomala', 'out'); return; }
    }

    const v = verdict(fix, null, selectedArea);
    renderVerdict(v, fix);
  }

  function onErr(err){
    badge('GPS errore: '+err.message, 'out');
  }

  function badge(text, state){
    const b = document.getElementById('badge');
    if(!b) return;
    b.textContent = text;
    b.className = `badge ${state||'neutral'}`;
  }

  function renderVerdict(v, fix){
    lastVerdict = v;
    const b = document.getElementById('badge');
    const mini = document.getElementById('mini');
    const km = (n)=> (Math.round(n*10)/10).toFixed(1);

    if(v.state==='present'){ b.className='badge ok'; b.textContent=`Presente • d=${km(v.distance_m)}m • r=${v.r_applied}m`; }
    else if(v.state==='borderline'){ b.className='badge mid'; b.textContent=`Al limite • d=${km(v.distance_m)}m • r=${v.r_applied}m`; }
    else { b.className='badge out'; b.textContent=`Fuori • d=${km(v.distance_m)}m • r=${v.r_applied}m`; }

    const aTxt = selectedArea ? (selectedArea.feature.properties?.name || selectedArea.feature.properties?.code || 'Area') : '—';
    mini.innerHTML = `Area: <b>${aTxt}</b> • Fix ±${Math.round(fix.acc_m||0)}m`;
  }

  function injectCSS(){
    if(document.getElementById('css-mod23')) return;
    const css = document.createElement('style'); css.id='css-mod23';
    css.textContent = `
      .panel{background:#0f4a4e;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;margin:10px 0;color:#d5f0e6}
      .panel h3{margin:0 0 8px 0;font-size:16px}
      .panel .row{margin:8px 0}
      .dms-btn{background:#34d1b6;color:#043; border:0; border-radius:8px; padding:8px 10px; cursor:pointer}
      .dms-btn.outline{background:transparent;color:#d5f0e6;border:1px solid rgba(255,255,255,.2)}
      .badge{margin-top:8px;padding:8px 10px;border-radius:8px;background:#133c3e;color:#d5f0e6}
      .badge.ok{background:#0e5f46}
      .badge.mid{background:#6b5f17}
      .badge.out{background:#6b1b1b}
      .badge.neutral{background:#133c3e}
      .mini{opacity:.85;font-size:12px;margin-top:6px}
      .dms-pop{min-width:220px}
      .dms-pop .row{margin:4px 0}
      .dms-pop .dms-btn{margin-top:6px}
      .dms-anchor{filter: drop-shadow(0 2px 6px rgba(0,0,0,.3));}
      .sidebar{position:fixed;left:10px;top:70px;width:280px;z-index:4000}
      @media (max-width: 900px){ .sidebar{width:92vw; left:4vw; top:auto; bottom:10px} }
    `;
    document.head.appendChild(css);
  }

})(window.DMS);

