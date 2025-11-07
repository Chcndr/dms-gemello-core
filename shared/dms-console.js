/**
 * DMS Console - Sistema di logging unificato per tutti i tool
 * Versione: 1.0
 * 
 * Uso:
 *   DMSConsole.log('Messaggio info');
 *   DMSConsole.success('Operazione completata');
 *   DMSConsole.warn('Attenzione!');
 *   DMSConsole.error('Errore critico');
 */

const DMSConsole = {
  messages: [],
  maxMessages: 100,
  isOpen: true,
  container: null,
  logList: null,
  
  init() {
    // Crea HTML console
    const consoleHTML = `
      <div id="dms-console" class="dms-console">
        <div class="dms-console-header">
          <span class="dms-console-title">📋 Console Log</span>
          <div class="dms-console-actions">
            <button class="dms-console-btn" onclick="DMSConsole.clear()">🗑️</button>
            <button class="dms-console-btn" onclick="DMSConsole.copy()">📋</button>
            <button class="dms-console-btn" onclick="DMSConsole.toggle()">▼</button>
          </div>
        </div>
        <div class="dms-console-body">
          <div id="dms-console-list" class="dms-console-list"></div>
        </div>
      </div>
    `;
    
    // Aggiungi al body
    document.body.insertAdjacentHTML('beforeend', consoleHTML);
    
    // Riferimenti
    this.container = document.getElementById('dms-console');
    this.logList = document.getElementById('dms-console-list');
    
    // Log iniziale
    this.log('Console inizializzata');
  },
  
  toggle() {
    this.isOpen = !this.isOpen;
    this.container.classList.toggle('collapsed');
    
    const btn = this.container.querySelector('.dms-console-actions button:last-child');
    btn.textContent = this.isOpen ? '▲' : '▼';
  },
  
  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('it-IT');
    const entry = { timestamp, message, type };
    
    this.messages.push(entry);
    
    // Limita numero messaggi
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }
    
    // Aggiungi a DOM
    this.render();
    
    // Log anche in console browser
    console.log(`[${timestamp}] ${message}`);
  },
  
  success(message) {
    this.log(message, 'success');
  },
  
  warn(message) {
    this.log(message, 'warning');
  },
  
  error(message) {
    this.log(message, 'error');
  },
  
  render() {
    if (!this.logList) return;
    
    this.logList.innerHTML = '';
    
    this.messages.forEach(entry => {
      const item = document.createElement('div');
      item.className = `dms-console-item dms-console-${entry.type}`;
      
      const icon = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: '🔵'
      }[entry.type] || '🔵';
      
      item.innerHTML = `
        <span class="dms-console-time">${entry.timestamp}</span>
        <span class="dms-console-icon">${icon}</span>
        <span class="dms-console-msg">${entry.message}</span>
      `;
      
      this.logList.appendChild(item);
    });
    
    // Auto-scroll to bottom
    this.logList.scrollTop = this.logList.scrollHeight;
  },
  
  clear() {
    this.messages = [];
    this.render();
    this.log('Console pulita');
  },
  
  copy() {
    const text = this.messages.map(m => 
      `[${m.timestamp}] ${m.message}`
    ).join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
      this.success('Log copiato negli appunti');
    }).catch(() => {
      this.error('Errore copia log');
    });
  }
};

// Inizializza quando DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => DMSConsole.init());
} else {
  DMSConsole.init();
}

