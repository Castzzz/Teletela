import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { criarApostas } from '../apostas.js';
import { FichasStore } from '../fichas-store.js';

function montar({ diretorio = '', agora = () => 1000, dono = 'Dono' } = {}) {
  const users = new Map(), sockets = new Map();
  const fichas = new FichasStore(diretorio, agora);
  const apostas = criarApostas({ io: { sockets: { sockets } }, channels: new Map([['geral', { users }]]), fichas, isOwner: u => u.accessId === dono, diretorio, agora });
  function conectar(nome) {
    const ouvintes = {};
    let ultimo;
    const socket = { id: nome, on(ev, fn) { ouvintes[ev] = fn; }, emit(_, dados) { ultimo = dados; } };
    sockets.set(nome, socket); users.set(nome, {});
    apostas.conectar(socket, { channelId: 'geral', name: nome, accessId: nome });
    const pedir = (acao, extra = {}) => { let r; ouvintes.aposta({ canal: 'geral', id: ultimo?.aposta?.id, acao, ...extra }, x => { r = x; }); if (acao === 'ver') ultimo = r; return r; };
    pedir('ver');
    return { pedir, get estado() { return ultimo; }, get saldo() { return fichas.resumo(nome).saldo; } };
  }
  return { conectar, fichas };
}
const criar = (p, extra = {}) => p.pedir('criar', { titulo: 'Quem morre primeiro?', opcoes: ['Ana', 'Bia', 'Caio'], segundos: 120, ...extra });

test('pote vai pra quem acertou na proporção e quem criou também aposta', () => {
  const { conectar } = montar();
  const a = conectar('Ana'), b = conectar('Bia'), c = conectar('Caio');
  assert.deepEqual(criar(a), {});
  assert.ok(criar(b).erro, 'uma por canal');
  a.pedir('palpitar', { opcao: 'o1', valor: 100 });
  b.pedir('palpitar', { opcao: 'o1', valor: 50 });
  b.pedir('palpitar', { opcao: 'o1', valor: 250 });
  assert.ok(b.pedir('palpitar', { opcao: 'o2', valor: 10 }).erro, 'não troca de lado');
  c.pedir('palpitar', { opcao: 'o2', valor: 600 });
  assert.ok(c.pedir('palpitar', { opcao: 'o2', valor: 401 }).erro, 'sem saldo');
  const o1 = a.estado.aposta.opcoes[0];
  assert.deepEqual([o1.total, o1.pessoas, a.estado.aposta.total], [400, 2, 1000]);
  assert.equal(o1.paga, 2.5);
  assert.ok(b.pedir('resolver', { opcao: 'o1' }).erro, 'só quem criou decide');
  a.pedir('resolver', { opcao: 'o1' });
  assert.deepEqual([a.saldo, b.saldo, c.saldo], [1150, 1450, 400]);
  assert.equal(b.estado.aposta.meu.ganho, 750);
  assert.equal(a.estado.aposta.fase, 'resolvida');
  assert.deepEqual(criar(b), {}, 'depois do resultado dá pra criar outra');
});

test('ninguém acertou ou cancelou: devolve tudo; dono pode cancelar', () => {
  const { conectar } = montar();
  const a = conectar('Ana'), b = conectar('Bia'), dono = conectar('Dono');
  criar(a);
  b.pedir('palpitar', { opcao: 'o2', valor: 300 });
  a.pedir('resolver', { opcao: 'o3' });
  assert.equal(b.saldo, 1000);
  assert.equal(b.estado.aposta.devolvida, true);
  criar(b);
  a.pedir('palpitar', { opcao: 'o1', valor: 70 });
  assert.equal(a.saldo, 930);
  assert.deepEqual(dono.pedir('cancelar'), {});
  assert.equal(a.saldo, 1000);
  assert.equal(a.estado.aposta.fase, 'cancelada');
});

test('valida a criação e fecha sozinha no tempo, sobrevivendo a reinício', async () => {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'apostas-'));
  let agora = 1000;
  const um = montar({ diretorio: pasta, agora: () => agora }).conectar('Ana');
  assert.ok(criar(um, { opcoes: ['Só uma'] }).erro);
  assert.ok(criar(um, { opcoes: ['A', 'a'] }).erro);
  assert.ok(criar(um, { segundos: 7 }).erro);
  criar(um, { segundos: 60 });
  um.pedir('palpitar', { opcao: 'o1', valor: 200 });
  agora += 61e3;
  assert.ok(um.pedir('palpitar', { opcao: 'o1', valor: 1 }).erro, 'passou do tempo');
  const dois = montar({ diretorio: pasta, agora: () => agora }).conectar('Ana');
  assert.equal(dois.estado.aposta.fase, 'fechada');
  assert.equal(dois.saldo, 800);
  dois.pedir('resolver', { opcao: 'o1' });
  assert.equal(dois.saldo, 1000);
  fs.rmSync(pasta, { recursive: true, force: true });
});
