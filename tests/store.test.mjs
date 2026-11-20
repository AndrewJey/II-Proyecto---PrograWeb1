import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createStore, createMemoryStorage } = require('../js/store.js');

test('login works on empty localStorage with admin/12345 and rejects invalid credentials', () => {
  const store = createStore(createMemoryStorage());
  assert.equal(store.authenticate('admin', 'wrong').ok, false);
  const ok = store.authenticate('admin', '12345');
  assert.equal(ok.ok, true);
  assert.equal(store.getSession().nombreUsuario, 'admin');
  store.logout();
  assert.equal(store.getSession(), null);
});

test('users CRUD prevents duplicates, preserves username on edit, and enables login', () => {
  const store = createStore(createMemoryStorage());
  assert.equal(store.saveUser({ cedula: '1-1111-1111', nombreUsuario: 'ana', nombreCompleto: 'Ana Rojas', contrasena: 'secret', rol: 'Auxiliar' }).ok, true);
  assert.equal(store.saveUser({ cedula: '2-2222-2222', nombreUsuario: 'ANA', nombreCompleto: 'Otra Ana', contrasena: 'abc', rol: 'Auxiliar' }).ok, false);
  const upd = store.saveUser({ cedula: '1-1111-1111', nombreUsuario: 'ana.rojas', nombreCompleto: 'Ana María Rojas', contrasena: '', rol: 'Administrador' }, 0);
  assert.equal(upd.ok, true);
  assert.equal(store.listUsers()[0].nombreUsuario, 'ana.rojas');
  assert.equal(store.authenticate('ana.rojas', 'secret').ok, true);
  assert.equal(store.deleteUser(0).ok, true);
  assert.equal(store.listUsers().length, 0);
});

test('careers and students CRUD handle image validation, skills, and search history', () => {
  const store = createStore(createMemoryStorage());
  assert.equal(store.saveCareer({ nombreCarrera: 'Ingeniería del Software', codigoCareer: 'ISW' }).ok, true);
  assert.equal(store.saveCareer({ nombreCarrera: 'Duplicada', codigoCareer: 'isw' }).ok, false);

  const validPng = 'data:image/png;base64,iVBORw0KGgo=';
  assert.equal(store.saveStudent({
    cedula: '207000123',
    nombre: 'Carlos Barrantes',
    carrera: 'Ingeniería del Software',
    ingles: 'Avanzado',
    imagen: 'javascript:alert(1)',
    skills: ['JavaScript', 'SQL']
  }).ok, true);
  assert.equal(store.listStudents()[0].imagen, '');

  assert.equal(store.saveStudent({
    cedula: '207000123',
    nombre: 'Carlos Barrantes',
    carrera: 'Ingeniería del Software',
    ingles: 'Avanzado',
    imagen: validPng,
    skills: ['JavaScript', 'SQL']
  }, 0).ok, true);
  assert.equal(store.listStudents()[0].imagen, validPng);

  store.recordSearch('JavaScript', new Date('2026-11-19T12:00:00Z'));
  const found = store.searchAll('JavaScript');
  assert.equal(found.students.length, 1);
  assert.equal(store.listSearches()[0].term, 'JavaScript');
});
