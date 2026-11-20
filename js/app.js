(function () {
  'use strict';

  var store = window.UTNStore.createStore();
  var SKILLS = ['JavaScript', 'HTML/CSS', 'PHP', 'Java', 'C#', 'SQL', 'Python'];

  var selected = { users: null, careers: null, students: null };
  var currentTab = 0;
  var pendingImage = '';

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'className') node.className = attrs[k];
        else if (k === 'text') node.textContent = attrs[k];
        else if (k.startsWith('on') && typeof attrs[k] === 'function') node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, String(attrs[k]));
      });
    }
    (children || []).forEach(function (child) {
      if (child == null) return;
      if (typeof child === 'string') node.appendChild(document.createTextNode(child));
      else node.appendChild(child);
    });
    return node;
  }

  function showToast(message, variant) {
    var region = document.getElementById('toast-region');
    if (!region) return;
    var toast = el('div', { className: 'toast' + (variant ? ' toast-' + variant : ''), text: message });
    region.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3200);
  }

  function openModal(title, contentNode) {
    var backdrop = document.getElementById('modal-backdrop');
    var titleEl = document.getElementById('modal-title');
    var bodyEl = document.getElementById('modal-body');
    titleEl.textContent = title;
    bodyEl.innerHTML = '';
    bodyEl.appendChild(contentNode);
    backdrop.hidden = false;
    var focusable = bodyEl.querySelector('input, select, button');
    if (focusable) focusable.focus();
  }

  function closeModal() {
    var backdrop = document.getElementById('modal-backdrop');
    backdrop.hidden = true;
    document.getElementById('modal-body').innerHTML = '';
    pendingImage = '';
  }

  function switchTab(index) {
    currentTab = index;
    for (var i = 0; i <= 3; i++) {
      var btn = document.getElementById('tab-btn-' + i);
      var panel = document.getElementById('tabs-' + i);
      var active = i === index;
      if (btn) btn.setAttribute('aria-selected', String(active));
      if (panel) panel.hidden = !active;
    }
  }

  function updateCounters() {
    var u = store.listUsers().length;
    var c = store.listCareers().length;
    var s = store.listStudents().length;
    document.getElementById('count-users').textContent = u;
    document.getElementById('count-careers').textContent = c;
    document.getElementById('count-students').textContent = s;
    document.getElementById('kpi-users').textContent = u;
    document.getElementById('kpi-careers').textContent = c;
    document.getElementById('kpi-students').textContent = s;
  }

  function updateToolbarButtons(kind, prefix) {
    var hasSel = selected[kind] !== null;
    ['search', 'edit', 'delete'].forEach(function (act) {
      var btn = document.getElementById(act + prefix);
      if (btn) btn.disabled = !hasSel;
    });
  }

  function renderTable(wrapperId, kind, prefix, headers, rows, mapper) {
    var wrapper = document.getElementById(wrapperId);
    wrapper.innerHTML = '';
    if (selected[kind] !== null && selected[kind] >= rows.length) {
      selected[kind] = null;
    }
    updateToolbarButtons(kind, prefix);
    if (!rows.length) {
      wrapper.appendChild(el('div', { className: 'empty-state', text: 'No hay registros aún. Usa "+ Agregar" para crear el primero.' }));
      return;
    }
    var thead = el('thead', null, [
      el('tr', null, headers.map(function (h) { return el('th', { text: h }); }))
    ]);
    var tbody = el('tbody');
    rows.forEach(function (item, idx) {
      var tr = el('tr', {
        className: selected[kind] === idx ? 'is-selected' : '',
        tabindex: '0',
        'aria-selected': String(selected[kind] === idx),
        onClick: function () {
          selected[kind] = selected[kind] === idx ? null : idx;
          renderAll();
        },
        onKeydown: function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selected[kind] = selected[kind] === idx ? null : idx;
            renderAll();
          }
        }
      }, mapper(item).map(function (val) { return el('td', { text: val }); }));
      tbody.appendChild(tr);
    });
    wrapper.appendChild(el('table', { className: 'data-table' }, [thead, tbody]));
  }

  function renderSearches() {
    var container = document.getElementById('recent-searches');
    container.innerHTML = '';
    store.listSearches().forEach(function (entry) {
      var chip = el('button', {
        type: 'button',
        className: 'chip',
        text: entry.date + ' — ' + entry.term,
        onClick: function () {
          document.getElementById('global-search-input').value = entry.term;
          executeSearch(entry.term, false);
        }
      });
      container.appendChild(chip);
    });
  }

  function executeSearch(term, saveHistory) {
    var box = document.getElementById('search-results');
    box.innerHTML = '';
    var clean = String(term || '').trim();
    if (!clean) return;
    if (saveHistory) {
      store.recordSearch(clean);
      renderSearches();
    }
    var res = store.searchAll(clean);
    var total = res.students.length + res.careers.length + res.users.length;
    box.appendChild(el('p', {
      text: total + ' resultado(s) para "' + clean + '" (' +
        res.students.length + ' estudiantes, ' + res.careers.length + ' carreras, ' + res.users.length + ' usuarios).'
    }));
    if (res.students.length) {
      box.appendChild(el('h3', { text: 'Estudiantes' }));
      res.students.forEach(function (s) {
        box.appendChild(el('div', { className: 'alert alert-info', text: s.nombre + ' (' + s.cedula + ') — ' + s.carrera + ' · Inglés: ' + s.ingles }));
      });
    }
    if (res.careers.length) {
      box.appendChild(el('h3', { text: 'Carreras' }));
      res.careers.forEach(function (c) {
        box.appendChild(el('div', { className: 'alert alert-info', text: c.nombreCarrera + ' [' + c.codigoCareer + ']' }));
      });
    }
    if (res.users.length) {
      box.appendChild(el('h3', { text: 'Usuarios' }));
      res.users.forEach(function (u) {
        box.appendChild(el('div', { className: 'alert alert-info', text: u.nombreCompleto + ' (@' + u.nombreUsuario + ') — ' + u.rol }));
      });
    }
  }

  // --- Forms ---
  function openUserForm(editIndex) {
    var isEdit = typeof editIndex === 'number';
    var current = isEdit ? store.listUsers()[editIndex] : null;
    var errBox = el('div', { className: 'alert alert-error', role: 'alert', hidden: '' });

    var cedulaIn = el('input', { id: 'f-cedula', type: 'text', required: '', value: current ? current.cedula : '' });
    var userIn = el('input', { id: 'f-user', type: 'text', required: '', value: current ? current.nombreUsuario : '' });
    var nameIn = el('input', { id: 'f-name', type: 'text', required: '', value: current ? current.nombreCompleto : '' });
    var passIn = el('input', {
      id: 'f-pass',
      type: 'password',
      placeholder: isEdit ? 'Dejar vacío para mantener la actual' : 'Contraseña',
      required: isEdit ? null : ''
    });
    var rolSel = el('select', { id: 'f-rol' }, ['Administrador', 'Director de carrera', 'Auxiliar'].map(function (r) {
      return el('option', { value: r, text: r, selected: current && current.rol === r ? '' : null });
    }));

    var form = el('form', {
      onSubmit: function (e) {
        e.preventDefault();
        var res = store.saveUser({
          cedula: cedulaIn.value,
          nombreUsuario: userIn.value,
          nombreCompleto: nameIn.value,
          contrasena: passIn.value,
          rol: rolSel.value
        }, isEdit ? editIndex : undefined);
        if (!res.ok) {
          errBox.textContent = res.error;
          errBox.hidden = false;
          return;
        }
        closeModal();
        renderAll();
        showToast(isEdit ? 'Usuario actualizado.' : 'Usuario agregado.', 'success');
      }
    }, [
      errBox,
      el('div', { className: 'field' }, [el('label', { for: 'f-cedula', text: 'Cédula' }), cedulaIn]),
      el('div', { className: 'field' }, [el('label', { for: 'f-user', text: 'Nombre de usuario' }), userIn]),
      el('div', { className: 'field' }, [el('label', { for: 'f-name', text: 'Nombre completo' }), nameIn]),
      el('div', { className: 'field' }, [el('label', { for: 'f-pass', text: 'Contraseña' }), passIn]),
      el('div', { className: 'field' }, [el('label', { for: 'f-rol', text: 'Rol' }), rolSel]),
      el('div', { className: 'modal-footer' }, [
        el('button', { type: 'button', className: 'btn btn-secondary', text: 'Cancelar', onClick: closeModal }),
        el('button', { type: 'submit', className: 'btn btn-primary', text: isEdit ? 'Guardar cambios' : 'Crear usuario' })
      ])
    ]);
    openModal(isEdit ? 'Editar usuario' : 'Nuevo usuario', form);
  }

  function openCareerForm(editIndex) {
    var isEdit = typeof editIndex === 'number';
    var current = isEdit ? store.listCareers()[editIndex] : null;
    var errBox = el('div', { className: 'alert alert-error', role: 'alert', hidden: '' });

    var nameIn = el('input', { id: 'f-cname', type: 'text', required: '', value: current ? current.nombreCarrera : '' });
    var codeIn = el('input', { id: 'f-ccode', type: 'text', required: '', value: current ? current.codigoCareer : '' });

    var form = el('form', {
      onSubmit: function (e) {
        e.preventDefault();
        var res = store.saveCareer({
          nombreCarrera: nameIn.value,
          codigoCareer: codeIn.value
        }, isEdit ? editIndex : undefined);
        if (!res.ok) {
          errBox.textContent = res.error;
          errBox.hidden = false;
          return;
        }
        closeModal();
        renderAll();
        showToast(isEdit ? 'Carrera actualizada.' : 'Carrera agregada.', 'success');
      }
    }, [
      errBox,
      el('div', { className: 'field' }, [el('label', { for: 'f-cname', text: 'Nombre de la carrera' }), nameIn]),
      el('div', { className: 'field' }, [el('label', { for: 'f-ccode', text: 'Código' }), codeIn]),
      el('div', { className: 'modal-footer' }, [
        el('button', { type: 'button', className: 'btn btn-secondary', text: 'Cancelar', onClick: closeModal }),
        el('button', { type: 'submit', className: 'btn btn-primary', text: isEdit ? 'Guardar cambios' : 'Crear carrera' })
      ])
    ]);
    openModal(isEdit ? 'Editar carrera' : 'Nueva carrera', form);
  }

  function openStudentForm(editIndex) {
    var isEdit = typeof editIndex === 'number';
    var current = isEdit ? store.listStudents()[editIndex] : null;
    var careers = store.listCareers();
    var errBox = el('div', { className: 'alert alert-error', role: 'alert', hidden: '' });
    pendingImage = current ? (current.imagen || '') : '';

    var cedulaIn = el('input', { id: 'f-sced', type: 'text', required: '', value: current ? current.cedula : '' });
    var nameIn = el('input', { id: 'f-sname', type: 'text', required: '', value: current ? current.nombre : '' });
    var careerOptions = careers.length
      ? careers.map(function (c) { return c.nombreCarrera; })
      : ['Sin asignar'];
    if (current && current.carrera && careerOptions.indexOf(current.carrera) === -1) {
      careerOptions.unshift(current.carrera);
    }
    var careerSel = el('select', { id: 'f-scareer' }, careerOptions.map(function (cname) {
      return el('option', { value: cname, text: cname, selected: current && current.carrera === cname ? '' : null });
    }));
    var englishSel = el('select', { id: 'f-senglish' }, ['Principiante', 'Intermedio', 'Avanzado'].map(function (lvl) {
      return el('option', { value: lvl, text: lvl, selected: current && current.ingles === lvl ? '' : null });
    }));

    var preview = el('div', { style: 'margin-top:0.5rem;' });
    function renderPreview() {
      preview.innerHTML = '';
      if (pendingImage) {
        preview.appendChild(el('img', { className: 'thumb', src: pendingImage, alt: 'Vista previa del estudiante' }));
      }
    }
    renderPreview();

    var fileIn = el('input', {
      id: 'f-sfile',
      type: 'file',
      accept: 'image/png,image/jpeg,image/gif,image/webp',
      onChange: function (evt) {
        var f = evt.target.files && evt.target.files[0];
        if (!f) return;
        if (f.size > 1024 * 1024) {
          errBox.textContent = 'La imagen no debe superar 1 MB.';
          errBox.hidden = false;
          return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
          pendingImage = e.target.result;
          renderPreview();
        };
        reader.readAsDataURL(f);
      }
    });

    var currentSkills = (current && Array.isArray(current.skills)) ? current.skills : [];
    var skillChecks = SKILLS.map(function (sk) {
      var cb = el('input', { type: 'checkbox', value: sk, checked: currentSkills.indexOf(sk) !== -1 ? '' : null });
      return { cb: cb, node: el('label', null, [cb, sk]) };
    });

    var form = el('form', {
      onSubmit: function (e) {
        e.preventDefault();
        var chosenSkills = skillChecks.filter(function (x) { return x.cb.checked; }).map(function (x) { return x.cb.value; });
        var res = store.saveStudent({
          cedula: cedulaIn.value,
          nombre: nameIn.value,
          carrera: careerSel.value,
          ingles: englishSel.value,
          imagen: pendingImage,
          skills: chosenSkills
        }, isEdit ? editIndex : undefined);
        if (!res.ok) {
          errBox.textContent = res.error;
          errBox.hidden = false;
          return;
        }
        closeModal();
        renderAll();
        showToast(isEdit ? 'Estudiante actualizado.' : 'Estudiante agregado.', 'success');
      }
    }, [
      errBox,
      el('div', { className: 'field' }, [el('label', { for: 'f-sced', text: 'Cédula' }), cedulaIn]),
      el('div', { className: 'field' }, [el('label', { for: 'f-sname', text: 'Nombre completo' }), nameIn]),
      el('div', { className: 'field' }, [el('label', { for: 'f-scareer', text: 'Carrera' }), careerSel]),
      el('div', { className: 'field' }, [el('label', { for: 'f-senglish', text: 'Nivel de inglés' }), englishSel]),
      el('div', { className: 'field' }, [
        el('label', { text: 'Habilidades técnicas' }),
        el('div', { className: 'skills-grid' }, skillChecks.map(function (x) { return x.node; }))
      ]),
      el('div', { className: 'field' }, [el('label', { for: 'f-sfile', text: 'Fotografía (opcional, máx. 1 MB)' }), fileIn, preview]),
      el('div', { className: 'modal-footer' }, [
        el('button', { type: 'button', className: 'btn btn-secondary', text: 'Cancelar', onClick: closeModal }),
        el('button', { type: 'submit', className: 'btn btn-primary', text: isEdit ? 'Guardar cambios' : 'Crear estudiante' })
      ])
    ]);
    openModal(isEdit ? 'Editar estudiante' : 'Nuevo estudiante', form);
  }

  function openDetail(kind) {
    var idx = selected[kind];
    if (idx === null) return;
    var items = kind === 'users' ? store.listUsers() : kind === 'careers' ? store.listCareers() : store.listStudents();
    var item = items[idx];
    if (!item) return;

    var wrap = el('div');
    if (kind === 'students' && item.imagen) {
      wrap.appendChild(el('p', null, [el('img', { className: 'thumb', src: item.imagen, alt: 'Fotografía de ' + item.nombre })]));
    }
    var pairs = kind === 'users'
      ? [['Cédula', item.cedula], ['Usuario', item.nombreUsuario], ['Nombre completo', item.nombreCompleto], ['Rol', item.rol]]
      : kind === 'careers'
        ? [['Nombre', item.nombreCarrera], ['Código', item.codigoCareer]]
        : [
            ['Cédula', item.cedula],
            ['Nombre completo', item.nombre],
            ['Carrera', item.carrera],
            ['Nivel de inglés', item.ingles],
            ['Habilidades', (item.skills && item.skills.length) ? item.skills.join(', ') : 'Ninguna registrada']
          ];
    var dl = el('dl', { className: 'detail-list' });
    pairs.forEach(function (pair) {
      dl.appendChild(el('dt', { text: pair[0] }));
      dl.appendChild(el('dd', { text: pair[1] || '—' }));
    });
    wrap.appendChild(dl);
    wrap.appendChild(el('div', { className: 'modal-footer' }, [
      el('button', { type: 'button', className: 'btn btn-primary', text: 'Cerrar', onClick: closeModal })
    ]));
    openModal('Detalle del registro', wrap);
  }

  function openDeleteConfirm(kind) {
    var idx = selected[kind];
    if (idx === null) return;
    var label = kind === 'users' ? 'este usuario' : kind === 'careers' ? 'esta carrera' : 'este estudiante';
    var content = el('div', null, [
      el('p', { text: '¿Seguro que deseas eliminar ' + label + '? Esta acción no se puede deshacer.' }),
      el('div', { className: 'modal-footer' }, [
        el('button', { type: 'button', className: 'btn btn-secondary', text: 'Cancelar', onClick: closeModal }),
        el('button', {
          type: 'button',
          className: 'btn btn-danger',
          text: 'Eliminar',
          onClick: function () {
            if (kind === 'users') store.deleteUser(idx);
            else if (kind === 'careers') store.deleteCareer(idx);
            else store.deleteStudent(idx);
            selected[kind] = null;
            closeModal();
            renderAll();
            showToast('Registro eliminado.', 'success');
          }
        })
      ])
    ]);
    openModal('Confirmar eliminación', content);
  }

  function renderAll() {
    renderTable('table_wrapper1', 'users', '1', ['Cédula', 'Usuario', 'Nombre completo', 'Rol'], store.listUsers(), function (u) {
      return [u.cedula, u.nombreUsuario, u.nombreCompleto, u.rol];
    });
    renderTable('table_wrapper2', 'careers', '2', ['Nombre', 'Código'], store.listCareers(), function (c) {
      return [c.nombreCarrera, c.codigoCareer];
    });
    renderTable('table_wrapper3', 'students', '3', ['Cédula', 'Nombre completo', 'Carrera', 'Inglés'], store.listStudents(), function (s) {
      return [s.cedula, s.nombre, s.carrera, s.ingles];
    });
    updateCounters();
    renderSearches();
  }

  function prepareBinding() {
    var session = store.getSession();
    var sessionLabel = document.getElementById('session-label');
    if (sessionLabel) {
      sessionLabel.textContent = session ? ('Sesión: ' + session.nombreCompleto + ' (' + session.rol + ')') : 'Sesión: Invitado';
    }

    document.getElementById('logout-btn').addEventListener('click', function () {
      store.logout();
      window.location.href = 'index.html';
    });

    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchTab(Number(btn.getAttribute('data-tab')));
      });
    });

    document.getElementById('global-search-form').addEventListener('submit', function (e) {
      e.preventDefault();
      executeSearch(document.getElementById('global-search-input').value, true);
    });
    document.getElementById('global-search-clear').addEventListener('click', function () {
      document.getElementById('global-search-input').value = '';
      document.getElementById('search-results').innerHTML = '';
    });

    document.getElementById('add1').addEventListener('click', function () { openUserForm(); });
    document.getElementById('edit1').addEventListener('click', function () { if (selected.users !== null) openUserForm(selected.users); });
    document.getElementById('search1').addEventListener('click', function () { openDetail('users'); });
    document.getElementById('delete1').addEventListener('click', function () { openDeleteConfirm('users'); });

    document.getElementById('add2').addEventListener('click', function () { openCareerForm(); });
    document.getElementById('edit2').addEventListener('click', function () { if (selected.careers !== null) openCareerForm(selected.careers); });
    document.getElementById('search2').addEventListener('click', function () { openDetail('careers'); });
    document.getElementById('delete2').addEventListener('click', function () { openDeleteConfirm('careers'); });

    document.getElementById('add3').addEventListener('click', function () { openStudentForm(); });
    document.getElementById('edit3').addEventListener('click', function () { if (selected.students !== null) openStudentForm(selected.students); });
    document.getElementById('search3').addEventListener('click', function () { openDetail('students'); });
    document.getElementById('delete3').addEventListener('click', function () { openDeleteConfirm('students'); });

    document.getElementById('modal-close-x').addEventListener('click', closeModal);
    document.getElementById('modal-backdrop').addEventListener('click', function (e) {
      if (e.target === e.currentTarget) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !document.getElementById('modal-backdrop').hidden) {
        closeModal();
      }
    });

    renderAll();
  }

  window.prepareBinding = prepareBinding;
  document.addEventListener('DOMContentLoaded', prepareBinding);
})();
