/* ============================================================
   RMRP — fons.js (автофоны на всех страницах)
   ============================================================ */
(function(){
  'use strict';

  /* Конфиг фонов по страницам */
  var BG_CONFIG = {
    'index.html':       { c1: '#1a0a15', c2: '#0d1424', c3: '#0a0b0f', accent: '255,70,85',   accent2: '168,85,247' },
    'constitution.html':{ c1: '#2a1e08', c2: '#1a1408', c3: '#0a0b0f', accent: '251,191,36',  accent2: '217,119,6' },
    'uk.html':          { c1: '#2a0a0a', c2: '#1a0808', c3: '#0a0b0f', accent: '255,70,85',   accent2: '153,27,27' },
    'koap.html':        { c1: '#0a1a2a', c2: '#081420', c3: '#0a0b0f', accent: '74,168,255',  accent2: '37,99,235' },
    'process.html':     { c1: '#0a1030', c2: '#080b20', c3: '#0a0b0f', accent: '99,102,241',  accent2: '79,70,229' },
    'weapons.html':     { c1: '#1a1a1e', c2: '#0f0f14', c3: '#0a0b0f', accent: '148,163,184', accent2: '71,85,105' },
    'property.html':    { c1: '#0a2a1a', c2: '#081a10', c3: '#0a0b0f', accent: '34,197,94',   accent2: '22,163,74' },
    'raids.html':       { c1: '#2a1a0a', c2: '#1a1008', c3: '#0a0b0f', accent: '249,115,22',  accent2: '234,88,12' },
    'vzk.html':         { c1: '#1a2a10', c2: '#101a08', c3: '#0a0b0f', accent: '132,204,22',  accent2: '101,163,13' },
    'discipline.html':  { c1: '#2a0e14', c2: '#1a0810', c3: '#0a0b0f', accent: '255,70,85',   accent2: '251,191,36' },
    'garrison.html':    { c1: '#0a1a2a', c2: '#081420', c3: '#0a0b0f', accent: '59,130,246',  accent2: '37,99,235' },
    'internal.html':    { c1: '#1a0a2a', c2: '#100820', c3: '#0a0b0f', accent: '168,85,247',  accent2: '126,34,206' },
    'drill.html':       { c1: '#2a1e14', c2: '#1a1208', c3: '#0a0b0f', accent: '217,119,6',   accent2: '120,53,15' },
    'military.html':    { c1: '#0a2a1e', c2: '#081a12', c3: '#0a0b0f', accent: '61,220,132',  accent2: '16,185,129' },
    'profile.html':     { c1: '#0a1a2a', c2: '#101030', c3: '#0a0b0f', accent: '74,168,255',  accent2: '168,85,247' },
    'media.html':       { c1: '#1a0a2a', c2: '#200820', c3: '#0a0b0f', accent: '236,72,153',  accent2: '168,85,247' },
    'audit.html':       { c1: '#180a28', c2: '#100820', c3: '#0a0b0f', accent: '168,85,247',  accent2: '74,168,255' },
    'user.html':        { c1: '#0a2028', c2: '#081820', c3: '#0a0b0f', accent: '61,220,132',  accent2: '74,168,255' }
  };

  function getPath(){
    var p = location.pathname.split('/').pop();
    return p || 'index.html';
  }

  function initBackground(){
    var page = getPath();
    var cfg = BG_CONFIG[page];
    if(!cfg) return; /* Нет конфига — стандартный фон */

    /* Создаём контейнер */
    var bg = document.createElement('div');
    bg.className = 'rmrp-live-bg';
    bg.setAttribute('aria-hidden', 'true');

    /* Стили в body */
    var style = document.createElement('style');
    style.id = 'rmrp-live-bg-styles';
    style.textContent =
      '.rmrp-live-bg{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;' +
        'background:radial-gradient(1200px 700px at 15% 10%, rgba(' + cfg.accent + ',.18), transparent 65%),' +
        'radial-gradient(1000px 700px at 85% 90%, rgba(' + cfg.accent2 + ',.15), transparent 65%),' +
        'linear-gradient(180deg, ' + cfg.c1 + ' 0%, ' + cfg.c2 + ' 50%, ' + cfg.c3 + ' 100%);}' +
      '.rmrp-live-bg::before{content:"";position:absolute;inset:0;' +
        'background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),' +
        'linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);' +
        'background-size:60px 60px;' +
        'mask-image:radial-gradient(circle at 50% 40%, #000 25%, transparent 75%);' +
        '-webkit-mask-image:radial-gradient(circle at 50% 40%, #000 25%, transparent 75%);}' +
      '.rmrp-particle{position:absolute;border-radius:50%;' +
        'background:linear-gradient(135deg, rgba(' + cfg.accent + ',.9), rgba(' + cfg.accent2 + ',.7));' +
        'animation:rmrpFloat linear infinite;opacity:0;}' +
      '@keyframes rmrpFloat{' +
        '0%{transform:translateY(0) translateX(0) scale(1);opacity:0}' +
        '10%{opacity:.5}' +
        '90%{opacity:.5}' +
        '100%{transform:translateY(-100vh) translateX(80px) scale(.5);opacity:0}}';
    document.head.appendChild(style);

    /* Частицы */
    var particles = document.createElement('div');
    particles.style.cssText = 'position:absolute;inset:0;pointer-events:none';
    for(var i = 0; i < 15; i++){
      var p = document.createElement('div');
      p.className = 'rmrp-particle';
      var size = 3 + Math.random() * 7;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.bottom = '-20px';
      p.style.animationDuration = (12 + Math.random() * 15) + 's';
      p.style.animationDelay = (Math.random() * 12) + 's';
      particles.appendChild(p);
    }
    bg.appendChild(particles);

    /* Вставляем в body первым элементом */
    document.body.insertBefore(bg, document.body.firstChild);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initBackground);
  } else {
    initBackground();
  }

})();
