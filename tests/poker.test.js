import test from 'node:test';
import assert from 'node:assert/strict';
import { criarMesasPoker, melhorMao, comparar, montarPotes, PRAZO_VEZ } from '../poker.js';
import { FichasStore } from '../fichas-store.js';

const mao = s => melhorMao(s.split(' '));

test('avalia as mãos e escolhe as 5 melhores de 7', () => {
  assert.equal(mao('A♠ K♠ Q♠ J♠ 10♠ 2♦ 3♣').nome, 'Royal flush');
  assert.equal(mao('A♦ 2♣ 3♥ 4♠ 5♦ K♣ K♥').nome, 'Sequência até o 5', 'ás baixo');
  assert.equal(mao('9♣ 9♦ 9♥ 9♠ 2♦ 3♣ 4♥').nome, 'Quadra de 9');
  assert.equal(mao('Q♣ Q♦ Q♥ 7♠ 7♦ 3♣ 3♥').nome, 'Full house, damas com 7');
  assert.equal(mao('2♥ 7♥ 9♥ J♥ K♥ A♣ A♦').nome, 'Flush, rei alto');
  assert.equal(mao('A♣ A♦ 8♥ 8♠ 3♦ 3♣ K♥').nome, 'Dois pares, ases e 8');
  assert.equal(mao('K♣ K♦').nome, 'Par de reis', 'antes do flop');
  // Mesmo par: decide o kicker. Dois pares iguais: decide a quinta carta.
  assert.ok(comparar(mao('A♣ K♦ A♥ 7♠ 3♦ 2♣ 9♥').valor, mao('A♦ Q♦ A♥ 7♠ 3♦ 2♣ 9♥').valor) > 0);
  assert.equal(comparar(mao('2♣ 3♦ A♥ A♠ K♦ K♣ Q♥').valor, mao('4♣ 5♦ A♥ A♠ K♦ K♣ Q♥').valor), 0, 'a mesa joga: divide');
  assert.ok(comparar(mao('6♦ 7♦ 2♥ 3♠ 4♦ 5♣ 9♥').valor, mao('A♦ K♦ 2♥ 3♠ 4♦ 5♣ 9♥').valor) > 0, 'sequência até o 7 ganha da roda');
});

test('potes paralelos: quem largou paga, sobra sem cobertura volta', () => {
  const j = (total, foldou = false) => ({ total, foldou });
  const [a, b, c, d] = [j(100), j(300), j(300), j(50, true)];
  const potes = montarPotes([a, b, c, d]);
  assert.deepEqual(potes.map(p => [p.valor, p.elegiveis.length]), [[350, 3], [400, 2]]);
  const sobra = montarPotes([j(500), j(200), j(20, true)]);
  assert.deepEqual(sobra.map(p => p.valor), [420, 300]);
  assert.equal(sobra[1].elegiveis.length, 1);
});

// Baralho na ordem em que as cartas saem: duas voltas a partir de quem senta depois do
// dealer, queima, flop, queima, turn, queima, river.
const baralho = s => () => s.split(' ').reverse();

function montar(cartas, fichas = new FichasStore()) {
  const users = new Map(), sockets = new Map();
  const pendentes = [];
  const relogio = {
    setTimeout(fn, ms) { const t = { fn, ms }; pendentes.push(t); return t; },
    clearTimeout(t) { const i = pendentes.indexOf(t); if (i >= 0) pendentes.splice(i, 1); }
  };
  const mesas = criarMesasPoker({ io: { sockets: { sockets } }, channels: new Map([['geral', { users }]]),
    novoBaralho: Array.isArray(cartas) ? () => cartas.shift()() : cartas, fichas, relogio });
  function conectar(id, accountId = id) {
    const ouvintes = {};
    let estado;
    const socket = { id, on(n, fn) { ouvintes[n] = fn; }, emit(_, d) { estado = d.mesa; } };
    const user = { channelId: 'geral', name: id, accessId: id, accountId };
    sockets.set(id, socket);
    users.set(id, {});
    mesas.conectar(socket, user);
    const jogar = (acao, extra = {}) => {
      let r;
      ouvintes['jogar-poker']({ canal: 'geral', passo: estado?.passo, acao, ...extra }, x => { r = x; });
      return r;
    };
    jogar('ver');
    return {
      get mesa() { return estado; },
      get eu() { return estado?.lugares[estado.eu]; },
      jogar,
      sair() { mesas.sair('geral', id); }
    };
  }
  // Roda o próximo timer (vez que acabou ou pausa entre mãos).
  const passarTempo = () => pendentes.shift()?.fn();
  return { conectar, passarTempo, pendentes, fichas };
}

test('mão mano a mano até o showdown, com as fichas saindo e voltando pra carteira', () => {
  // Ana (lugar 0) é dealer e small blind; Bia (lugar 4) é big blind e recebe primeiro.
  const t = montar(baralho('K♣ A♠ 7♦ A♦ 2♣ A♥ 9♠ 3♣ 4♦ K♦ 5♥ 8♣'));
  const ana = t.conectar('Ana'), bia = t.conectar('Bia');
  assert.ok(ana.jogar('sentar', { valor: 5 }).erro, 'menos que o big blind');
  assert.ok(ana.jogar('sentar', { valor: 1001 }).erro, 'mais que a carteira');
  ana.jogar('sentar', { valor: 500 });
  bia.jogar('sentar', { valor: 300 });
  assert.equal(ana.mesa.fase, 'espera', 'a primeira mão espera alguém começar');
  ana.jogar('comecar');
  const m = ana.mesa;
  assert.equal(m.fase, 'jogando');
  assert.deepEqual([m.dealer, m.sb, m.bb, m.vez], [0, 0, 4, 0], 'no mano a mano o dealer fala primeiro');
  assert.deepEqual(ana.eu.cartas, ['A♠', 'A♦']);
  assert.deepEqual(ana.mesa.lugares[4].cartas, [null, null], 'carta dos outros fica escondida');
  assert.equal(t.fichas.resumo('Ana').saldo, 995);
  assert.equal(t.fichas.resumo('Bia').saldo, 990);
  assert.ok(bia.jogar('passar').erro, 'fora da vez');
  ana.jogar('pagar');
  assert.equal(bia.mesa.vez, 4, 'big blind tem a opção');
  bia.jogar('passar');
  assert.equal(ana.mesa.etapa, 'flop');
  assert.equal(ana.mesa.mesaCartas.length, 3);
  assert.equal(ana.mesa.pote, 20);
  assert.equal(ana.mesa.vez, 4, 'depois do flop quem fala primeiro é quem senta depois do dealer');
  assert.ok(bia.jogar('aumentar', { valor: 5 }).erro, 'aposta mínima é o big blind');
  bia.jogar('aumentar', { valor: 50 });
  assert.ok(ana.jogar('aumentar', { valor: 60 }).erro, 'aumento mínimo dobra a aposta');
  ana.jogar('aumentar', { valor: 150 });
  bia.jogar('tudo');
  assert.equal(bia.eu.pilha, 0);
  ana.jogar('pagar');
  // Bia ficou all-in: a mesa abre até o river e mostra as cartas.
  assert.equal(ana.mesa.fase, 'resultado');
  assert.equal(ana.mesa.mesaCartas.length, 5);
  assert.equal(ana.mesa.lugares[4].nomeMao, 'Par de reis');
  assert.equal(ana.mesa.lugares[0].nomeMao, 'Trinca de ases');
  assert.equal(ana.mesa.lugares[0].ganho, 600);
  assert.deepEqual([ana.eu.pilha, t.fichas.resumo('Ana').saldo, t.fichas.resumo('Bia').saldo], [800, 1300, 700]);
  // Pausa, e a próxima mão sai sozinha? Bia sem fichas: a mesa volta a esperar.
  t.passarTempo();
  assert.equal(ana.mesa.fase, 'espera');
  assert.ok(bia.jogar('repor', { valor: 701 }).erro, 'não põe mais que a carteira');
  bia.jogar('repor', { valor: 200 });
  assert.equal(ana.mesa.fase, 'jogando', 'com duas pessoas de novo, a mão sai sozinha');
  assert.equal(ana.mesa.dealer, 4, 'o botão gira');
});

test('acabou o tempo: passa se der, senão larga; duas vezes e fica ausente', () => {
  const cartas = 'K♣ A♠ 7♦ A♦ 2♣ A♥ 9♠ 3♣ 4♦ K♦ 5♥ 8♣';
  const t = montar(Array.from({ length: 6 }, () => baralho(cartas)));
  const ana = t.conectar('Ana'), bia = t.conectar('Bia');
  ana.jogar('sentar', { valor: 500 }); bia.jogar('sentar', { valor: 500 });
  ana.jogar('comecar');
  assert.equal(t.pendentes[0].ms, PRAZO_VEZ);
  t.passarTempo(); // Ana tinha 5 pra pagar: larga
  assert.equal(ana.mesa.fase, 'resultado');
  assert.equal(ana.eu.acao, 'Largou (tempo)');
  assert.equal(ana.mesa.lugares[4].ganho, 15);
  t.passarTempo(); // próxima mão: Bia é dealer e fala primeiro
  assert.equal(ana.mesa.vez, 4);
  bia.jogar('pagar');
  t.passarTempo(); // Ana (big blind) pode passar
  assert.equal(ana.mesa.etapa, 'flop');
  assert.equal(ana.eu.ausente, true, 'segunda falta seguida');
  bia.jogar('aumentar', { valor: 20 });
  assert.equal(ana.mesa.fase, 'resultado', 'ausente larga na hora, sem esperar o tempo');
  t.passarTempo();
  assert.equal(ana.mesa.fase, 'espera', 'ausente não recebe cartas');
  ana.jogar('voltar');
  assert.equal(ana.mesa.fase, 'jogando');
});

test('três na mesa: all-in curto ganha o pote principal e o outro leva o paralelo', () => {
  // Lugares: Ana 0 (dealer), Bia 4 (small), Caio 2 (big)? Não: a ordem gira pelos números.
  // Ana 0 dealer, Caio 2 small, Bia 4 big. Cartas a partir do lugar 2: Caio, Bia, Ana.
  const t = montar(baralho('A♣ K♣ 2♦ A♦ K♦ 3♣ 9♠ A♥ 7♣ 4♦ 8♥ 5♠ J♥ 6♦'));
  const ana = t.conectar('Ana'), bia = t.conectar('Bia'), caio = t.conectar('Caio');
  ana.jogar('sentar', { valor: 1000 }); bia.jogar('sentar', { valor: 400 }); caio.jogar('sentar', { valor: 100 });
  ana.jogar('comecar');
  assert.deepEqual([ana.mesa.dealer, ana.mesa.sb, ana.mesa.bb, ana.mesa.vez], [0, 2, 4, 0]);
  ana.jogar('aumentar', { valor: 400 });
  caio.jogar('tudo');
  assert.equal(caio.eu.allin, true);
  bia.jogar('tudo');
  assert.equal(ana.mesa.vez, null);
  assert.equal(ana.mesa.fase, 'resultado', 'Ana cobriu: todos all-in menos ela, a mesa corre');
  // Caio: A♣ A♦ (trinca de ases com A♥). Bia: K♣ K♦. Ana: 2♦ 3♣ com 4-5-6 na mesa = sequência.
  const [principal, paralelo] = ana.mesa.potes;
  assert.equal(principal.valor, 300);
  assert.equal(paralelo.valor, 600);
  assert.deepEqual(principal.ganhadores, [0], 'sequência ganha da trinca');
  assert.deepEqual(paralelo.ganhadores, [0]);
  assert.deepEqual([t.fichas.resumo('Ana').saldo, t.fichas.resumo('Bia').saldo, t.fichas.resumo('Caio').saldo], [1500, 600, 900]);
});

test('all-in curto não reabre o aumento pra quem já falou', () => {
  const t = montar(baralho('K♣ A♠ 7♦ A♦ 2♣ Q♥ 9♠ 3♣ 4♦ K♦ 5♥ 8♣ J♣ 6♠'));
  const ana = t.conectar('Ana'), bia = t.conectar('Bia'), caio = t.conectar('Caio');
  ana.jogar('sentar', { valor: 1000 }); bia.jogar('sentar', { valor: 1000 }); caio.jogar('sentar', { valor: 35 });
  ana.jogar('comecar');
  ana.jogar('aumentar', { valor: 30 });   // aumento de 20
  caio.jogar('tudo');                      // vai a 35: só +5, curto
  bia.jogar('pagar');
  assert.equal(ana.mesa.vez, 0);
  assert.equal(ana.mesa.jogadas.podeAumentar, false, 'Ana só paga ou larga');
  assert.equal(ana.mesa.jogadas.pagar, 5);
  ana.jogar('pagar');
  assert.equal(ana.mesa.etapa, 'flop');
});

test('quem sai no meio da mão larga, e o que pôs fica no pote', () => {
  const t = montar(baralho('K♣ A♠ 7♦ A♦ 2♣ A♥ 9♠ 3♣ 4♦ K♦ 5♥ 8♣'));
  const ana = t.conectar('Ana'), bia = t.conectar('Bia');
  ana.jogar('sentar', { valor: 500 }); bia.jogar('sentar', { valor: 500 });
  ana.jogar('comecar');
  ana.jogar('aumentar', { valor: 100 });
  bia.sair();
  assert.equal(ana.mesa.fase, 'resultado');
  assert.equal(ana.eu.ganho, 110);
  assert.equal(ana.mesa.lugares[4].cartas[0], null, 'sem showdown ninguém vê as cartas');
  assert.deepEqual([t.fichas.resumo('Ana').saldo, t.fichas.resumo('Bia').saldo], [1010, 990]);
  t.passarTempo();
  assert.equal(ana.mesa.lugares[4], null, 'o lugar fica livre');
  ana.sair();
  assert.equal(ana.mesa, null);
});

test('só diversão não mexe na carteira', () => {
  const t = montar(baralho('K♣ A♠ 7♦ A♦ 2♣ A♥ 9♠ 3♣ 4♦ K♦ 5♥ 8♣'));
  const ana = t.conectar('Ana'), bia = t.conectar('Bia');
  ana.jogar('sentar', { fichas: false });
  bia.jogar('sentar', { valor: 1 });
  ana.jogar('comecar');
  ana.jogar('tudo'); bia.jogar('pagar');
  assert.equal(ana.eu.pilha, 2000);
  assert.deepEqual([t.fichas.resumo('Ana').saldo, t.fichas.resumo('Bia').saldo], [1000, 1000]);
});

test('300 mãos aleatórias: nenhuma ficha some ou aparece e a mesa nunca trava', () => {
  let semente = Number(process.env.POKER_SEMENTE) || 7;
  const sorte = n => { semente = (semente * 1103515245 + 12345) % 2147483648; return semente % n; };
  const t = montar(() => {
    const cartas = [];
    for (const n of '♠♥♦♣') for (const v of 'A 2 3 4 5 6 7 8 9 10 J Q K'.split(' ')) cartas.push(v + n);
    for (let i = cartas.length - 1; i > 0; i--) { const j = sorte(i + 1); [cartas[i], cartas[j]] = [cartas[j], cartas[i]]; }
    return cartas;
  });
  const nomes = ['Ana', 'Bia', 'Caio', 'Davi', 'Eva', 'Fábio'];
  const gente = nomes.map(n => t.conectar(n));
  const total = () => nomes.reduce((s, n) => s + t.fichas.resumo(n).saldo, 0);
  let inicial = total();
  // Quando um só ficou com quase tudo, o dono recarrega todo mundo e a soma esperada muda.
  const reviver = () => { if (nomes.filter(n => t.fichas.resumo(n).saldo >= 10).length < 2) { t.fichas.resetarTodas(); inicial = total(); } };
  for (const [i, p] of gente.entries()) if (i < 3) p.jogar('sentar', { valor: 100 + sorte(900) });
  gente[0].jogar('comecar');
  let maos = 0, passos = 0;
  while (maos < 300 && passos++ < 20000) {
    const m = gente[0].mesa;
    if (!m) {
      reviver();
      const comFichas = gente.filter((p, i) => t.fichas.resumo(nomes[i]).saldo >= 10).slice(0, 3);
      for (const p of comFichas) p.jogar('sentar', { valor: 10 + sorte(t.fichas.resumo(nomes[gente.indexOf(p)]).saldo - 9) });
      comFichas[0].jogar('comecar');
      continue;
    }
    if (m.fase === 'resultado') {
      // Entre as mãos as fichas da mesa já voltaram pra carteira: a soma bate.
      assert.equal(total(), inicial, 'mão ' + m.numero);
      maos++;
      // Às vezes alguém levanta, senta ou põe mais fichas.
      const p = gente[sorte(gente.length)];
      if (sorte(4) === 0) p.mesa?.eu != null ? p.sair() : p.jogar('sentar', { valor: 10 + sorte(500) });
      t.passarTempo();
      continue;
    }
    if (m.fase === 'espera') {
      reviver();
      const fora = gente.find(p => p.mesa?.eu == null && t.fichas.resumo(nomes[gente.indexOf(p)]).saldo >= 10);
      // Pilha zerada: põe mais se a carteira tiver, senão levanta.
      for (const sem of gente.filter(p => p.eu && p.eu.pilha === 0)) {
        const carteira = t.fichas.resumo(sem.eu.nome).saldo;
        if (carteira) sem.jogar('repor', { valor: Math.min(200, carteira) }); else sem.sair();
      }
      gente.find(p => p.eu?.ausente)?.jogar('voltar');
      if (fora && gente[0].mesa?.fase === 'espera') fora.jogar('sentar', { valor: 10 });
      if (gente[0].mesa?.fase === 'espera') {
        const algum = gente.find(p => p.eu);
        algum?.jogar('comecar');
        if (gente[0].mesa?.fase === 'espera') break;
      }
      continue;
    }
    assert.equal(m.fase, 'jogando');
    assert.notEqual(m.vez, null, 'mão sem ninguém na vez');
    const p = gente.find(x => x.mesa.eu === m.vez);
    const j = p.mesa.jogadas;
    const r = sorte(10);
    if (r === 0) { t.passarTempo(); continue; } // deixou o tempo acabar
    if (r === 1 && sorte(5) === 0) { p.sair(); continue; }
    const acao = r < 3 ? 'largar' : r < 6 ? (j.podePassar ? 'passar' : 'pagar') : r < 8 && j.podeAumentar ? 'aumentar' : r === 8 ? 'tudo' : (j.podePassar ? 'passar' : 'pagar');
    const valor = j.minimo + sorte(Math.max(1, j.maximo - j.minimo + 1));
    const resp = p.jogar(acao, { valor });
    assert.equal(resp.erro, undefined, acao + ' recusado: ' + resp.erro);
  }
  assert.ok(maos >= 300, 'só jogou ' + maos + ' mãos');
});

test('visitante só senta no poker por diversão e pode assistir sem carteira', () => {
  const t = montar([]);
  const visita = t.conectar('Visita', null);
  assert.equal(visita.jogar('ver').carteira, null);
  assert.match(visita.jogar('sentar', { valor: 10 }).erro, /conta/);
  assert.ok(!visita.jogar('sentar', { fichas: false }).erro);
  visita.sair();
  t.conectar('Ana').jogar('sentar', { valor: 10 });
  assert.match(visita.jogar('sentar', { fichas: false }).erro, /conta/);
  assert.deepEqual(t.fichas.lista().map(c => c.nome), ['Ana']);
});
