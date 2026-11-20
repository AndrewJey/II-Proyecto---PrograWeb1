(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.UTNStore = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var KEYS = {
    users: 'usuarios',
    careers: 'carreras',
    students: 'estudiante',
    searches: 'utn_busquedas',
    session: 'utn_session'
  };

  var DEFAULT_SEARCHES = [
    { date: '2014/06/30', term: 'JavaScript' },
    { date: '2014/06/30', term: 'PHP' },
    { date: '2014/06/29', term: 'Juan Miranda' },
    { date: '2014/06/28', term: 'Carlos Barrantes' }
  ];

  function createMemoryStorage() {
    var map = Object.create(null);
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : null; },
      setItem: function (k, v) { map[k] = String(v); },
      removeItem: function (k) { delete map[k]; }
    };
  }

  function safeParseArray(raw, fallback) {
    if (!raw) return fallback.slice();
    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(function (x) { return x && typeof x === 'object'; }) : fallback.slice();
    } catch (_) {
      return fallback.slice();
    }
  }

  function cleanText(value, maxLen) {
    var s = String(value == null ? '' : value).trim();
    return maxLen && s.length > maxLen ? s.slice(0, maxLen) : s;
  }

  function isSafeImage(value) {
    if (!value) return '';
    var s = String(value).trim();
    if (/^data:image\/(png|jpeg|jpg|gif|webp);base64,[a-zA-Z0-9+/=]+$/.test(s)) return s;
    if (/^(img\/[a-zA-Z0-9._-]+)$/.test(s)) return s;
    return '';
  }

  function formatDate(d) {
    var dt = d || new Date();
    var m = String(dt.getMonth() + 1).padStart(2, '0');
    var day = String(dt.getDate()).padStart(2, '0');
    return dt.getFullYear() + '/' + m + '/' + day;
  }

  function createStore(storage) {
    var store = storage || (typeof localStorage !== 'undefined' ? localStorage : createMemoryStorage());

    function readList(key, fallback) {
      return safeParseArray(store.getItem(key), fallback || []);
    }

    function writeList(key, items) {
      store.setItem(key, JSON.stringify(items));
      return items;
    }

    function authenticate(username, password) {
      var user = cleanText(username, 80);
      var pass = String(password == null ? '' : password);
      if (!user || !pass) {
        return { ok: false, error: 'Ingresa tu usuario y contraseña.' };
      }
      if (user === 'admin' && pass === '12345') {
        var adminSession = { nombreUsuario: 'admin', nombreCompleto: 'Administrador UTN', rol: 'Administrador' };
        store.setItem(KEYS.session, JSON.stringify(adminSession));
        return { ok: true, user: adminSession };
      }
      var users = readList(KEYS.users, []);
      for (var i = 0; i < users.length; i++) {
        if (users[i].nombreUsuario === user && users[i].contrasena === pass) {
          var session = {
            nombreUsuario: users[i].nombreUsuario,
            nombreCompleto: users[i].nombreCompleto || users[i].nombreUsuario,
            rol: users[i].rol || 'Auxiliar'
          };
          store.setItem(KEYS.session, JSON.stringify(session));
          return { ok: true, user: session };
        }
      }
      return { ok: false, error: 'Usuario o contraseña incorrectos. Prueba con admin / 12345 o un usuario registrado.' };
    }

    function getSession() {
      var raw = store.getItem(KEYS.session);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (_) {
        return null;
      }
    }

    function logout() {
      store.removeItem(KEYS.session);
    }

    // --- Carreras ---
    function listCareers() {
      return readList(KEYS.careers, []);
    }

    function saveCareer(data, index) {
      var nombreCarrera = cleanText(data.nombreCarrera, 80);
      var codigoCareer = cleanText(data.codigoCareer, 30);
      if (!nombreCarrera || !codigoCareer) {
        return { ok: false, error: 'El nombre y el código de la carrera son obligatorios.' };
      }
      var list = listCareers();
      var codeLower = codigoCareer.toLowerCase();
      for (var i = 0; i < list.length; i++) {
        if (i !== index && cleanText(list[i].codigoCareer).toLowerCase() === codeLower) {
          return { ok: false, error: 'Ya existe una carrera con ese código.' };
        }
      }
      var item = { nombreCarrera: nombreCarrera, codigoCareer: codigoCareer };
      if (typeof index === 'number' && index >= 0 && index < list.length) {
        list[index] = item;
      } else {
        list.push(item);
      }
      writeList(KEYS.careers, list);
      return { ok: true, item: item, list: list };
    }

    function deleteCareer(index) {
      var list = listCareers();
      if (index < 0 || index >= list.length) return { ok: false, error: 'Carrera no encontrada.' };
      var removed = list.splice(index, 1)[0];
      writeList(KEYS.careers, list);
      return { ok: true, removed: removed, list: list };
    }

    // --- Usuarios ---
    function listUsers() {
      return readList(KEYS.users, []);
    }

    function saveUser(data, index) {
      var cedula = cleanText(data.cedula, 30);
      var nombreUsuario = cleanText(data.nombreUsuario, 60);
      var nombreCompleto = cleanText(data.nombreCompleto, 100);
      var contrasena = String(data.contrasena == null ? '' : data.contrasena).trim();
      var rol = cleanText(data.rol, 40) || 'Auxiliar';
      var list = listUsers();
      var isEdit = typeof index === 'number' && index >= 0 && index < list.length;
      if (!contrasena && isEdit) {
        contrasena = list[index].contrasena || '';
      }
      if (!cedula || !nombreUsuario || !nombreCompleto || !contrasena) {
        return { ok: false, error: 'Completa cédula, nombre de usuario, nombre completo y contraseña.' };
      }
      var userLower = nombreUsuario.toLowerCase();
      for (var i = 0; i < list.length; i++) {
        if (i !== index && cleanText(list[i].nombreUsuario).toLowerCase() === userLower) {
          return { ok: false, error: 'Ese nombre de usuario ya está registrado.' };
        }
      }
      var item = {
        cedula: cedula,
        nombreUsuario: nombreUsuario,
        nombreCompleto: nombreCompleto,
        contrasena: contrasena,
        rol: rol
      };
      if (isEdit) {
        list[index] = item;
      } else {
        list.push(item);
      }
      writeList(KEYS.users, list);
      return { ok: true, item: item, list: list };
    }

    function deleteUser(index) {
      var list = listUsers();
      if (index < 0 || index >= list.length) return { ok: false, error: 'Usuario no encontrado.' };
      var removed = list.splice(index, 1)[0];
      writeList(KEYS.users, list);
      return { ok: true, removed: removed, list: list };
    }

    // --- Estudiantes ---
    function listStudents() {
      return readList(KEYS.students, []);
    }

    function saveStudent(data, index) {
      var cedula = cleanText(data.cedula, 30);
      var nombre = cleanText(data.nombre, 100);
      var carrera = cleanText(data.carrera, 80) || 'Sin asignar';
      var ingles = cleanText(data.ingles, 30) || 'Principiante';
      var skills = Array.isArray(data.skills)
        ? data.skills.map(function (s) { return cleanText(s, 40); }).filter(Boolean)
        : [];
      var list = listStudents();
      var isEdit = typeof index === 'number' && index >= 0 && index < list.length;
      var imagen = isSafeImage(data.imagen);
      if (!imagen && isEdit) {
        imagen = isSafeImage(list[index].imagen);
      }
      if (!cedula || !nombre) {
        return { ok: false, error: 'La cédula y el nombre completo del estudiante son obligatorios.' };
      }
      for (var i = 0; i < list.length; i++) {
        if (i !== index && cleanText(list[i].cedula).toLowerCase() === cedula.toLowerCase()) {
          return { ok: false, error: 'Ya existe un estudiante registrado con esa cédula.' };
        }
      }
      var item = {
        cedula: cedula,
        nombre: nombre,
        carrera: carrera,
        ingles: ingles,
        imagen: imagen,
        skills: skills
      };
      if (isEdit) {
        list[index] = item;
      } else {
        list.push(item);
      }
      writeList(KEYS.students, list);
      return { ok: true, item: item, list: list };
    }

    function deleteStudent(index) {
      var list = listStudents();
      if (index < 0 || index >= list.length) return { ok: false, error: 'Estudiante no encontrado.' };
      var removed = list.splice(index, 1)[0];
      writeList(KEYS.students, list);
      return { ok: true, removed: removed, list: list };
    }

    // --- Búsqueda global e historial ---
    function listSearches() {
      var raw = store.getItem(KEYS.searches);
      if (!raw) return DEFAULT_SEARCHES.slice();
      return safeParseArray(raw, DEFAULT_SEARCHES);
    }

    function recordSearch(term, dateObj) {
      var clean = cleanText(term, 80);
      if (!clean) return listSearches();
      var list = listSearches().filter(function (entry) {
        return cleanText(entry.term).toLowerCase() !== clean.toLowerCase();
      });
      list.unshift({ date: formatDate(dateObj), term: clean });
      if (list.length > 12) list = list.slice(0, 12);
      writeList(KEYS.searches, list);
      return list;
    }

    function searchAll(term) {
      var q = cleanText(term, 80).toLowerCase();
      var students = listStudents();
      var careers = listCareers();
      var users = listUsers();
      if (!q) {
        return { students: students, careers: careers, users: users };
      }
      return {
        students: students.filter(function (s) {
          return (
            cleanText(s.cedula).toLowerCase().includes(q) ||
            cleanText(s.nombre).toLowerCase().includes(q) ||
            cleanText(s.carrera).toLowerCase().includes(q) ||
            cleanText(s.ingles).toLowerCase().includes(q) ||
            (Array.isArray(s.skills) && s.skills.join(' ').toLowerCase().includes(q))
          );
        }),
        careers: careers.filter(function (c) {
          return (
            cleanText(c.nombreCarrera).toLowerCase().includes(q) ||
            cleanText(c.codigoCareer).toLowerCase().includes(q)
          );
        }),
        users: users.filter(function (u) {
          return (
            cleanText(u.cedula).toLowerCase().includes(q) ||
            cleanText(u.nombreUsuario).toLowerCase().includes(q) ||
            cleanText(u.nombreCompleto).toLowerCase().includes(q) ||
            cleanText(u.rol).toLowerCase().includes(q)
          );
        })
      };
    }

    return {
      KEYS: KEYS,
      authenticate: authenticate,
      getSession: getSession,
      logout: logout,
      listCareers: listCareers,
      saveCareer: saveCareer,
      deleteCareer: deleteCareer,
      listUsers: listUsers,
      saveUser: saveUser,
      deleteUser: deleteUser,
      listStudents: listStudents,
      saveStudent: saveStudent,
      deleteStudent: deleteStudent,
      listSearches: listSearches,
      recordSearch: recordSearch,
      searchAll: searchAll
    };
  }

  return {
    createStore: createStore,
    createMemoryStorage: createMemoryStorage,
    isSafeImage: isSafeImage
  };
});
