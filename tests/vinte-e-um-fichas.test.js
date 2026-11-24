import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { criarMesas21, tempoDoResultado } from '../vinte-e-um.js';
import { FichasStore, proximaSegunda, ultimaSegunda } from '../fichas-store.js';

function montar(cartas, fichas = new FichasStore(), relogio) {
  const users = new Map(), sockets = new Map();
  const mesas = criarMesas21({ channels: new Map([['geral', { users }]]), io: { sockets: { sockets } }, novoBaralho: () => cartas.slice(), fichas, relogio });
  function conectar(id, accountId = id, accessId = id) {
    const ouvintes = {};
    let estado;
    const socket = { id, on(nome, fn) { ouvintes[nome] = fn; }, emit(_, dados) { estado = dados.mesa; } };
    sockets.set(id, socket);
    users.set(id, {});
    mesas.conectar(socket, { channelId: 'geral', name: id, accessId, accountId });
    return { get mesa() { return estado; }, jogar(acao, opcoes = {}) {
      let resposta;
      ouvintes['jogar-21']({ canal: 'geral', rodada: estado?.rodada, quantidade: estado?.pessoas.find(p => p.id === id)?.cartas.length, acao, ...opcoes }, r => { resposta = r; });
      return resposta;
    }, ranking() { let r; ouvintes['ranking-fichas'](x => { r = x; }); return r.lista; } };
  }
  return conectar;
}
const saldos = m => m.pessoas.map(p => p.saldo);

test('aposta montada com fichas, validada contra o saldo', () => {
  const a = montar(['10♣','K♦','10♠','8♥'])('Ana');
  a.jogar('criar', { modo: 'banca' });
  assert.ok(a.jogar('iniciar').erro, 'sem pilha não vale');
  assert.ok(a.jogar('iniciar', { pilha: [7] }).erro, 'ficha inexistente');
  assert.ok(a.jogar('iniciar', { pilha: Array(11).fill(100) }).erro, 'mais que o saldo');
  a.jogar('iniciar', { pilha: [100, 50, 25, 10, 5] });
  assert.equal(a.mesa.fase, 'jogando');
  assert.equal(a.mesa.pessoas[0].aposta, 190);
  assert.deepEqual(saldos(a.mesa), [810]);
  a.jogar('parar');
  assert.deepEqual(saldos(a.mesa), [1190], 'vitória paga o dobro');
});

test('banca devolve empate, recolhe derrota uma vez e aceita tudo numa mão', () => {
  for (const [mao, saldo] of [[['10♣','8♦'], 1000], [['10♣','6♦'], 0]]) {
    const a = montar([...mao,'10♠','8♥'])('Ana');
    a.jogar('criar', { modo: 'banca' });
    a.jogar('iniciar', { pilha: Array(10).fill(100) });
    a.jogar('parar');
    assert.deepEqual(saldos(a.mesa), [saldo]);
    assert.ok(a.jogar('parar').erro);
    assert.deepEqual(saldos(a.mesa), [saldo]);
  }
});

test('depois do resultado a mesa se limpa e cada um monta a aposta de novo', () => {
  const agendados = [];
  const relogio = { setTimeout: (fn, ms) => { const t = { fn, ms, vivo: true }; agendados.push(t); return t; }, clearTimeout: t => { if (t) t.vivo = false; } };
  const conectar = montar(['10♣','K♦','10♠','8♥','10♣','K♦','10♠','8♥'], new FichasStore(), relogio);
  const a = conectar('Ana');
  a.jogar('criar', { modo: 'banca' });
  a.jogar('iniciar', { pilha: [100] });
  a.jogar('parar');
  assert.equal(a.mesa.fase, 'resultado');
  assert.ok(a.jogar('iniciar', { pilha: [100] }).erro, 'com o resultado na mesa ainda não aposta');
  const limpeza = agendados.at(-1);
  assert.equal(limpeza.ms, 5550, 'banca sem comprar: o placar sai logo e fica 5 s');
  assert.equal(tempoDoResultado({ modo: 'banca', banca: ['2♣', '3♦', '4♠', '5♥'] }), 700 + 650 + 550 + 5000, 'duas compras da banca');
  limpeza.fn();
  assert.equal(a.mesa.fase, 'espera');
  assert.deepEqual(a.mesa.banca, []);
  assert.deepEqual(a.mesa.pessoas.map(p => [p.cartas.length, p.aposta, p.pilha.length, p.resultado]), [[0, 0, 0, '']]);
  assert.deepEqual(saldos(a.mesa), [1100], 'o ganho continua na carteira');
  a.jogar('iniciar', { pilha: [50] });
  assert.equal(a.mesa.fase, 'jogando');
  // Quem sai antes da limpeza leva o relógio junto.
  a.jogar('parar');
  a.jogar('sair');
  assert.equal(agendados.at(-1).vivo, false);
});

test('entre amigos o pote vai pros vencedores na proporção da aposta', () => {
  // Ana e Bia fazem 20, Caio 13: Ana apostou 10, Bia 30, Caio 60. Pote 100 -> 25 e 75.
  const conectar = montar(['3♣','K♥','Q♠','J♦','10♥','K♣']);
  const a = conectar('Ana'), b = conectar('Bia'), c = conectar('Caio');
  a.jogar('criar', { modo: 'amigos' }); b.jogar('entrar'); c.jogar('entrar');
  a.jogar('iniciar', { pilha: [10] }); a.jogar('cancelar');
  b.jogar('iniciar', { pilha: [25, 5] }); c.jogar('iniciar', { pilha: [50, 10] });
  assert.equal(a.mesa.fase, 'espera');
  a.jogar('iniciar', { pilha: [5, 5] });
  assert.equal(a.mesa.pote, 100);
  for (const p of [a, b, c]) p.jogar('parar');
  assert.deepEqual(saldos(a.mesa), [1015, 1045, 940]);
});

test('saldo vale fora da mesa e toda segunda cada um ganha mais 1000', () => {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'fichas-'));
  let agora = Date.UTC(2026, 10, 25, 15); // quarta-feira
  const loja = new FichasStore(pasta, () => agora);
  loja.pegar('Bia', 'Bia'); loja.mover('Bia', 250);
  const a = montar(['10♣','6♦','10♠','8♥'], loja)('Ana');
  a.jogar('criar', { modo: 'banca' });
  a.jogar('iniciar', { pilha: Array(10).fill(100) });
  a.jogar('parar');
  a.jogar('sair');
  assert.ok(a.jogar('criar', { modo: 'banca' }).erro, 'sem fichas não senta');
  assert.equal(proximaSegunda(agora), Date.UTC(2026, 10, 30, 3));
  assert.equal(ultimaSegunda(agora), Date.UTC(2026, 10, 23, 3));
  assert.equal(ultimaSegunda(Date.UTC(2026, 10, 30, 3)), Date.UTC(2026, 10, 30, 3), 'a própria segunda conta');
  agora = Date.UTC(2026, 10, 30, 2, 59);
  assert.equal(new FichasStore(pasta, () => agora).resumo('Ana').saldo, 0, 'ainda é domingo em Brasília');
  agora = Date.UTC(2026, 10, 30, 3);
  const depois = new FichasStore(pasta, () => agora);
  assert.equal(depois.resumo('Ana').saldo, 1000, 'quem zerou ganha 1000');
  assert.equal(depois.ranking('Ana')[0].nome, 'Bia', 'quem tinha saldo também ganha: 1250 + 1000');
  assert.equal(depois.ranking('Ana')[0].saldo, 2250);
  assert.equal(depois.resumo('Ana').saldo, 1000, 'na mesma semana não credita de novo');
  agora = Date.UTC(2026, 11, 15, 12); // duas segundas depois
  assert.equal(new FichasStore(pasta, () => agora).resumo('Ana').saldo, 3000, 'semanas sem abrir somam');
  fs.rmSync(pasta, { recursive: true, force: true });
});

test('ranking ordena por fichas e marca quem pediu', () => {
  const conectar = montar(['10♣','K♦','10♠','8♥']);
  const a = conectar('Ana'), b = conectar('Bia');
  a.jogar('criar', { modo: 'banca' });
  a.jogar('iniciar', { pilha: [100] });
  a.jogar('parar');
  b.jogar('ver');
  assert.deepEqual(b.ranking().map(p => [p.nome, p.saldo, p.voce]), [['Ana', 1100, false], ['Bia', 1000, true]]);
});

test('dono recarrega uma pessoa ou todo mundo', () => {
  const loja = new FichasStore();
  loja.pegar('a', 'Ana'); loja.pegar('b', 'Bia');
  loja.mover('a', -1000); loja.mover('b', -300);
  assert.equal(loja.resetar('x'), false);
  assert.equal(loja.resetar('a'), true);
  assert.deepEqual(loja.lista().map(p => [p.nome, p.saldo, p.zerado]), [['Ana', 1000, false], ['Bia', 700, false]]);
  assert.equal(loja.resetarTodas(), 2);
  assert.deepEqual(loja.lista().map(p => p.saldo), [1000, 1000]);
});

test('visitante acompanha o ranking e joga só por diversão sem abrir carteira', () => {
  const fichas = new FichasStore();
  const conectar = montar([], fichas);
  const visita = conectar('Visita', null);
  assert.equal(visita.jogar('ver').carteira, null);
  assert.deepEqual(visita.ranking(), []);
  assert.match(visita.jogar('criar', { modo: 'banca' }).erro, /conta/);
  assert.ok(!visita.jogar('criar', { modo: 'banca', fichas: false }).erro);
  visita.jogar('sair');
  conectar('Ana').jogar('criar', { modo: 'banca' });
  assert.match(visita.jogar('entrar', { fichas: false }).erro, /conta/);
  assert.deepEqual(visita.ranking().map(p => p.nome), ['Ana']);
});

test('a mesma conta retoma saldo e posição em outro aparelho, mesmo com outro apelido', () => {
  const contas = new Set(['membro']);
  const fichas = new FichasStore('', Date.now, () => contas);
  fichas.pegar('visita-antiga', 'Ana');
  const conectar = montar([], fichas);
  const primeiro = conectar('Ana', 'conta', 'membro');
  assert.equal(primeiro.jogar('ver').carteira.saldo, 1000);
  fichas.mover('membro', -180);
  const segundo = conectar('Outro apelido', 'conta', 'membro');
  assert.equal(segundo.jogar('ver').carteira.saldo, 820);
  assert.deepEqual(segundo.ranking().map(p => [p.nome, p.saldo, p.voce]), [['Outro apelido', 820, true]]);
});
