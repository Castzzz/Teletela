import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { criarCassino } from '../cassino.js';
import { FichasStore } from '../fichas-store.js';
import * as R from '../public/cassino-regras.js';

function montar({ diretorio = '', teste = false } = {}) {
  let relogio = Date.UTC(2026, 10, 25, 15); // quarta, meio-dia em Brasília
  const agora = () => relogio;
  const fichas = new FichasStore(diretorio, agora);
  const cassino = criarCassino({ io: {}, fichas, diretorio, agora, teste });
  function conectar(nome, accountId = nome) {
    const ouvintes = {}, avisos = [];
    const socket = { id: nome, on(ev, fn) { ouvintes[ev] = fn; }, emit(ev, dados) { avisos.push([ev, dados]); } };
    cassino.conectar(socket, { name: nome, accessId: nome, accountId });
    const pedir = (acao, extra = {}) => { let r; ouvintes.cassino({ acao, ...extra }, x => { r = x; }); return r; };
    return { pedir, avisos, get saldo() { return fichas.resumo(nome).saldo; } };
  }
  return { conectar, fichas, cassino, passar: ms => { relogio += ms; } };
}

test('visitante não tem cassino e ação estranha é recusada', () => {
  const { conectar } = montar();
  assert.equal(conectar('Anon', null).pedir('ver').erro, 'Entre na sua conta pra ter seu cassino.');
  const a = conectar('Ana');
  assert.ok(a.pedir('maquina', { id: 'constructor' }).erro);
  assert.ok(a.pedir('plantar', { i: -1, cultura: 'milho' }).erro);
  assert.ok(a.pedir('plantar', { i: 0, cultura: '__proto__' }).erro);
  assert.ok(a.pedir('pular', { ms: R.DIA }).erro, 'pular só no servidor de teste');
  assert.ok(a.pedir('hackear').erro);
});

test('comprar desconta da carteira e o cofre só vira ficha ao coletar, até o limite', () => {
  const { conectar, passar } = montar();
  const a = conectar('Ana');
  const inicial = a.saldo;
  const r = a.pedir('maquina', { id: 'caca' });
  assert.equal(r.estado.maquinas.caca, 1);
  assert.equal(a.saldo, inicial - R.MAQUINAS.caca.custo);
  passar(2 * R.HORA);
  assert.equal(a.saldo, inicial - 150, 'produção fica no cofre');
  const c = a.pedir('coletar');
  assert.equal(c.resultado.valor, 20, 'inauguração: 2 h a 5/h em dobro');
  assert.equal(a.saldo, inicial - 150 + 20);
  // Uma semana fora: o cofre para nas 6 h (de produção em dobro, enquanto durou a inauguração).
  passar(7 * R.DIA);
  assert.equal(a.pedir('coletar').resultado.valor, 60);
  assert.equal(a.pedir('coletar').erro, 'O cofre está vazio.');
  // Passada a inauguração, volta pro normal.
  passar(2 * R.HORA);
  assert.equal(a.pedir('coletar').resultado.valor, 10);
});

test('inauguração: ×2 só nas 72 h, e save antigo ganha as 72 h a partir de quando o servidor sobe', () => {
  const e = R.novoEstado(0);
  e.maquinas.caca = 1;
  assert.equal(R.taxaHora(e, 0), 10);
  assert.equal(R.taxaHora(e, R.INAUGURACAO - 1), 10);
  assert.equal(R.taxaHora(e, R.INAUGURACAO), 5);
  assert.equal(R.taxaHora(e), 5, 'sem horário não conta');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cassino-inaug-'));
  const antigo = R.novoEstado(0); delete antigo.inauguracao;
  fs.writeFileSync(path.join(dir, 'cassino.json'), JSON.stringify({ version: 1, temporada: { numero: 1, inicio: 0, fim: Date.UTC(2027, 0, 1) }, jogadores: { Ana: { nome: 'Ana', estado: antigo } } }));
  const { conectar } = montar({ diretorio: dir });
  const ini = conectar('Ana').pedir('ver').estado.inauguracao;
  assert.equal(ini.de, Date.UTC(2026, 10, 25, 15));
  assert.equal(ini.ate - ini.de, R.INAUGURACAO);
  fs.rmSync(dir, { recursive: true });
});

test('irrigação com o celeiro cheio vende a sobra pro cofre', () => {
  const e = R.novoEstado(0);
  e.maquinas.caca = 1; e.niveis.irrigacao = 1; delete e.inauguracao;
  e.estoque.milho = R.capacidadeCeleiro(e); // celeiro cheio
  e.canteiros[0] = { cultura: 'milho', plantado: 0 };
  R.avancar(e, R.HORA);
  assert.equal(e.estoque.milho, R.capacidadeCeleiro(e));
  // 1 h: 5 do caça-níquel + 12 pipocas × 0,3
  assert.ok(Math.abs(e.cofre - (5 + 12 * 0.3)) < 1e-6, String(e.cofre));
  assert.equal(e.canteiros[0].plantado, R.HORA);
});

test('vender máquina devolve 70% da última comprada, sem contar como ganho', () => {
  const { conectar } = montar();
  const a = conectar('Ana');
  const inicial = a.saldo;
  a.pedir('maquina', { id: 'caca' });
  a.pedir('maquina', { id: 'caca' }); // a 2ª custa 172,5 → 175
  assert.equal(a.saldo, inicial - 150 - 175);
  const r = a.pedir('venderMaquina', { id: 'caca' });
  assert.equal(r.resultado.valor, 120); // 70% de 175 = 122,5 → 120
  assert.equal(r.estado.maquinas.caca, 1);
  assert.equal(r.estado.layout.caca.length, 1);
  assert.equal(r.estado.ganhoTemporada, 0);
  assert.equal(a.saldo, inicial - 150 - 175 + 120);
  assert.equal(a.pedir('venderMaquina', { id: 'caca' }).resultado.valor, 105);
  assert.equal(a.pedir('venderMaquina', { id: 'caca' }).erro, 'Você não tem essa máquina.');
  assert.ok(a.pedir('venderMaquina', { id: 'constructor' }).erro);
});

test('roça: planta, espera, colhe pro celeiro e vende barato', () => {
  const { conectar, passar } = montar();
  const a = conectar('Ana');
  assert.ok(a.pedir('plantar', { i: 0, cultura: 'morango' }).erro, 'semente bloqueada');
  assert.equal(a.pedir('plantarVazios', { cultura: 'milho' }).resultado.plantados, 3);
  assert.equal(a.pedir('colher', { i: 0 }).erro, 'Ainda não está pronto.');
  passar(5 * R.MIN);
  assert.equal(a.pedir('colherTudo').resultado.porcoes, 3);
  const antes = a.saldo;
  // 3 pipocas valem 0,9: não paga agora, mas a fração fica guardada pra próxima venda
  assert.equal(a.pedir('vender', { cultura: 'milho' }).resultado.valor, 0);
  a.pedir('plantarVazios', { cultura: 'milho' });
  passar(5 * R.MIN);
  a.pedir('colherTudo');
  assert.equal(a.pedir('vender', { cultura: 'milho' }).resultado.valor, 1);
  assert.equal(a.saldo, antes + 1);
});

test('alavanca tem limite por segundo e por dia', () => {
  const { conectar, passar } = montar();
  const a = conectar('Ana');
  for (let i = 0; i < R.CLIQUES_POR_SEGUNDO; i++) assert.ok(!a.pedir('alavanca').erro);
  assert.equal(a.pedir('alavanca').erro, 'Calma!');
  let n = R.CLIQUES_POR_SEGUNDO;
  while (n < R.CLIQUES_DIA) { passar(1000); for (let i = 0; i < 10 && n < R.CLIQUES_DIA; i++, n++) a.pedir('alavanca'); }
  passar(1000);
  assert.equal(a.pedir('alavanca').erro, 'A alavanca esfriou. Volta amanhã.');
  passar(R.DIA);
  assert.ok(!a.pedir('alavanca').erro, 'volta no outro dia');
});

test('ajudar um amigo dá fichas pros dois, uma vez por dia, e avisa quem recebeu', () => {
  const { conectar } = montar();
  const a = conectar('Ana'), b = conectar('Bia');
  a.pedir('ver'); b.pedir('ver');
  const lista = a.pedir('amigos').amigos;
  assert.deepEqual(lista.map(x => x.nome), ['Bia']);
  const [sa, sb] = [a.saldo, b.saldo];
  const r = a.pedir('ajudar', { chave: 'Bia' });
  assert.equal(a.saldo, sa + 15);
  assert.equal(b.saldo, sb + 15);
  assert.deepEqual(b.avisos.at(-1), ['cassino-ajuda', { nome: 'Ana', valor: 15 }]);
  assert.equal(r.resultado.amigo.nome, 'Bia');
  assert.equal(a.pedir('ajudar', { chave: 'Bia' }).erro, 'Você já ajudou hoje.');
  assert.ok(a.pedir('ajudar', { chave: 'Ana' }).erro, 'não ajuda a si mesmo');
  assert.equal(a.pedir('visitar', { chave: 'Bia' }).amigo.nome, 'Bia');
});

test('servidor de teste: amigos de mentira, pular o tempo e encerrar a temporada', () => {
  const { conectar } = montar({ teste: true });
  const a = conectar('Ana');
  assert.equal(a.pedir('amigos').amigos.length, 3);
  a.pedir('maquina', { id: 'caca' });
  a.pedir('pular', { ms: R.HORA });
  assert.equal(Math.round(a.pedir('ver').estado.cofre), 5);
  const fim = a.pedir('encerrarTemporada');
  assert.equal(fim.estado.temporada, 2);
  assert.deepEqual(fim.estado.culturas, { milho: true });
  assert.equal(a.saldo, R.FICHAS_TEMPORADA);
});

test('lojinha das estrelas: paga em estrelas e o que comprou passa pelo reset', () => {
  const agora = Date.UTC(2026, 10, 25, 15);
  const e = R.novoEstado(agora, 4);
  e.culturas.uva = true;
  assert.equal(R.acoes.legado(e, 'irrigacao').ok, true);
  assert.equal(e.niveis.irrigacao, 1, 'vale na hora');
  assert.equal(R.acoes.legado(e, 'fama').ok, true);
  assert.equal(R.acoes.legado(e, 'canteiros').ok, true);
  assert.equal(e.canteiros.length, 5);
  assert.equal(e.estrelas, 4 - 2 - 1 - 1);
  assert.equal(R.acoes.legado(e, 'sementes').erro, 'Estrelas insuficientes.');
  assert.equal(R.acoes.legado(e, 'irrigacao').erro, 'Já está no máximo.');
  assert.ok(Math.abs(R.multiplicadorGeral(e) - 1.1) < 1e-9);
  const { estado } = R.fimTemporada(e, agora + R.DIA);
  assert.equal(estado.niveis.irrigacao, 1);
  assert.equal(estado.canteiros.length, 5);
  assert.deepEqual(estado.culturas, { milho: true }, 'sem o banco de sementes a fazenda zera');
  assert.equal(estado.legado.fama, 1);
  assert.equal(estado.estrelas, R.ESTRELAS_BASE, 'sem tudo no máximo ganha 1');
  // Tudo no máximo: 3 estrelas.
  const m = R.novoEstado(agora);
  for (const [id, x] of Object.entries(R.MAQUINAS)) m.maquinas[id] = x.max;
  for (const [id, x] of Object.entries(R.MELHORIAS)) m.niveis[id] = x.valores.length - 1;
  for (const id of Object.keys(R.FUNCIONARIOS)) m.funcionarios[id] = true;
  assert.equal(R.faltamProMaximo(m), Object.keys(R.CULTURAS).length - 1);
  for (const id of Object.keys(R.CULTURAS)) m.culturas[id] = true;
  assert.equal(R.fimTemporada(m, agora).novas, R.ESTRELAS_MAXIMO);
});

test('estado sobrevive a reinício', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cassino-'));
  try {
    const um = montar({ diretorio: dir });
    um.conectar('Ana').pedir('maquina', { id: 'caca' });
    um.cassino.gravar();
    const dois = montar({ diretorio: dir });
    assert.equal(dois.conectar('Ana').pedir('ver').estado.maquinas.caca, 1);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('salão em grade: máquina nova ganha lugar, nada se sobrepõe e mover respeita a porta', () => {
  const { conectar, fichas } = montar();
  const a = conectar('Ana');
  a.pedir('ver');
  fichas.ajustar('Ana', 10_000_000);
  const sobrepoe = e => {
    const rs = R.retangulos(e);
    return rs.some((p, i) => rs.some((q, j) => i < j && p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.h && q.y < p.y + p.h));
  };
  let r = a.pedir('maquina', { id: 'caca' });
  assert.equal(r.estado.layout.caca.length, 1);
  // salão cheio: 24 lugares com as maiores peças
  for (let i = 0; i < 4; i++) a.pedir('melhorar', { id: 'salao' });
  for (const [id, n] of [['roleta', 8], ['vinte', 4], ['poker', 2], ['caca', 9]]) for (let i = 0; i < n; i++) r = a.pedir('maquina', { id });
  const e = r.estado;
  assert.deepEqual([e.layout.caca.length, e.layout.roleta.length, e.layout.vinte.length, e.layout.poker.length], [10, 8, 4, 2]);
  assert.ok(!sobrepoe(e), 'peças sobrepostas');
  for (const p of R.retangulos(e)) assert.ok(R.cabe(e, p.tipo, p.x, p.y, { tipo: p.tipo, i: p.i }), `${p.tipo} fora do lugar`);
  // mover: pra cima de outra peça, pra porta ou pra fora não pode; pra um vazio pode
  const s = R.sala(e);
  const [bx, by] = e.layout.bar[0];
  assert.equal(a.pedir('mover', { tipo: 'caca', i: 0, x: bx, y: by }).erro, 'Não cabe aí.');
  assert.equal(a.pedir('mover', { tipo: 'dados', i: 0, x: s.porta.x, y: s.porta.y }).erro, 'Não cabe aí.');
  assert.equal(a.pedir('mover', { tipo: 'vaso', i: 0, x: s.w, y: 5 }).erro, 'Não cabe aí.');
  assert.ok(a.pedir('mover', { tipo: 'nada', i: 0, x: 1, y: 3 }).erro);
  assert.ok(a.pedir('mover', { tipo: 'caca', i: 99, x: 1, y: 3 }).erro);
  let livre = null;
  for (let y = R.PAREDE; y < s.h && !livre; y++) for (let x = 0; x < s.w && !livre; x++) if (R.cabe(e, 'dados', x, y, { tipo: 'dados', i: 0 })) livre = [x, y];
  r = a.pedir('mover', { tipo: 'dados', i: 0, x: livre[0], y: livre[1] });
  assert.deepEqual(r.estado.layout.dados[0], livre);
});

test('estado antigo sem layout ganha um ao carregar', () => {
  const e = R.novoEstado(0);
  delete e.layout;
  e.maquinas.caca = 3; e.maquinas.roleta = 2;
  R.avancar(e, 1000);
  assert.equal(e.layout.caca.length, 3);
  assert.equal(e.layout.roleta.length, 2);
  assert.equal(e.layout.bar.length, 1);
});

test('irrigação: dá pra escolher a próxima cultura e arrancar', () => {
  const { conectar, fichas, passar } = montar();
  const a = conectar('Ana');
  a.pedir('ver');
  fichas.ajustar('Ana', 1_000_000);
  a.pedir('melhorar', { id: 'irrigacao' });
  a.pedir('liberar', { cultura: 'morango' });
  a.pedir('plantar', { i: 0, cultura: 'milho' });
  a.pedir('plantar', { i: 1, cultura: 'milho' });
  assert.ok(a.pedir('proxima', { i: 0, cultura: 'laranja' }).erro, 'semente não liberada');
  assert.ok(a.pedir('proxima', { i: 2, cultura: 'morango' }).erro, 'canteiro vazio');
  let r = a.pedir('proxima', { i: 0, cultura: 'morango' });
  assert.equal(r.estado.canteiros[0].proxima, 'morango');
  // passa a colheita do milho: a irrigação colhe e replanta morango no 0 e milho no 1
  passar(R.CULTURAS.milho.tempo + 1000);
  r = a.pedir('ver');
  assert.equal(r.estado.canteiros[0].cultura, 'morango');
  assert.equal(r.estado.canteiros[0].proxima, undefined);
  assert.equal(r.estado.canteiros[1].cultura, 'milho');
  // trocar todos e voltar atrás
  r = a.pedir('proximaTodos', { cultura: 'milho' });
  assert.equal(r.estado.canteiros[0].proxima, 'milho');
  r = a.pedir('proxima', { i: 0, cultura: null });
  assert.equal(r.estado.canteiros[0].proxima, undefined);
  // arrancar esvazia na hora
  r = a.pedir('arrancar', { i: 1 });
  assert.equal(r.estado.canteiros[1], null);
  assert.ok(a.pedir('arrancar', { i: 1 }).erro);
});

test('temporada global: começa sem tirar coins, acaba às 03h e recomeça todo mundo com 5.000', () => {
  const diretorio = fs.mkdtempSync(path.join(os.tmpdir(), 'teletela-temporada-'));
  let relogio = Date.UTC(2026, 10, 28, 6, 10); // 28/11, 03h10 em Brasília (dia do lançamento)
  const agora = () => relogio;
  const fichas = new FichasStore(diretorio, agora);
  fichas.pegar('Pobre'); fichas.mover('Pobre', 300 - fichas.resumo('Pobre').saldo);
  fichas.pegar('Rico'); fichas.mover('Rico', 8000 - fichas.resumo('Rico').saldo);
  const cassino = criarCassino({ io: {}, fichas, diretorio, agora });
  assert.equal(fichas.resumo('Pobre').saldo, 5000, 'quem tem menos sobe pra 5.000');
  assert.equal(fichas.resumo('Rico').saldo, 8000, 'ninguém perde coins no lançamento');
  const t = cassino.temporada();
  assert.equal(t.numero, 1);
  assert.equal(new Date(t.fim).getUTCHours(), 6, 'acaba às 03h de Brasília');
  assert.ok(t.fim >= t.inicio + R.DIAS_TEMPORADA * R.DIA && t.fim < t.inicio + (R.DIAS_TEMPORADA + 1) * R.DIA);

  const ouvintes = {}, avisos = [];
  cassino.conectar({ id: 'Ana', on(ev, fn) { ouvintes[ev] = fn; }, emit(ev) { avisos.push(ev); } }, { name: 'Ana', accessId: 'Ana', accountId: 'Ana' });
  const pedir = (acao, extra = {}) => { let r; ouvintes.cassino({ acao, ...extra }, x => { r = x; }); return r; };
  assert.ok(!pedir('maquina', { id: 'caca' }).erro);
  let r = pedir('ver');
  assert.deepEqual([r.temporada.numero, r.fimTemporada], [1, null]);

  relogio = t.fim - 60e3; cassino.verificarTemporada();
  assert.equal(cassino.temporada().numero, 1, 'um minuto antes ainda não acabou');
  relogio = t.fim + 30e3; cassino.verificarTemporada();
  assert.equal(cassino.temporada().numero, 2);
  assert.ok(avisos.includes('cassino-temporada'), 'quem está com o cassino aberto é avisado');
  r = pedir('ver');
  assert.equal(r.estado.maquinas.caca, 0, 'cassino recomeça do zero');
  assert.equal(r.estado.estrelas, R.ESTRELAS_BASE, 'quem não chegou no máximo ganha 1 estrela');
  assert.equal(r.estado.temporada, 2);
  assert.deepEqual([r.fimTemporada.numero, r.fimTemporada.novas], [1, R.ESTRELAS_BASE]);
  for (const quem of ['Pobre', 'Rico', 'Ana']) assert.equal(fichas.resumo(quem).saldo, R.FICHAS_TEMPORADA, quem);
  assert.equal(cassino.temporada().inicio, t.fim, 'a próxima conta a partir do fim, não de agora');

  // Reinício: a temporada continua a mesma e não mexe nas carteiras de novo.
  cassino.gravar(); cassino.parar();
  fichas.mover('Rico', 100 - fichas.resumo('Rico').saldo);
  const depois = criarCassino({ io: {}, fichas, diretorio, agora });
  assert.equal(depois.temporada().numero, 2);
  assert.equal(fichas.resumo('Rico').saldo, 100);
  depois.parar();
});
