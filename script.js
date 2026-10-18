(function () {
  'use strict';

  window.runScan = function() {
    var status = document.getElementById('scanStatus');
    var fill = document.getElementById('scanFill');
    var log = document.getElementById('scanLog');
    if(!status) return;
    status.textContent = 'СТАТУС: СКАНИРОВАНИЕ...';
    status.style.color = '#f1c40f';
    fill.style.width = '0%';
    log.innerHTML = '';
    var progress = 0;
    var interval = setInterval(function() {
      progress += 10;
      fill.style.width = progress + '%';
      if (progress === 30) log.innerHTML += '<div>[>] Запрос к УК РФ... OK</div>';
      if (progress === 60) log.innerHTML += '<div>[>] Проверка прав... ОФИЦЕР</div>';
      if (progress === 90) log.innerHTML += '<div>[>] Связь с ЦУ... OK</div>';
      if (progress >= 100) {
        clearInterval(interval);
        status.textContent = 'СТАТУС: ЗАЩИЩЕНО';
        status.style.color = 'var(--accent)';
        log.innerHTML += '<div style="color:var(--accent)">[✓] СКАНИРОВАНИЕ ЗАВЕРШЕНО.</div>';
      }
    }, 100);
  };

  document.addEventListener('DOMContentLoaded', function() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    var aiBtn = document.createElement('a');
    aiBtn.href = '#';
    aiBtn.className = 'nav-link ai-nav-btn';
    aiBtn.innerHTML = '🤖 ИИ-ЮРИСТ';
    
    var dropdown = document.createElement('div');
    dropdown.className = 'ai-dropdown';
    dropdown.id = 'aiDropdown';
    dropdown.innerHTML = '<div class="ai-chat-head"><span style="color:var(--accent)">●</span> Юрист ФСБ (ИИ)</div><div class="ai-chat-body" id="aiChatBody"><div class="ai-msg bot">Приветствую. Спроси меня о статье (напр: "срок за кражу").</div></div><div class="ai-chat-input-wrap"><input type="text" class="ai-chat-input" id="aiChatInput" placeholder="Введите вопрос..." onkeypress="if(event.key===\'Enter\')window.sendAI()"><button class="ai-chat-send" onclick="window.sendAI()">➤</button></div>';

    nav.appendChild(aiBtn);
    document.body.appendChild(dropdown);

    aiBtn.addEventListener('click', function(e) {
      e.preventDefault();
      dropdown.classList.toggle('active');
      if (dropdown.classList.contains('active')) { document.getElementById('aiChatInput').focus(); }
    });

    document.addEventListener('click', function(e) {
      if (!dropdown.contains(e.target) && !aiBtn.contains(e.target)) { dropdown.classList.remove('active'); }
    });

    window.sendAI = function() {
      const input = document.getElementById('aiChatInput');
      const body = document.getElementById('aiChatBody');
      const query = input.value.toLowerCase().trim();
      if (!query) return;
      const userMsg = document.createElement('div');
      userMsg.className = 'ai-msg user';
      userMsg.textContent = input.value;
      body.appendChild(userMsg);
      input.value = '';
      body.scrollTop = body.scrollHeight;

      setTimeout(() => {
        let bestMatch = null; let maxScore = 0;
        const AI_KNOWLEDGE = [
          { keywords: ['убийство', 'убил'], title: 'Статья 37 УК РФ', answer: 'Убийство. Наказание: лишение свободы на срок 7 лет.', url: 'uk.html#art-37' },
          { keywords: ['кража', 'украл'], title: 'Статья 44 УК РФ', answer: 'Кража. Наказание: штраф 30.000 рублей или лишение свободы на срок 3 лет.', url: 'uk.html#art-44' },
          { keywords: ['задержание', 'сколько длится'], title: 'Статья 6 ПК РФ', answer: 'Задержание. Срок: не более 60 минут.', url: 'process.html' },
          { keywords: ['адвокат'], title: 'Статья 9 ПК РФ', answer: 'Права задержанного. Время ожидания адвоката: 5 минут.', url: 'process.html' }
        ];
        AI_KNOWLEDGE.forEach(item => {
          let score = 0;
          item.keywords.forEach(kw => { if (query.includes(kw)) score += 1; });
          if (score > maxScore) { maxScore = score; bestMatch = item; }
        });
        const botMsg = document.createElement('div');
        botMsg.className = 'ai-msg bot';
        if (bestMatch) {
          botMsg.innerHTML = '<strong>' + bestMatch.title + '</strong><br>' + bestMatch.answer + '<br><br><a href="' + bestMatch.url + '" style="color:var(--accent);">🔗 Перейти</a>';
        } else {
          botMsg.innerHTML = 'Не нашел статью. Спросите иначе.';
        }
        body.appendChild(botMsg);
        body.scrollTop = body.scrollHeight;
      }, 500);
    };
  });
})();
