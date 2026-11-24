// Poker (Texas Hold'em) no palco das Atividades, aberto pelo salão (salao.js). O servidor
// manda a mesa inteira a cada jogada; aqui a gente compara com a anterior pra saber
// o que animar (cartas saindo do monte, fichas indo pro pote) e qual som tocar.
import { criarSons, somDeCarta, somDeFicha } from './sons-mesa.js';
import { numero, semMovimento, cartaVisual, pilha, voarFichas, rosto, virarRetro, brilhar, embaralharMonte } from './mesa-pecas.js';
import { melhorMao, CATEGORIAS, categoriaDe } from './poker-maos.js';
import { confirmar } from './confirmar.js';

const LUGARES = 8;
const ETAPAS = { preflop: 'Antes do flop', flop: 'Flop', turn: 'Turn', river: 'River', showdown: 'Showdown' };

export function configurarPoker({ socket, appState, showToast, pessoaDaCall = () => null }) {
  const palco = document.querySelector('#mesa-21');
  const titulo = document.querySelector('#titulo-21');
  const jogo = document.querySelector('#jogo-poker');
  const feltro = jogo.querySelector('.feltro-21');
  const lugaresEl = document.querySelector('#lugares-poker');
  const centro = jogo.querySelector('.centro-poker');
  const monte = jogo.querySelector('.monte-poker');
  const mesaCartas = document.querySelector('#mesa-cartas-poker');
  const poteEl = document.querySelector('#pote-poker');
  const placar = document.querySelector('#placar-poker');
  const info = document.querySelector('#info-poker');
  const aviso = document.querySelector('#aviso-poker');
  const entrada = document.querySelector('#entrada-poker');
  const formValor = document.querySelector('#valor-poker');
  const faixa = document.querySelector('#valor-poker-faixa');
  const campo = document.querySelector('#valor-poker-numero');
  const rotuloValor = formValor.querySelector('.valor-poker-rotulo');
  const rapidos = formValor.querySelector('.valor-poker-rapidos');
  const acoes = document.querySelector('#acoes-poker');
  const botaoMaos = document.querySelector('#maos-poker-botao');
  const painelMaos = document.querySelector('#maos-poker');

  let aba = palco.dataset.jogo; // qual jogo o salão abriu
  let canal = null, mesa = null, anterior = null, carteira = null;
  let ocupado = false, recebidoEm = 0, relogio = 0, revelacao = 0;
  let modoValor = null, valor = null; // o que o campo de valor está escolhendo agora
  let repondo = false;                // abriu "Pôr mais fichas"
  let avisouVez = null, tocouVez = null, placarVisto = null;
  // Nome da sua mão ao lado do seu nome: só troca quando as cartas novas pousam.
  let maoMostrada = null, categoriaMostrada = null, rotuloTimer = 0;
  // Fim da mão: as cartas voltam pro monte e ele embaralha antes da próxima, como no 21.
  let limpeza = 0, limpou = null, embaralhado = false;

  const ativo = () => !palco.hidden && aba === 'poker';
  const tocar = criarSons(appState, ativo);
  const eu = () => mesa?.eu != null ? mesa.lugares[mesa.eu] : null;
  const minhaVez = () => Boolean(mesa?.jogadas);
  const sentados = () => mesa ? mesa.lugares.filter(Boolean) : [];

  // O salão abriu outro jogo (ou o poker): redesenha sem animar o que mudou enquanto estava fechado.
  window.addEventListener('teletela-aba-jogo', ev => {
    aba = ev.detail.jogo;
    sincronizarBotaoMaos();
    if (ativo()) { anterior = mesa; desenhar(); }
  });

  // ---------- Conversa com o servidor ----------
  function pedir(acao, extra = {}) {
    if (!canal) return Promise.resolve({ erro: 'Entre num canal de voz.' });
    if (acao !== 'ver') tocar.precarregar();
    return new Promise(resolve => {
      socket.timeout(6000).emit('jogar-poker', { canal, acao, passo: mesa?.passo, ...extra },
        (erro, r) => resolve(erro ? { erro: 'A mesa não respondeu.' } : r || {}));
    });
  }

  async function jogar(acao, extra) {
    if (ocupado) return;
    ocupado = true;
    for (const b of acoes.querySelectorAll('button')) b.disabled = true;
    const foco = document.activeElement?.dataset?.acao;
    const r = await pedir(acao, extra);
    ocupado = false;
    if (r.erro) { aviso.textContent = r.erro; tocar('bater', 0, .25); }
    if (r.carteira) novaCarteira(r.carteira);
    if (acao === 'repor' && !r.erro) repondo = false;
    desenhar();
    if (foco) (acoes.querySelector('[data-acao="' + foco + '"]') || acoes.querySelector('button'))?.focus();
  }

  function receber(dados) {
    if (!dados || dados.canal !== canal) return;
    mesa = dados.mesa;
    recebidoEm = performance.now();
    if (dados.carteira) novaCarteira(dados.carteira);
    // Chegou sua vez com a mesa fechada ou no 21: avisa, porque o tempo está correndo.
    const chave = minhaVez() ? mesa.mao + ':' + mesa.passo : null;
    if (chave && avisouVez !== chave && !ativo() && canal === appState.currentChannelId) {
      showToast('Sua vez no poker. Você tem ' + Math.round(mesa.restante / 1000) + ' segundos.', 'normal', 5000);
    }
    avisouVez = chave;
    if (ativo()) desenhar();
    else anterior = mesa;
  }

  // Uma carteira só pra todas as atividades.
  function novaCarteira(c) {
    carteira = c;
    window.dispatchEvent(new CustomEvent('teletela-carteira', { detail: { carteira: c, de: 'poker' } }));
  }
  window.addEventListener('teletela-carteira', ev => {
    if (ev.detail.de === 'poker') return;
    carteira = ev.detail.carteira;
    if (ativo() && !mesa?.jogadas) desenharPainel();
  });

  async function entrarNoCanal() {
    canal = appState.currentChannelId || null;
    mesa = null; anterior = null;
    if (!canal) return;
    const pedido = canal;
    const r = await pedir('ver');
    if (pedido !== canal || r.erro) return;
    receber({ canal, ...r });
  }

  // ---------- Desenho ----------
  // Você sempre embaixo; os outros lugares giram a partir do seu.
  function angulo(lugar) {
    const base = mesa.eu ?? 0;
    return 90 + ((lugar - base + LUGARES) % LUGARES) * (360 / LUGARES);
  }

  function linhaDe(j) {
    const partes = [];
    if (mesa.fase === 'resultado' && j.cartas.length) {
      if (j.nomeMao) partes.push(j.nomeMao);
      else if (j.foldou) partes.push(j.acao === 'Saiu' ? 'Saiu' : 'Largou');
    } else if (j.ausente && !j.cartas.length) partes.push('Ausente');
    else if (mesa.vez === j.lugar) partes.push(j.id === socket.id ? 'Sua vez' : 'Pensando…');
    else if (j.allin && mesa.fase === 'jogando') partes.push('All-in');
    else if (j.acao) partes.push(j.acao);
    else if (mesa.fase === 'jogando' && !j.cartas.length) partes.push('Fora dessa mão');
    partes.push(numero(j.pilha) + (j.pilha === 1 ? ' ficha' : ' fichas'));
    return partes.join(' · ');
  }

  function estadoDe(j) {
    if (mesa.fase === 'resultado' && j.ganho > j.total) return 'ganhou';
    if (j.foldou || (mesa.fase === 'jogando' && !j.cartas.length)) return 'foldou';
    if (mesa.vez === j.lugar) return 'vez';
    if (j.allin) return 'allin';
    if (j.ausente) return 'ausente';
    return '';
  }

  function assento(j) {
    const meu = j.id === socket.id;
    const bloco = document.createElement('section');
    bloco.className = 'lugar-21 ao-redor lugar-poker ' + (meu ? 'minha-mao' : 'amigo-21');
    bloco.dataset.lugar = j.lugar;
    const estado = estadoDe(j);
    if (estado) bloco.dataset.estado = estado;
    const rad = angulo(j.lugar) * Math.PI / 180;
    bloco.style.setProperty('--cos', Math.cos(rad).toFixed(3));
    bloco.style.setProperty('--sin', Math.sin(rad).toFixed(3));
    if (Math.sin(rad) < -.2) bloco.classList.add('em-cima');

    const jogoEl = document.createElement('div');
    jogoEl.className = 'jogo-21';
    // As fichas apostadas na rua ficam na frente do lugar, viradas pro centro.
    const aposta = document.createElement('span');
    aposta.className = 'aposta-poker';
    if (j.naRua) {
      aposta.append(pilha(j.naRua, 'Apostou ' + numero(j.naRua)));
      const r = document.createElement('small');
      r.textContent = numero(j.naRua);
      aposta.append(r);
    }
    const leque = document.createElement('div');
    leque.className = 'leque-21';
    const destaque = new Set(mesa.fase === 'resultado' ? j.melhores : []);
    for (const [i, c] of j.cartas.entries()) {
      const el = cartaVisual(c);
      if (destaque.has(c)) el.classList.add('destaque-poker');
      leque.append(el);
    }
    jogoEl.append(aposta, leque);

    const placa = document.createElement('div');
    placa.className = 'placa-21';
    placa.append(rosto(j.id, j.nome, pessoaDaCall));
    const textos = document.createElement('span');
    textos.className = 'textos-21';
    const h3 = document.createElement('h3');
    h3.textContent = j.nome + (meu ? ' (você)' : '');
    const small = document.createElement('small');
    small.textContent = linhaDe(j);
    textos.append(h3);
    if (meu) {
      const rotulo = document.createElement('span');
      rotulo.className = 'mao-poker';
      rotulo.setAttribute('aria-live', 'polite');
      mostrarRotulo(rotulo, maoMostrada);
      textos.append(rotulo);
    }
    textos.append(small);
    placa.append(textos);
    if (mesa.fase === 'resultado' && j.cartas.length && mesa.fichas) {
      const delta = j.ganho - j.total;
      if (delta) {
        const b = document.createElement('b');
        b.className = 'ganho-21';
        b.textContent = (delta > 0 ? '+' : '−') + numero(Math.abs(delta));
        placa.append(b);
      }
    }
    if (mesa.dealer === j.lugar && mesa.fase !== 'espera') {
      const d = document.createElement('span');
      d.className = 'dealer-poker';
      d.textContent = 'D';
      d.title = 'Dealer';
      d.setAttribute('aria-label', 'Dealer');
      placa.append(d);
    }
    // Barra do tempo da vez: encolhe até zero sem precisar de timer aqui.
    if (mesa.vez === j.lugar && mesa.restante != null) {
      const barra = document.createElement('span');
      barra.className = 'tempo-poker';
      barra.setAttribute('aria-hidden', 'true');
      const resta = Math.max(0, mesa.restante - (performance.now() - recebidoEm));
      barra.style.setProperty('--inicio', (resta / mesa.prazoTotal).toFixed(3));
      barra.style.animationDuration = resta + 'ms';
      placa.append(barra);
    }
    bloco.append(jogoEl, placa);
    return bloco;
  }

  const lugarEl = lugar => lugaresEl.querySelector('[data-lugar="' + lugar + '"]');

  function desenharMesaCartas(novas) {
    mesaCartas.replaceChildren();
    const destaque = new Set(mesa?.fase === 'resultado' ? sentados().flatMap(j => j.ganho > j.total ? j.melhores : []) : []);
    for (let i = 0; i < 5; i++) {
      const c = mesa?.mesaCartas[i];
      if (c) {
        const el = cartaVisual(c);
        if (destaque.size) el.classList.add(destaque.has(c) ? 'destaque-poker' : 'apagada-poker');
        mesaCartas.append(el);
        if (i >= novas.de) novas.lista.push([el, (i - novas.de) * novas.passo]);
      } else {
        const vaga = document.createElement('span');
        vaga.className = 'vaga-poker';
        vaga.setAttribute('aria-hidden', 'true');
        mesaCartas.append(vaga);
      }
    }
  }

  // Cartas saindo do monte; as da mesa ainda viram no ar.
  function voar(lista, virar) {
    const origem = monte.getBoundingClientRect();
    for (const [el, quando] of lista) {
      tocar(somDeCarta(), quando);
      if (semMovimento.matches) continue;
      const alvo = el.getBoundingClientRect();
      const dx = origem.left + origem.width / 2 - (alvo.left + alvo.width / 2);
      const dy = origem.top + origem.height / 2 - (alvo.top + alvo.height / 2);
      // Sem girar no caminho: pixel art inclinado fica serrilhado.
      el.animate([
        { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 },
        { opacity: 1, offset: .12 },
        { transform: 'translate(0, 0)', opacity: 1 }
      ], { duration: 420, delay: quando, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' });
      if (virar.has(el)) {
        // Chega de costas e vira depois de pousar.
        el.querySelector('.miolo-21').animate([{ transform: 'rotateY(180deg)' }, { transform: 'rotateY(180deg)' }], { duration: 420, delay: quando, fill: 'backwards' });
        virarRetro(el, quando + 420);
      }
    }
  }

  function desenhar() {
    if (!ativo()) return;
    clearTimeout(revelacao); clearTimeout(limpeza); clearTimeout(rotuloTimer);
    placar.getAnimations().forEach(a => a.cancel());
    jogo.classList.toggle('mesa-limpa', mesa?.fase === 'resultado' && limpou === mesa.mao);
    sincronizarBotaoMaos();
    titulo.textContent = !mesa ? 'Jogar poker' : mesa.fichas ? 'Poker · blinds 5/10' : 'Poker · só diversão';
    jogo.dataset.fase = mesa?.fase || 'abertura';
    for (const el of lugaresEl.querySelectorAll('.lugar-poker')) el.remove();
    placar.hidden = true;
    feltro.querySelectorAll('.voando-21').forEach(el => el.remove());
    const novas = { lista: [], de: 5, passo: 0 };
    const virar = new Set();

    if (!mesa) {
      desenharMesaCartas(novas);
      poteEl.hidden = true;
      anterior = null; maoMostrada = null;
      desenharPainel();
      return;
    }
    const mesmaMao = anterior?.mao === mesa.mao;
    const maoNova = mesa.fase === 'jogando' && !mesmaMao;
    // Cartas comunitárias novas: no all-in a mesa abre tudo de uma vez, com mais pausa.
    const antes = mesmaMao ? anterior.mesaCartas.length : (maoNova ? 0 : mesa.mesaCartas.length);
    novas.de = antes;
    novas.passo = mesa.mesaCartas.length - antes > 3 ? 420 : 160;
    desenharMesaCartas(novas);
    for (const [el] of novas.lista) virar.add(el);

    const potePrincipal = mesa.fase === 'resultado' ? mesa.potes.reduce((s, p) => s + p.valor, 0) : mesa.pote;
    poteEl.replaceChildren();
    poteEl.hidden = !potePrincipal;
    if (potePrincipal) {
      poteEl.append(pilha(potePrincipal, 'Pote de ' + numero(potePrincipal) + ' fichas'));
      const r = document.createElement('small');
      r.textContent = 'Pote · ' + numero(potePrincipal);
      poteEl.append(r);
    }

    for (const j of sentados()) lugaresEl.append(assento(j));

    // Mão nova: duas voltas a partir de quem senta depois do dealer.
    let fimDaDistribuicao = 0;
    if (maoNova) {
      // Se o monte já embaralhou no fim da mão anterior, não repete o som.
      if (!embaralhado) tocar('embaralhar', 0, .5);
      embaralhado = false;
      const naMao = sentados().filter(j => j.cartas.length).sort((a, b) => ((a.lugar - mesa.dealer - 1 + LUGARES) % LUGARES) - ((b.lugar - mesa.dealer - 1 + LUGARES) % LUGARES));
      const cartas = [];
      naMao.forEach((j, k) => lugarEl(j.lugar)?.querySelectorAll('.carta-21').forEach((el, volta) => cartas.push([el, 450 + (volta * naMao.length + k) * 130])));
      voar(cartas, new Set());
      fimDaDistribuicao = 450 + naMao.length * 2 * 130;
    }
    // Showdown: as cartas de quem chegou até o fim viram.
    if (mesmaMao && mesa.mostrou && !anterior.mostrou && !semMovimento.matches) {
      for (const j of sentados()) {
        const a = anterior.lugares[j.lugar];
        if (j.id === socket.id || !a || a.cartas[0] || !j.cartas[0]) continue;
        lugarEl(j.lugar)?.querySelectorAll('.carta-21').forEach((c, i) => virarRetro(c, 120 + i * 90));
      }
      tocar('virar', 100);
    }
    voar(novas.lista, virar);
    const fimDaMesa = novas.lista.length ? novas.lista.at(-1)[1] + 700 : 0;

    if (mesmaMao) sonsEFichas(fimDaMesa);
    if (mesa.fase === 'resultado') {
      const mostrar = () => { mostrarPlacar(); pagar(placarVisto !== mesa.mao); placarVisto = mesa.mao; };
      const atraso = placarVisto !== mesa.mao && !semMovimento.matches ? fimDaMesa + (mesa.mostrou ? 650 : 250) : 0;
      if (atraso) revelacao = setTimeout(mostrar, atraso); else mostrar();
    }
    if (minhaVez() && tocouVez !== mesa.mao + ':' + mesa.passo) {
      tocar('leque', Math.max(fimDaDistribuicao, fimDaMesa), .4);
      tocouVez = mesa.mao + ':' + mesa.passo;
    }
    // Sua mão: o nome muda quando a distribuição ou as cartas novas da mesa terminam de pousar.
    const alvo = textoMinhaMao();
    const espera = semMovimento.matches ? 0 : Math.max(fimDaDistribuicao, novas.lista.length ? fimDaMesa - 250 : 0);
    if (alvo !== maoMostrada) {
      if (espera) rotuloTimer = setTimeout(() => trocarRotulo(alvo), espera);
      else trocarRotulo(alvo, Boolean(maoMostrada));
    }
    // Resultado com a próxima mão marcada: recolhe e embaralha ~2,6 s antes dela.
    if (mesa.fase === 'resultado' && mesa.proxima != null && limpou !== mesa.mao) {
      const quando = mesa.proxima - (performance.now() - recebidoEm) - 2600;
      if (quando > -800) limpeza = setTimeout(limparMesa, Math.max(0, quando));
    }
    if (!painelMaos.hidden) marcarCategoria();
    anterior = mesa;
    desenharPainel();
  }

  // ---------- Sua mão ----------
  function textoMinhaMao() {
    const meu = eu();
    if (!meu?.cartas[0] || meu.foldou || limpou === mesa.mao) return null;
    if (mesa.fase === 'jogando') return mesa.maoAtual;
    return mesa.fase === 'resultado' ? meu.nomeMao : null;
  }
  function categoriaMinha() {
    const meu = eu();
    if (!meu?.cartas[0] || meu.foldou || mesa.fase === 'espera' || limpou === mesa.mao) return null;
    return categoriaDe(melhorMao([...meu.cartas, ...mesa.mesaCartas]).valor);
  }
  function mostrarRotulo(el, texto) {
    el.hidden = !texto;
    el.textContent = texto || '';
    if (texto && categoriaMostrada != null) el.dataset.categoria = categoriaMostrada; else delete el.dataset.categoria;
  }
  function trocarRotulo(texto, animar = true) {
    const categoria = texto ? categoriaMinha() : null;
    const melhorou = categoria != null && categoriaMostrada != null && categoria > categoriaMostrada;
    maoMostrada = texto; categoriaMostrada = categoria;
    const el = lugaresEl.querySelector('.minha-mao .mao-poker');
    if (!el) return;
    mostrarRotulo(el, texto);
    if (animar && texto && !semMovimento.matches) {
      el.animate([{ transform: 'scale(.7)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: .6 }, { transform: 'none' }],
        { duration: 320, easing: 'steps(4, end)' });
      if (melhorou) brilhar(el);
    }
  }

  // ---------- Fim da mão: recolher e embaralhar ----------
  function limparMesa() {
    if (!ativo() || mesa?.fase !== 'resultado' || limpou === mesa.mao) return;
    limpou = mesa.mao;
    const terminar = () => {
      if (!ativo() || limpou !== mesa?.mao) return;
      jogo.classList.add('mesa-limpa');
      trocarRotulo(null, false);
      embaralharMonte(monte);
      tocar('embaralhar', 0, .5);
      embaralhado = true;
    };
    if (semMovimento.matches) return terminar();
    const origem = monte.getBoundingClientRect();
    const cartas = [...lugaresEl.querySelectorAll('.carta-21')];
    cartas.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      el.animate([{ transform: 'none', opacity: 1 }, { opacity: 1, offset: .7 },
        { transform: `translate(${origem.left + origem.width / 2 - r.left - r.width / 2}px, ${origem.top + origem.height / 2 - r.top - r.height / 2}px)`, opacity: 0 }],
      { duration: 380, delay: i * 35, easing: 'cubic-bezier(.5, 0, .75, 0)', fill: 'forwards' });
    });
    placar.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' });
    tocar('leque', 0, .4);
    limpeza = setTimeout(terminar, 420 + cartas.length * 35);
  }

  // ---------- Tabela das mãos ----------
  function montarTabela() {
    const lista = painelMaos.querySelector('ol');
    if (lista.children.length) return;
    for (const [i, c] of CATEGORIAS.entries()) {
      const li = document.createElement('li');
      li.dataset.categoria = c.valor;
      const pos = document.createElement('span');
      pos.className = 'posicao-maos';
      pos.textContent = i + 1;
      const textos = document.createElement('div');
      const nome = document.createElement('strong');
      nome.textContent = c.nome;
      const explica = document.createElement('small');
      explica.textContent = c.explica;
      const cartas = document.createElement('div');
      cartas.className = 'cartas-maos';
      cartas.setAttribute('role', 'img');
      cartas.setAttribute('aria-label', 'Exemplo: ' + melhorMao(c.exemplo).nome);
      for (const carta of c.exemplo) {
        const el = cartaVisual(carta);
        el.setAttribute('aria-hidden', 'true');
        cartas.append(el);
      }
      textos.append(nome, explica, cartas);
      li.append(pos, textos);
      lista.append(li);
    }
  }
  function marcarCategoria() {
    const cat = mesa ? categoriaMinha() : null;
    for (const li of painelMaos.querySelectorAll('li')) {
      const sua = String(cat) === li.dataset.categoria;
      li.classList.toggle('sua-mao', sua);
      if (sua) li.setAttribute('aria-current', 'true'); else li.removeAttribute('aria-current');
    }
  }
  function abrirMaos(abrir = painelMaos.hidden) {
    painelMaos.hidden = !abrir;
    botaoMaos.setAttribute('aria-expanded', String(abrir));
    if (!abrir) return;
    // Divide o canto com o ranking e as apostas: abre um de cada vez.
    for (const id of ['#fechar-ranking-21', '#fechar-apostas-21']) {
      const fechar = document.querySelector(id);
      if (fechar?.closest('aside') && !fechar.closest('aside').hidden) fechar.click();
    }
    montarTabela();
    marcarCategoria();
    painelMaos.querySelector('.sua-mao')?.scrollIntoView({ block: 'nearest' });
  }
  function sincronizarBotaoMaos() {
    botaoMaos.hidden = !ativo();
    if (botaoMaos.hidden && !painelMaos.hidden) abrirMaos(false);
  }
  botaoMaos.onclick = () => abrirMaos();
  document.querySelector('#fechar-maos-poker').onclick = () => { abrirMaos(false); botaoMaos.focus(); };
  painelMaos.addEventListener('keydown', ev => { if (ev.key === 'Escape') { abrirMaos(false); botaoMaos.focus(); } });
  for (const id of ['#ranking-21-botao', '#apostas-21-botao']) document.querySelector(id)?.addEventListener('click', () => abrirMaos(false));

  // Fichas apostadas, rua fechando (apostas vão pro pote), passar e largar.
  function sonsEFichas(atraso) {
    const ruaFechou = anterior.etapa !== mesa.etapa && mesa.fase === 'jogando' || (mesa.fase === 'resultado' && anterior.fase === 'jogando');
    for (const j of sentados()) {
      const a = anterior.lugares[j.lugar];
      if (!a || a.id !== j.id) continue;
      const el = lugarEl(j.lugar);
      if (j.naRua > a.naRua) {
        tocar(j.allin ? 'fichas' : somDeFicha(), 0, j.allin ? .55 : .5);
        const nova = el?.querySelector('.aposta-poker .pilhas-21');
        const placa = el?.querySelector('.placa-21');
        if (nova && placa && !semMovimento.matches) {
          const p = placa.getBoundingClientRect(), b = nova.getBoundingClientRect();
          nova.animate([{ transform: `translate(${p.left - b.left}px, ${p.top - b.top}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }],
            { duration: 380, easing: 'cubic-bezier(.16, 1, .3, 1)' });
        }
      } else if (j.acao !== a.acao && /^Passou/.test(j.acao)) tocar('bater', 0, .3);
      if (j.foldou && !a.foldou) tocar('virar', 0, .35);
      if (ruaFechou && a.naRua) voarFichas(feltro, el?.querySelector('.aposta-poker'), poteEl.querySelector('.pilhas-21') || poteEl, a.naRua, 0);
    }
    if (ruaFechou && sentados().some(j => anterior.lugares[j.lugar]?.naRua)) tocar('fichas', 120, .4);
  }

  // O pote voa pra quem levou.
  function pagar(animar) {
    if (!animar) return;
    const origem = poteEl.querySelector('.pilhas-21');
    let algum = false;
    for (const j of sentados()) {
      if (!j.ganho) continue;
      algum = true;
      const placa = lugarEl(j.lugar)?.querySelector('.placa-21');
      voarFichas(feltro, origem, placa, j.ganho, 0, () => brilhar(placa));
    }
    if (algum) { poteEl.hidden = true; tocar('pote', 300, .6); }
  }

  function vencedores() {
    const lugares = new Set(mesa.potes.filter(p => !p.devolvido).flatMap(p => p.ganhadores));
    const lista = sentados().filter(j => lugares.has(j.lugar));
    return lista.length ? lista : sentados().filter(j => j.ganho > j.total);
  }

  function mostrarPlacar() {
    const ganham = vencedores();
    const meu = eu();
    let grande = '', pequeno = '', tom = 'neutro';
    const comoGanhou = ganham[0]?.nomeMao || (mesa.mostrou ? '' : 'Todo mundo largou');
    if (meu?.cartas.length && ganham.includes(meu)) {
      grande = ganham.length > 1 ? 'Você dividiu o pote' : 'Você levou';
      tom = 'ganhou';
      const delta = meu.ganho - meu.total;
      pequeno = [mesa.fichas && delta > 0 ? '+' + numero(delta) + ' fichas' : '', meu.nomeMao || comoGanhou].filter(Boolean).join(' · ');
    } else if (ganham.length) {
      grande = ganham.length === 1 ? ganham[0].nome + ' levou' : ganham.map(j => j.nome).join(' e ') + ' dividiram';
      tom = meu?.cartas.length ? 'perdeu' : 'neutro';
      pequeno = comoGanhou;
    } else return;
    placar.dataset.tom = tom;
    placar.querySelector('strong').textContent = grande;
    placar.querySelector('span').textContent = pequeno;
    placar.hidden = false;
    if (!semMovimento.matches && placarVisto !== mesa.mao) {
      placar.animate([{ opacity: 0, transform: 'scale(.86)', filter: 'blur(6px)' }, { opacity: 1, transform: 'scale(1)', filter: 'blur(0)' }],
        { duration: 420, easing: 'cubic-bezier(.16, 1, .3, 1)' });
    }
  }

  // ---------- Painel de baixo: aviso, valor e botões ----------
  function botao(texto, acao, { secundario = false, extra, confirmarAntes } = {}) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = secundario ? 'btn-secondary' : 'btn-primary';
    b.textContent = texto;
    b.dataset.acao = acao;
    b.disabled = ocupado;
    b.onclick = async () => {
      if (confirmarAntes && !await confirmar(confirmarAntes.texto, confirmarAntes)) return;
      jogar(acao, typeof extra === 'function' ? extra() : extra);
    };
    acoes.append(b);
    return b;
  }

  // Campo de valor: sentar, pôr mais fichas ou aumentar. Faixa e número andam juntos.
  function mostrarValor(modo, min, max, sugestao, rotulo, atalhos) {
    if (modoValor !== modo || valor == null) valor = sugestao;
    modoValor = modo;
    valor = Math.max(min, Math.min(max, valor));
    formValor.hidden = false;
    rotuloValor.textContent = rotulo;
    for (const el of [faixa, campo]) { el.min = min; el.max = max; el.step = 1; el.value = valor; }
    faixa.disabled = campo.disabled = min >= max;
    rapidos.replaceChildren();
    for (const [texto, v] of atalhos) {
      if (v < min || v > max) continue;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn-secondary';
      b.textContent = texto;
      b.onclick = () => { valor = v; faixa.value = campo.value = v; aoMudarValor(); tocar(somDeFicha(), 0, .35); };
      rapidos.append(b);
    }
  }
  function aoMudarValor() {
    const principal = acoes.querySelector('[data-valor]');
    if (principal) principal.textContent = principal.dataset.valor.replace('#', numero(valor));
  }
  faixa.oninput = () => { valor = Number(faixa.value); campo.value = valor; aoMudarValor(); };
  campo.oninput = () => { valor = Math.floor(Number(campo.value)) || 0; faixa.value = valor; aoMudarValor(); };
  campo.onblur = () => { valor = Math.max(Number(campo.min), Math.min(Number(campo.max), valor || 0)); campo.value = faixa.value = valor; aoMudarValor(); };
  formValor.onsubmit = ev => { ev.preventDefault(); acoes.querySelector('[data-valor]')?.click(); };

  function principalComValor(modelo, acao, secundario = false) {
    const b = botao(modelo.replace('#', numero(valor)), acao, { secundario, extra: () => ({ valor }) });
    b.dataset.valor = modelo;
    return b;
  }

  const redondo = v => Math.round(v / 5) * 5;

  function desenharPainel() {
    acoes.replaceChildren();
    formValor.hidden = true;
    entrada.hidden = true;
    clearInterval(relogio);
    const saldo = carteira?.saldo ?? 0;
    const meu = eu();

    if (!mesa || !meu) {
      // Quem ainda não sentou: escolhe quanto leva da carteira.
      const cheia = mesa && sentados().length >= LUGARES;
      entrada.hidden = Boolean(mesa);
      entrada.querySelector('[value="1"]').disabled = !appState.myUser.accountId;
      if (!appState.myUser.accountId) entrada.querySelector('[value="0"]').checked = true;
      const valendo = mesa ? mesa.fichas : entrada.querySelector(':checked').value === '1';
      info.textContent = mesa
        ? sentados().length + (sentados().length === 1 ? ' pessoa na mesa' : ' pessoas na mesa') + (mesa.fase === 'jogando' ? ' · ' + ETAPAS[mesa.etapa] : '')
        : "Texas Hold'em com blinds de 5 e 10. Cada um senta com quanto quiser e levanta quando quiser.";
      aviso.textContent = cheia ? 'A mesa está cheia. Dá pra assistir.' : mesa?.fase === 'jogando' ? 'Sentando agora, você entra na próxima mão.' : '';
      if (cheia) return;
      if (!appState.myUser.accountId) {
        aviso.textContent = 'Entre na sua conta pra jogar valendo fichas.';
        if (valendo) return;
      }
      if (valendo) {
        if (saldo < 10) {
          aviso.textContent = mesa ? 'Você precisa de pelo menos 10 fichas pra sentar nesta mesa.' : 'Você precisa de pelo menos 10 fichas. Dá pra abrir uma mesa só por diversão.';
          return;
        } else {
          mostrarValor('sentar', 10, saldo, Math.min(saldo, 500), 'Levar pra mesa', [['100', 100], ['500', 500], ['1.000', 1000], ['Tudo', saldo]]);
          principalComValor('Sentar com # fichas', 'sentar');
          return;
        }
      }
      botao('Sentar', 'sentar', { extra: { fichas: false } });
      return;
    }

    const naMao = mesa.fase === 'jogando' && meu.cartas.length && !meu.foldou;
    const quantos = sentados().filter(j => !j.ausente && j.pilha > 0).length;
    info.textContent = [mesa.fase === 'jogando' ? ETAPAS[mesa.etapa] : mesa.fase === 'resultado' ? 'Fim da mão' : 'Esperando',
      mesa.maoAtual && 'você tem ' + mesa.maoAtual.charAt(0).toLowerCase() + mesa.maoAtual.slice(1)].filter(Boolean).join(' · ');

    if (minhaVez()) {
      const j = mesa.jogadas;
      const segundos = () => Math.max(0, Math.ceil((mesa.restante - (performance.now() - recebidoEm)) / 1000));
      const texto = () => 'Sua vez · ' + segundos() + 's' + (j.pagar ? ' · ' + numero(j.pagar) + ' pra pagar' : '');
      aviso.textContent = texto();
      relogio = setInterval(() => { if (minhaVez()) aviso.textContent = texto(); }, 1000);
      botao('Largar', 'largar', { secundario: true });
      if (j.podePassar) botao('Passar', 'passar', { secundario: true });
      else botao(j.pagar >= j.maximo - j.naRua ? 'Pagar ' + numero(j.pagar) + ' (all-in)' : 'Pagar ' + numero(j.pagar), 'pagar');
      if (j.podeAumentar) {
        const apostar = !j.apostaAtual;
        const potePago = j.pote + j.pagar;
        mostrarValor('aumentar', j.minimo, j.maximo, j.minimo, apostar ? 'Apostar' : 'Aumentar pra', [
          ['Mínimo', j.minimo], ['½ pote', redondo(j.apostaAtual + potePago / 2)], ['Pote', redondo(j.apostaAtual + potePago)], ['Tudo', j.maximo]
        ]);
        // Com aposta pra pagar, pagar é o caminho comum; aumentar fica do lado, sem destaque.
        principalComValor(apostar ? 'Apostar #' : 'Aumentar pra #', 'aumentar', !apostar);
      }
      return;
    }

    if (meu.ausente) {
      aviso.textContent = 'Você está ausente e não recebe cartas.' + (naMao ? ' Nesta mão você passa ou larga sozinho.' : '');
      botao('Voltar pro jogo', 'voltar');
    } else if (naMao) {
      const vez = mesa.vez != null && mesa.lugares[mesa.vez];
      aviso.textContent = meu.allin ? 'Você está all-in. Agora é com as cartas.' : vez ? 'Vez de ' + vez.nome + '.' : '';
    } else if (mesa.fase === 'jogando') aviso.textContent = meu.cartas.length ? 'Você largou essa mão.' : 'Você entra na próxima mão.';
    else if (mesa.fase === 'resultado') aviso.textContent = quantos >= 2 ? 'A próxima mão já vem.' : '';
    else aviso.textContent = quantos < 2 ? 'Esperando mais alguém sentar com fichas.' : mesa.numero ? '' : 'Todo mundo pronto? Dê as cartas.';

    if (mesa.fase === 'espera' && quantos >= 2 && !mesa.numero) botao('Dar as cartas', 'comecar');
    if (!meu.pilha && !repondo) aviso.textContent = 'Suas fichas na mesa acabaram. Ponha mais pra continuar.';
    // Pôr mais fichas: só fora de uma mão em andamento.
    const teto = mesa.fichas ? saldo : 1000;
    if (!naMao && teto > meu.pilha) {
      if (repondo || !meu.pilha) {
        mostrarValor('repor', 1, teto - meu.pilha, Math.min(teto - meu.pilha, 500), 'Pôr na mesa', [['100', 100], ['500', 500], ['Tudo', teto - meu.pilha]]);
        principalComValor('Pôr # fichas', 'repor');
        if (meu.pilha) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn-secondary'; b.textContent = 'Cancelar'; b.onclick = () => { repondo = false; desenharPainel(); }; acoes.append(b); }
      } else {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'btn-secondary'; b.textContent = 'Pôr mais fichas'; b.dataset.acao = 'abrir-repor';
        b.onclick = () => { repondo = true; desenharPainel(); campo.focus(); };
        acoes.append(b);
      }
    }
    if (!meu.ausente && mesa.fase !== 'espera') botao('Sair um pouco', 'ausentar', { secundario: true });
    botao('Levantar', 'sair', { secundario: true, confirmarAntes: naMao ? { texto: 'Levantar agora larga a sua mão. O que você já pôs fica no pote.', confirmar: 'Levantar', perigo: true } : null });
  }

  entrada.addEventListener('change', () => { tocar(somDeFicha(), 0, .35); desenharPainel(); });

  // ---------- Quando o palco abre e fecha ----------
  new MutationObserver(() => {
    sincronizarBotaoMaos();
    if (palco.hidden) { clearInterval(relogio); clearTimeout(revelacao); clearTimeout(limpeza); clearTimeout(rotuloTimer); return; }
    if (canal !== appState.currentChannelId) entrarNoCanal();
    else pedir('ver').then(r => { if (!r.erro) receber({ canal, ...r }); });
  }).observe(palco, { attributes: true, attributeFilter: ['hidden'] });

  socket.on('mesa-poker', receber);
  socket.on('connect', () => { if (appState.currentChannelId) entrarNoCanal(); });
  window.addEventListener('teletela-call-joined', entrarNoCanal);
  window.addEventListener('teletela-call-left', entrarNoCanal);
  entrarNoCanal();
}
