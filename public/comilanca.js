// Comilança no palco das Atividades (salão → cartão "Comilança"). O servidor (comilanca.js)
// sorteia a jogada inteira e já acerta a carteira; aqui a gente só anima os eventos do
// motor (public/comilanca-motor.js): amigos andando e comendo, avalanche, níveis, bomba.
import { criarSons } from './sons-mesa.js';
import { VALOR_BASE, CORES, criarMotor } from './comilanca-motor.js';

const COR_HEX = { vermelho: '#e5322d', azul: '#2f7fe8', verde: '#22b45a', roxo: '#9a48e0' };
// Nome de cada cor: as fotos e os nomes dos amigos entram depois (fora do git, como no cassino).
const TURMA = { vermelho: 'Amigo 1', azul: 'Amigo 2', verde: 'Amigo 3', roxo: 'Amigo 4' };
const APOSTAS = [5, 10, 25, 50, 100];
const ESCALA = 0.252; // mesma do motor
// Faixas de comemoração, em vezes a aposta.
const FAIXAS = [[10, 'Big win'], [25, 'Mega win'], [60, 'Ultra win']];
// Ritmo (ms) de cada passo; o turbo multiplica por TURBO.
const RITMO = { entrada: 560, comer: 300, avalanche: 780, destaque: 950, entreGiros: 800 };
const TURBO = .38;
const fmt = v => (Math.round(v * 10) / 10).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const inteiro = v => Math.round(v).toLocaleString('pt-BR');

// ---------- Pedras: um corte só (octógono), só a cor muda. Três tons chapados: facetas
// de cima/esquerda claras, de baixo/direita escuras, mesa no meio. Sem brilho. ----------
const JOIAS = {
  vermelho: ['#ff8576', '#e0362e', '#9c1d18'],
  azul: ['#7cb8ff', '#2f74e0', '#1b438f'],
  verde: ['#6fdc8c', '#22a854', '#12683a'],
  roxo: ['#c48af5', '#8c42d6', '#55208f'],
};
const CORTE = [[21, 7], [43, 7], [57, 21], [57, 43], [43, 57], [21, 57], [7, 43], [7, 21]];
const MESA = CORTE.map(([x, y]) => [32 + (x - 32) * .58, 32 + (y - 32) * .58]);
function misturar(a, b, t) {
  const c = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [c(a), c(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
const pts = l => l.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');
function simboloJoia(cor) {
  const [claro, meio, escuro] = JOIAS[cor];
  const facetas = CORTE.map((a, i) => {
    const b = CORTE[(i + 1) % CORTE.length];
    // Normal da aresta contra a luz de cima à esquerda, em três tons.
    const nx = (a[0] + b[0]) / 2 - 32, ny = (a[1] + b[1]) / 2 - 32, m = Math.hypot(nx, ny);
    const d = (nx * -.6 + ny * -.8) / m;
    const fill = d > .3 ? claro : d < -.3 ? escuro : meio;
    return `<polygon points="${pts([a, b, MESA[(i + 1) % CORTE.length], MESA[i]])}" fill="${fill}"/>`;
  }).join('');
  return `<symbol id="cml-${cor}" viewBox="0 0 64 64">${facetas}`
    + `<polygon points="${pts(MESA)}" fill="${misturar(meio, claro, .3)}"/>`
    + `<polygon points="${pts(CORTE)}" fill="none" stroke="${escuro}" stroke-width="2.5" stroke-linejoin="round"/></symbol>`;
}
// Quadrantes do curinga nas cores da turma.
const quarto = (k, r) => {
  const a0 = (k * 90 - 90) * Math.PI / 180, a1 = a0 + Math.PI / 2;
  return `M32 32L${(32 + r * Math.cos(a0)).toFixed(2)} ${(32 + r * Math.sin(a0)).toFixed(2)}A${r} ${r} 0 0 1 ${(32 + r * Math.cos(a1)).toFixed(2)} ${(32 + r * Math.sin(a1)).toFixed(2)}Z`;
};
// Folha em coração com a ponta no centro; o trevo gira ela quatro vezes.
const folha = giro => `<path transform="rotate(${giro} 32 32)" d="M32 31C25 26 22 18 26 15c3-2 6 0 6 3 0-3 3-5 6-3 4 3 1 11-6 16z" fill="#3cbf62" stroke="#0b4020" stroke-width="1.5" stroke-linejoin="round"/>`;
const ESPECIAIS = {
  // Curinga: as quatro cores da turma num círculo, com uma estrela branca no meio.
  curinga: '<symbol id="cml-curinga" viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="#f0bf4f" stroke="#8a5a16" stroke-width="2.5"/>'
    + Object.values(JOIAS).map(([, meio], k) => `<path d="${quarto(k, 21)}" fill="${meio}"/>`).join('')
    + '<path d="M32 15l4 13 13 4-13 4-4 13-4-13-13-4 13-4z" fill="#fff" stroke="#2a1236" stroke-width="1.5" stroke-linejoin="round"/></symbol>',
  // Medalha: duas divisas pra cima, centradas no círculo (sobe o nível).
  nivel: '<symbol id="cml-nivel" viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="#f0bf4f" stroke="#8a5a16" stroke-width="2.5"/><circle cx="32" cy="32" r="20" fill="#d99a2b"/>'
    + '<path d="M21 31 32 20 43 31M21 43 32 32 43 43" fill="none" stroke="#6b4210" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'
    + '<path d="M21 31 32 20 43 31M21 43 32 32 43 43" fill="none" stroke="#fff6d8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></symbol>',
  // Bomba: esfera de ferro com o pavio aceso (a faísca pisca pelo CSS).
  bomba: '<symbol id="cml-bomba" viewBox="0 0 64 64"><circle cx="30" cy="36" r="21" fill="#2e313a" stroke="#0b0c10" stroke-width="2.5"/><circle cx="23" cy="29" r="5" fill="#4b4f5b"/>'
    + '<rect x="36" y="12" width="12" height="9" rx="2" fill="#7d8596" stroke="#0b0c10" stroke-width="2" transform="rotate(40 42 16)"/><path d="M46 12c3-6 8-7 11-4" fill="none" stroke="#c99a5c" stroke-width="3" stroke-linecap="round"/>'
    + '<g class="cml-faisca"><path d="M57 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ffc83d"/></g></symbol>',
  // Trevo: quatro folhas numa moeda.
  trevo: '<symbol id="cml-trevo" viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="#f0bf4f" stroke="#8a5a16" stroke-width="2.5"/><circle cx="32" cy="32" r="21" fill="#173f27"/>'
    + [0, 90, 180, 270].map(folha).join('') + '<circle cx="32" cy="32" r="2.5" fill="#0b4020"/></symbol>',
  // Troca (só na legenda e na etiqueta): duas setas trocando de lugar.
  troca: '<symbol id="cml-troca" viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="#f0bf4f" stroke="#8a5a16" stroke-width="2.5"/>'
    + '<path d="M18 26h26m-7-7 7 7-7 7M46 38H20m7-7-7 7 7 7" fill="none" stroke="#3a1f00" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>',
};
function instalarDesenhos() {
  if (document.querySelector('#cml-desenhos')) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'cml-desenhos';
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  svg.innerHTML = '<defs>' + Object.keys(JOIAS).map(simboloJoia).join('') + Object.values(ESPECIAIS).join('') + '</defs>';
  document.body.prepend(svg);
}
const usar = (id, classe = '') => `<svg class="cml-svg ${classe}" viewBox="0 0 64 64" aria-hidden="true"><use href="#cml-${id}"/></svg>`;
const desenho = s => usar(s.t === 'gema' ? s.cor : s.t);
// Sem foto: um bonequinho na cor do amigo.
const rosto = cor => `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" fill="#1a0b22"/><circle cx="20" cy="16" r="8" fill="${COR_HEX[cor]}"/><path d="M5 40c2-10 8-14 15-14s13 4 15 14Z" fill="${COR_HEX[cor]}"/><circle cx="17" cy="15" r="1.4" fill="#1a0b22"/><circle cx="23" cy="15" r="1.4" fill="#1a0b22"/><path d="M17 19q3 2 6 0" stroke="#1a0b22" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`;

export function configurarComilanca({ socket, appState, showToast }) {
  instalarDesenhos();
  const palco = document.querySelector('#mesa-21');
  const titulo = document.querySelector('#titulo-21');
  const jogo = document.querySelector('#jogo-comilanca');
  const $ = s => jogo.querySelector(s);
  const grade = $('.comilanca-grade'), aviso = $('.comilanca-aviso'), caixa = $('.comilanca-caixa');
  const status = document.querySelector('.salao-cartao[data-jogo="comilanca"] .salao-status');
  document.querySelector('.salao-arte-comilanca').innerHTML = usar('vermelho', 'arte-joia') + usar('curinga', 'arte-joia')
    + `<span class="arte-amigo" style="--cor:${COR_HEX.roxo}">${rosto('roxo')}</span>` + usar('verde', 'arte-joia') + usar('azul', 'arte-joia');

  let aba = palco.dataset.jogo;
  let carteira = null, iAposta = 1, turbo = false, rodando = false, exemploRodando = false, auto = 0, pular = null;
  let niveis = Object.fromEntries(CORES.map(c => [c, 0]));
  const historico = [];
  const ativo = () => !palco.hidden && aba === 'comilanca';
  const tocar = criarSons(appState, ativo);
  const aposta = () => APOSTAS[iAposta];
  const comConta = () => Boolean(appState.myUser?.accountId);
  const reduzido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Animação pela API (e não keyframe CSS): o app pausa as animações CSS com a janela em
  // segundo plano, e uma entrada pausada no começo deixaria a peça invisível.
  const animar = (el, quadros, opcoes) => (reduzido() || !el.animate ? null : el.animate(quadros, opcoes));
  status.textContent = 'Solo · aposta de 5 a 100';

  // ---------- Carteira (a mesma de todas as atividades) ----------
  function novaCarteira(c) {
    carteira = c;
    window.dispatchEvent(new CustomEvent('teletela-carteira', { detail: { carteira: c, de: 'comilanca' } }));
  }
  window.addEventListener('teletela-carteira', ev => {
    if (ev.detail.de === 'comilanca') return;
    carteira = ev.detail.carteira;
    if (ativo() && !rodando) desenharControles();
  });
  window.addEventListener('teletela-aba-jogo', ev => {
    aba = ev.detail.jogo;
    if (!ativo()) { auto = 0; fecharAuto(); return; }
    titulo.textContent = 'Comilança';
    if (comConta()) socket.timeout(6000).emit('comilanca', { acao: 'ver' }, (erro, r) => { if (!erro && r?.carteira) novaCarteira(r.carteira); desenharControles(); });
    desenharControles();
    if (!pecas.size) exemplo();
  });

  // ---------- Turma e legenda ----------
  function desenharTurma() {
    $('.comilanca-turma').innerHTML = CORES.map(cor => {
      const n = niveis[cor];
      return `<li data-cor="${cor}" style="--cor:${COR_HEX[cor]}"><span class="foto">${rosto(cor)}</span>`
        + `<span class="dados"><b>${TURMA[cor]}</b><span class="pips" role="img" aria-label="Nível ${n + 1} de ${VALOR_BASE.length}">${VALOR_BASE.map((_, i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`
        + `<small>${fmt(VALOR_BASE[n] * ESCALA * aposta())} por pedra</small></span></li>`;
    }).join('');
  }
  $('.comilanca-legenda').innerHTML = [
    [usar('vermelho') + usar('azul'), '<b>Pedras</b>: cada uma é de um amigo, e só ele come.'],
    [usar('curinga'), '<b>Curinga</b>: qualquer um come, vale como pedra da cor dele.'],
    [usar('nivel'), '<b>Medalha</b>: quem comer sobe um nível, e as pedras da cor dele passam a valer mais.'],
    [usar('bomba'), '<b>Bomba</b>: a grade cresce uma casa, até 8×8.'],
    [usar('troca'), '<b>Troca</b>: se ninguém mais tem o que comer, dois amigos encostados trocam de lugar quando isso deixa um deles continuar.'],
    [usar('trevo'), '<b>Trevo</b>: 3 ou mais no fim dão 6 giros grátis, que guardam o tamanho e os níveis.'],
  ].map(([s, t]) => `<li><span class="icones">${s}</span><span>${t}</span></li>`).join('');

  function desenharControles() {
    const saldo = carteira?.saldo;
    const semCoins = comConta() && saldo != null && saldo < aposta();
    $('.comilanca-aposta b').textContent = aposta();
    $('[data-aposta="-1"]').disabled = rodando || auto > 0 || iAposta === 0;
    $('[data-aposta="1"]').disabled = rodando || auto > 0 || iAposta === APOSTAS.length - 1;
    const girar = $('.comilanca-girar');
    girar.classList.toggle('parar', auto > 0);
    girar.disabled = auto > 0 ? false : rodando || exemploRodando || !comConta() || semCoins;
    girar.textContent = auto > 0 ? `Parar · ${auto}` : semCoins && !rodando ? 'Sem coins' : 'Girar';
    $('.comilanca-auto-botao').disabled = auto > 0 || rodando || exemploRodando || !comConta() || semCoins;
    $('.comilanca-aviso-conta').textContent = comConta() ? '' : 'Entre na sua conta pra jogar valendo coins.';
  }

  // ---------- A grade ----------
  const pecas = new Map(); // "x,y" -> elemento
  let amigosEl = [], lado = 6;
  const tempo = ms => (turbo ? ms * TURBO : ms);
  const espera = ms => new Promise(r => setTimeout(r, tempo(ms)));
  const posicionar = (el, x, y) => { el.style.setProperty('--x', x); el.style.setProperty('--y', y); };
  function criarPeca(s, x, y, deCima) {
    const el = document.createElement('div');
    el.className = 'comilanca-peca ' + s.t;
    el.innerHTML = desenho(s);
    posicionar(el, x, deCima);
    grade.append(el);
    requestAnimationFrame(() => requestAnimationFrame(() => posicionar(el, x, y)));
    return el;
  }
  // Grade inteira. Na avalanche ("novas"), as peças que sobraram descem na ordem da
  // coluna e as novas caem de cima, como no motor.
  function desenharGrade(g, novas = null) {
    const novasSet = new Set((novas || []).map(([x, y]) => x + ',' + y));
    if (!novas) { for (const el of pecas.values()) el.remove(); pecas.clear(); }
    const nova = new Map();
    for (let x = 0; x < lado; x++) {
      const velhas = [...pecas].filter(([k]) => Number(k.split(',')[0]) === x)
        .map(([k, el]) => [Number(k.split(',')[1]), el]).sort((a, b) => a[0] - b[0]);
      let k = 0, topo = -[...novasSet].filter(c => Number(c.split(',')[0]) === x).length;
      for (let y = 0; y < lado; y++) {
        const s = g[y][x];
        if (!s) continue;
        let el;
        if (novas && !novasSet.has(x + ',' + y) && k < velhas.length) { el = velhas[k++][1]; posicionar(el, x, y); }
        else el = criarPeca(s, x, y, novas ? topo++ : -1 - (lado - y) - x * .3);
        nova.set(x + ',' + y, el);
      }
      for (; k < velhas.length; k++) velhas[k][1].remove();
    }
    pecas.clear();
    for (const [k, el] of nova) pecas.set(k, el);
  }
  const mudarLado = n => { lado = n; grade.style.setProperty('--n', n); };
  const centro = (x, y) => [((x + .5) / lado * 100) + '%', ((y + .5) / lado * 100) + '%'];
  function voar(texto, x, y) {
    const v = document.createElement('div');
    v.className = 'comilanca-voa'; v.textContent = texto;
    [v.style.left, v.style.top] = centro(x, y);
    grade.append(v);
    const a = animar(v, [{ transform: 'translate(-50%, -50%) scale(.8)', opacity: 0 }, { transform: 'translate(-50%, -80%) scale(1.05)', opacity: 1, offset: .2 }, { transform: 'translate(-50%, -210%) scale(1)', opacity: 0 }], { duration: tempo(900), easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' });
    setTimeout(() => v.remove(), a ? tempo(950) : 700);
  }
  // Faíscas da cor da pedra comida, pra cada mordida ter peso.
  function faiscas(x, y, cor, n = 6) {
    if (reduzido()) return;
    const [l, t] = centro(x, y);
    for (let i = 0; i < n; i++) {
      const f = document.createElement('i');
      f.className = 'comilanca-faisca'; f.style.left = l; f.style.top = t; f.style.background = cor;
      grade.append(f);
      const a = (i / n) * Math.PI * 2 + Math.random() * .6, d = 180 + Math.random() * 220;
      f.animate([{ transform: 'translate(-50%, -50%) rotate(45deg) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}%), calc(-50% + ${Math.sin(a) * d}%)) rotate(45deg) scale(0)`, opacity: .2 }],
      { duration: tempo(520), easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }).onfinish = () => f.remove();
    }
  }
  function mostrarAviso(forte, texto, ms) {
    aviso.querySelector('strong').textContent = forte;
    aviso.querySelector('span').textContent = texto;
    aviso.hidden = false;
    animar(aviso.firstElementChild, [{ transform: 'scale(.85)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    return espera(ms).then(() => { aviso.hidden = true; });
  }
  // Etiqueta curta em cima da grade (nível, curinga, grade maior).
  function etiqueta(texto, cor = '#f0bf4f') {
    const e = document.createElement('div');
    e.className = 'comilanca-etiqueta'; e.textContent = texto; e.style.setProperty('--cor', cor);
    caixa.append(e);
    const dura = tempo(RITMO.destaque * 1.5);
    animar(e, [{ transform: 'translate(-50%, 30%) scale(.9)', opacity: 0 }, { transform: 'translate(-50%, 0) scale(1)', opacity: 1, offset: .15 }, { transform: 'translate(-50%, 0) scale(1)', opacity: 1, offset: .8 }, { transform: 'translate(-50%, -40%) scale(.98)', opacity: 0 }], { duration: dura, easing: 'ease-out', fill: 'forwards' });
    setTimeout(() => e.remove(), dura);
  }
  // Especial comido: escurece a grade, a peça cresce com um anel de luz e o jogo respira.
  async function destacar(peca, x, y, cor) {
    grade.classList.add('foco');
    if (peca) {
      peca.classList.add('em-foco');
      animar(peca, [{ scale: 1 }, { scale: 1.6, offset: .4 }, { scale: 1.45, opacity: 1, offset: .75 }, { scale: 1.9, opacity: 0 }], { duration: tempo(RITMO.destaque), easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' });
    }
    const anel = document.createElement('i');
    anel.className = 'comilanca-anel'; anel.style.setProperty('--cor', cor);
    [anel.style.left, anel.style.top] = centro(x, y);
    grade.append(anel);
    const a = animar(anel, [{ transform: 'translate(-50%, -50%) scale(.4)', opacity: 1 }, { transform: 'translate(-50%, -50%) scale(2.6)', opacity: 0 }], { duration: tempo(RITMO.destaque * .8), easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    if (a) a.onfinish = () => anel.remove(); else anel.remove();
    faiscas(x, y, cor, 10);
    await espera(RITMO.destaque);
    grade.classList.remove('foco');
    peca?.remove();
  }

  // ---------- Animar uma rodada do motor ----------
  async function tocarRodada(r, acumulado, comSom = true) {
    let corrente = 0, total = 0;
    const som = (...a) => { if (comSom) tocar.tom(...a); };
    for (const ev of r.eventos) {
      if (ev.t === 'inicio') {
        mudarLado(ev.lado); niveis = { ...ev.niveis }; desenharTurma();
        for (const el of amigosEl) el.remove();
        desenharGrade(ev.grade);
        await espera(RITMO.entrada);
        amigosEl = ev.amigos.map((a, i) => {
          const el = document.createElement('div');
          el.className = 'comilanca-amigo';
          el.style.setProperty('--cor', COR_HEX[a.cor]);
          el.innerHTML = `<div class="rosto">${rosto(a.cor)}</div>`;
          posicionar(el, a.x, a.y);
          grade.append(el);
          animar(el.firstElementChild, [{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 320, delay: tempo(i * 70), easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards' });
          return el;
        });
        som([[523, 0], [659, .07], [784, .14]], { dura: .14, volume: .05 });
        await espera(RITMO.entrada * .8);
      } else if (ev.t === 'comer') {
        const el = amigosEl[ev.amigo], cor = COR_HEX[r.eventos[0].amigos[ev.amigo].cor];
        posicionar(el, ...ev.para);
        el.classList.remove('comendo'); void el.offsetWidth; el.classList.add('comendo');
        const chave = ev.para.join(','), p = pecas.get(chave);
        pecas.delete(chave);
        corrente++;
        if (ev.valor) {
          total = ev.total;
          voar('+' + fmt(ev.valor), ...ev.para);
          $('.comilanca-ganho').textContent = fmt(acumulado + ev.total);
          som([[392 * 2 ** (Math.min(corrente, 24) / 12), 0]], { onda: 'sine', dura: .12, volume: .08 });
        }
        if (['nivel', 'bomba', 'curinga'].includes(ev.simbolo.t)) {
          som([[523, 0], [784, .08], [1047, .16]], { onda: 'triangle', dura: .3, volume: .08 });
          if (ev.simbolo.t === 'curinga') etiqueta('Curinga!', cor);
          await destacar(p, ...ev.para, cor);
          continue;
        }
        if (p) {
          const a = animar(p, [{ scale: 1, opacity: 1 }, { scale: 1.35, opacity: 0 }], { duration: tempo(240), easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' });
          setTimeout(() => p.remove(), a ? tempo(250) : 0);
        }
        faiscas(...ev.para, cor);
        await espera(RITMO.comer);
      } else if (ev.t === 'nivel') {
        niveis[ev.cor] = ev.nivel; desenharTurma();
        const li = $(`.comilanca-turma li[data-cor="${ev.cor}"]`);
        li?.classList.add('subiu'); setTimeout(() => li?.classList.remove('subiu'), tempo(1200));
        if (li) animar(li, [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(0.77, 0, 0.175, 1)' });
        etiqueta(`${TURMA[ev.cor]} no nível ${ev.nivel + 1}`, COR_HEX[ev.cor]);
        som([[660, 0], [880, .08], [1175, .16], [1568, .26]], { onda: 'sine', dura: .22, volume: .07 });
        await espera(RITMO.destaque * .6);
      } else if (ev.t === 'crescer') {
        if (comSom) tocar('bater', 0, .55);
        animar(caixa, [{ transform: 'translate(0, 0)' }, { transform: 'translate(-6px, 3px)' }, { transform: 'translate(5px, -4px)' }, { transform: 'translate(-3px, 2px)' }, { transform: 'translate(0, 0)' }], { duration: 380, easing: 'ease-out' });
        grade.classList.add('clarao'); setTimeout(() => grade.classList.remove('clarao'), 260);
        mudarLado(ev.lado);
        etiqueta(`Grade ${ev.lado}×${ev.lado}`);
        await espera(RITMO.destaque * .8);
      } else if (ev.t === 'trocar') {
        // Os dois trocam devagar, por cima das pedras, e a comilança continua.
        const [i, j] = ev.amigos.map(k => amigosEl[k]);
        for (const el of [i, j]) el.classList.add('trocando');
        posicionar(i, ...ev.posicoes[0]); posicionar(j, ...ev.posicoes[1]);
        etiqueta('Troca!');
        som([[587, 0], [440, .1], [587, .2]], { onda: 'triangle', dura: .16, volume: .07 });
        await espera(RITMO.destaque * .8);
        for (const el of [i, j]) el.classList.remove('trocando');
      } else if (ev.t === 'avalanche') {
        corrente = 0;
        desenharGrade(ev.grade, ev.novas);
        som([[196, 0], [175, .06]], { onda: 'sine', dura: .12, volume: .06 });
        await espera(RITMO.avalanche);
      } else if (ev.t === 'fim' && ev.trevos >= 3 && comSom) {
        // Os trevos acendem antes do aviso, pra ficar claro de onde vieram os giros.
        for (const el of pecas.values()) if (el.classList.contains('trevo')) {
          el.classList.add('aceso');
          animar(el, [{ scale: 1 }, { scale: 1.3 }, { scale: 1 }], { duration: 700, iterations: 2, easing: 'cubic-bezier(0.77, 0, 0.175, 1)' });
        }
        som([[523, 0], [659, .1], [784, .2], [1047, .3], [1319, .42]], { dura: .32, volume: .08 });
        await espera(1300);
        await mostrarAviso(ev.giros + ' giros grátis', ev.trevos + ' trevos na grade', 1800);
      }
    }
    return total;
  }

  // ---------- Big win / Mega win / Ultra win ----------
  // O contador sobe e a faixa troca quando passa de cada marca; tocar ou espaço pula pro fim.
  function celebrar(premio) {
    const alcance = FAIXAS.filter(([m]) => premio / aposta() >= m);
    if (!alcance.length) return Promise.resolve();
    const painel = $('.comilanca-vitoria'), faixa = $('.comilanca-faixa'), contador = $('.comilanca-contador');
    const duracao = [0, 3000, 4800, 6800][alcance.length] * (turbo ? .5 : 1) * (auto > 0 ? .6 : 1);
    painel.hidden = false;
    painel.dataset.faixa = '0';
    faixa.textContent = alcance[0][1];
    contador.textContent = '0';
    animar(painel.lastElementChild, [{ transform: 'scale(.9)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    tocar('pote', 0, .6);
    return new Promise(resolve => {
      const inicio = performance.now();
      let mostrada = 0, ultimoTique = 0, acabou = false;
      const trocar = k => {
        mostrada = k;
        painel.dataset.faixa = String(k);
        faixa.textContent = alcance[k][1];
        animar(faixa, [{ transform: 'scale(1.5)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
        tocar.tom([[523, 0], [659, .08], [784, .16], [1047, .24]], { dura: .3, volume: .09 });
      };
      const fim = () => {
        if (acabou) return;
        acabou = true;
        clearInterval(passo); clearInterval(chuva);
        contador.textContent = inteiro(premio);
        if (mostrada < alcance.length - 1) trocar(alcance.length - 1);
        tocar.tom([[784, 0], [988, .1], [1175, .2], [1568, .32]], { dura: .5, volume: .09 });
        pular = null;
        setTimeout(() => {
          const a = animar(painel, [{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-out' });
          setTimeout(() => { painel.hidden = true; resolve(); }, a ? 260 : 0);
        }, tempo(1600));
      };
      const chuva = setInterval(() => moeda(painel), 110);
      // setInterval e não requestAnimationFrame: em segundo plano o rAF para e o giro travaria.
      const passo = setInterval(() => {
        const t = Math.min(1, (performance.now() - inicio) / duracao);
        const v = premio * (1 - (1 - t) ** 3);
        contador.textContent = inteiro(v);
        const k = alcance.findLastIndex(([m]) => v / aposta() >= m);
        if (k > mostrada) trocar(k);
        if (performance.now() - ultimoTique > 110) { ultimoTique = performance.now(); tocar.tom([[600 + 500 * t, 0]], { onda: 'square', dura: .04, volume: .025 }); }
        if (t >= 1) fim();
      }, 40);
      pular = fim;
    });
  }
  function moeda(painel) {
    if (reduzido()) return;
    const m = document.createElement('i');
    m.className = 'comilanca-moeda';
    m.style.left = (5 + Math.random() * 90) + '%';
    painel.append(m);
    const giro = (Math.random() - .5) * 720, queda = 900 + Math.random() * 300;
    m.animate([{ transform: 'translateY(0) rotate(0deg)', opacity: 1 }, { transform: `translateY(${queda * .85}%) rotate(${giro * .85}deg)`, opacity: 1, offset: .85 }, { transform: `translateY(${queda}%) rotate(${giro}deg)`, opacity: 0 }],
      { duration: 1500 + Math.random() * 700, easing: 'cubic-bezier(.45, 0, .9, .55)' }).onfinish = () => m.remove();
  }
  $('.comilanca-vitoria').addEventListener('click', () => pular?.());

  // Abre com uma grade de exemplo (sem tocar nada nem valer coins), pra mostrar o jogo.
  async function exemplo() {
    exemploRodando = true;
    desenharControles();
    const turboAntes = turbo; turbo = true;
    await tocarRodada(criarMotor().rodada(aposta()), 0, false);
    turbo = turboAntes;
    $('.comilanca-ganho').textContent = '0';
    exemploRodando = false;
    desenharControles();
  }

  // Um giro pago. Devolve true se deu certo (o auto continua) e false se parou.
  async function girar() {
    if (rodando || exemploRodando || !comConta()) return false;
    rodando = true; desenharControles();
    tocar.precarregar();
    const r = await new Promise(resolve => socket.timeout(8000).emit('comilanca', { acao: 'girar', aposta: aposta() },
      (erro, x) => resolve(erro ? { erro: 'O servidor não respondeu.' } : x || {})));
    if (r.erro) {
      showToast(r.erro, 'error'); tocar('bater', 0, .25);
      if (r.carteira) novaCarteira(r.carteira);
      rodando = false; desenharControles();
      return false;
    }
    // A aposta já saiu: mostra o saldo sem o prêmio enquanto a turma come.
    novaCarteira({ ...r.carteira, saldo: r.carteira.saldo - r.premio });
    $('.comilanca-ganho').textContent = '0';
    let total = await tocarRodada(r.jogada.base, 0);
    const giros = $('.comilanca-giros');
    for (const [i, rodada] of r.jogada.bonus.entries()) {
      giros.hidden = false; giros.textContent = `Giro grátis ${i + 1} de ${r.jogada.bonus.length}`;
      await espera(RITMO.entreGiros);
      total += await tocarRodada(rodada, total);
    }
    giros.hidden = true;
    $('.comilanca-ganho').textContent = inteiro(r.premio);
    if (r.premio / aposta() >= FAIXAS[0][0]) await celebrar(r.premio);
    else if (r.premio >= aposta()) {
      tocar('fichas', 0, .4);
      animar($('.comilanca-placar'), [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    }
    novaCarteira(r.carteira);
    historico.unshift(r.premio);
    $('.comilanca-historico').innerHTML = historico.slice(0, 14)
      .map(v => `<span class="${v >= aposta() ? 'bom' : ''}">${v ? '+' + inteiro(v) : '0'}</span>`).join('');
    rodando = false; desenharControles();
    return true;
  }

  // Giros automáticos: gira N vezes seguidas, gastando da carteira; para sem coins,
  // com erro, saindo da Comilança ou no botão Parar.
  const menuAuto = $('.comilanca-auto-menu'), botaoAuto = $('.comilanca-auto-botao');
  function fecharAuto() { menuAuto.hidden = true; botaoAuto.setAttribute('aria-expanded', 'false'); }
  async function girarAuto(n) {
    fecharAuto();
    auto = n; desenharControles();
    while (auto > 0 && ativo()) {
      const ok = await girar();
      if (!ok) break;
      if (auto > 0) auto--;
      desenharControles();
      if (auto > 0) await espera(450);
    }
    auto = 0; desenharControles();
  }
  botaoAuto.addEventListener('click', () => {
    const abrir = menuAuto.hidden;
    menuAuto.hidden = !abrir; botaoAuto.setAttribute('aria-expanded', String(abrir));
    if (abrir) menuAuto.querySelector('button')?.focus();
  });
  menuAuto.addEventListener('click', e => { const b = e.target.closest('[data-auto]'); if (b) girarAuto(Number(b.dataset.auto)); });
  document.addEventListener('click', e => { if (!menuAuto.hidden && !e.target.closest('.comilanca-auto')) fecharAuto(); });
  jogo.addEventListener('keydown', e => { if (e.key === 'Escape' && !menuAuto.hidden) { fecharAuto(); botaoAuto.focus(); } });

  // ---------- Botões ----------
  $('.comilanca-girar').addEventListener('click', () => {
    if (auto > 0) { auto = 0; desenharControles(); return; }
    girar();
  });
  jogo.addEventListener('click', ev => {
    const b = ev.target.closest('[data-aposta]');
    if (!b || b.disabled) return;
    iAposta = Math.max(0, Math.min(APOSTAS.length - 1, iAposta + Number(b.dataset.aposta)));
    desenharControles(); desenharTurma();
  });
  $('.comilanca-turbo').addEventListener('click', e => {
    turbo = !turbo;
    e.currentTarget.setAttribute('aria-pressed', String(turbo));
    grade.classList.toggle('turbo', turbo);
  });
  // Espaço: pula a comemoração, para o auto ou gira (com o foco fora de um campo de texto).
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space' || !ativo() || e.target.closest('input, textarea, [contenteditable="true"], button, summary')) return;
    e.preventDefault();
    if (pular) pular();
    else if (auto > 0) { auto = 0; desenharControles(); }
    else girar();
  });

  desenharTurma(); desenharControles();
}
