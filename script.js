/* ============================================================
   RMRP LAW — script.js (v18: единая шапка + живой фон + комфорт-зона)
   ============================================================ */

(function () {
  'use strict';

  var LS = {
    bg: 'rmrp_bg',
    music: 'rmrp_music',
    laws: 'rmrp_custom_laws',
    page: 'rmrp_page'
  };

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  onReady(function () {
    console.log('[RMRP] script.js loaded');

    try { initLiveBackground(); } catch(e){ console.warn('liveBg', e); }
    try { initHeaderButtons(); }  catch(e){ console.warn('headerButtons', e); }
    try { initDocAccess(); }      catch(e){ console.warn('docAccess', e); }
    try { initModals(); }         catch(e){ console.warn('modals', e); }
    try { initAccordion(); }      catch(e){ console.warn('accordion', e); }
    try { initBurger(); }         catch(e){ console.warn('burger', e); }
    try { initDocSearch(); }      catch(e){ console.warn('docSearch', e); }
    try { initToTop(); }          catch(e){ console.warn('toTop', e); }
    try { initSliders(); }        catch(e){ console.warn('sliders', e); }
    try { initBgTabs(); }         catch(e){ console.warn('bgTabs', e); }
    try { initEditor(); }         catch(e){ console.warn('editor', e); }
    try { initBgActions(); }      catch(e){ console.warn('bgActions', e); }
    try { initExport(); }         catch(e){ console.warn('export', e); }
    try { restoreLaws(); }        catch(e){ console.warn('restoreLaws', e); }
    try { restoreBg(); }          catch(e){ console.warn('restoreBg', e); }

    console.log('[RMRP] init done');
  });

  /* ============================================================
     ЖИВОЙ ФОН НА ВСЕХ СТРАНИЦАХ
     ============================================================ */
  function initLiveBackground(){
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

    var page = location.pathname.split('/').pop() || 'index.html';
    var cfg = BG_CONFIG[page];
    if(!cfg) return;

    /* Убираем старый bg если был */
    var old = document.querySelector('.rmrp-live-bg');
    if(old) old.remove();
    var oldStyle = document.getElementById('rmrp-live-bg-styles');
    if(oldStyle) oldStyle.remove();

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
        '100%{transform:translateY(-100vh) translateX(80px) scale(.5);opacity:0}}' +
      'body{background:transparent !important}';
    document.head.appendChild(style);

    var bg = document.createElement('div');
    bg.className = 'rmrp-live-bg';

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
      bg.appendChild(p);
    }

    document.body.insertBefore(bg, document.body.firstChild);
  }

  /* ============================================================
     ЕДИНАЯ ШАПКА + КНОПКА КОМФОРТ-ЗОНЫ
     ============================================================ */
  function initHeaderButtons() {
    var nav = document.querySelector('.nav');
    var actions = document.querySelector('.header-actions');

    var path = location.pathname.split('/').pop() || 'index.html';
    var isGate = /gate\.html?$/i.test(path);
    var isComfort = /comfort\.html?$/i.test(path);

    if (isGate) return;

    /* NAV — 5 ссылок */
    if (nav) {
      var links = [
        { href: 'index.html',    icon: '🏠', label: 'Главная',   file: 'index.html' },
        { href: 'military.html', icon: '🎓', label: 'Военкомат', file: 'military.html', green: true },
        { href: 'media.html',    icon: '🎬', label: 'Медиа',     file: 'media.html' },
        { href: 'profile.html',  icon: '👤', label: 'Профиль',   file: 'profile.html' },
        { href: 'audit.html',    icon: '📋', label: 'Аудит',     file: 'audit.html' }
      ];

      nav.innerHTML = links.map(function(l){
        var isActive = (l.file === path);
        var style = '';
        if (isActive) style = 'background:var(--accent);color:#fff;';
        else if (l.green) style = 'background:linear-gradient(135deg,#2a5f3f,#3d7a52);color:#fff;';
        return '<a href="' + l.href + '" class="nav-link' + (isActive ? ' active' : '') + '"' +
          (style ? ' style="' + style + '"' : '') + '>' +
          l.icon + ' ' + l.label +
        '</a>';
      }).join('');
    }

    /* Кнопки справа */
    if (actions) {
      actions.querySelectorAll('.btn-profile, .btn-media').forEach(function(el){ el.remove(); });

      var profileBtn = document.createElement('a');
      profileBtn.href = 'profile.html';
      profileBtn.className = 'btn-media';
      profileBtn.title = 'Личный кабинет';
      profileBtn.style.cssText = 'background:linear-gradient(135deg,#4aa8ff,#3ddc84);text-decoration:none';
      profileBtn.innerHTML = '<span>👤</span><span class="btn-add-text">Профиль</span>';

      var logoutBtn = null;
      if (window.RMRPAuth) {
        var user = RMRPAuth.getCurrent();
        if (user) {
          logoutBtn = document.createElement('button');
          logoutBtn.className = 'btn-logout';
          logoutBtn.title = 'Выйти (' + (user.displayName || user.login) + ')';
          logoutBtn.style.cssText = 'background:rgba(255,70,85,.12);color:#ff6b78;border:1px solid rgba(255,70,85,.3);padding:8px 12px;border-radius:9px;cursor:pointer;font-size:14px;transition:.25s';
          logoutBtn.innerHTML = '🚪';
          logoutBtn.onmouseenter = function(){ logoutBtn.style.background = 'rgba(255,70,85,.25)'; };
          logoutBtn.onmouseleave = function(){ logoutBtn.style.background = 'rgba(255,70,85,.12)'; };
          logoutBtn.onclick = function(){
            if(!confirm('Выйти из аккаунта?')) return;
            RMRPAuth.logout();
            location.href = 'index.html';
          };
        }
      }

      var addBtn = actions.querySelector('.btn-add');
      if (addBtn) actions.insertBefore(profileBtn, addBtn);
      else actions.appendChild(profileBtn);

      if (logoutBtn) actions.appendChild(logoutBtn);
    }

    /* Кнопка Комфорт-зоны */
    if (!isComfort && !document.querySelector('.comfort-float-btn')) {
      var cBtn = document.createElement('a');
      cBtn.href = 'comfort.html';
      cBtn.className = 'comfort-float-btn';
      cBtn.title = 'Комфорт-зона';
      cBtn.innerHTML = '<span style="font-size:18px">🎧</span><span class="cfb-text">Комфорт-зона</span>';
      document.body.appendChild(cBtn);

      if (!document.getElementById('comfort-btn-styles')) {
        var st = document.createElement('style');
        st.id = 'comfort-btn-styles';
        st.textContent =
          '.comfort-float-btn{position:fixed;bottom:22px;right:22px;z-index:999;' +
            'padding:14px 22px;border-radius:99px;' +
            'background:linear-gradient(135deg,#0e7490,#0891b2,#0284c7,#a855f7);' +
            'background-size:200% 200%;animation:cfbGradient 6s ease infinite;' +
            'color:#fff;font-weight:800;font-size:13.5px;letter-spacing:.4px;' +
            'text-decoration:none;display:flex;align-items:center;gap:10px;' +
            'box-shadow:0 10px 30px rgba(8,145,178,.4), 0 0 60px rgba(168,85,247,.25);' +
            'transition:.3s;}' +
          '.comfort-float-btn:hover{transform:translateY(-3px) scale(1.03);}' +
          '@keyframes cfbGradient{' +
            '0%,100%{background-position:0% 50%}' +
            '50%{background-position:100% 50%}}' +
          '@media(max-width:600px){.comfort-float-btn{padding:11px 14px;font-size:12px}' +
            '.cfb-text{display:none}}';
        document.head.appendChild(st);
      }
    }
  }

  /* ============================================================
     БЛОКИРОВКА ВОЕНКОМАТА
     ============================================================ */
  function initDocAccess(){
    var LOCKED_PAGES = ['military.html'];
    var SKIP_PAGES = ['index.html','gate.html','profile.html','user.html','media.html',
                      'comfort.html','audit.html'];

    var path = location.pathname.split('/').pop() || 'index.html';
    if(SKIP_PAGES.indexOf(path) !== -1) return;
    if(LOCKED_PAGES.indexOf(path) === -1) return;

    if(!window.RMRPAuth) return;
    var user = RMRPAuth.getCurrent();

    if(user && RMRPAuth.canReadDocs && RMRPAuth.canReadDocs(user)) return;

    if(!user){
      var c0 = document.querySelector('.container');
      if(c0){
        c0.innerHTML =
          '<div style="max-width:520px;margin:80px auto;padding:44px 32px;background:var(--bg-2);border:1px solid var(--line);border-radius:20px;text-align:center">' +
            '<div style="font-size:64px;margin-bottom:20px">🎓</div>' +
            '<h3 style="color:var(--txt-0);font-size:22px;font-weight:900;margin-bottom:12px">Требуется авторизация</h3>' +
            '<p style="color:var(--txt-2);font-size:14.5px;line-height:1.7;margin-bottom:22px">Военкомат доступен только военнослужащим.<br>Войди в аккаунт, чтобы продолжить.</p>' +
            '<a href="profile.html" style="display:inline-block;padding:12px 24px;border-radius:10px;background:linear-gradient(135deg,#4aa8ff,#3ddc84);color:#fff;text-decoration:none;font-weight:700;font-size:14px">👤 Войти</a>' +
          '</div>';
      }
      return;
    }

    var container = document.querySelector('.container');
    if(!container) return;

    document.querySelectorAll('.section, .vk-hero, .section-dark').forEach(function(el){
      el.style.display = 'none';
    });

    var lock = document.createElement('div');
    lock.style.cssText = 'max-width:560px;margin:60px auto;padding:48px 36px;background:linear-gradient(135deg,rgba(61,220,132,.06),rgba(74,168,255,.04));border:1px solid rgba(61,220,132,.3);border-radius:20px;text-align:center';
    lock.innerHTML =
      '<div style="font-size:72px;margin-bottom:20px">🎓</div>' +
      '<h3 style="color:var(--txt-0);font-size:24px;font-weight:900;margin-bottom:12px">Доступ ограничен</h3>' +
      '<p style="color:var(--txt-2);font-size:15px;line-height:1.7;margin-bottom:20px">Военный комиссариат доступен только <b style="color:#3ddc84">от Младшего Сержанта</b> и выше.</p>' +
      '<div style="padding:18px 22px;background:var(--bg-1);border:1px solid var(--line);border-radius:12px;max-width:400px;margin:0 auto 22px;text-align:left">' +
        '<div style="font-size:11.5px;text-transform:uppercase;letter-spacing:1.4px;font-weight:800;color:var(--txt-3);margin-bottom:10px">Требования</div>' +
        '<div style="font-size:13.5px;color:var(--txt-1);line-height:1.8">' +
          '🎖️ Звание: <b>Мл.Сержант</b> и выше<br>' +
          '🔐 Или роль: <b>Администратор / Разработчик</b>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
        '<a href="index.html" style="padding:11px 22px;border-radius:10px;background:var(--bg-3);color:var(--txt-1);text-decoration:none;font-weight:600;font-size:13.5px;border:1px solid var(--line)">← На главную</a>' +
        '<a href="profile.html" style="padding:11px 22px;border-radius:10px;background:linear-gradient(135deg,#fbbf24,#d97706);color:#fff;text-decoration:none;font-weight:700;font-size:13.5px">📤 Подать заявку</a>' +
      '</div>';

    var firstSection = document.querySelector('.vk-hero') || document.querySelector('.section');
    if(firstSection && firstSection.parentNode){
      firstSection.parentNode.insertBefore(lock, firstSection);
    } else {
      container.appendChild(lock);
    }
  }

  /* ============================================================
     МОДАЛКИ
     ============================================================ */
  function openModal(m) { if (m) m.hidden = false; }
  function closeAllModals() { $$('.modal-overlay').forEach(function (m) { m.hidden = true; }); }

  function initModals() {
    var openEditor = $('#openEditor');
    var openBg = $('#openBgPicker');
    if (openEditor) openEditor.addEventListener('click', function () { openModal($('#editorModal')); });
    if (openBg) openBg.addEventListener('click', function () { openModal($('#bgModal')); });

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('.modal-close')) { closeAllModals(); return; }
      if (t.closest('#cancelEditor, #removeBg, #closeEditor, #closeBgPicker')) { closeAllModals(); return; }
      if (t.classList.contains('modal-overlay')) { t.hidden = true; return; }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAllModals(); });
  }

  /* ============================================================
     АККОРДЕОН
     ============================================================ */
  function initAccordion() {
    $$('.acc-header').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var item = btn.closest('.acc-item');
        if (!item) return;
        var acc = item.closest('.accordion');
        var isOpen = item.classList.contains('open');
        if (acc) $$('.acc-item.open', acc).forEach(function (i) { i.classList.remove('open'); });
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ============================================================
     БУРГЕР
     ============================================================ */
  function initBurger() {
    var burger = $('#burger');
    var nav = $('#nav');
    if (!burger || !nav) return;
    burger.addEventListener('click', function () { nav.classList.toggle('open'); });
    $$('.nav-link', nav).forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  /* ============================================================
     ПОИСК
     ============================================================ */
  function initDocSearch() {
    $$('.doc-search').forEach(function (input) {
      input.addEventListener('input', function () {
        var q = input.value.trim().toLowerCase();
        var items = $$('.acc-item');
        if (!q) {
          items.forEach(function (i) { i.style.display = ''; i.classList.remove('open'); });
          return;
        }
        items.forEach(function (item) {
          var text = item.textContent.toLowerCase();
          item.style.display = text.indexOf(q) !== -1 ? '' : 'none';
        });
      });
    });
  }

  /* ============================================================
     КНОПКА «НАВЕРХ»
     ============================================================ */
  function initToTop() {
    var toTop = $('#toTop');
    if (!toTop) return;
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('show', window.scrollY > 500);
    });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     СЛАЙДЕРЫ
     ============================================================ */
  function initSliders() {
    function bind(id, outId, sfx) {
      var el = $('#' + id);
      var o = $('#' + outId);
      if (el && o) el.addEventListener('input', function () { o.textContent = el.value + sfx; });
    }
    bind('bgOverlay', 'bgOverlayValue', '%');
    bind('bgBlur', 'bgBlurValue', 'px');
  }

  /* ============================================================
     ТАБЫ ФОНА
     ============================================================ */
  function initBgTabs() {
    $$('.bg-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var name = tab.getAttribute('data-bg-tab');
        $$('.bg-tab').forEach(function (t) { t.classList.toggle('active', t === tab); });
        $$('.bg-panel').forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('data-bg-panel') === name);
        });
      });
    });
  }

  /* ============================================================
     РЕДАКТОР ЗАКОНОВ
     ============================================================ */
  function initEditor() {
    var saveBtn = $('#saveEditor');
    if (!saveBtn) return;
    saveBtn.addEventListener('click', function () {
      var cat = $('#lawCategory').value;
      var tag = $('#lawTag').value;
      var title = $('#lawTitle').value.trim();
      var text = $('#editorArea').innerHTML.trim();
      if (!title || !text) { alert('Заполните заголовок и текст'); return; }
      var laws = JSON.parse(localStorage.getItem(LS.laws) || '{}');
      if (!laws[cat]) laws[cat] = [];
      laws[cat].push({ id: Date.now(), tag: tag, title: title, text: text });
      localStorage.setItem(LS.laws, JSON.stringify(laws));
      renderLaws(cat);
      closeAllModals();
      $('#lawTitle').value = '';
      $('#lawTag').value = '';
      $('#editorArea').innerHTML = '';
    });
  }

  function renderLaws(cat) {
    var container = document.getElementById('custom-' + cat);
    if (!container) return;
    var laws = JSON.parse(localStorage.getItem(LS.laws) || '{}');
    var list = laws[cat] || [];
    if (!list.length) { container.innerHTML = ''; return; }
    container.innerHTML = list.map(function (l) {
      return '<div class="acc-item open">' +
        '<button class="acc-header"><span class="acc-emoji">📌</span><span class="acc-num">' + (l.tag || 'Закон') + '</span><span class="acc-title">' + l.title + '</span><span class="acc-arrow">▾</span></button>' +
        '<div class="acc-body"><div class="acc-text">' + l.text + '</div></div>' +
      '</div>';
    }).join('');
    $$('.acc-header', container).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.acc-item');
        if (item.classList.contains('open')) item.classList.remove('open');
        else item.classList.add('open');
      });
    });
  }

  function restoreLaws() {
    ['constitution', 'uk', 'koap', 'process', 'weapons', 'property', 'raids',
     'vzk', 'discipline', 'garrison', 'internal', 'drill', 'custom'].forEach(renderLaws);
  }

  /* ============================================================
     ФОН (кастомный пользовательский)
     ============================================================ */
  function applyBg(url, overlay, blur) {
    localStorage.setItem(LS.bg, JSON.stringify({ url: url, overlay: overlay, blur: blur }));
    var style = document.getElementById('dynamic-bg-styles') || document.createElement('style');
    style.id = 'dynamic-bg-styles';
    if (!style.parentNode) document.head.appendChild(style);
    style.textContent =
      'body::before{content:"";position:fixed;inset:0;z-index:-2;' +
      'background:url("' + url + '") center/cover no-repeat fixed;' +
      'filter:blur(' + blur + 'px);transform:scale(1.06);}' +
      'body::after{content:"";position:fixed;inset:0;z-index:-1;' +
      'background:rgba(10,11,15,' + overlay + ');}';
  }

  function initBgActions() {
    var applyBtn = $('#applyBg');
    var removeBg = $('#removeBg');

    if (applyBtn) {
      applyBtn.addEventListener('click', function () {
        var activeTabEl = $('.bg-tab.active');
        var activeTab = activeTabEl ? activeTabEl.getAttribute('data-bg-tab') : 'url';
        var overlay = ($('#bgOverlay') ? $('#bgOverlay').value : 60) / 100;
        var blur = $('#bgBlur') ? $('#bgBlur').value : 0;

        if (activeTab === 'url') {
          var url = $('#bgUrlInput').value.trim();
          if (url) applyBg(url, overlay, blur);
        } else if (activeTab === 'file') {
          var file = $('#bgFileInput').files[0];
          if (file) {
            var reader = new FileReader();
            reader.onload = function (ev) { applyBg(ev.target.result, overlay, blur); };
            reader.readAsDataURL(file);
          }
        }
        closeAllModals();
      });
    }

    if (removeBg) {
      removeBg.addEventListener('click', function () {
        localStorage.removeItem(LS.bg);
        var style = document.getElementById('dynamic-bg-styles');
        if (style) style.textContent = '';
        closeAllModals();
      });
    }
  }

  function restoreBg() {
    try {
      var bg = JSON.parse(localStorage.getItem(LS.bg) || 'null');
      if (bg && bg.url) applyBg(bg.url, bg.overlay, bg.blur);
    } catch (e) {}
  }

  /* ============================================================
     ЭКСПОРТ / ИМПОРТ
     ============================================================ */
  function initExport() {
    window.RMRP = {
      export: function () {
        var data = {
          laws: JSON.parse(localStorage.getItem(LS.laws) || '{}'),
          bg: localStorage.getItem(LS.bg),
          media: JSON.parse(localStorage.getItem('rmrp_media_gallery') || '[]'),
          albums: JSON.parse(localStorage.getItem('rmrp_media_albums') || '[]'),
          vkCalc: JSON.parse(localStorage.getItem('rmrp_vk_calc_v2') || 'null'),
          auditHistory: JSON.parse(localStorage.getItem('rmrp_audit_history') || '[]')
        };
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'rmrp-backup-' + Date.now() + '.json';
        a.click();
      },
      import: function (file) {
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) {
          try {
            var data = JSON.parse(e.target.result);
            if (data.laws)   localStorage.setItem(LS.laws, JSON.stringify(data.laws));
            if (data.bg)     localStorage.setItem(LS.bg, data.bg);
            if (data.media)  localStorage.setItem('rmrp_media_gallery', JSON.stringify(data.media));
            if (data.albums) localStorage.setItem('rmrp_media_albums', JSON.stringify(data.albums));
            if (data.vkCalc) localStorage.setItem('rmrp_vk_calc_v2', JSON.stringify(data.vkCalc));
            if (data.auditHistory) localStorage.setItem('rmrp_audit_history', JSON.stringify(data.auditHistory));
            alert('Импорт выполнен.');
            location.reload();
          } catch (err) { alert('Ошибка: ' + err.message); }
        };
        reader.readAsText(file);
      }
    };
  }

})();
