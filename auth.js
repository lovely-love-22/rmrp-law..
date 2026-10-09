/* ============================================================
   RMRP — auth.js (v5: Firebase Realtime Database)
   ============================================================ */
(function(){
  'use strict';

  var FIREBASE_URL = 'https://rmrp-4b406-default-rtdb.firebaseio.com';
  var LS_CURRENT   = 'rmrp_current_user';
  var LS_GATE      = 'rmrp_gate_pass';
  var LS_USERS_CACHE = 'rmrp_users_cache';

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

  function canGiveAccess(user){
    if(!user) return false;
    if(user.role === 'Администратор') return true;
    var posIdx = POS_IDX[user.position];
    if(posIdx === undefined) return false;
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

  function canChangeRole(current, target){
    if(!current) return false;
    if(current.role !== 'Администратор') return false;
    if(target && current.login === target.login) return false;
    return true;
  }

  var GATE_CODE = 'RMRP2025';
  var GATE_DAYS = 30;

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

  function fbUrl(path){ return FIREBASE_URL + '/' + path + '.json'; }

  function fbGet(path){
    return fetch(fbUrl(path)).then(function(r){
      if(!r.ok) throw new Error('Firebase read error: ' + r.status);
      return r.json();
    });
  }
  function fbPut(path, data){
    return fetch(fbUrl(path), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function(r){
      if(!r.ok) throw new Error('Firebase write error: ' + r.status);
      return r.json();
    });
  }
  function fbPatch(path, data){
    return fetch(fbUrl(path), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function(r){
      if(!r.ok) throw new Error('Firebase patch error: ' + r.status);
      return r.json();
    });
  }
  function fbDelete(path){
    return fetch(fbUrl(path), { method: 'DELETE' }).then(function(r){
      if(!r.ok) throw new Error('Firebase delete error: ' + r.status);
      return r.json();
    });
  }

  var Auth = {
    RANKS: RANKS, POSITIONS: POSITIONS, ROLES: ROLES,
    RANK_IDX: RANK_IDX, POS_IDX: POS_IDX,

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

    getCurrent: function(){ return lsGet(LS_CURRENT, null); },
    setCurrent: function(u){ lsSet(LS_CURRENT, u); },
    logout: function(){ localStorage.removeItem(LS_CURRENT); },

    getUsers: function(){
      return fbGet('users').then(function(data){
        var users = data || {};
        lsSet(LS_USERS_CACHE, users);
        return users;
      }).catch(function(err){
        console.warn('[RMRP] Firebase недоступен, используется кэш:', err.message);
        return lsGet(LS_USERS_CACHE, {});
      });
    },

    getUsersSync: function(){ return lsGet(LS_USERS_CACHE, {}); },

    register: function(data){
      var login = (data.login || '').trim().toLowerCase();
      if(!login) return Promise.resolve({ ok:false, error:'Введите логин' });
      if(login.length < 3) return Promise.resolve({ ok:false, error:'Логин слишком короткий' });
      if(!data.password || data.password.length < 4) return Promise.resolve({ ok:false, error:'Пароль минимум 4 символа' });

      return Auth.getUsers().then(function(users){
        if(users[login]) throw new Error('Такой логин уже занят');
        var isFirst = Object.keys(users).length === 0;

        var user = {
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

        return fbPut('users/' + login, user).then(function(){
          return { ok:true, user: user };
        });
      }).catch(function(err){
        return { ok:false, error: err.message };
      });
    },

    login: function(login, password){
      login = (login || '').trim().toLowerCase();
      if(!login) return Promise.resolve({ ok:false, error:'Введите логин' });

      return fbGet('users/' + login).then(function(user){
        if(!user) throw new Error('Пользователь не найден');
        if(user.password !== hashPass(password)) throw new Error('Неверный пароль');
        Auth.setCurrent(user);
        return { ok:true, user: user };
      }).catch(function(err){
        return { ok:false, error: err.message };
      });
    },

    update: function(patch){
      var cur = Auth.getCurrent();
      if(!cur) return Promise.resolve({ ok:false, error:'Не авторизован' });

      var cleanPatch = {};
      Object.keys(patch).forEach(function(k){
        if(k === 'password' && patch[k]) cleanPatch.password = hashPass(patch[k]);
        else if(k !== 'login' && k !== 'password' && k !== 'role') cleanPatch[k] = patch[k];
      });

      return fbPatch('users/' + cur.login, cleanPatch).then(function(){
        Object.keys(cleanPatch).forEach(function(k){ cur[k] = cleanPatch[k]; });
        Auth.setCurrent(cur);
        return { ok:true, user: cur };
      }).catch(function(err){
        return { ok:false, error: err.message };
      });
    },

    updateOther: function(login, patch){
      var cur = Auth.getCurrent();
      if(!cur) return Promise.resolve({ ok:false, error:'Не авторизован' });

      return fbGet('users/' + login).then(function(target){
        if(!target) throw new Error('Пользователь не найден');
        if(!canEdit(cur, target)) throw new Error('Недостаточно прав: цель выше вас по званию или должности');
        if(patch.role !== undefined && !canChangeRole(cur, target)){
          throw new Error('Только Администратор может менять роли доступа');
        }
        if(patch.rank && cur.role !== 'Администратор'){
          var tIdx = RANK_IDX[patch.rank];
          var maxIdx = maxRankByRole(cur);
          if(tIdx > maxIdx) throw new Error('Нельзя выдать звание выше своего');
        }
        if(patch.position && cur.role !== 'Администратор'){
          var pIdx = POS_IDX[patch.position];
          var maxP = maxPositionByRole(cur);
          if(pIdx > maxP) throw new Error('Нельзя выдать должность выше своей');
        }

        var cleanPatch = {};
        Object.keys(patch).forEach(function(k){
          if(k === 'password' && patch[k]) cleanPatch.password = hashPass(patch[k]);
          else if(k !== 'login') cleanPatch[k] = patch[k];
        });

        return fbPatch('users/' + login, cleanPatch).then(function(){
          return { ok:true, user: Object.assign({}, target, cleanPatch) };
        });
      }).catch(function(err){
        return { ok:false, error: err.message };
      });
    },

    deleteUser: function(login){
      var cur = Auth.getCurrent();
      if(!cur || cur.role !== 'Администратор'){
        return Promise.resolve({ ok:false, error:'Только администратор' });
      }
      if(login === cur.login){
        return Promise.resolve({ ok:false, error:'Нельзя удалить себя' });
      }
      return fbDelete('users/' + login).then(function(){
        return { ok:true };
      }).catch(function(err){
        return { ok:false, error: err.message };
      });
    },

    canEdit: canEdit,
    canGiveAccess: canGiveAccess,
    canChangeRole: canChangeRole,
    maxRankByRole: maxRankByRole,
    maxPositionByRole: maxPositionByRole,

    rankColor: function(rank){
      var map = {
        'Младший Сержант':'#6b7280,#9ca3af','Сержант':'#16a34a,#22c55e',
        'Старший Сержант':'#15803d,#16a34a','Старшина':'#0e7490,#0891b2',
        'Прапорщик':'#0369a1,#0284c7','Ст. Прапорщик':'#075985,#0c4a6e',
        'Младший лейтенант':'#7c3aed,#a855f7','Лейтенант':'#6d28d9,#8b5cf6',
        'Ст. Лейтенант':'#5b21b6,#7c3aed','Капитан':'#4c1d95,#6d28d9',
        'Майор':'#dc2626,#ef4444','Подполковник':'#b91c1c,#dc2626',
        'Полковник':'#991b1b,#b91c1c','Генерал-Майор':'#ff4655,#ff6b78'
      };
      return map[rank] || '#6b7280,#9ca3af';
    },
    positionColor: function(pos){
      var map = {
        'Стажер ВК':'#4b5563,#6b7280','Сотрудник ВК':'#1d4ed8,#3b82f6',
        'Инструктор ВК':'#047857,#10b981','Заместитель военного комиссара':'#6d28d9,#a855f7',
        'Военный Комиссар':'#991b1b,#ff4655'
      };
      return map[pos] || '#4b5563,#6b7280';
    },
    roleColor: function(role){
      var map = {
        'Пользователь':'#4b5563,#6b7280','Сотрудник':'#1d4ed8,#3b82f6',
        'Администратор':'#991b1b,#ff4655'
      };
      return map[role] || '#4b5563,#6b7280';
    }
  };

  window.RMRPAuth = Auth;

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
