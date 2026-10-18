/* ============================================================
   RMRP LAW — script.js (v20: рабочая шапка + умный поиск + ИИ)
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
    try { initSmartSearch(); }    catch(e){ console.warn('smartSearch', e); }
    try { initToTop(); }          catch(e){ console.warn('toTop', e); }
    try { initSliders(); }        catch(e){ console.warn('sliders', e); }
    try { initBgTabs(); }         catch(e){ console.warn('bgTabs', e); }
    try { initEditor(); }         catch(e){ console.warn('editor', e); }
    try { initBgActions(); }      catch(e){ console.warn('bgActions', e); }
    try { initExport(); }         catch(e){ console.warn('export', e); }
    try { restoreLaws(); }        catch(e){ console.warn('restoreLaws', e); }
    try { restoreBg(); }          catch(e){ console.warn('restoreBg', e); }
    try { initAI(); }             catch(e){ console.warn('ai', e); }

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
     ЕДИНАЯ ШАПКА + ИИ + КОМФОРТ-ЗОНА
     ============================================================ */
  function initHeaderButtons() {
    var nav = document.querySelector('.nav');
    var path = location.pathname.split('/').pop() || 'index.html';
    var isGate = /gate\.html?$/i.test(path);
    var isComfort = /comfort\.html?$/i.test(path);
    var isAudit = /audit\.html?$/i.test(path);

    if (isGate || isAudit) return; // На гейте и аудите шапку не трогаем

    // Добавляем кнопку ИИ в меню
    if (nav && !document.getElementById('aiNavBtn')) {
      var aiBtn = document.createElement('a');
      aiBtn.href = '#';
      aiBtn.id = 'aiNavBtn';
      aiBtn.className = 'nav-link';
      aiBtn.innerHTML = '🤖 ИИ-Юрист';
      aiBtn.style.color = '#a855f7';
      aiBtn.style.fontWeight = '900';
      nav.appendChild(aiBtn);
    }

    /* 🎧 КОМФОРТ-ЗОНА */
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
            'color:#fff;font-weight:800;font-size:13.5px;' +
            'text-decoration:none;display:flex;align-items:center;gap:10px;' +
            'box-shadow:0 10px 30px rgba(8,145,178,.4), 0 0 60px rgba(168,85,247,.25);' +
            'transition:.3s;}' +
          '.comfort-float-btn:hover{transform:translateY(-3px) scale(1.03);}' +
          '@keyframes cfbGradient{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}' +
          '@media(max-width:600px){.comfort-float-btn{padding:11px 14px;font-size:12px}.cfb-text{display:none}}';
        document.head.appendChild(st);
      }
    }
  }

  /* ============================================================
     АККОРДЕОН (ОТКРЫТИЕ СТАТЕЙ)
     ============================================================ */
  function initAccordion() {
    $$('.acc-header').forEach(function (btn) {
      // Удаляем старые обработчики, чтобы не было дублей
      var newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var item = newBtn.closest('.acc-item');
        if (!item) return;
        var acc = item.closest('.accordion');
        var isOpen = item.classList.contains('open');
        
        if (acc) {
          // Закрываем остальные (если нужно, чтобы открывался только один)
          $$('.acc-item.open', acc).forEach(function (i) { i.classList.remove('open'); });
        }
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ============================================================
     УМНЫЙ ПОИСК (ИЩЕТ ПО НОМЕРУ СТАТЬИ И ТЕКСТУ)
     ============================================================ */
  function initSmartSearch() {
    var inputs = $$('.doc-search');
    inputs.forEach(function(input) {
      input.addEventListener('input', function() {
        var q = this.value.toLowerCase().trim();
        var items = $$('.acc-item');
        
        // Снимаем старую подсветку
        $$('.acc-text p').forEach(function(p){ p.style.background = ''; p.style.borderLeft = ''; });

        if (!q) {
          items.forEach(function (i) { 
            i.style.display = ''; 
            i.classList.remove('open'); 
          });
          return;
        }

        items.forEach(function (item) {
          var text = item.textContent.toLowerCase();
          var hasMatch = false;

          // Ищем совпадения в параграфах, чтобы подсветить
          var ps = item.querySelectorAll('.acc-text p');
          ps.forEach(function(p) {
            if (p.textContent.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) {
              hasMatch = true;
              // Подсветка найденного абзаца
              p.style.background = 'rgba(46, 204, 113, 0.15)';
              p.style.borderLeft = '3px solid #2ecc71';
              p.style.paddingLeft = '8px';
              p.style.transition = '0.3s';
            }
          });

          if (hasMatch) {
            item.style.display = '';
            item.classList.add('open'); // Автоматически раскрываем раздел
          } else {
            item.style.display = 'none';
            item.classList.remove('open');
          }
        });
      });
    });
  }

  /* ============================================================
     ИИ-ПОМОЩНИК (ВЫПАДАЮЩЕЕ ОКНО)
     ============================================================ */
  function initAI() {
    var aiBtn = document.getElementById('aiNavBtn');
    if (!aiBtn) return;

    // Создаём окно ИИ
    var dropdown = document.createElement('div');
    dropdown.className = 'ai-dropdown';
    dropdown.id = 'aiDropdown';
    dropdown.innerHTML = `
      <div class="ai-chat-head">
        <span><span style="color:#a855f7">●</span> Юрист ФСБ (ИИ)</span>
        <span style="font-size:10px; color:#8b949e;">СПРАВКА</span>
      </div>
      <div class="ai-chat-body" id="aiChatBody">
        <div class="ai-msg bot">Приветствую. Спроси меня о статье (напр: "срок за кражу").</div>
      </div>
      <div class="ai-chat-input-wrap">
        <input type="text" class="ai-chat-input" id="aiChatInput" placeholder="Введите вопрос..." onkeypress="if(event.key==='Enter')window.sendAI()">
        <button class="ai-chat-send" onclick="window.sendAI()">➤</button>
      </div>
    `;
    document.body.appendChild(dropdown);

    // Добавляем стили для окна ИИ
    var st = document.createElement('style');
    st.textContent = `
      .ai-dropdown { position: absolute; top: 60px; right: 22px; width: 350px; background: #0a0f12; border: 1px solid #a855f7; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); display: none; flex-direction: column; z-index: 999; overflow: hidden; }
      .ai-dropdown.active { display: flex; animation: dropIn 0.3s ease; }
      @keyframes dropIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      .ai-chat-head { padding: 12px 16px; border-bottom: 1px solid #1a242b; background: #0f1419; display: flex; justify-content: space-between; align-items: center; font-family: monospace; font-size: 13px; font-weight: bold; color: #fff; }
      .ai-chat-body { max-height: 300px; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; background: #05080a; }
      .ai-msg { max-width: 85%; padding: 8px 12px; border-radius: 10px; font-size: 12.5px; line-height: 1.4; word-wrap: break-word; }
      .ai-msg.bot { background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2); color: #c9d1d9; align-self: flex-start; }
      .ai-msg.user { background: #a855f7; color: #fff; align-self: flex-end; }
      .ai-msg a { color: #2ecc71; font-weight: bold; text-decoration: none; }
      .ai-chat-input-wrap { padding: 10px; border-top: 1px solid #1a242b; display: flex; gap: 8px; background: #0f1419; }
      .ai-chat-input { flex: 1; padding: 8px 12px; border-radius: 6px; background: #000; border: 1px solid #1a242b; color: #fff; outline: none; font-family: inherit; }
      .ai-chat-send { padding: 0 12px; border-radius: 6px; background: #a855f7; color: #fff; font-weight: bold; border: none; cursor: pointer; }
    `;
    document.head.appendChild(st);

    aiBtn.addEventListener('click', function(e) {
      e.preventDefault();
      dropdown.classList.toggle('active');
      if (dropdown.classList.contains('active')) {
        document.getElementById('aiChatInput').focus();
      }
    });

    document.addEventListener('click', function(e) {
      if (!dropdown.contains(e.target) && !aiBtn.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });

    window.sendAI = function() {
      var input = document.getElementById('aiChatInput');
      var body = document.getElementById('aiChatBody');
      var query = input.value.toLowerCase().trim();
      if (!query) return;

      var userMsg = document.createElement('div');
      userMsg.className = 'ai-msg user';
      userMsg.textContent = input.value;
      body.appendChild(userMsg);
      input.value = '';
      body.scrollTop = body.scrollHeight;

      setTimeout(function() {
        var bestMatch = null;
        var maxScore = 0;
        var KB = [
          { keys: ['убийство', 'убил'], title: 'Статья 37 УК РФ', ans: 'Убийство. 7 лет лишения свободы.', url: 'uk.html#art-37' },
          { keys: ['кража', 'украл'], title: 'Статья 44 УК РФ', ans: 'Кража. Штраф 30.000 или 3 года.', url: 'uk.html#art-44' },
          { keys: ['грабеж', 'ограбил'], title: 'Статья 46 УК РФ', ans: 'Грабеж. 4 года лишения свободы.', url: 'uk.html#art-46' },
          { keys: ['разбой', 'напал'], title: 'Статья 47 УК РФ', ans: 'Разбой. 5 лет лишения свободы.', url: 'uk.html#art-47' },
          { keys: ['адвокат'], title: 'Статья 9 ПК РФ', ans: 'Ожидание адвоката 5 минут.', url: 'process.html' },
          { keys: ['задержание'], title: 'Статья 6 ПК РФ', ans: 'Задержание не более 60 минут.', url: 'process.html' },
          { keys: ['хулиганство'], title: 'Статья 8.1 КоАП', ans: 'Штраф до 30.000 или арест на 7 суток.', url: 'koap.html#art-8.1' }
        ];

        KB.forEach(function(item) {
          var score = 0;
          item.keys.forEach(function(k) { if (query.includes(k)) score++; });
          if (score > maxScore) { maxScore = score; bestMatch = item; }
        });

        var botMsg = document.createElement('div');
        botMsg.className = 'ai-msg bot';
        if (bestMatch) {
          botMsg.innerHTML = '<strong>' + bestMatch.title + '</strong><br>' + bestMatch.ans + '<br><br><a href="' + bestMatch.url + '">🔗 Перейти к статье</a>';
        } else {
          botMsg.innerHTML = 'Не нашел статью. Спросите иначе (напр: "срок за кражу").';
        }
        body.appendChild(botMsg);
        body.scrollTop = body.scrollHeight;
      }, 500);
    };
  }

  /* ============================================================
     ОСТАЛЬНЫЕ ФУНКЦИИ (СЛУЖЕБНЫЕ)
     ============================================================ */
  function initDocAccess(){
    var LOCKED_PAGES = ['military.html'];
    var SKIP_PAGES = ['index.html','gate.html','profile.html','user.html','media.html','comfort.html','audit.html'];
    var path = location.pathname.split('/').pop() || 'index.html';
    if(SKIP_PAGES.indexOf(path) !== -1) return;
    if(LOCKED_PAGES.indexOf(path) === -1) return;
    if(!window.RMRPAuth) return;
    var user = RMRPAuth.getCurrent();
    if(user && RMRPAuth.canReadDocs && RMRPAuth.canReadDocs(user)) return;
    
    // Если нет прав - прячем всё и показываем заглушку
    document.querySelectorAll('.section, .vk-hero, .section-dark').forEach(function(el){ el.style.display = 'none'; });
    var container = document.querySelector('.container');
    if(container) {
      container.innerHTML = '<div style="max-width:520px;margin:80px auto;padding:44px 32px;background:var(--bg-2);border:1px solid var(--line);border-radius:20px;text-align:center;color:#fff"><h3>Доступ ограничен</h3><p style="color:var(--txt-2)">Требуется авторизация.</p><a href="profile.html" style="color:var(--accent)">Войти</a></div>';
    }
  }

  function openModal(m) { if (m) m.hidden = false; }
  function closeAllModals() { $$('.modal-overlay').forEach(function (m) { m.hidden = true; }); }
  function initModals() {
    var openEditor = $('#openEditor');
    var openBg = $('#openBgPicker');
    if (openEditor) openEditor.addEventListener('click', function () { openModal($('#editorModal')); });
    if (openBg) openBg.addEventListener('click', function () { openModal($('#bgModal')); });
    document.addEventListener('click', function (e) {
      if (e.target.closest('.modal-close, #cancelEditor, #removeBg, #closeEditor, #closeBgPicker')) closeAllModals();
      if (e.target.classList.contains('modal-overlay')) e.target.hidden = true;
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAllModals(); });
  }

  function initBurger() {
    var burger = $('#burger');
    var nav = $('#nav');
    if (!burger || !nav) return;
    burger.addEventListener('click', function () { nav.classList.toggle('open'); });
  }

  function initToTop() {
    var toTop = $('#toTop');
    if (!toTop) return;
    window.addEventListener('scroll', function () { toTop.classList.toggle('show', window.scrollY > 500); });
    toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  function initSliders() {
    function bind(id, outId, sfx) {
      var el = $('#' + id), o = $('#' + outId);
      if (el && o) el.addEventListener('input', function () { o.textContent = el.value + sfx; });
    }
    bind('bgOverlay', 'bgOverlayValue', '%');
    bind('bgBlur', 'bgBlurValue', 'px');
  }

  function initBgTabs() {
    $$('.bg-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var name = tab.getAttribute('data-bg-tab');
        $$('.bg-tab').forEach(function (t) { t.classList.toggle('active', t === tab); });
        $$('.bg-panel').forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-bg-panel') === name); });
      });
    });
  }

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
    });
  }

  function renderLaws(cat) {
    var container = document.getElementById('custom-' + cat);
    if (!container) return;
    var laws = JSON.parse(localStorage.getItem(LS.laws) || '{}');
    var list = laws[cat] || [];
    if (!list.length) { container.innerHTML = ''; return; }
    container.innerHTML = list.map(function (l) {
      return '<div class="acc-item open"><button class="acc-header"><span class="acc-emoji">📌</span><span class="acc-num">' + (l.tag || 'Закон') + '</span><span class="acc-title">' + l.title + '</span><span class="acc-arrow">▾</span></button><div class="acc-body"><div class="acc-text">' + l.text + '</div></div></div>';
    }).join('');
    // Переинициализируем аккордеон для новых элементов
    initAccordion();
  }

  function restoreLaws() {
    ['constitution', 'uk', 'koap', 'process', 'weapons', 'property', 'raids', 'vzk', 'discipline', 'garrison', 'internal', 'drill', 'custom'].forEach(renderLaws);
  }

  function applyBg(url, overlay, blur) {
    localStorage.setItem(LS.bg, JSON.stringify({ url: url, overlay: overlay, blur: blur }));
    var style = document.getElementById('dynamic-bg-styles') || document.createElement('style');
    style.id = 'dynamic-bg-styles';
    if (!style.parentNode) document.head.appendChild(style);
    style.textContent = 'body::before{content:"";position:fixed;inset:0;z-index:-2;background:url("' + url + '") center/cover no-repeat fixed;filter:blur(' + blur + 'px);transform:scale(1.06);}body::after{content:"";position:fixed;inset:0;z-index:-1;background:rgba(10,11,15,' + overlay + ');}';
  }

  function initBgActions() {
    var applyBtn = $('#applyBg'), removeBg = $('#removeBg');
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

  function initExport() {
    window.RMRP = {
      export: function () {
        var data = { laws: JSON.parse(localStorage.getItem(LS.laws) || '{}'), bg: localStorage.getItem(LS.bg) };
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'rmrp-backup.json'; a.click();
      },
      import: function (file) {
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) {
          try {
            var data = JSON.parse(e.target.result);
            if (data.laws) localStorage.setItem(LS.laws, JSON.stringify(data.laws));
            if (data.bg) localStorage.setItem(LS.bg, data.bg);
            alert('Импорт выполнен.'); location.reload();
          } catch (err) { alert('Ошибка: ' + err.message); }
        };
        reader.readAsText(file);
      }
    };
  }

})();
