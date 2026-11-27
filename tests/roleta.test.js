import test from 'node:test';
import assert from 'node:assert/strict';
import { criarMesasRoleta, multiplicador, alvoValido, RODA, TEMPO_APOSTAS, TEMPO_GIRO, PAUSA_RESULTADO } from '../roleta.js';
import { FichasStore } from '../fichas-store.js';

// Relógio de mentira: os timers só rodam quando o teste manda o tempo andar.
function montar(numero = 17) {
  let agora = 1e12;
  const timers = new Set();
  const relogio = {
    setTimeout(fn, ms) { const t = { fn, quando: agora + ms }; timers.add(t); return t; },
    clearTimeout(t) { timers.delete(t); },
  };
  const passar = ms => {
    agora += ms;
    for (const t of [...timers].sort((a, b) => a.quando - b.quando)) if (t.quando <= agora && timers.delete(t)) t.fn();
  };
  const users = new Map(), sockets = new Map();
  const fichas = new FichasStore();
  const sorteio = { numero };
  const mesas = criarMesasRoleta({ channels: new Map([['geral', { users }]]), io: { sockets: { sockets } }, fichas, relogio, agora: () => agora, sortear: () => sorteio.numero });
  function conectar(id, accountId = id) {
    const ouvintes = {};
    let estado;
    const socket = { id, on(nome, fn) { ouvintes[nome] = fn; }, emit(_, dados) { estado = dados; } };
    sockets.set(id, socket);
    users.set(id, {});
    mesas.conectar(socket, { channelId: 'geral', name: id, accessId: id, accountId });
    const jogar = (acao, opcoes = {}) => {
      let r;
      ouvintes['jogar-roleta']({ canal: 'geral', rodada: estado?.mesa?.rodada, acao, ...opcoes }, x => { r = x; if (x.mesa !== undefined) estado = { ...x }; });
      return r;
    };
    return { jogar, get mesa() { return estado?.mesa; }, get saldo() { return fichas.resumo(id).saldo; } };
  }
  return { conectar, passar, sorteio, mesas, users };
}

test('pagamentos da roda europeia', () => {
  assert.equal(RODA.length, 37);
  assert.deepEqual([...RODA].sort((a, b) => a - b), Array.from({ length: 37 }, (_, i) => i));
  assert.equal(multiplicador('n17', 17), 36);
  assert.equal(multiplicador('n17', 18), 0);
  assert.equal(multiplicador('preto', 17), 2);
  assert.equal(multiplicador('vermelho', 17), 0);
  assert.equal(multiplicador('impar', 17), 2);
  assert.equal(multiplicador('baixo', 17), 2);
  assert.equal(multiplicador('d2', 17), 3);
  assert.equal(multiplicador('c2', 17), 3);
  for (const fora of ['vermelho', 'preto', 'par', 'impar', 'baixo', 'alto', 'd1', 'c3']) assert.equal(multiplicador(fora, 0), 0, 'zero leva as de fora');
  assert.equal(multiplicador('n0', 0), 36);
  assert.ok(alvoValido('n36') && !alvoValido('n37') && !alvoValido('__proto__') && !alvoValido('n'));
});

test('aposta, gira sozinha no fim do tempo e paga', () => {
  const { conectar, passar } = montar(17);
  const ana = conectar('Ana'), bia = conectar('Bia');
  assert.ok(ana.jogar('apostar', { alvo: 'n17', valor: 7 }).erro, 'ficha inexistente');
  assert.ok(ana.jogar('apostar', { alvo: 'n40', valor: 5 }).erro, 'lugar inexistente');
  ana.jogar('apostar', { alvo: 'n17', valor: 10 });
  assert.equal(ana.mesa.fase, 'apostando');
  assert.equal(ana.saldo, 990, 'a ficha sai da carteira na hora');
  bia.jogar('apostar', { alvo: 'vermelho', valor: 100 });
  bia.jogar('apostar', { alvo: 'd2', valor: 50 });
  passar(TEMPO_APOSTAS);
  assert.equal(ana.mesa.fase, 'girando');
  assert.equal(ana.mesa.numero, 17);
  assert.ok(bia.jogar('apostar', { alvo: 'preto', valor: 5 }).erro, 'fechou');
  passar(TEMPO_GIRO);
  assert.equal(ana.mesa.fase, 'resultado');
  assert.equal(ana.saldo, 990 + 360);
  assert.equal(bia.saldo, 1000 - 150 + 150, 'perdeu no vermelho, a dúzia pagou 3x');
  assert.deepEqual(ana.mesa.historico, [17]);
  passar(PAUSA_RESULTADO);
  assert.equal(ana.mesa.fase, 'espera');
  assert.equal(ana.mesa.apostas.length, 0);
});

test('desfazer, limpar, pronto e sair devolvem certo', () => {
  const { conectar, passar, sorteio } = montar(0);
  const ana = conectar('Ana'), bia = conectar('Bia');
  ana.jogar('apostar', { alvo: 'par', valor: 25 });
  ana.jogar('apostar', { alvo: 'n0', valor: 5 });
  ana.jogar('desfazer');
  assert.equal(ana.saldo, 975);
  ana.jogar('limpar');
  assert.equal(ana.saldo, 1000);
  assert.equal(ana.mesa.fase, 'espera', 'sem fichas a contagem para');
  ana.jogar('apostar', { alvo: 'n0', valor: 5 });
  bia.jogar('apostar', { alvo: 'impar', valor: 100 });
  ana.jogar('pronto');
  assert.equal(ana.mesa.fase, 'apostando', 'falta a Bia');
  bia.jogar('pronto');
  assert.equal(ana.mesa.fase, 'girando', 'todos prontos: gira na hora');
  sorteio.numero = 5;
  passar(TEMPO_GIRO);
  assert.equal(ana.saldo, 1000 - 5 + 180, 'zero paga 36x');
  assert.equal(bia.saldo, 900);
  passar(PAUSA_RESULTADO);
  assert.equal(ana.mesa.fase, 'espera');
});

test('sair da call com as apostas abertas devolve as fichas', () => {
  const r = montar(3);
  const ana = r.conectar('Ana');
  ana.jogar('apostar', { alvo: 'alto', valor: 50 });
  assert.equal(ana.saldo, 950);
  r.mesas.sair('geral', 'Ana');
  assert.equal(ana.saldo, 1000);
  r.passar(TEMPO_APOSTAS + TEMPO_GIRO);
  assert.equal(ana.saldo, 1000, 'não girou sem ninguém');
});

test('visitante assiste, mas não aposta; saldo não deixa passar', () => {
  const { conectar } = montar();
  const anon = conectar('Anon', null);
  assert.equal(anon.jogar('ver').mesa, null);
  assert.equal(anon.jogar('apostar', { alvo: 'n1', valor: 5 }).erro, 'Entre na sua conta pra apostar.');
  const ana = conectar('Ana');
  for (let i = 0; i < 10; i++) ana.jogar('apostar', { alvo: 'n1', valor: 100 });
  assert.equal(ana.saldo, 0);
  assert.ok(ana.jogar('apostar', { alvo: 'n1', valor: 5 }).erro, 'sem saldo');
});
