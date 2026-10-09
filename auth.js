/* ============================================================
   RMRP — auth.js (v3: роли, доступы, защита, баннеры)
   ============================================================ */
(function(){
  'use strict';

  var LS_USERS    = 'rmrp_users';
  var LS_CURRENT  = 'rmrp_current_user';
  var LS_GATE     = 'rmrp_gate_pass';

  /* ============================================================
     КОНСТАНТЫ
     ============================================================ */

  var RANKS = [
    'Младший Сержант','Сержант','Старший Сержант','Старшина','Прапорщик',
    'Ст. Прапорщик','Младший лейтенант','Лейтенант','Ст. Лейтенант','Капитан',
    'Майор','Подполковник','Полковник','Генерал-Майор'
  ];

  var POSITIONS = [
    'Стажер ВК','Сотрудник ВК','Инструктор ВК',
    'Заместитель военного комиссара','Военный Комиссар'
  ];

  var ROLES = ['Пользователь', 'Сотрудник', 'Администратор'];

  var RANK_IDX = {
    'Младший Сержант': 0, 'Сержант': 1, 'Старший Сержант': 2, 'Старшина': 3,
    'Прапорщик': 4, 'Ст. Прапорщик': 5, 'Младший лейтенант': 6, 'Лейтенант': 7,
    'Ст. Лейтенант': 8, 'Капитан': 9, 'Майор': 10, 'Подполковник': 11,
    'Полковник': 12, 'Генерал-Майор': 13
  };
  var POS_IDX = {
    'Стажер ВК': 0, 'Сотрудник ВК': 1, 'Инструктор ВК': 2,
    'Заместитель военного комиссара': 3, 'Военный Комиссар': 4
  };

  /* Кто МОЖЕТ выдавать доступы */
  function canGiveAccess(user){
    if(!user) return false;
    if(user.role === 'Администратор') return true;
    var posIdx = POS_IDX[user.position];
    if(posIdx === undefined) return false;
    /* Только Инструктор ВК и выше */
    return posIdx >= POS_IDX['Инструктор ВК'];
  }

  function maxRankByRole(user){
    if(!user) return -1;
    if(user.role === 'Администратор') return RANKS.length - 1;
    var myRankIdx = RANK_IDX[user.rank];
    if(myRankIdx === undefined) return -1;
    if(myRankIdx >= RANK_IDX['Генерал-Майор']) return RANKS.length - 1;
    if(myRankIdx >= RANK_IDX['Майор']) return myRankIdx;
    if(myRankIdx >= RANK_IDX['Младший Сержант'] && myRankIdx <= RANK_IDX['Капитан']){
      return RANK_IDX['Капитан'];
    }
    return -1;
  }

  function maxPositionByRole(user){
    if(!user) return -1;
    if(user.role === 'Администратор') return POSITIONS.length - 1;
    var myPosIdx = POS_IDX[user.position];
    if(myPosIdx === undefined) return -1;
    if(myPosIdx >= POS_IDX['Заместитель военного комиссара']) return myPosIdx;
    if(myPosIdx >= POS_IDX['Инструктор ВК']) return POS_IDX['Инструктор ВК'];
    return -1;
  }

  function canEdit(current, target){
    if(!current || !target) return false;
    if(current.role === 'Администратор') return true;
    if(current.login === target.login) return true;
    var tRankIdx = RANK_IDX[target.rank];
    var maxRank = maxRankByRole(current);
    if(tRankIdx > maxRank) return false;
    var tPosIdx = POS_IDX[target.position];
    var maxPos = maxPositionByRole(current);
    if(tPosIdx > maxPos) return false;
    return true;
  }

  /* ============================================================
     GATE
     ============================================================ */
  var GATE_CODE = 'RMRP2025';
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
    RANK_IDX: RANK_IDX,
    POS_IDX: POS_IDX,

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
    lockGate: function(){ localStorage.removeItem(LS_GATE); },

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

    logout: function(){ localStorage.removeItem(LS_CURRENT); },

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

    updateOther: function(login, patch){
      var cur = Auth.getCurrent();
      if(!cur) return { ok:false, error:'Не авторизован' };
      var users = Auth.getUsers();
      var target = users[login];
      if(!target) return { ok:false, error:'Пользователь не найден' };
      if(!canEdit(cur, target)) return { ok:false, error:'Недостаточно прав: цель выше вас по званию или должности' };

      if(patch.role && cur.role !== 'Администратор') delete patch.role;

      if(patch.rank && cur.role !== 'Администратор'){
        var tIdx = RANK_IDX[patch.rank];
        var maxIdx = maxRankByRole(cur);
        if(tIdx > maxIdx) return { ok:false, error:'Нельзя выдать звание выше своего' };
      }

      if(patch.position && cur.role !== 'Администратор'){
        var pIdx = POS_IDX[patch.position];
        var maxP = maxPositionByRole(cur);
        if(pIdx > maxP) return { ok:false, error:'Нельзя выдать должность выше своей' };
      }

      Object.keys(patch).forEach(function(k){
        if(k === 'password' && patch[k]) target.password = hashPass(patch[k]);
        else if(k !== 'login') target[k] = patch[k];
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

    canEdit: canEdit,
    canGiveAccess: canGiveAccess,
    maxRankByRole: maxRankByRole,
    maxPositionByRole: maxPositionByRole,

    rankColor: function(rank){
      var map = {
        'Младший Сержант':'#6b7280,#9ca3af',
        'Сержант':'#16a34a,#22c55e',
        'Старший Сержант':'#15803d,#16a34a',
        'Старшина':'#0e7490,#0891b2',
        'Прапорщик':'#0369a1,#0284c7',
        'Ст. Прапорщик':'#075985,#0c4a6e',
        'Младший лейтенант':'#7c3aed,#a855f7',
        'Лейтенант':'#6d28d9,#8b5cf6',
        'Ст. Лейтенант':'#5b21b6,#7c3aed',
        'Капитан':'#4c1d95,#6d28d9',
        'Майор':'#dc2626,#ef4444',
        'Подполковник':'#b91c1c,#dc2626',
        'Полковник':'#991b1b,#b91c1c',
        'Генерал-Майор':'#ff4655,#ff6b78'
      };
      return map[rank] || '#6b7280,#9ca3af';
    },
    positionColor: function(pos){
      var map = {
        'Стажер ВК':'#4b5563,#6b7280',
        'Сотрудник ВК':'#1d4ed8,#3b82f6',
        'Инструктор ВК':'#047857,#10b981',
        'Заместитель военного комиссара':'#6d28d9,#a855f7',
        'Военный Комиссар':'#991b1b,#ff4655'
      };
      return map[pos] || '#4b5563,#6b7280';
    },
    roleColor: function(role){
      var map = {
        'Пользователь':'#4b5563,#6b7280',
        'Сотрудник':'#1d4ed8,#3b82f6',
        'Администратор':'#991b1b,#ff4655'
      };
      return map[role] || '#4b5563,#6b7280';
    }
  };

  window.RMRPAuth = Auth;

  /* ============================================================
     АВТО-ЗАЩИТА
     ============================================================ */
  (function(){
    if(Auth.checkGate()) return;
    if(/gate\.html?$/i.test(location.pathname)) return;
    document.documentElement.style.visibility = 'hidden';
    var redirect = encodeURIComponent(location.pathname + location.search);
    setTimeout(function(){
      location.replace('gate.html?next=' + redirect);
    }, 50);
  })();

})();
