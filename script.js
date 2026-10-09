/* ============================================================
   RMRP LAW — script.js (v16: комфорт-зона + блокировка военкомата)
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

    try { initHeaderButtons(); } catch(e){ console.warn('headerButtons', e); }
    try { initComfortButton(); } catch(e){ console.warn('comfortButton', e); }
    try { initDocAccess(); }     catch(e){ console.warn('docAccess', e); }
    try { initModals(); }        catch(e){ console.warn('modals', e); }
    try { initAccordion(); }     catch(e){ console.warn('accordion', e); }
    try { initBurger(); }        catch(e){ console.warn('burger', e); }
    try { initDocSearch(); }     catch(e){ console.warn('docSearch', e); }
    try { initToTop(); }         catch(e){ console.warn('toTop', e); }
    try { initSliders(); }       catch(e){ console.warn('sliders', e); }
    try { initBgTabs(); }        catch(e){ console.warn('bgTabs', e); }
    try { initEditor(); }        catch(e){ console.warn('editor', e); }
    try { initBgActions(); }     catch(e){ console.warn('bgActions', e); }
    try { initExport(); }        catch(e){ console.warn('export', e); }
    try { restoreLaws(); }       catch(e){ console.warn('restoreLaws', e); }
    try { restoreBg(); }         catch(e){ console.warn('restoreBg', e); }

    console.log('[RMRP] init done');
  });

  /* ============================================================
     КНОПКИ В ШАПКЕ
     ============================================================ */
  function initHeaderButtons() {
    var actions = document.querySelector('.header-actions');
    if (!actions) return;

    var path = location.pathname;
    var isGatePage = /gate\.html?$/i.test(path);
    if (isGatePage) return;

    /* Кнопка «Выйти» */
    if (window.RMRPAuth) {
      var user = RMRPAuth.getCurrent();
      if (user && !actions.querySelector('.btn-logout')) {
        var btn = document.createElement('button');
        btn.className = 'btn-logout';
        btn.title = 'Выйти (' + (user.displayName || user.login) + ')';
        btn.style.cssText = 'background:rgba(255,70,85,.12);color:#ff6b78;border:1px solid rgba(255,70,85,.3);padding:8px 12px;border-radius:9px;cursor:pointer;font-size:14px;transition:.25s';
        btn.innerHTML = '🚪';
        btn.onmouseenter = function(){ btn.style.background = 'rgba(255,70,85,.25)'; };
        btn.onmouseleave = function(){ btn.style.background = 'rgba(255,70,85,.12)'; };
        btn.onclick = function(){
          if(!confirm('Выйти из аккаунта?')) return;
          RMRPAuth.logout();
          location.href = 'index.html';
        };
        actions.appendChild(btn);
      }
    }
  }

  /* ============================================================
     КНОПКА «КОМФОРТ-ЗОНА» НА ВСЕХ СТРАНИЦАХ
     ============================================================ */
  function initComfortButton(){
    /* Не показываем на gate и в самой comfort зоне */
    var path = location.pathname;
    if(/gate\.html?$/i.test(path)) return;
    if(/comfort\.html?$/i.test(path)) return;

    /* Не дублируем */
    if(document.querySelector('.comfort-float-btn')) return;

    var btn = document.createElement('a');
    btn.href = 'comfort.html';
    btn.className = 'comfort-float-btn';
    btn.title = 'Комфорт-зона — музыка и отдых';
    btn.innerHTML = '<span class="cfb-icon">🎧</span><span class="cfb-text">Комфорт-зона</span>';

    document.body.appendChild(btn);

    /* Стили вставляем один раз */
    if(!document.getElementById('comfort-btn-styles')){
      var st = document.createElement('style');
      st.id = 'comfort-btn-styles';
      st.textContent =
        '.comfort-float-btn{' +
          'position:fixed;bottom:22px;right:22px;z-index:999;' +
          'padding:14px 22px;border-radius:99px;' +
          'background:linear-gradient(135deg,#0e7490,#0891b2,#0284c7,#a855f7);' +
          'background-size:200% 200%;' +
          'animation:cfbGradient 6s ease infinite;' +
          'color:#fff;font-weight:800;font-size:13.5px;letter-spacing:.4px;' +
          'text-decoration:none;' +
          'box-shadow:0 10px 30px rgba(8,145,178,.4), 0 0 60px rgba(168,85,247,.25);' +
          'display:flex;align-items:center;gap:10px;' +
          'transition:.3s;' +
        '}' +
        '.comfort-float-btn:hover{' +
          'transform:translateY(-3px) scale(1.03);' +
          'box-shadow:0 14px 40px rgba(8,145,178,.6), 0 0 80px rgba(168,85,247,.35);' +
        '}' +
        '.comfort-float-btn .cfb-icon{font-size:18px}' +
        '@keyframes cfbGradient{' +
          '0%,100%{background-position:0% 50%}' +
          '50%{background-position:100% 50%}' +
        '}' +
        '@media(max-width:600px){' +
          '.comfort-float-btn{padding:11px 14px;font-size:12px}' +
          '.comfort-float-btn .cfb-text{display:none}' +
        '}';
      document.head.appendChild(st);
    }
  }

  /* ============================================================
     БЛОКИРОВКА — только Военкомат для тех, кто ниже Мл.Сержанта
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

    /* Не авторизован */
    if(!user){
      var container0 = document.querySelector('.container');
      if(container0){
        container0.innerHTML =
          '<div style="max-width:520px;margin:80px auto;padding:44px 32px;background:var(--bg-2);border:1px solid var(--line);border-radius:20px;text-align:center">' +
            '<div style="font-size:64px;margin-bottom:20px">🎓</div>' +
            '<h3 style="color:var(--txt-0);font-size:22px;font-weight:900;margin-bottom:12px">Требуется авторизация</h3>' +
            '<p style="color:var(--txt-2);font-size:14.5px;line-height:1.7;margin-bottom:22px">Военкомат доступен только военнослужащим.<br>Войди в аккаунт, чтобы продолжить.</p>' +
            '<a href="profile.html" style="display:inline-block;padding:12px 24px;border-radius:10px;background:linear-gradient(135deg,#4aa8ff,#3ddc84);color:#fff;text-decoration:none;font-weight:700;font-size:14px">👤 Войти</a>' +
          '</div>';
      }
      return;
    }

    /* Авторизован, но нет доступа */
    var container = document.querySelector('.container');
    if(!container) return;

    document.querySelectorAll('.section, .vk-hero, .section-dark').forEach(function(el){
      el.style.display = 'none';
    });

    var lock = document.createElement('div');
    lock.style.cssText = 'max-width:560px;margin:60px auto;padding:48px 36px;background:linear-gradient(135deg,rgba(61,220,132,.06),rgba(74,168,255,.04));border:1px solid rgba(61,220,132,.3);border-radius:20px;text-align:center';
    lock.innerHTML =
      '<div style="font-size:72px;margin-bottom:20px;filter:drop-shadow(0 10px 30px rgba(61,220,132,.4))">🎓</div>' +
      '<h3 style="color:var(--txt-0);font-size:24px;font-weight:900;margin-bottom:12px;letter-spacing:-.5px">Доступ ограничен</h3>' +
      '<p style="color:var(--txt-2);font-size:15px;line-height:1.7;margin-bottom:20px">Военный комиссариат доступен только военнослужащим <b style="color:#3ddc84">от Младшего Сержанта</b> и выше.</p>' +
      '<div style="padding:18px 22px;background:var(--bg-1);border:1px solid var(--line);border-radius:12px;max-width:400px;margin:0 auto 22px;text-align:left">' +
        '<div style="font-size:11.5px;text-transform:uppercase;letter-spacing:1.4px;font-weight:800;color:var(--txt-3);margin-bottom:10px">Требования</div>' +
        '<div style="font-size:13.5px;color:var(--txt-1);line-height:1.8">' +
          '🎖️ Звание: <b>Мл.Сержант</b> и выше<br>' +
          '🛠️ Должность: <b>Ст. ВК</b> и выше<br>' +
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
    var headers = $$('.acc-header');
    headers.forEach(function (btn) {
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
     ПОИСК ПО ДОКУМЕНТУ
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
    bind('bgVolume', 'bgVolumeValue', '%');
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
     ФОН
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
