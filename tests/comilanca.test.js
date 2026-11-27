import test from 'node:test';
import assert from 'node:assert/strict';
import { criarComilanca, INTERVALO } from '../comilanca.js';
import { criarMotor, TETO } from '../public/comilanca-motor.js';
import { FichasStore } from '../fichas-store.js';

// Sorteio repetível (mulberry32), pra simulação e o teste não variarem.
function semente(n) {
  return () => { n |= 0; n = n + 0x6D2B79F5 | 0; let t = Math.imul(n ^ n >>> 15, 1 | n); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

function montar() {
  let agora = 1e12;
  const fichas = new FichasStore();
  const c = criarComilanca({ fichas, aleatorio: semente(7), agora: () => agora });
  function conectar(nome, accountId = nome) {
    const ouvintes = {};
    c.conectar({ on(ev, fn) { ouvintes[ev] = fn; } }, { name: nome, accessId: nome, accountId });
    return (pedido) => { let r; ouvintes.comilanca(pedido, x => { r = x; }); return r; };
  }
  return { conectar, fichas, passar: ms => { agora += ms; } };
}

test('giro cobra a aposta, paga o prêmio e devolve os eventos', () => {
  const { conectar, fichas, passar } = montar();
  const ana = conectar('Ana');
  assert.equal(conectar('Anon', null)({ acao: 'girar', aposta: 10 }).erro, 'Entre na sua conta pra jogar.');
  assert.ok(ana({ acao: 'girar', aposta: 7 }).erro, 'aposta fora da lista');
  let saldo = fichas.resumo('Ana').saldo;
  for (let i = 0; i < 30; i++) {
    const r = ana({ acao: 'girar', aposta: 10 });
    assert.ok(!r.erro, r.erro);
    assert.equal(r.carteira.saldo, saldo - 10 + r.premio);
    assert.equal(r.jogada.base.eventos[0].t, 'inicio');
    assert.equal(r.jogada.base.eventos.at(-1).t, 'fim');
    saldo = r.carteira.saldo;
    assert.equal(ana({ acao: 'girar', aposta: 10 }).erro, 'Calma, a turma ainda está comendo.');
    passar(INTERVALO);
  }
  fichas.mover('Ana', -fichas.resumo('Ana').saldo);
  assert.equal(ana({ acao: 'girar', aposta: 5 }).erro, 'Você não tem coins pra essa aposta.');
});

test('motor: amigo só come a cor dele, troca só quando destrava e o retorno fica perto de 95%', () => {
  const m = criarMotor({ aleatorio: semente(42) });
  let apostado = 0, ganho = 0, trocas = 0;
  for (let i = 0; i < 60000; i++) {
    const j = m.jogar(1);
    apostado += 1; ganho += j.total;
    assert.ok(j.total <= TETO);
    if (i < 300) for (const r of [j.base, ...j.bonus]) {
      const amigos = r.eventos[0].amigos;
      for (const [k, ev] of r.eventos.entries()) {
        if (ev.t === 'trocar') {
          trocas++;
          const [a, b] = ev.posicoes;
          assert.equal(Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]), 1, 'troca só entre amigos encostados');
          assert.equal(r.eventos[k + 1].t, 'comer', 'troca sempre destrava alguém');
        }
        if (ev.t !== 'comer') continue;
        const cor = amigos[ev.amigo].cor;
        assert.ok(ev.simbolo.t !== 'gema' || ev.simbolo.cor === cor, 'comeu pedra de outra cor');
        assert.equal(Math.abs(ev.de[0] - ev.para[0]) + Math.abs(ev.de[1] - ev.para[1]), 1, 'anda uma casa');
      }
    }
  }
  assert.ok(trocas > 0, 'nenhuma troca em 300 jogadas');
  const rtp = ganho / apostado;
  assert.ok(rtp > 0.85 && rtp < 1.05, 'retorno ' + rtp.toFixed(3));
});
