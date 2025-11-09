/* ========================================
   DMS HUB PUBLIC - JAVASCRIPT FIGATA
   ======================================== */

// ========================================
// GLOBAL STATE
// ========================================

const state = {
  musicPlaying: false,
  audioContext: null,
  musicNodes: null,
  scrollY: 0,
  isLoaded: false
};

// ========================================
// INIT
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initLoading();
  initNavbar();
  initHero();
  initMusic();
  initAnimations();
  initMaps();
  initCounters();
  initParticles();
});

// ========================================
// LOADING SCREEN
// ========================================

function initLoading() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        state.isLoaded = true;
        
        // Trigger entrance animations
        triggerEntranceAnimations();
      }
    }, 800);
  });
}

function triggerEntranceAnimations() {
  const elements = document.querySelectorAll('.animate-fade-in, .animate-slide-up');
  elements.forEach((el, index) => {
    setTimeout(() => {
      el.style.opacity = '1';
    }, index * 100);
  });
}

// ========================================
// NAVBAR
// ========================================

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  
  // Scroll effect
  window.addEventListener('scroll', () => {
    state.scrollY = window.scrollY;
    
    if (state.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
  
  // Mobile toggle
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
  
  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= (sectionTop - 200)) {
        current = section.getAttribute('id');
      }
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// ========================================
// HERO
// ========================================

function initHero() {
  // Parallax effect
  window.addEventListener('scroll', () => {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && state.scrollY < window.innerHeight) {
      const offset = state.scrollY * 0.5;
      heroContent.style.transform = `translateY(${offset}px)`;
      heroContent.style.opacity = 1 - (state.scrollY / window.innerHeight);
    }
  });
}

// ========================================
// MUSIC (Web Audio API)
// ========================================

function initMusic() {
  const musicControl = document.getElementById('musicControl');
  
  if (!musicControl) return;
  
  musicControl.addEventListener('click', toggleMusic);
}

function toggleMusic() {
  if (state.musicPlaying) {
    stopMusic();
  } else {
    startMusic();
  }
}

function startMusic() {
  // Create Audio Context
  if (!state.audioContext) {
    state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  // Generate ambient music
  generateAmbientMusic();
  
  state.musicPlaying = true;
  
  // Update UI
  const musicControl = document.getElementById('musicControl');
  const iconSound = musicControl.querySelector('.icon-sound');
  const iconMute = musicControl.querySelector('.icon-mute');
  
  iconSound.classList.add('hidden');
  iconMute.classList.remove('hidden');
}

function stopMusic() {
  if (state.musicNodes) {
    // Stop all oscillators
    state.musicNodes.forEach(node => {
      if (node.oscillator) {
        node.oscillator.stop();
      }
    });
    state.musicNodes = null;
  }
  
  state.musicPlaying = false;
  
  // Update UI
  const musicControl = document.getElementById('musicControl');
  const iconSound = musicControl.querySelector('.icon-sound');
  const iconMute = musicControl.querySelector('.icon-mute');
  
  iconSound.classList.remove('hidden');
  iconMute.classList.add('hidden');
}

function generateAmbientMusic() {
  const ctx = state.audioContext;
  const now = ctx.currentTime;
  
  // Master gain
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.15;
  masterGain.connect(ctx.destination);
  
  state.musicNodes = [];
  
  // Bass drone (C2)
  const bass = createTone(ctx, 65.41, 'sine', masterGain, 0.3);
  state.musicNodes.push(bass);
  
  // Pad (G3)
  const pad1 = createTone(ctx, 196.00, 'triangle', masterGain, 0.15);
  state.musicNodes.push(pad1);
  
  // Pad (E4)
  const pad2 = createTone(ctx, 329.63, 'sine', masterGain, 0.12);
  state.musicNodes.push(pad2);
  
  // Ambient high (B4)
  const high = createTone(ctx, 493.88, 'sine', masterGain, 0.08);
  state.musicNodes.push(high);
  
  // Add subtle LFO modulation
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.2;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 10;
  lfo.connect(lfoGain);
  lfoGain.connect(pad1.oscillator.frequency);
  lfo.start(now);
  
  // Fade in
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(0.15, now + 2);
}

function createTone(ctx, frequency, type, destination, volume) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  
  gain.gain.value = volume;
  
  oscillator.connect(gain);
  gain.connect(destination);
  
  oscillator.start(ctx.currentTime);
  
  return { oscillator, gain };
}

// ========================================
// ANIMATED COUNTERS
// ========================================

function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        animateCounter(entry.target);
        entry.target.dataset.counted = 'true';
      }
    });
  }, observerOptions);
  
  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const target = parseInt(element.dataset.target);
  const duration = 2000;
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = formatNumber(Math.floor(current));
  }, 16);
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toString();
}

// ========================================
// PARTICLES
// ========================================

function initParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  
  const particleCount = 50;
  
  for (let i = 0; i < particleCount; i++) {
    createParticle(particlesContainer);
  }
}

function createParticle(container) {
  const particle = document.createElement('div');
  particle.style.position = 'absolute';
  particle.style.width = Math.random() * 3 + 1 + 'px';
  particle.style.height = particle.style.width;
  particle.style.background = 'rgba(20, 184, 166, 0.5)';
  particle.style.borderRadius = '50%';
  particle.style.left = Math.random() * 100 + '%';
  particle.style.top = Math.random() * 100 + '%';
  particle.style.pointerEvents = 'none';
  
  // Animation
  const duration = Math.random() * 10 + 10;
  const delay = Math.random() * 5;
  
  particle.style.animation = `float ${duration}s ${delay}s infinite ease-in-out`;
  
  container.appendChild(particle);
}

// Add float animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% {
      transform: translate(0, 0);
      opacity: 0;
    }
    10%, 90% {
      opacity: 1;
    }
    50% {
      transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px);
    }
  }
`;
document.head.appendChild(style);

// ========================================
// MAPS
// ========================================

function initMaps() {
  // Hero Map
  const heroMapEl = document.getElementById('heroMap');
  if (heroMapEl && typeof L !== 'undefined') {
    const heroMap = L.map('heroMap', {
      center: [42.5, 12.5],
      zoom: 6,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: false
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      opacity: 0.6
    }).addTo(heroMap);
    
    // Add animated markers for demo cities
    const cities = [
      { name: 'Milano', coords: [45.4642, 9.1900] },
      { name: 'Roma', coords: [41.9028, 12.4964] },
      { name: 'Napoli', coords: [40.8518, 14.2681] },
      { name: 'Torino', coords: [45.0703, 7.6869] },
      { name: 'Firenze', coords: [43.7696, 11.2558] },
      { name: 'Bologna', coords: [44.4949, 11.3426] },
      { name: 'Venezia', coords: [45.4408, 12.3155] },
      { name: 'Genova', coords: [44.4056, 8.9463] }
    ];
    
    cities.forEach((city, index) => {
      setTimeout(() => {
        const marker = L.circleMarker(city.coords, {
          radius: 8,
          fillColor: '#14b8a6',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(heroMap);
        
        marker.bindPopup(`<b>${city.name}</b><br>Mercati attivi`);
        
        // Pulse animation
        setInterval(() => {
          marker.setRadius(8);
          setTimeout(() => marker.setRadius(12), 300);
          setTimeout(() => marker.setRadius(8), 600);
        }, 3000 + index * 500);
      }, index * 200);
    });
  }
  
  // Stats Map
  const statsMapEl = document.getElementById('statsMap');
  if (statsMapEl && typeof L !== 'undefined') {
    const statsMap = L.map('statsMap', {
      center: [42.5, 12.5],
      zoom: 6,
      zoomControl: true
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(statsMap);
    
    // Add same markers
    const cities = [
      { name: 'Milano', coords: [45.4642, 9.1900], markets: 127 },
      { name: 'Roma', coords: [41.9028, 12.4964], markets: 98 },
      { name: 'Napoli', coords: [40.8518, 14.2681], markets: 76 },
      { name: 'Torino', coords: [45.0703, 7.6869], markets: 54 },
      { name: 'Firenze', coords: [43.7696, 11.2558], markets: 43 },
      { name: 'Bologna', coords: [44.4949, 11.3426], markets: 38 },
      { name: 'Venezia', coords: [45.4408, 12.3155], markets: 32 },
      { name: 'Genova', coords: [44.4056, 8.9463], markets: 29 }
    ];
    
    cities.forEach(city => {
      const marker = L.circleMarker(city.coords, {
        radius: Math.sqrt(city.markets) * 2,
        fillColor: '#14b8a6',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.6
      }).addTo(statsMap);
      
      marker.bindPopup(`
        <b>${city.name}</b><br>
        ${city.markets} mercati attivi<br>
        <a href="#" style="color: #14b8a6;">Visualizza dettagli →</a>
      `);
    });
  }
}

// ========================================
// SCROLL ANIMATIONS
// ========================================

function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe all cards and sections
  const elements = document.querySelectorAll('.feature-card, .access-card, .stat-card');
  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ========================================
// SOUND EFFECTS
// ========================================

function playClickSound() {
  if (!state.audioContext) return;
  
  const ctx = state.audioContext;
  const now = ctx.currentTime;
  
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  
  oscillator.start(now);
  oscillator.stop(now + 0.1);
}

// Add click sound to all buttons
document.addEventListener('click', (e) => {
  if (e.target.closest('.btn, .nav-link, .access-card')) {
    playClickSound();
  }
});

// ========================================
// SMOOTH SCROLL
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ========================================
// CONSOLE EASTER EGG
// ========================================

console.log('%c🇮🇹 DMS HUB - Gemello Digitale del Commercio Nazionale', 'font-size: 20px; font-weight: bold; color: #14b8a6;');
console.log('%cSistema operativo dal 2024', 'font-size: 14px; color: #9bd6de;');
console.log('%c\nVuoi contribuire? Contattaci!', 'font-size: 12px; color: #6b8a96;');
console.log('%chttps://github.com/dms-hub', 'font-size: 12px; color: #14b8a6;');

// ========================================
// UTILITY FUNCTIONS
// ========================================

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

// Optimize scroll events
window.addEventListener('scroll', throttle(() => {
  state.scrollY = window.scrollY;
}, 16));

// Preload images
window.addEventListener('load', () => {
  const images = document.querySelectorAll('img[data-src]');
  images.forEach(img => {
    img.src = img.dataset.src;
  });
});

// ========================================
// PWA SUPPORT
// ========================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      registration => {
        console.log('ServiceWorker registration successful');
      },
      err => {
        console.log('ServiceWorker registration failed: ', err);
      }
    );
  });
}

// ========================================
// EXPORT FOR EXTERNAL USE
// ========================================

window.DMSHUB = {
  state,
  toggleMusic,
  playClickSound
};
