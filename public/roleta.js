// Roleta no palco das Atividades, aberta pelo salão (salao.js). O servidor (roleta.js)
// guarda as apostas e sorteia; aqui a gente desenha o pano, gira a roda até o número
// que veio e toca os sons. A roda é public/roleta/roda.svg, com o 0 no topo.
import { criarSons, somDeFicha } from './sons-mesa.js';
import { FICHAS, numero, semMovimento, brilhar } from './mesa-pecas.js';

const RODA = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const VERMELHOS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const GIRO = 7000; // mesmo TEMPO_GIRO do servidor
const FATIA = 360 / RODA.length;
const corDe = n => n === 0 ? 'verde' : VERMELHOS.has(n) ? 'vermelho' : 'preto';
const NOME_COR = { verde: 'Verde', vermelho: 'Vermelho', preto: 'Preto' };
// Apostas de fora: [alvo, linha, coluna] na grade de 14 colunas do pano e o texto.
const FORA = [
  ['d1', 4, '2 / 6', '1ª 12'], ['d2', 4, '6 / 10', '2ª 12'], ['d3', 4, '10 / 14', '3ª 12'],
  ['baixo', 5, '2 / 4', '1–18'], ['par', 5, '4 / 6', 'Par'], ['vermelho', 5, '6 / 8', ''],
  ['preto', 5, '8 / 10', ''], ['impar', 5, '10 / 12', 'Ímpar'], ['alto', 5, '12 / 14', '19–36'],
  ['c3', 1, '14', '2:1'], ['c2', 2, '14', '2:1'], ['c1', 3, '14', '2:1'],
];
const NOME_ALVO = { d1: '1ª dúzia', d2: '2ª dúzia', d3: '3ª dúzia', baixo: '1 a 18', alto: '19 a 36', par: 'Par', impar: 'Ímpar', vermelho: 'Vermelho', preto: 'Preto', c1: '1ª coluna', c2: '2ª coluna', c3: '3ª coluna' };
const nomeAlvo = alvo => alvo[0] === 'n' ? 'Número ' + alvo.slice(1) : NOME_ALVO[alvo];

export function configurarRoleta({ socket, appState, showToast }) {
  const palco = document.querySelector('#mesa-21');
  const titulo = document.querySelector('#titulo-21');
  const jogo = document.querySelector('#jogo-roleta');
  const roda = jogo.querySelector('.roda-img');
  const orbita = jogo.querySelector('.bola-orbita');
  const bola = jogo.querySelector('.bola-roleta');
  const pano = jogo.querySelector('.pano-roleta');
  const historico = jogo.querySelector('.historico-roleta');
  const placar = jogo.querySelector('#placar-roleta');
  const aviso = jogo.querySelector('#aviso-roleta');
  const apostadores = jogo.querySelector('#apostadores-roleta');
  const fichasEl = jogo.querySelector('#fichas-roleta');
  const acoes = jogo.querySelector('#acoes-roleta');

  let aba = palco.dataset.jogo;
  let canal = null, mesa = null, carteira = null, recebidoEm = 0;
  let valor = 10;
  let anguloRoda = 0, anguloBola = 0, girouRodada = null, pagouRodada = null;
  const ativo = () => !palco.hidden && aba === 'roleta';
  const tocar = criarSons(appState, ativo);
  const comConta = () => Boolean(appState.myUser?.accountId);
  const minha = () => mesa?.apostas.find(a => a.id === socket.id);

  // ---------- O pano: 0, os 36 números em 3 linhas e as apostas de fora ----------
  function montarPano() {
    let h = '<button type="button" class="casa-roleta verde" data-alvo="n0" style="grid-row: 1 / 4; grid-column: 1">0</button>';
    for (let n = 1; n <= 36; n++) {
      const linha = 3 - ((n - 1) % 3), coluna = Math.ceil(n / 3) + 1;
      h += `<button type="button" class="casa-roleta ${corDe(n)}" data-alvo="n${n}" style="grid-row: ${linha}; grid-column: ${coluna}">${n}</button>`;
    }
    for (const [alvo, linha, coluna, texto] of FORA) {
      const conteudo = texto || `<span class="losango ${alvo}" aria-hidden="true"></span>`;
      h += `<button type="button" class="casa-roleta fora" data-alvo="${alvo}" style="grid-row: ${linha}; grid-column: ${coluna}">${conteudo}</button>`;
    }
    pano.innerHTML = h;
  }
  montarPano();

  // ---------- Conversa com o servidor ----------
  function pedir(acao, extra = {}) {
    if (!canal) return Promise.resolve({ erro: 'Entre num canal de voz.' });
    if (acao !== 'ver') tocar.precarregar();
    return new Promise(resolve => {
      socket.timeout(6000).emit('jogar-roleta', { canal, acao, rodada: mesa?.rodada, ...extra },
        (erro, r) => resolve(erro ? { erro: 'A mesa não respondeu.' } : r || {}));
    });
  }
  async function jogar(acao, extra) {
    const r = await pedir(acao, extra);
    if (r.mesa !== undefined) receber({ canal, ...r });
    if (r.erro) { showToast(r.erro, 'error'); tocar('bater', 0, .25); }
    return !r.erro;
  }
  function receber(dados) {
    if (!dados || dados.canal !== canal) return;
    mesa = dados.mesa;
    recebidoEm = performance.now();
    if (dados.carteira) novaCarteira(dados.carteira);
    if (ativo()) desenhar();
  }
  function novaCarteira(c) {
    carteira = c;
    window.dispatchEvent(new CustomEvent('teletela-carteira', { detail: { carteira: c, de: 'roleta' } }));
  }
  window.addEventListener('teletela-carteira', ev => {
    if (ev.detail.de === 'roleta') return;
    carteira = ev.detail.carteira;
    if (ativo()) desenharPainel();
  });
  socket.on('mesa-roleta', receber);

  function entrarNoCanal() {
    canal = appState.currentChannelId || null;
    mesa = null;
    if (canal) pedir('ver').then(r => { if (r.mesa !== undefined) receber({ canal, ...r }); });
  }
  window.addEventListener('teletela-call-joined', entrarNoCanal);
  window.addEventListener('teletela-call-left', entrarNoCanal);
  socket.on('connect', () => { if (appState.currentChannelId) entrarNoCanal(); });
  window.addEventListener('teletela-aba-jogo', ev => {
    aba = ev.detail.jogo;
    if (!ativo()) return;
    titulo.textContent = 'Roleta';
    if (canal !== appState.currentChannelId) entrarNoCanal();
    desenhar();
  });

  // ---------- Desenho ----------
  const restante = () => Math.max(0, (mesa?.restante ?? 0) - (performance.now() - recebidoEm));

  function desenhar() {
    desenharRoda();
    desenharPano();
    desenharPainel();
  }

  // A roda gira no sentido horário até o número ficar no topo; a bola corre ao contrário
  // e cai na casa. Ângulos acumulam, pra roda nunca voltar pra trás.
  function desenharRoda() {
    const girando = mesa?.fase === 'girando', resultado = mesa?.fase === 'resultado';
    jogo.dataset.fase = mesa?.fase || 'espera';
    if ((girando || resultado) && mesa.numero != null && girouRodada !== mesa.rodada) {
      girouRodada = mesa.rodada;
      const duracao = girando && !semMovimento.matches ? Math.max(0, restante()) : 0;
      const casa = RODA.indexOf(mesa.numero) * FATIA;
      const alvoRoda = ((-casa - anguloRoda) % 360 + 360) % 360;
      anguloRoda += (duracao > 1500 ? 360 * 4 : 0) + alvoRoda;
      anguloBola -= (duracao > 1500 ? 360 * 6 : 0) + ((anguloBola % 360) + 360) % 360;
      for (const el of [roda, orbita]) el.style.transitionDuration = duracao + 'ms';
      bola.style.transitionDelay = duracao * .55 + 'ms';
      bola.style.transitionDuration = duracao * .35 + 'ms';
      if (duracao) somDoGiro(duracao);
    }
    roda.style.transform = `rotate(${anguloRoda}deg)`;
    orbita.style.transform = `rotate(${anguloBola}deg)`;
    bola.classList.toggle('na-casa', girando || resultado);
    if (!girando && !resultado) bola.style.transitionDelay = '0ms';
  }
  // Tique da bola batendo nas casas: rápido no começo, espaçado no fim.
  function somDoGiro(duracao) {
    const notas = [];
    for (let k = 0; k < 36; k++) notas.push([1900 + (k % 2) * 150, duracao / 1000 * .92 * (1 - Math.cbrt(1 - k / 36))]);
    tocar.tom(notas, { onda: 'square', dura: .03, volume: .025 });
  }

  function desenharPano() {
    const porAlvo = new Map(), meus = new Set();
    for (const a of mesa?.apostas || []) {
      for (const [alvo, v] of a.fichas) {
        porAlvo.set(alvo, (porAlvo.get(alvo) || 0) + v);
        if (a.id === socket.id) meus.add(alvo);
      }
    }
    const aberto = comConta() && (!mesa || ['espera', 'apostando'].includes(mesa.fase));
    const venceu = mesa?.fase === 'resultado' ? mesa.numero : null;
    for (const casa of pano.children) {
      const alvo = casa.dataset.alvo, total = porAlvo.get(alvo) || 0;
      let marca = casa.querySelector('.marca-roleta');
      if (total && !marca) { marca = document.createElement('span'); marca.className = 'marca-roleta'; casa.append(marca); }
      if (!total && marca) marca.remove();
      if (marca) {
        // A ficha mostrada é a maior que cabe no total, com o total escrito nela.
        const cor = (FICHAS.find(([v]) => v <= total) || FICHAS.at(-1))[1];
        marca.dataset.cor = cor;
        marca.textContent = total >= 1000 ? Math.floor(total / 1000) + 'k' : total;
        marca.classList.toggle('minha', meus.has(alvo));
      }
      casa.classList.toggle('ganhou', venceu != null && ganha(alvo, venceu));
      casa.setAttribute('aria-disabled', aberto ? 'false' : 'true');
      casa.setAttribute('aria-label', nomeAlvo(alvo) + (total ? ', ' + numero(total) + ' coins' + (meus.has(alvo) ? ' (com fichas suas)' : '') : ''));
    }
    // Últimos números, o mais novo primeiro.
    historico.innerHTML = (mesa?.historico || []).map(n => `<li class="${corDe(n)}">${n}</li>`).join('');
    historico.hidden = !mesa?.historico?.length;
  }
  function ganha(alvo, n) {
    if (alvo[0] === 'n') return Number(alvo.slice(1)) === n;
    if (n === 0) return false;
    return { vermelho: VERMELHOS.has(n), preto: !VERMELHOS.has(n), par: n % 2 === 0, impar: n % 2 === 1, baixo: n <= 18, alto: n >= 19,
      d1: n <= 12, d2: n > 12 && n <= 24, d3: n > 24, c1: n % 3 === 1, c2: n % 3 === 2, c3: n % 3 === 0 }[alvo];
  }

  let contagem = 0;
  function desenharPainel() {
    clearInterval(contagem);
    const eu = minha();
    const fase = mesa?.fase || 'espera';
    const saldo = carteira?.saldo;
    for (const b of fichasEl.querySelectorAll('button')) {
      const v = Number(b.dataset.valor);
      b.setAttribute('aria-pressed', String(v === valor));
      b.disabled = !comConta() || (saldo != null && saldo < v);
    }
    const abertas = fase === 'espera' || fase === 'apostando';
    fichasEl.hidden = !comConta() || !abertas;
    acoes.hidden = !comConta() || fase !== 'apostando' || !eu?.fichas.length;
    acoes.querySelector('[data-acao="pronto"]').disabled = Boolean(eu?.pronto);
    acoes.querySelector('[data-acao="pronto"]').firstChild.textContent = eu?.pronto ? 'Pronto ✓' : 'Pronto';

    // Quem está apostando e quanto; no resultado, quanto cada um levou.
    apostadores.innerHTML = (mesa?.apostas || []).map(a => {
      const extra = fase === 'resultado' ? (a.ganho ? ` <b class="ganho">+${numero(a.ganho)}</b>` : ' <span>perdeu</span>') : a.pronto ? ' <span>pronto</span>' : '';
      return `<span class="apostador"><strong>${escapar(a.nome)}</strong> ${numero(a.total)}${extra}</span>`;
    }).join('');

    // Placar no meio do pano.
    placar.hidden = fase !== 'resultado';
    if (fase === 'resultado') {
      const n = mesa.numero, cor = corDe(n);
      placar.dataset.cor = cor;
      placar.querySelector('strong').textContent = `${n} · ${NOME_COR[cor]}`;
      placar.querySelector('span').textContent = !eu ? '' : eu.ganho ? `Você levou ${numero(eu.ganho)} coins` : `Não foi dessa vez (${numero(eu.total)})`;
      placar.dataset.tom = eu?.ganho ? 'ganhou' : eu ? 'perdeu' : '';
      if (pagouRodada !== mesa.rodada) {
        pagouRodada = mesa.rodada;
        if (eu?.ganho) { tocar('pote', 0, .6); brilhar(placar); }
      }
    }

    const texto = () => {
      if (!comConta()) return 'Entre na sua conta pra apostar. Dá pra assistir a roda daqui.';
      if (fase === 'espera') return 'Escolha a ficha e toque no pano. A primeira ficha abre 25 s de apostas pra call.';
      if (fase === 'apostando') return `Apostas abertas: ${Math.ceil(restante() / 1000)} s. ` + (eu?.fichas.length ? `Você pôs ${numero(eu.total)} coins.` : 'Toque no pano pra entrar.');
      if (fase === 'girando') return 'A roda está girando… apostas fechadas.';
      return 'Próxima rodada já já.';
    };
    aviso.textContent = texto();
    if (fase === 'apostando') contagem = setInterval(() => { if (ativo()) aviso.textContent = texto(); }, 500);
  }
  const escapar = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- Cliques ----------
  pano.addEventListener('click', async ev => {
    const casa = ev.target.closest('.casa-roleta');
    if (!casa) return;
    if (casa.getAttribute('aria-disabled') === 'true') {
      if (!comConta()) return showToast('Entre na sua conta pra apostar.', 'error');
      return showToast('As apostas estão fechadas. Espere a próxima rodada.');
    }
    if (carteira && carteira.saldo < valor) return showToast('Você não tem coins pra essa ficha.', 'error');
    if (await jogar('apostar', { alvo: casa.dataset.alvo, valor })) tocar(somDeFicha(), 0, .45);
  });
  fichasEl.addEventListener('click', ev => {
    const b = ev.target.closest('button');
    if (!b || b.disabled) return;
    valor = Number(b.dataset.valor);
    tocar(somDeFicha(), 0, .3);
    desenharPainel();
  });
  acoes.addEventListener('click', async ev => {
    const b = ev.target.closest('button');
    if (!b || b.disabled) return;
    const acao = b.dataset.acao;
    if (await jogar(acao) && acao !== 'pronto') tocar('fichas', 0, .35);
  });

  entrarNoCanal();
}
