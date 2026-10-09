/* ============================================================
   RMRP — auth.js (v9: SVG-погоны + градиенты + DEV_LOGIN kiryushaz)
   ============================================================ */
(function(){
  'use strict';

  var FIREBASE_URL = 'https://rmrp-4b406-default-rtdb.firebaseio.com';
  var LS_CURRENT   = 'rmrp_current_user';
  var LS_GATE      = 'rmrp_gate_pass';
  var LS_USERS_CACHE = 'rmrp_users_cache';

  var DEV_LOGIN = 'kiryushaz';

  var RANKS = [
    'Младший Сержант','Сержант','Старший Сержант','Старшина','Прапорщик',
    'Ст. Прапорщик','Младший лейтенант','Лейтенант','Ст. Лейтенант','Капитан',
    'Майор','Подполковник','Полковник','Генерал-Майор'
  ];

  var POSITIONS = [
    'Стажер ВК','Сотрудник ВК','Инструктор ВК',
    'Заместитель военного комиссара','Военный Комиссар'
  ];

  var ROLES = ['Пользователь', 'Сотрудник', 'Администратор', 'Разработчик'];

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

  function isDev(user){ return user && user.role === 'Разработчик'; }
  function isAdmin(user){ return user && (user.role === 'Администратор' || user.role === 'Разработчик'); }

  function canGiveAccess(user){
    if(!user) return false;
    if(isAdmin(user)) return true;
    var posIdx = POS_IDX[user.position];
    if(posIdx === undefined) return false;
    return posIdx >= POS_IDX['Инструктор ВК'];
  }

  function canUseAudit(user){
    if(!user) return false;
    if(isAdmin(user)) return true;
    var rankIdx = RANK_IDX[user.rank];
    if(rankIdx !== undefined && rankIdx >= RANK_IDX['Майор']) return true;
    var posIdx = POS_IDX[user.position];
    if(posIdx !== undefined && posIdx >= POS_IDX['Инструктор ВК']) return true;
    return false;
  }

  function maxRankByRole(user){
    if(!user) return -1;
    if(isAdmin(user)) return RANKS.length - 1;
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
    if(isAdmin(user)) return POSITIONS.length - 1;
    var myPosIdx = POS_IDX[user.position];
    if(myPosIdx === undefined) return -1;
    if(myPosIdx >= POS_IDX['Заместитель военного комиссара']) return myPosIdx;
    if(myPosIdx >= POS_IDX['Инструктор ВК']) return POS_IDX['Инструктор ВК'];
    return -1;
  }

  function canEdit(current, target){
    if(!current || !target) return false;
    if(isAdmin(current)) return true;
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
    if(!isAdmin(current)) return false;
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

  /* ============================================================
     SVG-ПОГОНЫ
     ============================================================ */
  function buildEpaulette(rank){
    var gold = '#fbbf24';
    var line = '#3a3d47';
    var bg = '#23262f';

    var base = '<rect x="2" y="2" width="16" height="40" rx="2" fill="' + bg + '" stroke="' + line + '" stroke-width="1"/>';
    var strip = '<line x1="10" y1="4" x2="10" y2="40" stroke="' + line + '" stroke-width="0.5" stroke-dasharray="2,2"/>';

    function lychka(y){
      return '<rect x="5" y="' + y + '" width="10" height="2.5" fill="' + gold + '" rx="0.5"/>';
    }
    function starSmall(cx, cy){
      return '<circle cx="' + cx + '" cy="' + cy + '" r="2.2" fill="' + gold + '"/>';
    }
    function starBig(cx, cy){
      return '<circle cx="' + cx + '" cy="' + cy + '" r="3.2" fill="' + gold + '"/>';
    }

    var content = '';

    switch(rank){
      case 'Младший Сержант':
        content = lychka(12) + lychka(20);
        break;
      case 'Сержант':
        content = lychka(10) + lychka(17) + lychka(24);
        break;
      case 'Старший Сержант':
        content = lychka(8) + lychka(15) + lychka(22) + lychka(29);
        break;
      case 'Старшина':
        content = '<rect x="9.5" y="4" width="1" height="36" fill="' + gold + '"/>' +
                  lychka(10) + lychka(18) + lychka(26);
        break;
      case 'Прапорщик':
        content = starSmall(10, 12) + starSmall(10, 22) + starSmall(10, 32);
        break;
      case 'Ст. Прапорщик':
        content = starSmall(6, 12) + starSmall(14, 12) +
                  starSmall(6, 22) + starSmall(14, 22) +
                  starSmall(6, 32) + starSmall(14, 32);
        break;
      case 'Младший лейтенант':
        content = starSmall(6, 10) + starSmall(14, 10) + starSmall(10, 22);
        break;
      case 'Лейтенант':
        content = starSmall(6, 10) + starSmall(14, 10) +
                  starSmall(6, 22) + starSmall(14, 22);
        break;
      case 'Ст. Лейтенант':
        content = starSmall(6, 8) + starSmall(14, 8) +
                  starSmall(6, 18) + starSmall(14, 18) +
                  starSmall(10, 30);
        break;
      case 'Капитан':
        content = starSmall(6, 6) + starSmall(14, 6) +
                  starSmall(6, 18) + starSmall(14, 18) +
                  starSmall(6, 30) + starSmall(14, 30);
        break;
      case 'Майор':
        content = starBig(10, 14) +
                  '<line x1="4" y1="36" x2="16" y2="36" stroke="' + gold + '" stroke-width="0.8"/>';
        break;
      case 'Подполковник':
        content = starBig(10, 12) + starBig(10, 26) +
                  '<line x1="4" y1="36" x2="16" y2="36" stroke="' + gold + '" stroke-width="0.8"/>';
        break;
      case 'Полковник':
        content = starBig(6, 12) + starBig(14, 12) + starBig(10, 28) +
                  '<line x1="4" y1="36" x2="16" y2="36" stroke="' + gold + '" stroke-width="0.8"/>';
        break;
      case 'Генерал-Майор':
        content = '<circle cx="10" cy="20" r="6" fill="none" stroke="' + gold + '" stroke-width="0.6" opacity="0.6"/>' +
                  starBig(10, 20) +
                  '<line x1="4" y1="36" x2="16" y2="36" stroke="' + gold + '" stroke-width="1"/>';
        break;
      default:
        content = lychka(18);
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 44" width="22" height="44" style="display:block">' +
      base + strip + content +
    '</svg>';
  }

  var Auth = {
    RANKS: RANKS,
    POSITIONS: POSITIONS,
    ROLES: ROLES,
    RANK_IDX: RANK_IDX,
    POS_IDX: POS_IDX,
    DEV_LOGIN: DEV_LOGIN,

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
        if(users[DEV_LOGIN]){
          var patch = {};
          if(users[DEV_LOGIN].role !== 'Разработчик'){
            users[DEV_LOGIN].role = 'Разработчик';
            patch.role = 'Разработчик';
          }
          if(Object.keys(patch).length) fbPatch('users/' + DEV_LOGIN, patch);
        }
        lsSet(LS_USERS_CACHE, users);
        return users;
      }).catch(function(err){
        console.warn('[RMRP] Firebase недоступен, кэш:', err.message);
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
        var isDev = (login === DEV_LOGIN);

        var user = {
          login: login,
          displayName: data.displayName || data.login,
          password: hashPass(data.password),
          rank: data.rank || RANKS[0],
          position: data.position || POSITIONS[0],
          role: isDev ? 'Разработчик' : (isFirst ? 'Администратор' : 'Пользователь'),
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
        if(login === DEV_LOGIN && user.role !== 'Разработчик'){
          user.role = 'Разработчик';
          fbPatch('users/' + login, { role: 'Разработчик' });
        }
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

        if(patch.role !== undefined){
          if(!canChangeRole(cur, target)){
            throw new Error('Только Администратор или Разработчик может менять роли');
          }
          if(patch.role === 'Разработчик' && !isDev(cur)){
            throw new Error('Только Разработчик может выдавать роль Разработчик');
          }
        }

        if(patch.rank && !isAdmin(cur)){
          var tIdx = RANK_IDX[patch.rank];
          var maxIdx = maxRankByRole(cur);
          if(tIdx > maxIdx) throw new Error('Нельзя выдать звание выше своего');
        }

        if(patch.position && !isAdmin(cur)){
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
      if(!isAdmin(cur)){
        return Promise.resolve({ ok:false, error:'Только Администратор или Разработчик' });
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
    canUseAudit: canUseAudit,
    isAdmin: isAdmin,
    isDev: isDev,
    maxRankByRole: maxRankByRole,
    maxPositionByRole: maxPositionByRole,

    /* Погон SVG */
    rankEpaulette: function(rank){ return buildEpaulette(rank); },

    rankColor: function(rank){
      var map = {
        'Младший Сержант':   '#374151,#4b5563,#6b7280',
        'Сержант':           '#14532d,#15803d,#22c55e',
        'Старший Сержант':   '#166534,#16a34a,#4ade80',
        'Старшина':          '#155e75,#0891b2,#22d3ee',
        'Прапорщик':         '#0c4a6e,#0369a1,#38bdf8',
        'Ст. Прапорщик':     '#075985,#0e7490,#0284c7',
        'Младший лейтенант': '#3730a3,#4f46e5,#818cf8',
        'Лейтенант':         '#4338ca,#6366f1,#a5b4fc',
        'Ст. Лейтенант':     '#5b21b6,#7c3aed,#a855f7',
        'Капитан':           '#3b0764,#5b21b6,#7c3aed',
        'Майор':             '#78350f,#d97706,#fbbf24,#fcd34d',
        'Подполковник':      '#7c2d12,#c2410c,#ea580c,#fb923c',
        'Полковник':         '#713f12,#a16207,#eab308,#facc15',
        'Генерал-Майор':     '#1e293b,#475569,#cbd5e1,#f1f5f9'
      };
      return map[rank] || '#4b5563,#6b7280,#9ca3af';
    },

    positionColor: function(pos){
      var map = {
        'Стажер ВК':                       '#374151,#4b5563,#6b7280',
        'Сотрудник ВК':                    '#1e3a8a,#1d4ed8,#3b82f6,#60a5fa',
        'Инструктор ВК':                   '#064e3b,#047857,#10b981,#34d399',
        'Заместитель военного комиссара':  '#4c1d95,#6d28d9,#a855f7,#c084fc',
        'Военный Комиссар':                '#7f1d1d,#991b1b,#ff4655,#ff6b78'
      };
      return map[pos] || '#4b5563,#6b7280,#9ca3af';
    },

    roleColor: function(role){
      var map = {
        'Пользователь': '#374151,#4b5563,#6b7280',
        'Сотрудник':    '#1e3a8a,#1d4ed8,#3b82f6',
        'Администратор':'#450a0a,#7f1d1d,#dc2626,#ff4655',
        'Разработчик':  '#4c1d95,#7c3aed,#a855f7,#ec4899,#f472b6'
      };
      return map[role] || '#4b5563,#6b7280,#9ca3af';
    },

    hasGlow: function(rank, role){
      var glowRanks = ['Майор','Подполковник','Полковник','Генерал-Майор'];
      return glowRanks.indexOf(rank) !== -1 || role === 'Разработчик' || role === 'Администратор';
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
