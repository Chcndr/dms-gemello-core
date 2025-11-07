// Gestione Negozi e Servizi per Slot Editor v2

// Funzione per creare marker negozio
function createShopMarker(latlng, number, status = 'open') {
  const colors = {
    open: { bg: 'rgba(76, 175, 80, 0.9)', border: '#4CAF50' },
    closed: { bg: 'rgba(244, 67, 54, 0.9)', border: '#F44336' },
    vacation: { bg: 'rgba(255, 193, 7, 0.9)', border: '#FFC107' }
  };
  
  const color = colors[status] || colors.open;
  
  return L.marker(latlng, {
    icon: L.divIcon({
      className: 'shop-marker',
      html: `<div style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: ${color.bg}; border: 3px solid ${color.border}; border-radius: 4px; font-weight: bold; font-size: 16px; color: white;">N</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    }),
    draggable: true
  });
}

// Funzione per creare marker servizio
function createServiceMarker(latlng, number, status = 'available') {
  const colors = {
    available: { bg: 'rgba(76, 175, 80, 0.9)', border: '#4CAF50' },
    unavailable: { bg: 'rgba(244, 67, 54, 0.9)', border: '#F44336' },
    maintenance: { bg: 'rgba(255, 193, 7, 0.9)', border: '#FFC107' }
  };
  
  const color = colors[status] || colors.available;
  
  return L.marker(latlng, {
    icon: L.divIcon({
      className: 'service-marker',
      html: `<div style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: ${color.bg}; border: 3px solid ${color.border}; border-radius: 4px; font-weight: bold; font-size: 16px; color: white;">S</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    }),
    draggable: true
  });
}

// Funzione per creare form popup negozio
function createShopPopupForm(shop) {
  return `
    <div style="min-width: 250px;">
      <h3 style="margin: 0 0 10px 0;">🏪 Negozio #${shop.number}</h3>
      <div style="margin-bottom: 8px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px;">Nome:</label>
        <input type="text" id="shop-name-${shop.number}" value="${shop.name || ''}" style="width: 100%; padding: 4px;" placeholder="Es: Pizzeria Da Mario" />
      </div>
      <div style="margin-bottom: 8px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px;">Descrizione:</label>
        <textarea id="shop-desc-${shop.number}" style="width: 100%; padding: 4px; min-height: 60px;" placeholder="Descrizione attività...">${shop.description || ''}</textarea>
      </div>
      <div style="margin-bottom: 8px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px;">Orari:</label>
        <input type="text" id="shop-hours-${shop.number}" value="${shop.hours || ''}" style="width: 100%; padding: 4px;" placeholder="Es: 9:00-22:00" />
      </div>
      <div style="margin-bottom: 8px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px;">Telefono:</label>
        <input type="text" id="shop-phone-${shop.number}" value="${shop.phone || ''}" style="width: 100%; padding: 4px;" placeholder="Es: +39 123 456 7890" />
      </div>
      <div style="margin-bottom: 8px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px;">Status:</label>
        <select id="shop-status-${shop.number}" style="width: 100%; padding: 4px;">
          <option value="open" ${shop.status === 'open' ? 'selected' : ''}>🟢 Aperto</option>
          <option value="closed" ${shop.status === 'closed' ? 'selected' : ''}>🔴 Chiuso</option>
          <option value="vacation" ${shop.status === 'vacation' ? 'selected' : ''}>🟡 Ferie</option>
        </select>
      </div>
      <div style="margin-top: 10px; font-size: 11px; color: #666;">
        <strong>Coordinate:</strong><br>
        Lat: ${shop.lat.toFixed(8)}<br>
        Lng: ${shop.lng.toFixed(8)}
      </div>
    </div>
  `;
}

// Funzione per creare form popup servizio
function createServicePopupForm(service) {
  return `
    <div style="min-width: 250px;">
      <h3 style="margin: 0 0 10px 0;">🚻 Servizio #${service.number}</h3>
      <div style="margin-bottom: 8px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px;">Nome:</label>
        <input type="text" id="service-name-${service.number}" value="${service.name || ''}" style="width: 100%; padding: 4px;" placeholder="Es: Bagni Pubblici" />
      </div>
      <div style="margin-bottom: 8px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px;">Tipo:</label>
        <select id="service-type-${service.number}" style="width: 100%; padding: 4px;">
          <option value="wc" ${service.type === 'wc' ? 'selected' : ''}>🚻 WC</option>
          <option value="parking" ${service.type === 'parking' ? 'selected' : ''}>🅿️ Parcheggio</option>
          <option value="info" ${service.type === 'info' ? 'selected' : ''}>ℹ️ Info Point</option>
          <option value="medical" ${service.type === 'medical' ? 'selected' : ''}>🏥 Medico</option>
          <option value="atm" ${service.type === 'atm' ? 'selected' : ''}>🏧 Bancomat</option>
          <option value="other" ${service.type === 'other' ? 'selected' : ''}>📍 Altro</option>
        </select>
      </div>
      <div style="margin-bottom: 8px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px;">Descrizione:</label>
        <textarea id="service-desc-${service.number}" style="width: 100%; padding: 4px; min-height: 60px;" placeholder="Descrizione servizio...">${service.description || ''}</textarea>
      </div>
      <div style="margin-bottom: 8px;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px;">Status:</label>
        <select id="service-status-${service.number}" style="width: 100%; padding: 4px;">
          <option value="available" ${service.status === 'available' ? 'selected' : ''}>🟢 Disponibile</option>
          <option value="unavailable" ${service.status === 'unavailable' ? 'selected' : ''}>🔴 Non disponibile</option>
          <option value="maintenance" ${service.status === 'maintenance' ? 'selected' : ''}>🟡 Manutenzione</option>
        </select>
      </div>
      <div style="margin-top: 10px; font-size: 11px; color: #666;">
        <strong>Coordinate:</strong><br>
        Lat: ${service.lat.toFixed(8)}<br>
        Lng: ${service.lng.toFixed(8)}
      </div>
    </div>
  `;
}
