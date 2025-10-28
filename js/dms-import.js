/**
 * DMS Gemello Digitale - Modulo Import Dati
 * 
 * Questo modulo gestisce l'import automatico di dati da fonti esterne:
 * - WebGIS Comune (quando disponibile accesso)
 * - Database PostgreSQL/PostGIS
 * - File CSV/Excel
 * - API REST
 * 
 * @author DMS Development Team
 * @version 1.0.0
 */

(function() {
  'use strict';

  // Namespace globale
  window.DMSImport = window.DMSImport || {};

  /**
   * Configurazione endpoint import
   */
  const IMPORT_ENDPOINTS = {
    // WebGIS Grosseto (quando disponibile)
    grosseto_webgis: {
      url: 'https://webgis.comune.grosseto.it/vector/api/data/mercati_test_v3/posteggi_mercati/',
      method: 'GET',
      auth_required: false,
      coord_system: 'EPSG:3003'
    },
    
    // Backend DMS (da implementare)
    dms_backend: {
      url: '/api/v1/mercati/{mercato_id}/posteggi',
      method: 'GET',
      auth_required: true,
      coord_system: 'EPSG:4326'
    },
    
    // Import da file locale
    local_file: {
      accept: '.geojson,.json,.csv',
      coord_system: 'EPSG:4326'
    }
  };

  /**
   * Converte coordinate da EPSG:3003 (Monte Mario Italy 1) a WGS84
   * 
   * @param {number} x - Coordinata X in EPSG:3003
   * @param {number} y - Coordinata Y in EPSG:3003
   * @returns {Array} [lon, lat] in WGS84
   */
  function convertEPSG3003toWGS84(x, y) {
    // Conversione approssimata (per conversione precisa serve libreria proj4js)
    // Parametri trasformazione Monte Mario → WGS84
    const dx = -104.1;
    const dy = -49.1;
    const dz = -9.9;
    
    // Conversione semplificata (da migliorare con proj4js)
    const lon = (x - 1500000) / 111320 + 9.0;
    const lat = y / 111320;
    
    return [lon, lat];
  }

  /**
   * Import dati da WebGIS Grosseto
   * 
   * @param {string} mercatoId - ID del mercato da importare
   * @param {Function} onSuccess - Callback successo (data)
   * @param {Function} onError - Callback errore (error)
   */
  DMSImport.importFromGrossetoWebGIS = function(mercatoId, onSuccess, onError) {
    const endpoint = IMPORT_ENDPOINTS.grosseto_webgis;
    
    console.log('[DMSImport] Importing from Grosseto WebGIS...');
    
    fetch(endpoint.url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('[DMSImport] Data received:', data);
        
        // Converte coordinate se necessario
        if (endpoint.coord_system === 'EPSG:3003' && data.features) {
          data.features.forEach(feature => {
            if (feature.geometry && feature.geometry.coordinates) {
              const [x, y] = feature.geometry.coordinates;
              if (x > 1000) { // Coordinate EPSG:3003 hanno valori > 1000000
                const [lon, lat] = convertEPSG3003toWGS84(x, y);
                feature.geometry.coordinates = [lon, lat];
                feature.properties._original_coords_epsg3003 = [x, y];
              }
            }
          });
        }
        
        if (onSuccess) onSuccess(data);
      })
      .catch(error => {
        console.error('[DMSImport] Error:', error);
        if (onError) onError(error);
      });
  };

  /**
   * Import dati da backend DMS
   * 
   * @param {string} mercatoId - ID del mercato
   * @param {string} authToken - Token autenticazione JWT
   * @param {Function} onSuccess - Callback successo
   * @param {Function} onError - Callback errore
   */
  DMSImport.importFromBackend = function(mercatoId, authToken, onSuccess, onError) {
    const endpoint = IMPORT_ENDPOINTS.dms_backend;
    const url = endpoint.url.replace('{mercato_id}', mercatoId);
    
    console.log('[DMSImport] Importing from DMS Backend...');
    
    fetch(url, {
      method: endpoint.method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('[DMSImport] Data received:', data);
        if (onSuccess) onSuccess(data);
      })
      .catch(error => {
        console.error('[DMSImport] Error:', error);
        if (onError) onError(error);
      });
  };

  /**
   * Import dati da file locale (GeoJSON, JSON, CSV)
   * 
   * @param {File} file - File da importare
   * @param {Function} onSuccess - Callback successo
   * @param {Function} onError - Callback errore
   */
  DMSImport.importFromFile = function(file, onSuccess, onError) {
    console.log('[DMSImport] Importing from file:', file.name);
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const content = e.target.result;
        let data;
        
        // Parse in base al tipo file
        if (file.name.endsWith('.json') || file.name.endsWith('.geojson')) {
          data = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          data = parseCSV(content);
        } else {
          throw new Error('Formato file non supportato');
        }
        
        console.log('[DMSImport] File parsed:', data);
        if (onSuccess) onSuccess(data);
        
      } catch (error) {
        console.error('[DMSImport] Parse error:', error);
        if (onError) onError(error);
      }
    };
    
    reader.onerror = function(error) {
      console.error('[DMSImport] File read error:', error);
      if (onError) onError(error);
    };
    
    reader.readAsText(file);
  };

  /**
   * Parse CSV to GeoJSON
   * 
   * @param {string} csv - Contenuto CSV
   * @returns {Object} GeoJSON FeatureCollection
   */
  function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const features = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const properties = {};
      
      headers.forEach((header, index) => {
        properties[header] = values[index];
      });
      
      // Estrai coordinate (assumo colonne lon, lat o x, y)
      const lon = parseFloat(properties.lon || properties.longitude || properties.x);
      const lat = parseFloat(properties.lat || properties.latitude || properties.y);
      
      if (isNaN(lon) || isNaN(lat)) {
        console.warn('[DMSImport] Skipping row with invalid coordinates:', properties);
        continue;
      }
      
      features.push({
        type: 'Feature',
        properties: properties,
        geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        }
      });
    }
    
    return {
      type: 'FeatureCollection',
      features: features
    };
  }

  /**
   * Crea UI per import dati
   * 
   * @param {HTMLElement} container - Elemento container
   */
  DMSImport.createImportUI = function(container) {
    const html = `
      <div class="dms-import-panel">
        <h3>Import Dati Mercato</h3>
        
        <div class="import-option">
          <h4>📡 Da WebGIS Grosseto</h4>
          <p>Import automatico quando disponibile accesso</p>
          <button id="btn-import-webgis" class="btn btn-primary">
            Import da WebGIS
          </button>
          <div id="status-webgis" class="status-message"></div>
        </div>
        
        <div class="import-option">
          <h4>🗄️ Da Backend DMS</h4>
          <p>Import da database DMS</p>
          <input type="text" id="input-mercato-id" placeholder="ID Mercato" />
          <button id="btn-import-backend" class="btn btn-primary">
            Import da Backend
          </button>
          <div id="status-backend" class="status-message"></div>
        </div>
        
        <div class="import-option">
          <h4>📁 Da File Locale</h4>
          <p>Import da GeoJSON, JSON o CSV</p>
          <input type="file" id="input-file" accept=".geojson,.json,.csv" />
          <button id="btn-import-file" class="btn btn-primary">
            Import da File
          </button>
          <div id="status-file" class="status-message"></div>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    // Event listeners
    document.getElementById('btn-import-webgis').addEventListener('click', function() {
      const statusEl = document.getElementById('status-webgis');
      statusEl.textContent = 'Importing...';
      statusEl.className = 'status-message loading';
      
      DMSImport.importFromGrossetoWebGIS(
        'esperanto',
        function(data) {
          statusEl.textContent = `✅ Import completato: ${data.features.length} features`;
          statusEl.className = 'status-message success';
          
          // Renderizza sulla mappa
          if (window.DMSCore && window.DMSCore.renderMarkets) {
            window.DMSCore.renderMarkets(data);
          }
        },
        function(error) {
          statusEl.textContent = `❌ Errore: ${error.message}`;
          statusEl.className = 'status-message error';
        }
      );
    });
    
    document.getElementById('btn-import-backend').addEventListener('click', function() {
      const mercatoId = document.getElementById('input-mercato-id').value;
      const statusEl = document.getElementById('status-backend');
      
      if (!mercatoId) {
        statusEl.textContent = '⚠️ Inserisci ID mercato';
        statusEl.className = 'status-message warning';
        return;
      }
      
      statusEl.textContent = 'Importing...';
      statusEl.className = 'status-message loading';
      
      // TODO: Implementare autenticazione
      const authToken = 'YOUR_JWT_TOKEN';
      
      DMSImport.importFromBackend(
        mercatoId,
        authToken,
        function(data) {
          statusEl.textContent = `✅ Import completato: ${data.features.length} features`;
          statusEl.className = 'status-message success';
          
          if (window.DMSCore && window.DMSCore.renderMarkets) {
            window.DMSCore.renderMarkets(data);
          }
        },
        function(error) {
          statusEl.textContent = `❌ Errore: ${error.message}`;
          statusEl.className = 'status-message error';
        }
      );
    });
    
    document.getElementById('btn-import-file').addEventListener('click', function() {
      const fileInput = document.getElementById('input-file');
      const statusEl = document.getElementById('status-file');
      
      if (!fileInput.files.length) {
        statusEl.textContent = '⚠️ Seleziona un file';
        statusEl.className = 'status-message warning';
        return;
      }
      
      const file = fileInput.files[0];
      statusEl.textContent = 'Importing...';
      statusEl.className = 'status-message loading';
      
      DMSImport.importFromFile(
        file,
        function(data) {
          statusEl.textContent = `✅ Import completato: ${data.features.length} features`;
          statusEl.className = 'status-message success';
          
          if (window.DMSCore && window.DMSCore.renderMarkets) {
            window.DMSCore.renderMarkets(data);
          }
        },
        function(error) {
          statusEl.textContent = `❌ Errore: ${error.message}`;
          statusEl.className = 'status-message error';
        }
      );
    });
  };

  console.log('[DMSImport] Module loaded');

})();

