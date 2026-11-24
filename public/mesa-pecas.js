// Peças das mesas (21 e poker): carta com frente e verso, fichas empilhadas, rosto
// de quem está na call e fichas voando de um ponto a outro do feltro.
export const FICHAS = [[100, 'preta'], [50, 'verde'], [25, 'roxa'], [10, 'azul'], [5, 'vermelha']];
export const COR_FICHA = Object.fromEntries(FICHAS);
export const soma = lista => lista.reduce((a, b) => a + b, 0);
export const numero = n => n.toLocaleString('pt-BR');
export const semMovimento = matchMedia('(prefers-reduced-motion: reduce)');
// Troca um valor pelo menor número de fichas, da maior pra menor.
export function decompor(valor) {
  const pecas = [];
  let resto = valor;
  for (const [quanto] of FICHAS) while (resto >= quanto) { pecas.push(quanto); resto -= quanto; }
  return pecas;
}

const naipes = {
  '♠': ['spades', 'espadas'], '♥': ['hearts', 'copas'],
  '♦': ['diamonds', 'ouros'], '♣': ['clubs', 'paus']
};
const figuras = { A: ['ace', 'Ás'], J: ['jack', 'Valete'], Q: ['queen', 'Dama'], K: ['king', 'Rei'] };

// Cada carta tem frente e verso; virar é girar o miolo, não trocar a imagem.
export function cartaVisual(valorCarta) {
  const el = document.createElement('span');
  el.className = 'carta-21';
  const miolo = document.createElement('span');
  miolo.className = 'miolo-21';
  const verso = document.createElement('span');
  verso.className = 'verso-21';
  if (valorCarta) {
    const valor = valorCarta.slice(0, -1);
    const [naipe, nome] = naipes[valorCarta.slice(-1)];
    const [arquivo, rotulo] = figuras[valor] || [valor, valor];
    const img = document.createElement('img');
    img.className = 'frente-21';
    img.src = './baralho/' + arquivo + '_of_' + naipe + '.png';
    img.alt = rotulo + ' de ' + nome;
    img.draggable = false;
    miolo.append(img);
  } else {
    el.classList.add('coberta');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', 'Carta virada');
  }
  miolo.append(verso);
  el.append(miolo);
  return el;
}

// Fichas empilhadas em colunas, uma cor por coluna, como no cassino. Cada coluna é uma
// imagem pronta (public/fichas/<cor>-<n>.png, 1 a 10 fichas) com a lateral sombreada
// do pacote; empilhar fichas soltas mostraria a emenda de cada uma.
// Com a ordem (a pilha que alguém montou), usa as fichas que a pessoa pôs.
const ALTURA_FICHA = 30, DEGRAU_FICHA = 2;
export function colunaDeFichas(cor, n) {
  const el = document.createElement('span');
  el.className = 'pilha-21';
  el.dataset.cor = cor;
  el.style.backgroundImage = 'url(fichas/' + cor + '-' + n + '.png)';
  el.style.height = (ALTURA_FICHA + DEGRAU_FICHA * (n - 1)) + 'px';
  return el;
}
export function pilha(valor, rotulo, ordem) {
  const el = document.createElement('span');
  el.className = 'pilhas-21';
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', rotulo || numero(valor) + ' fichas');
  const fichas = ordem?.length ? ordem : decompor(valor);
  const colunas = [];
  for (const [quanto, cor] of FICHAS) {
    let n = fichas.filter(v => v === quanto).length;
    while (n > 0 && colunas.length < 8) { colunas.push(colunaDeFichas(cor, Math.min(10, n))); n -= 10; }
  }
  // Vaga de cada coluna no montinho do círculo de aposta (o CSS só usa lá).
  const vagas = VAGAS_MONTINHO.slice(0, colunas.length);
  const meio = (Math.min(...vagas.map(v => v[0])) + Math.max(...vagas.map(v => v[0]))) / 2;
  colunas.forEach((c, i) => {
    c.style.setProperty('--x', (vagas[i][0] - meio) + 'px');
    c.style.setProperty('--y', vagas[i][1] + 'px');
    c.style.zIndex = vagas[i][1] ? 1 : 2;
  });
  el.append(...colunas);
  return el;
}
// Favo de mel: fileira da frente de 24 em 24 px (as fichas têm 32, sobrepõem um pouco)
// e a de trás encaixada nos vãos, um pouco acima. Preenche a partir do meio.
const VAGAS_MONTINHO = [[0, 0], [24, 0], [12, -14], [-24, 0], [-12, -14], [48, 0], [36, -14], [-48, 0]];

// Um ponto da parábola: sai de (dx, dy) e chega em (0, 0), subindo `altura` no meio.
const arco = (dx, dy, altura, t) => `translate(${(dx * (1 - t)).toFixed(1)}px, ${(dy * (1 - t) - altura * 4 * t * (1 - t)).toFixed(1)}px)`;

// Uma pilha temporária atravessa a mesa de um ponto a outro em arco, como jogada,
// uma coluna de cada vez.
export function voarFichas(feltro, de, para, valor, atraso = 0, aoChegar) {
  if (!de || !para || !valor || semMovimento.matches || !de.isConnected || !para.isConnected) { aoChegar?.(); return; }
  const base = feltro.getBoundingClientRect();
  const a = de.getBoundingClientRect(), b = para.getBoundingClientRect();
  const el = pilha(valor);
  el.classList.add('voando-21');
  el.setAttribute('aria-hidden', 'true');
  el.style.left = (b.left - base.left + b.width / 2) + 'px';
  el.style.top = (b.top - base.top + b.height / 2) + 'px';
  feltro.append(el);
  const dx = a.left + a.width / 2 - (b.left + b.width / 2), dy = a.top + a.height / 2 - (b.top + b.height / 2);
  const altura = Math.min(90, 24 + Math.hypot(dx, dy) * .18);
  const quadros = [0, .2, .4, .6, .8, 1].map(t => ({ transform: arco(dx, dy, altura, t), opacity: t ? 1 : 0 }));
  const voos = [...el.children].map((coluna, i) =>
    coluna.animate(quadros, { duration: 620, delay: atraso + i * 70, easing: 'cubic-bezier(.3, .1, .3, 1)', fill: 'backwards' }).finished);
  Promise.all(voos).then(() => { el.remove(); aoChegar?.(); }, () => el.remove());
}

// Virada de jogo antigo: a carta achata até virar uma linha, troca a face e abre,
// em poucos quadros. Girar em 3D com perspectiva entortaria o pixel art.
export function virarRetro(carta, atraso = 0, duracao = 300) {
  const miolo = carta?.querySelector('.miolo-21');
  if (!miolo || semMovimento.matches) return;
  miolo.animate([
    { transform: 'rotateY(180deg) scaleX(1)', easing: 'steps(3, end)' },
    { transform: 'rotateY(180deg) scaleX(0)', offset: .5 },
    { transform: 'scaleX(0)', offset: .5, easing: 'steps(3, start)' },
    { transform: 'scaleX(1)' }
  ], { duration: duracao, delay: atraso, fill: 'backwards' });
}

// Embaralhar em riffle no monte: ele se divide em duas metades que vão pros lados e
// as cartas caem de volta intercaladas, uma de cada lado, em quadros (pixel art não
// desliza liso). Duas passadas. As cartas paradas do monte somem enquanto isso.
export function embaralharMonte(monte, passadas = 2) {
  if (!monte?.isConnected || semMovimento.matches || monte.querySelector('.embaralhando')) return;
  const bolo = document.createElement('div');
  bolo.className = 'embaralhando';
  const animacoes = [];
  for (let k = 0; k < 10; k++) {
    const lado = k % 2 ? 1 : -1, naMetade = k >> 1;
    const carta = document.createElement('span');
    carta.style.zIndex = k;
    bolo.append(carta);
    const cai = .3 + k * .05;
    animacoes.push(carta.animate([
      { transform: 'translate(0, 0)', offset: 0, easing: 'steps(3, end)' },
      { transform: `translate(${lado * 62}%, ${-naMetade}px)`, offset: .25 },
      { transform: `translate(${lado * 62}%, ${-naMetade}px)`, offset: cai, easing: 'steps(2, end)' },
      { transform: `translate(0, ${-Math.round(k / 3)}px)`, offset: cai + .04 },
      { transform: `translate(0, ${-Math.round(k / 3)}px)`, offset: .9, easing: 'steps(2, end)' },
      { transform: 'translate(0, 0)', offset: 1 }
    ], { duration: 1000, iterations: passadas }).finished);
  }
  monte.classList.add('embaralhando-monte');
  monte.append(bolo);
  const fim = () => { bolo.remove(); monte.classList.remove('embaralhando-monte'); };
  Promise.all(animacoes).then(fim, fim);
}

// Uma ficha cai de cima no topo da coluna da cor dela e dá um quique pequeno.
export function cairFicha(feltro, coluna) {
  if (!coluna || semMovimento.matches || !coluna.isConnected) return;
  const base = feltro.getBoundingClientRect(), c = coluna.getBoundingClientRect();
  const el = document.createElement('span');
  el.className = 'ficha-caindo';
  el.setAttribute('aria-hidden', 'true');
  el.style.backgroundImage = 'url(fichas/' + coluna.dataset.cor + '-1.png)';
  el.style.left = (c.left - base.left) + 'px';
  el.style.top = (c.top - base.top) + 'px';
  feltro.append(el);
  el.animate([
    { transform: 'translateY(-36px)', opacity: 0, easing: 'steps(4, end)' },
    { transform: 'translateY(0)', opacity: 1, offset: .65, easing: 'steps(2, end)' },
    { transform: 'translateY(-4px)', offset: .82, easing: 'steps(2, end)' },
    { transform: 'translateY(0)' }
  ], { duration: 280 }).finished.then(() => el.remove(), () => el.remove());
}

// Brilho em pixel em volta de quem ganhou: estrelinhas que acendem e somem em quadros.
export function brilhar(alvo, atraso = 0) {
  if (!alvo || semMovimento.matches || !alvo.isConnected) return;
  const lugares = [[-8, 18], [104, 6], [96, 82], [-4, 74], [50, -10]];
  lugares.forEach(([x, y], i) => {
    const estrela = document.createElement('span');
    estrela.className = 'brilho-pixel';
    estrela.setAttribute('aria-hidden', 'true');
    estrela.style.left = x + '%';
    estrela.style.top = y + '%';
    alvo.append(estrela);
    estrela.animate([
      { transform: 'scale(0)', opacity: 1 }, { transform: 'scale(2)', opacity: 1, offset: .4 }, { transform: 'scale(1)', opacity: 1, offset: .7 }, { transform: 'scale(0)', opacity: 0 }
    ], { duration: 720, delay: atraso + i * 110, easing: 'steps(4, end)', fill: 'backwards' })
      .finished.then(() => estrela.remove(), () => estrela.remove());
  });
}

export function rosto(id, nome, pessoaDaCall = () => null) {
  const el = document.createElement('span');
  el.className = 'rosto-21';
  const pessoa = id && pessoaDaCall(id);
  if (pessoa?.html) {
    el.innerHTML = pessoa.html;
    if (pessoa.cor) el.style.backgroundColor = pessoa.cor;
  } else el.textContent = (nome || '?').trim().slice(0, 2).toUpperCase();
  return el;
}

