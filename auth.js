/* ============================================================
   RMRP — auth.js (v2: роли, доступы, защита сайта)
   ============================================================ */
(function(){
  'use strict';

  var LS_USERS    = 'rmrp_users';
  var LS_CURRENT  = 'rmrp_current_user';
  var LS_GATE     = 'rmrp_gate_pass';

  /* ============================================================
     КОНСТАНТЫ
     ============================================================ */

  /* Звания по возрастанию */
  var RANKS = [
    'Младший Сержант','Сержант','Старший Сержант','Старшина','Прапорщик',
    'Ст. Прапорщик','Младший лейтенант','Лейтенант','Ст. Лейтенант','Капитан',
    'Майор','Подполковник','Полковник','Генерал-Майор'
  ];

  /* Должности ВК по возрастанию */
  var POSITIONS = [
    'Стажер ВК','Сотрудник ВК','Инструктор ВК',
    'Заместитель военного комиссара','Военный Комиссар'
  ];

  /* Роли доступа */
  var ROLES = ['Пользователь', 'Сотрудник', 'Администратор'];

  /* Матрица: кто какие звания может выдавать */
  function maxRankByRole(user){
    if(!user) return -1;

    /* Админ — всё */
    if(user.role === 'Администратор') return RANKS.length - 1;

    /* Генерал-Майор — всё */
    if(user.rank === 'Генерал-Майор') return RANKS.length - 1;

    /* Майор и выше — не выше своего */
    var myRankIdx = RANKS.indexOf(user.rank);
    if(myRankIdx >= RANKS.indexOf('Майор')) return myRankIdx;

    /* Мл.Сержант — Капитан: могут выдавать до Капитана */
    if(myRankIdx >= 0 && myRankIdx <= RANKS.indexOf('Капитан')){
      return RANKS.indexOf('Капитан');
    }

    /* Все остальные — только чтение */
    return -1;
  }

  function maxPositionByRole(user){
    if(!user) return -1;
    if(user.role === 'Администратор') return POSITIONS.length - 1;

    var myPosIdx = POSITIONS.indexOf(user.position);
    if(myPosIdx >= POSITIONS.indexOf('Инструктор ВК')) return myPosIdx;

    /* Мл.Сержант — Капитан: могут выдавать до Инструктора ВК */
    var rIdx = RANKS.indexOf(user.rank);
    if(rIdx >= 0 && rIdx <= RANKS.indexOf('Капитан')){
      return POSITIONS.indexOf('Инструктор ВК');
    }

    return -1;
  }

  /* Может ли текущий юзер редактировать цель */
  function canEdit(current, target){
    if(!current || !target) return false;
    if(current.role === 'Администратор') return true;
    if(current.login === target.login) return true; /* себя можно */

    var targetRankIdx = RANKS.indexOf(target.rank);
    var maxRank = maxRankByRole(current);
    if(targetRankIdx > maxRank) return false;

    var targetPosIdx = POSITIONS.indexOf(target.position);
    var maxPos = maxPositionByRole(current);
    if(targetPosIdx > maxPos) return false;

    return true;
  }

  /* ============================================================
     GATE — защита сайта
     ============================================================ */
  var GATE_CODE = 'RMRP2025'; /* <-- поменяй здесь */
  var GATE_DAYS = 30;

  /* ============================================================
     УТИЛИТЫ
     ============================================================ */
  function lsGet(key, def){
    try{ var v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
    catch(e){ return def; }
  }
  function lsSet(key, val){
    try{ localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch(e){ return false; }
  }

  function hashPass(s){
    var h = 0;
    for(var i=0;i<s.length;i++){
      h = ((h<<5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    return 'h' + Math.abs(h).toString(36) + '_' + s.length;
  }

  /* ============================================================
     API
     ============================================================ */
  var Auth = {
    RANKS: RANKS,
    POSITIONS: POSITIONS,
    ROLES: ROLES,

    /* ---------- Gate ---------- */
    checkGate: function(){
      try{
        var g = JSON.parse(localStorage.getItem(LS_GATE) || 'null');
        if(!g) return false;
        if(Date.now() - g.ts > GATE_DAYS * 24 * 60 * 60 * 1000){
          localStorage.removeItem(LS_GATE);
          return false;
        }
        return true;
      }catch(e){ return false; }
    },
    passGate: function(code){
      if((code || '').trim() !== GATE_CODE) return false;
      lsSet(LS_GATE, { ts: Date.now() });
      return true;
    },
    lockGate: function(){
      localStorage.removeItem(LS_GATE);
    },

    /* ---------- Пользователи ---------- */
    getUsers: function(){ return lsGet(LS_USERS, {}); },
    saveUsers: function(u){ return lsSet(LS_USERS, u); },

    getCurrent: function(){ return lsGet(LS_CURRENT, null); },
    setCurrent: function(u){ lsSet(LS_CURRENT, u); },

    register: function(data){
      var users = Auth.getUsers();
      var login = (data.login || '').trim().toLowerCase();
      if(!login) return { ok:false, error:'Введите логин' };
      if(login.length < 3) return { ok:false, error:'Логин слишком короткий' };
      if(users[login]) return { ok:false, error:'Такой логин уже занят' };
      if(!data.password || data.password.length < 4) return { ok:false, error:'Пароль минимум 4 символа' };

      /* Первый зарегистрированный = Администратор */
      var isFirst = Object.keys(users).length === 0;

      users[login] = {
        login: login,
        displayName: data.displayName || data.login,
        password: hashPass(data.password),
        rank: data.rank || RANKS[0],
        position: data.position || POSITIONS[0],
        role: isFirst ? 'Администратор' : 'Пользователь',
        discord: data.discord || '',
        forum: data.forum || '',
        avatar: data.avatar || '',
        banner: data.banner || '',
        bio: data.bio || '',
        createdAt: Date.now()
      };
      Auth.saveUsers(users);
      return { ok:true, user: users[login] };
    },

    login: function(login, password){
      var users = Auth.getUsers();
      login = (login || '').trim().toLowerCase();
      if(!users[login]) return { ok:false, error:'Пользователь не найден' };
      if(users[login].password !== hashPass(password)) return { ok:false, error:'Неверный пароль' };
      Auth.setCurrent(users[login]);
      return { ok:true, user: users[login] };
    },

    logout: function(){
      localStorage.removeItem(LS_CURRENT);
    },

    update: function(patch){
      var cur = Auth.getCurrent();
      if(!cur) return { ok:false, error:'Не авторизован' };
      var users = Auth.getUsers();
      var login = cur.login;
      if(!users[login]) return { ok:false, error:'Пользователь не найден' };

      Object.keys(patch).forEach(function(k){
        if(k === 'password' && patch[k]){
          users[login].password = hashPass(patch[k]);
        } else if(k !== 'login' && k !== 'password' && k !== 'role'){
          users[login][k] = patch[k];
        }
      });
      Auth.saveUsers(users);
      Auth.setCurrent(users[login]);
      return { ok:true, user: users[login] };
    },

    /* Обновить чужого пользователя (для админа/старших) */
    updateOther: function(login, patch){
      var cur = Auth.getCurrent();
      if(!cur) return { ok:false, error:'Не авторизован' };
      var users = Auth.getUsers();
      var target = users[login];
      if(!target) return { ok:false, error:'Пользователь не найден' };

      if(!canEdit(cur, target)) return { ok:false, error:'Недостаточно прав' };

      /* Только админ может менять роль */
      if(patch.role && cur.role !== 'Администратор'){
        delete patch.role;
      }

      /* Проверка: нельзя выдать звание выше своего (если не админ) */
      if(patch.rank && cur.role !== 'Администратор'){
        var tIdx = RANKS.indexOf(patch.rank);
        var maxIdx = maxRankByRole(cur);
        if(tIdx > maxIdx) return { ok:false, error:'Нельзя выдать звание выше своего' };
      }

      /* Проверка: нельзя выдать должность выше своей */
      if(patch.position && cur.role !== 'Администратор'){
        var pIdx = POSITIONS.indexOf(patch.position);
        var maxP = maxPositionByRole(cur);
        if(pIdx > maxP) return { ok:false, error:'Нельзя выдать должность выше своей' };
      }

      Object.keys(patch).forEach(function(k){
        if(k === 'password' && patch[k]){
          target.password = hashPass(patch[k]);
        } else if(k !== 'login'){
          target[k] = patch[k];
        }
      });

      Auth.saveUsers(users);
      return { ok:true, user: target };
    },

    deleteUser: function(login){
      var cur = Auth.getCurrent();
      if(!cur || cur.role !== 'Администратор') return { ok:false, error:'Только администратор' };
      var users = Auth.getUsers();
      if(!users[login]) return { ok:false, error:'Не найден' };
      if(login === cur.login) return { ok:false, error:'Нельзя удалить себя' };
      delete users[login];
      Auth.saveUsers(users);
      return { ok:true };
    },

    /* ---------- Права ---------- */
    canEdit: canEdit,
    maxRankByRole: maxRankByRole,
    maxPositionByRole: maxPositionByRole,

    /* ---------- Хелперы ---------- */
    rankBadge: function(rank){
      var map = {
        'Младший Сержант':'#9ca3af', 'Сержант':'#22c55e', 'Старший Сержант':'#16a34a',
        'Старшина':'#0891b2', 'Прапорщик':'#0284c7', 'Ст. Прапорщик':'#0369a1',
        'Младший лейтенант':'#7c3aed', 'Лейтенант':'#6d28d9', 'Ст. Лейтенант':'#5b21b6',
        'Капитан':'#4c1d95', 'Майор':'#dc2626', 'Подполковник':'#b91c1c',
        'Полковник':'#991b1b', 'Генерал-Майор':'#ff4655'
      };
      return map[rank] || '#6e7385';
    },

    positionBadge: function(pos){
      var map = {
        'Стажер ВК':'#6e7385', 'Сотрудник ВК':'#4aa8ff', 'Инструктор ВК':'#3ddc84',
        'Заместитель военного комиссара':'#a855f7', 'Военный Комиссар':'#ff4655'
      };
      return map[pos] || '#6e7385';
    },

    roleBadge: function(role){
      var map = {
        'Пользователь':'#6e7385', 'Сотрудник':'#4aa8ff', 'Администратор':'#ff4655'
      };
      return map[role] || '#6e7385';
    }
  };

  window.RMRPAuth = Auth;

  /* ============================================================
     АВТО-ЗАЩИТА: блокируем страницу, если не введён код
     ============================================================ */
  (function(){
    if(Auth.checkGate()) return;

    /* Страница gate.html сама себя не блокирует */
    if(/gate\.html?$/i.test(location.pathname)) return;

    /* Скрываем всё */
    document.documentElement.style.visibility = 'hidden';

    /* Редирект на gate */
    var redirect = encodeURIComponent(location.pathname + location.search);
    setTimeout(function(){
      location.replace('gate.html?next=' + redirect);
    }, 50);
  })();

})();
