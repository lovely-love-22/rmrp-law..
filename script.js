/* ============================================================
   RMRP LAW — script.js (v9: чистая шапка)
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
