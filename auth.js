/* ============================================================
   RMRP — auth.js (авторизация + пользователи)
   ============================================================ */
(function(){
  'use strict';

  var LS_USERS   = 'rmrp_users';
  var LS_CURRENT = 'rmrp_current_user';

  /* -------- Звания -------- */
  var RANKS = [
    'Младший Сержант','Сержант','Старший Сержант','Старшина','Прапорщик',
    'Ст. Прапорщик','Младший лейтенант','Лейтенант','Ст. Лейтенант','Капитан',
    'Майор','Подполковник','Полковник','Генерал-Майор'
  ];

  /* -------- Должности ВК -------- */
  var POSITIONS = [
    'Стажер ВК','Сотрудник ВК','Инструктор ВК',
    'Заместитель военного комиссара','Военный Комиссар'
  ];

  /* -------- Утилиты -------- */
  function $(s,c){ return (c||document).querySelector(s); }
  function $$(s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); }

  function lsGet(key, def){
    try{ var v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
    catch(e){ return def; }
  }
  function lsSet(key, val){
    try{ localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch(e){ return false; }
  }

  /* Простой "хеш" — для реалма достаточно */
  function hashPass(s){
    var h = 0;
    for(var i=0;i<s.length;i++){
      h = ((h<<5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    return 'h' + Math.abs(h).toString(36) + '_' + s.length;
  }

  /* -------- API -------- */
  var Auth = {
    RANKS: RANKS,
    POSITIONS: POSITIONS,

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

      users[login] = {
        login: login,
        displayName: data.displayName || data.login,
        password: hashPass(data.password),
        rank: data.rank || RANKS[0],
        position: data.position || POSITIONS[0],
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
        } else if(k !== 'login' && k !== 'password'){
          users[login][k] = patch[k];
        }
      });
      Auth.saveUsers(users);
      Auth.setCurrent(users[login]);
      return { ok:true, user: users[login] };
    }
  };

  window.RMRPAuth = Auth;
})();
