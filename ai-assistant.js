/* ============================================================
   RMRP — ai-assistant.js
   ИИ-помощник по законодательной базе. Работает офлайн.
   Подключается на всех страницах через script.js
   ============================================================ */
(function(){
  'use strict';

  if(window.__RMRP_AI_LOADED__) return;
  window.__RMRP_AI_LOADED__ = true;

  function waitForKnowledge(cb, tries){
    tries = tries || 0;
    if(window.RMRP_AI_KNOWLEDGE) { cb(); return; }
    if(tries > 50) { console.warn('[AI] База знаний не загружена'); return; }
    setTimeout(function(){ waitForKnowledge(cb, tries+1); }, 100);
  }

  /* ============================================================
     СТОП-СЛОВА (не несут смысла, убираем при поиске)
     ============================================================ */
  var STOP_WORDS = ['какая','какой','какие','какое','что','за','для','по','на','в','и','или','а','но','сколько','как','где','когда','почему','это','мне','можно','ли','если','то','не','надо','нужно','должен','должна','будет','быть','есть','про','об','о','при','с','со','к','ко','от','до','из','за','под','над','без','через','после','перед','между','также','тоже','уже','ещё','еще'];

  function normalize(s){
    return String(s||'').toLowerCase()
      .replace(/[.,!?;:()"'«»\-—–]/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function tokenize(s){
    return normalize(s).split(' ').filter(function(w){
      return w.length > 1 && STOP_WORDS.indexOf(w) === -1;
    });
  }

  /* ============================================================
     ПОИСК ЛУЧШЕГО ОТВЕТА
     ============================================================ */
  function findBestAnswer(query){
    var q = normalize(query);
    var tokens = tokenize(query);
    if(tokens.length === 0) return null;

    var KB = window.RMRP_AI_KNOWLEDGE || [];
    var best = null;
    var bestScore = 0;

    KB.forEach(function(item){
      var score = 0;

      // 1. Совпадение ключевых фраз (высокий вес)
      (item.keywords || []).forEach(function(kw){
        var k = normalize(kw);
        if(!k) return;
        if(q.indexOf(k) !== -1){
          // Фраза целиком найдена в запросе — большой вес
          score += k.split(' ').length * 5;
        }
      });

      // 2. Совпадение по отдельным токенам с keywords и title
      var haystack = normalize((item.keywords || []).join(' ') + ' ' + item.title + ' ' + item.answer);
      tokens.forEach(function(t){
        if(haystack.indexOf(t) !== -1){
          score += 1;
          // Бонус, если токен есть в title
          if(normalize(item.title).indexOf(t) !== -1) score += 1;
          // Бонус, если токен есть в keywords
          if((item.keywords || []).some(function(kw){ return normalize(kw).indexOf(t) !== -1; })) score += 1;
        }
      });

      if(score > bestScore){
        bestScore = score;
        best = item;
      }
    });

    // Минимальный порог, чтобы не выдавать мусор
    if(bestScore < 2) return null;
    return { item: best, score: bestScore };
  }

  /* ============================================================
     СПЕЦИАЛЬНЫЕ ОТВЕТЫ (приветствие, помощь, спасибо)
     ============================================================ */
  function getSpecialAnswer(query){
    var q = normalize(query);

    if(/^(привет|здравствуй|хай|hello|hi|добрый день|добрый вечер|доброе утро|салют)/.test(q)){
      return {
        title: '👋 Приветствую!',
        section: 'ИИ-Помощник',
        answer: 'Я — ИИ-помощник по законодательной базе RMRP. Могу ответить на вопросы о:\n\n• УК РФ и КоАП (сроки, штрафы, статьи)\n• Процессуальном кодексе (задержание, адвокат, обыск)\n• ФЗ О ФСБ и Уставе УФСБ\n• Оружии, госсобственности, ограблениях, ВЗК\n• Уставах (дисциплинарный, гарнизонный, внутренний, строевой)\n\nСпроси меня, например:\n— «Какая статья за убийство и какой срок?»\n— «Сколько времени нужно для прибытия адвоката?»\n— «Что грозит за кражу?»\n— «Правила перекрытия»\n— «Сколько длится задержание?»',
        url: null
      };
    }

    if(/^(спасибо|благодарю|thanks|thank you)/.test(q)){
      return { title: '🙏 Пожалуйста!', section: 'ИИ-Помощник', answer: 'Рад был помочь! Если есть ещё вопросы — спрашивай.', url: null };
    }

    if(/^(помощь|help|что ты умеешь|что можешь|команды)/.test(q)){
      return {
        title: '🤖 Что я умею',
        section: 'ИИ-Помощник',
        answer: 'Я ищу ответы по всем статьям на сайте RMRP:\n\n• УК РФ (убийство, кража, разбой...)\n• КоАП (хулиганство, побои, ПДД...)\n• Процессуальный кодекс (задержание, адвокат, обыск)\n• ФЗ О ФСБ, Устав УФСБ\n• Об оружии, госсобственности\n• Ограбления и поставки, ВЗК\n• Дисциплинарный, гарнизонный, внутренний, строевой уставы\n\nПримеры вопросов:\n— «Какая статья за убийство?»\n— «Сколько ждать адвоката?»\n— «Что грозит за кражу?»\n— «Сколько длится задержание?»\n— «Правила перекрытия поставки»\n— «Какие права у задержанного?»',
        url: null
      };
    }

    return null;
  }

  /* ============================================================
     РЕНДЕР ОТВЕТА
     ============================================================ */
  function escapeHtml(s){
    return String(s||'').replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }

  function formatAnswer(html){
    // Переносы строк → <br>, "•" сохраняем
    return escapeHtml(html).replace(/\n/g,'<br>').replace(/•/g,'<span style="color:#a855f7">•</span>');
  }

  function renderAnswer(container, data){
    if(!data){
      container.innerHTML =
        '<div class="ai-answer-notfound">' +
          '<div style="font-size:32px;margin-bottom:8px">🤔</div>' +
          '<div style="font-weight:700;color:#fff;margin-bottom:6px">Не нашёл ответа</div>' +
          '<div style="font-size:13px;color:#a8adbd;line-height:1.5">' +
            'Попробуй переформулировать вопрос или спроси иначе.<br>' +
            'Например: «срок за кражу», «адвокат время», «правила перекрытия».' +
          '</div>' +
        '</div>';
      return;
    }

    var sectionBadge = data.section
      ? '<span class="ai-answer-badge">' + escapeHtml(data.section) + '</span>'
      : '';

    var linkHtml = data.url
      ? '<a class="ai-answer-link" href="' + escapeHtml(data.url) + '" target="_blank">🔗 Перейти к статье</a>'
      : '';

    container.innerHTML =
      '<div class="ai-answer">' +
        '<div class="ai-answer-head">' +
          '<div class="ai-answer-title">' + escapeHtml(data.title) + '</div>' +
          sectionBadge +
        '</div>' +
        '<div class="ai-answer-body">' + formatAnswer(data.answer) + '</div>' +
        linkHtml +
      '</div>';
  }

  /* ============================================================
     ОТПРАВКА СООБЩЕНИЯ
     ============================================================ */
  function sendMessage(inputEl, messagesEl){
    var text = (inputEl.value || '').trim();
    if(!text) return;

    // Эхо пользователя
    var userMsg = document.createElement('div');
    userMsg.className = 'ai-msg user';
    userMsg.textContent = text;
    messagesEl.appendChild(userMsg);
    inputEl.value = '';
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Индикатор "печатает"
    var typing = document.createElement('div');
    typing.className = 'ai-msg bot ai-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    setTimeout(function(){
      typing.remove();

      // Специальные ответы
      var special = getSpecialAnswer(text);
      var result = special || (function(){
        var found = findBestAnswer(text);
        return found ? found.item : null;
      })();

      var botMsg = document.createElement('div');
      botMsg.className = 'ai-msg bot';
      var wrapper = document.createElement('div');
      renderAnswer(wrapper, result);
      botMsg.innerHTML = wrapper.innerHTML;
      messagesEl.appendChild(botMsg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 350 + Math.random() * 300);
  }

  /* ============================================================
     ПОСТРОЕНИЕ UI
     ============================================================ */
  function buildUI(){
    if(document.getElementById('aiWidget')) return;

    var widget = document.createElement('div');
    widget.id = 'aiWidget';
    widget.className = 'ai-widget';
    widget.innerHTML =
      '<button class="ai-fab" id="aiFab" title="ИИ-Помощник">' +
        '<span class="ai-fab-icon">🤖</span>' +
        '<span class="ai-fab-text">ИИ</span>' +
      '</button>' +
      '<div class="ai-panel" id="aiPanel" hidden>' +
        '<div class="ai-panel-head">' +
          '<div class="ai-panel-title">' +
            '<span class="ai-dot"></span>' +
            '<span>ИИ-Помощник · RMRP</span>' +
          '</div>' +
          '<button class="ai-panel-close" id="aiPanelClose" title="Закрыть">✕</button>' +
        '</div>' +
        '<div class="ai-panel-body" id="aiPanelBody">' +
          '<div class="ai-msg bot">' +
            '<div class="ai-answer">' +
              '<div class="ai-answer-head"><div class="ai-answer-title">👋 Приветствую!</div></div>' +
              '<div class="ai-answer-body">' +
                'Я — ИИ-помощник по законодательной базе RMRP. Задай вопрос по любой статье на сайте.<br><br>' +
                'Примеры:<br>' +
                '• «Какая статья за убийство и срок?»<br>' +
                '• «Сколько времени нужно для прибытия адвоката?»<br>' +
                '• «Что грозит за кражу?»<br>' +
                '• «Сколько длится задержание?»<br>' +
                '• «Правила перекрытия»' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="ai-panel-foot">' +
          '<input type="text" class="ai-input" id="aiInput" placeholder="Спроси о статье или сроке…" autocomplete="off">' +
          '<button class="ai-send" id="aiSend" title="Отправить">➤</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(widget);

    var fab      = document.getElementById('aiFab');
    var panel    = document.getElementById('aiPanel');
    var closeBtn = document.getElementById('aiPanelClose');
    var body     = document.getElementById('aiPanelBody');
    var input    = document.getElementById('aiInput');
    var sendBtn  = document.getElementById('aiSend');

    function openPanel(){
      panel.hidden = false;
      setTimeout(function(){ input.focus(); }, 100);
    }
    function closePanel(){
      panel.hidden = true;
    }

    fab.addEventListener('click', function(){
      if(panel.hidden) openPanel();
      else closePanel();
    });
    closeBtn.addEventListener('click', closePanel);
    sendBtn.addEventListener('click', function(){ sendMessage(input, body); });
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); sendMessage(input, body); }
    });

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && !panel.hidden) closePanel();
    });
  }

  /* ============================================================
     СТИЛИ (вставляются в head)
     ============================================================ */
  function injectStyles(){
    if(document.getElementById('ai-widget-styles')) return;
    var style = document.createElement('style');
    style.id = 'ai-widget-styles';
    style.textContent = `
      .ai-widget{position:fixed;bottom:22px;right:100px;z-index:9998;font-family:'Inter',sans-serif}
      @media(max-width:700px){.ai-widget{bottom:80px;right:16px}}

      .ai-fab{
        display:flex;align-items:center;gap:8px;
        padding:14px 20px;border-radius:99px;
        background:linear-gradient(135deg,#a855f7,#4aa8ff);
        background-size:200% 200%;
        animation:aiGradient 6s ease infinite;
        color:#fff;font-weight:800;font-size:13.5px;
        border:0;cursor:pointer;
        box-shadow:0 10px 30px rgba(168,85,247,.4), 0 0 60px rgba(168,85,247,.2);
        transition:.25s;
      }
      .ai-fab:hover{transform:translateY(-3px) scale(1.03);box-shadow:0 14px 40px rgba(168,85,247,.6)}
      .ai-fab-icon{font-size:20px}
      @keyframes aiGradient{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}

      .ai-panel{
        position:absolute;bottom:70px;right:0;
        width:420px;max-width:calc(100vw - 32px);
        background:#13141a;
        border:1px solid rgba(168,85,247,.35);
        border-radius:18px;
        box-shadow:0 30px 80px rgba(0,0,0,.85), 0 0 60px rgba(168,85,247,.15);
        display:flex;flex-direction:column;
        overflow:hidden;
        animation:aiPop .25s ease;
      }
      @keyframes aiPop{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}

      .ai-panel-head{
        display:flex;align-items:center;justify-content:space-between;
        padding:14px 16px;border-bottom:1px solid #2a2d38;
        background:linear-gradient(135deg,rgba(168,85,247,.12),rgba(74,168,255,.08));
      }
      .ai-panel-title{
        display:flex;align-items:center;gap:10px;
        font-size:13.5px;font-weight:800;color:#fff;
      }
      .ai-dot{
        width:9px;height:9px;border-radius:50%;background:#3ddc84;
        box-shadow:0 0 10px #3ddc84;
        animation:aiPulse 1.6s ease-in-out infinite;
      }
      @keyframes aiPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:.7}}
      .ai-panel-close{
        width:30px;height:30px;border-radius:8px;
        background:rgba(255,255,255,.06);color:#a8adbd;
        border:0;cursor:pointer;font-size:14px;
        display:flex;align-items:center;justify-content:center;
        transition:.2s;
      }
      .ai-panel-close:hover{background:rgba(255,70,85,.25);color:#fff}

      .ai-panel-body{
        padding:14px;overflow-y:auto;
        max-height:440px;min-height:200px;
        display:flex;flex-direction:column;gap:10px;
        background:#0d0e12;
      }
      .ai-panel-body::-webkit-scrollbar{width:6px}
      .ai-panel-body::-webkit-scrollbar-thumb{background:rgba(168,85,247,.4);border-radius:3px}

      .ai-msg{
        max-width:90%;padding:10px 13px;border-radius:12px;
        font-size:13px;line-height:1.55;word-wrap:break-word;
      }
      .ai-msg.bot{
        background:rgba(168,85,247,.08);
        border:1px solid rgba(168,85,247,.25);
        color:#e6e8ee;align-self:flex-start;
        border-bottom-left-radius:4px;
      }
      .ai-msg.user{
        background:linear-gradient(135deg,#4aa8ff,#3ddc84);
        color:#fff;align-self:flex-end;
        border-bottom-right-radius:4px;font-weight:600;
      }

      .ai-typing{display:flex;gap:4px;padding:14px 16px}
      .ai-typing span{
        width:7px;height:7px;border-radius:50%;
        background:#a855f7;animation:aiTyping 1.2s ease-in-out infinite;
      }
      .ai-typing span:nth-child(2){animation-delay:.2s}
      .ai-typing span:nth-child(3){animation-delay:.4s}
      @keyframes aiTyping{0%,100%{opacity:.3;transform:translateY(0)}50%{opacity:1;transform:translateY(-4px)}}

      .ai-answer-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px}
      .ai-answer-title{font-size:14px;font-weight:800;color:#fff;line-height:1.35}
      .ai-answer-badge{
        font-size:10px;font-weight:800;
        padding:2px 8px;border-radius:6px;
        background:rgba(168,85,247,.18);
        color:#c084fc;
        border:1px solid rgba(168,85,247,.35);
        text-transform:uppercase;letter-spacing:.5px;
        white-space:nowrap;flex-shrink:0;
      }
      .ai-answer-body{font-size:13px;color:#e6e8ee;line-height:1.6}
      .ai-answer-link{
        display:inline-block;margin-top:10px;
        padding:6px 12px;border-radius:8px;
        background:rgba(74,168,255,.15);
        color:#4aa8ff;font-size:12px;font-weight:700;
        text-decoration:none;transition:.2s;
      }
      .ai-answer-link:hover{background:rgba(74,168,255,.3)}
      .ai-answer-notfound{padding:6px 2px}

      .ai-panel-foot{
        display:flex;gap:8px;padding:12px;
        border-top:1px solid #2a2d38;
        background:#13141a;
      }
      .ai-input{
        flex:1;padding:11px 14px;border-radius:10px;
        background:#0d0e12;border:1px solid #2a2d38;
        color:#fff;font-size:13.5px;outline:none;
        font-family:inherit;transition:.2s;
      }
      .ai-input:focus{border-color:#a855f7;box-shadow:0 0 0 3px rgba(168,85,247,.15)}
      .ai-send{
        width:44px;height:44px;border-radius:10px;
        background:linear-gradient(135deg,#a855f7,#4aa8ff);
        color:#fff;border:0;cursor:pointer;
        font-size:16px;font-weight:700;
        display:flex;align-items:center;justify-content:center;
        transition:.2s;flex-shrink:0;
      }
      .ai-send:hover{transform:scale(1.05);box-shadow:0 6px 20px rgba(168,85,247,.4)}

      @media(max-width:500px){
        .ai-panel{width:calc(100vw - 20px);right:-10px;bottom:66px}
        .ai-fab .ai-fab-text{display:none}
        .ai-fab{padding:14px}
      }
    `;
    document.head.appendChild(style);
  }

  /* ============================================================
     СТАРТ
     ============================================================ */
  function init(){
    waitForKnowledge(function(){
      injectStyles();
      buildUI();
      console.log('[AI] ИИ-помощник готов. База знаний:', (window.RMRP_AI_KNOWLEDGE||[]).length, 'записей');
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
