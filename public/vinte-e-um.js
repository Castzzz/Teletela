// Mesa de 21 no palco da call. O servidor manda a mesa inteira a cada mudança;
// aqui a gente compara com a anterior pra saber o que animar e qual som tocar.
import { criarSons, somLigado, ligarSom, somDeCarta, somDeFicha } from './sons-mesa.js';
import { soma, numero, decompor, semMovimento, cartaVisual, pilha, voarFichas as voarPecas, rosto as rostoPeca, COR_FICHA, cairFicha, virarRetro, brilhar, embaralharMonte } from './mesa-pecas.js';
const MENOR_FICHA = 5;

export function configurarMesa21(socket, appState, mostrarSala, pessoaDaCall = () => null) {
  const palco = document.querySelector('#mesa-21');
  const titulo = document.querySelector('#titulo-21');
  const aviso = document.querySelector('#aviso-21');
  const maos = document.querySelector('#maos-21');
  const fichas = document.querySelector('#fichas-na-mesa');
  const entrada = document.querySelector('#entrada-21');
  const acoes = document.querySelector('#acoes-21');
  const painel = acoes.closest('.painel-21');
  const monte = document.querySelector('#monte-21');
  const bandeja = document.querySelector('#bandeja-21');
  const feltro = document.querySelector('.feltro-21');
  const arco = document.querySelector('#faixa-21');
  const faixa = arco.querySelector('textPath');
  const placar = document.querySelector('#placar-21');
  const montar = document.querySelector('#montar-21');
  const carteiraEl = document.querySelector('#carteira-21');
  const painelRanking = document.querySelector('#ranking-21');
  const botaoRanking = document.querySelector('#ranking-21-botao');
  const botaoSom = document.querySelector('#som-21');
  let canal, mesa, anterior, ocupado, restaurarChat, consulta = 0, revelacao, resultadoVisto, carteira, limpando, embaralhado;
  // A pilha que você está montando. Zera quando a mesa é limpa: cada rodada se monta de novo.
  let montando = [];

  // ---------- Sons ----------
  // Tocam só pra quem está com a mesa aberta. O botão do cabeçalho desliga os sons
  // das atividades (21 e apostas); ensurdecer cala tudo.
  const tocar = criarSons(appState, () => !palco.hidden && palco.dataset.jogo === '21');
  const carta = somDeCarta, ficha = somDeFicha;
  function mostrarBotaoSom() {
    const rotulo = somLigado() ? 'Desligar sons da mesa' : 'Ligar sons da mesa';
    botaoSom.setAttribute('aria-pressed', String(somLigado()));
    botaoSom.setAttribute('aria-label', rotulo);
    botaoSom.title = rotulo;
  }
  botaoSom.onclick = () => {
    ligarSom(!somLigado());
    mostrarBotaoSom();
    tocar(ficha());
  };
  mostrarBotaoSom();

  // O título é do jogo aberto no salão; com outro na frente, o 21 guarda o seu.
  let titulo21 = 'Jogar 21';
  function mostrarTitulo(texto) {
    titulo21 = texto;
    if (palco.dataset.jogo === '21') titulo.textContent = texto;
  }
  window.addEventListener('teletela-aba-jogo', ev => { if (ev.detail.jogo === '21') titulo.textContent = titulo21; });

  // ---------- Peças ----------
  // cor: jogada da vez (.jogada-mesa), que vai pro grupo grande das jogadas.
  function botao(texto, acao, modo, secundario = false, cor) {
    const el = document.createElement('button');
    el.className = cor ? 'jogada-mesa' : secundario ? 'btn-secondary' : 'btn-primary';
    el.textContent = texto;
    el.dataset.acao = modo || acao;
    if (cor) el.dataset.cor = cor;
    el.disabled = ocupado;
    el.onclick = () => enviar(acao, modo);
    if (cor) {
      let grupo = acoes.querySelector('.jogadas-mesa');
      if (!grupo) { grupo = document.createElement('div'); grupo.className = 'jogadas-mesa'; acoes.prepend(grupo); }
      grupo.append(el);
    } else acoes.append(el);
    return el;
  }

  // O círculo de aposta impresso no feltro, na frente de cada lugar.
  function encher(roda, valor, ordem) {
    roda.replaceChildren();
    if (!valor) return;
    roda.append(pilha(valor, 'Aposta de ' + numero(valor) + ' fichas', ordem));
    const rotulo = document.createElement('small');
    rotulo.textContent = numero(valor);
    roda.append(rotulo);
  }

  const voarFichas = (...args) => voarPecas(feltro, ...args);
  const rosto = (id, nome) => rostoPeca(id, nome, pessoaDaCall);

  const ESTADOS = { Ganhou: 'ganhou', 'Ganhou por desistência': 'ganhou', Perdeu: 'perdeu', Estourou: 'estourou', Empatou: 'empatou' };

  // ---------- Assentos ----------
  // angulo: onde a pessoa senta na borda (90° é embaixo, no meio).
  // agenda: quando cada carta nova sai do monte (ms), por assento e índice.
  function assento({ id, nome, cartas, pontos, lugar, estado, linha, aposta, ordem, ganhoRodada, angulo }, agenda, onde = maos) {
    const bloco = document.createElement('section');
    bloco.className = 'lugar-21 ' + lugar;
    if (id) bloco.dataset.id = id;
    if (estado) bloco.dataset.estado = estado;
    if (angulo != null) {
      const rad = angulo * Math.PI / 180;
      bloco.classList.add('ao-redor');
      bloco.style.setProperty('--cos', Math.cos(rad).toFixed(3));
      bloco.style.setProperty('--sin', Math.sin(rad).toFixed(3));
      if (Math.sin(rad) < -.2) bloco.classList.add('em-cima');
    }
    const jogo = document.createElement('div');
    jogo.className = 'jogo-21';
    if (aposta !== undefined) {
      const roda = document.createElement('span');
      roda.className = 'aposta-21';
      encher(roda, aposta, ordem);
      jogo.append(roda);
    }
    const leque = document.createElement('div');
    leque.className = 'leque-21';
    const novas = [];
    for (const [i, valor] of cartas.entries()) {
      const el = cartaVisual(valor);
      leque.append(el);
      const quando = agenda?.get(id + ':' + i);
      if (quando != null) novas.push([el, quando]);
    }
    if (pontos != null && cartas.length) {
      const marca = document.createElement('span');
      marca.className = 'pontos-21';
      marca.textContent = pontos;
      if (pontos > 21) marca.classList.add('estouro');
      else if (pontos === 21) marca.classList.add('vinte-e-um');
      leque.append(marca);
      // O total só aparece quando a última carta pousa, pra não entregar a carta no ar.
      const ultima = Math.max(-1, ...novas.map(([, t]) => t));
      if (ultima >= 0 && !semMovimento.matches) {
        marca.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }],
          { duration: 260, delay: ultima + 340, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' });
      }
    }
    jogo.append(leque);
    bloco.append(jogo);
    if (nome) {
      const placa = document.createElement('div');
      placa.className = 'placa-21';
      placa.append(id === 'banca' ? iconeBanca() : rosto(id, nome));
      const textos = document.createElement('span');
      textos.className = 'textos-21';
      const cabecalho = document.createElement('h3');
      cabecalho.textContent = nome;
      textos.append(cabecalho);
      if (linha) {
        const info = document.createElement('small');
        info.textContent = linha;
        textos.append(info);
      }
      placa.append(textos);
      if (ganhoRodada != null) {
        const saldo = document.createElement('b');
        saldo.className = 'ganho-21';
        saldo.textContent = (ganhoRodada > 0 ? '+' : ganhoRodada < 0 ? '−' : '±') + Math.abs(ganhoRodada);
        placa.append(saldo);
      }
      bloco.append(placa);
    } else bloco.setAttribute('aria-hidden', 'true');
    onde.append(bloco);
    return novas;
  }

  // Lugares na borda. Contra a banca, todo mundo fica na metade de baixo e dos lados,
  // de frente pra banca; entre amigos, a roda fecha. Você sempre embaixo, no meio.
  function angulos() {
    const n = mesa.pessoas.length;
    const meu = Math.max(0, mesa.pessoas.findIndex(p => p.id === socket.id));
    const amigos = mesa.modo === 'amigos';
    const passo = amigos ? 360 / n : Math.min(70, 120 / Math.max(1, Math.ceil((n - 1) / 2)));
    return new Map(mesa.pessoas.map((p, i) => {
      const k = (i - meu + n) % n;
      const o = amigos || k <= (n - 1) / 2 ? k : k - n;
      return [p.id, 90 + o * passo];
    }));
  }

  const rodaDe = id => maos.querySelector('[data-id="' + CSS.escape(id) + '"] .aposta-21');


  function iconeBanca() {
    const el = document.createElement('span');
    el.className = 'rosto-21 banca';
    el.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="12" height="15" rx="2"/><path d="M9 3h10a2 2 0 0 1 2 2v12"/><path d="m9 11 1.5 2.5L9 16l-1.5-2.5z"/></svg>';
    return el;
  }

  // Ordem de mesa de verdade: uma carta pra cada um, a da banca, e a segunda volta.
  function agendaDaRodada() {
    const agenda = new Map();
    const lugares = [...mesa.pessoas.map(p => p.id), ...(mesa.modo === 'banca' ? ['banca'] : [])];
    let t = 650;
    for (const volta of [0, 1]) {
      for (const id of lugares) { agenda.set(id + ':' + volta, t); t += 150; }
    }
    return agenda;
  }

  function agendaDasNovas() {
    const agenda = new Map();
    const novaRodada = mesa.fase === 'jogando' && (anterior?.rodada !== mesa.rodada || anterior?.fase !== 'jogando');
    if (novaRodada) return [agendaDaRodada(), true];
    if (anterior?.rodada !== mesa.rodada) return [agenda, false];
    for (const p of mesa.pessoas) {
      const antes = anterior.pessoas.find(a => a.id === p.id)?.cartas.length ?? p.cartas.length;
      for (let i = antes; i < p.cartas.length; i++) agenda.set(p.id + ':' + i, 0);
    }
    // A banca compra uma por vez, com pausa, depois de virar a carta escondida.
    const antesBanca = anterior.banca.length;
    for (let i = antesBanca; i < mesa.banca.length; i++) agenda.set('banca:' + i, 700 + (i - antesBanca) * 650);
    return [agenda, false];
  }

  function voar(novas) {
    const origem = monte.getBoundingClientRect();
    for (const [el, quando] of novas) {
      tocar(carta(), quando);
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
    }
  }

  // ---------- Desenho ----------
  function desenhar(foco = document.activeElement?.dataset.acao) {
    clearTimeout(revelacao);
    maos.replaceChildren();
    acoes.replaceChildren(); painel.removeAttribute('data-vez');
    placar.hidden = true;
    mostrarTitulo(!mesa ? 'Jogar 21' : mesa.modo === 'banca' ? '21 contra a banca' : '21 entre amigos');
    palco.dataset.fase = mesa?.fase || 'abertura';
    palco.dataset.modo = mesa?.modo || '';
    const outros = mesa?.pessoas.filter(p => p.id !== socket.id).length || 1;
    maos.style.setProperty('--lugares', Math.min(4, outros));
    maos.style.setProperty('--lugares-movel', Math.min(2, outros));
    entrada.hidden = Boolean(mesa);
    entrada.querySelector('[value="1"]').disabled = !appState.myUser.accountId;
    if (!appState.myUser.accountId) entrada.querySelector('[value="0"]').checked = true;
    montar.hidden = true;
    mostrarCarteira();
    faixa.textContent = 'Cassino Colheita';
    if (!mesa) {
      anterior = null;
      const centro = document.createElement('div');
      centro.className = 'centro-21';
      maos.append(centro);
      assento({ cartas: [null, 'K♥', 'A♠'], lugar: 'amostra-21' }, null, centro);
      centro.append(arco);
      aviso.textContent = !appState.myUser.accountId ? 'Jogue só por diversão ou entre na sua conta pra apostar fichas.' : semFichas() ? 'Suas fichas acabaram. ' + quandoVolta() + ' Dá pra jogar só por diversão.' : 'Chegue perto de 21 sem passar. Escolha se vale fichas e o jeito de jogar.';
      fichas.hidden = true;
      botao('Contra a banca', 'criar', 'banca');
      botao('Entre amigos', 'criar', 'amigos', true);
      return;
    }
    const eu = mesa.pessoas.find(p => p.id === socket.id);
    const jogando = mesa.fase === 'jogando';
    const espera = mesa.fase === 'espera';
    const resultado = mesa.fase === 'resultado';
    const minimo = mesa.modo === 'amigos' ? 2 : 1;
    const [agenda, rodadaNova] = agendaDasNovas();
    const bancaVirou = resultado && anterior?.rodada === mesa.rodada && anterior.fase === 'jogando';
    const ultimaCartaBanca = Math.max(0, ...[...agenda].filter(([k]) => k.startsWith('banca:')).map(([, t]) => t));
    // Com a banca comprando, o resultado espera a última carta chegar.
    const atrasoResultado = bancaVirou && resultadoVisto !== mesa.rodada && !semMovimento.matches
      ? (mesa.modo === 'banca' ? ultimaCartaBanca + 550 : 450) : 0;

    // Esperando a rodada não precisa de explicação, só entre amigos sozinho na mesa.
    if (espera) aviso.textContent = mesa.modo === 'amigos' && mesa.pessoas.length < 2 ? 'Precisa de pelo menos duas pessoas.' : '';
    else if (jogando) aviso.textContent = !eu ? 'Rodada em andamento. Você entra na próxima.' : eu.parou ? (eu.pontos > 21 ? 'Passou de 21. Aguardando a mesa.' : 'Sua mão está fechada. Aguardando a mesa.') : 'Peça carta ou pare. O ás vale 1 ou 11.';
    else aviso.textContent = 'Rodada encerrada. ' + (eu?.resultado ? eu.resultado + '.' : 'Confira as mãos.') + ' A mesa já vai ser limpa.';
    // Pode montar a aposta: está sentado, a mesa vale fichas e a rodada ainda não começou.
    // Só com a mesa limpa: durante o resultado as fichas da rodada ainda estão nela.
    const podeApostar = Boolean(eu && mesa.fichas && espera && !eu.confirmou && eu.saldo >= MENOR_FICHA);
    if (eu) while (soma(montando) > eu.saldo) montando.pop();
    fichas.hidden = !mesa.fichas;
    if (mesa.fichas) {
      fichas.textContent = mesa.modo === 'amigos' && !espera && mesa.pote ? 'Pote de ' + numero(mesa.pote) + ' fichas' : '';
      if (jogando && eu) aviso.textContent += ' Sair agora perde a aposta.';
      if (eu?.confirmou) aviso.textContent += ' Aposta feita. Esperando a mesa.';
      if (eu && !jogando && eu.saldo < MENOR_FICHA) aviso.textContent += ' Suas fichas acabaram. ' + quandoVolta();
    }
    montar.hidden = !podeApostar;
    if (podeApostar) for (const el of montar.querySelectorAll('[data-ficha]')) el.disabled = soma(montando) + Number(el.dataset.ficha) > eu.saldo;

    const novas = [];
    const lugares = angulos();
    // Contra a banca: bandeja, banca e monte no alto. Entre amigos: monte e pote no meio.
    const centro = document.createElement('div');
    centro.className = 'centro-21';
    let pote = null;
    if (mesa.modo === 'banca') {
      const topo = document.createElement('div');
      topo.className = 'topo-21';
      topo.append(bandeja);
      novas.push(...assento({ id: 'banca', nome: 'Banca', cartas: mesa.banca, lugar: 'banca-21',
        pontos: mesa.pontosBanca, linha: resultado ? (mesa.pontosBanca > 21 ? 'Estourou' : 'Fechou') : jogando ? 'Para em 17' : '' }, agenda, topo));
      topo.append(monte);
      maos.append(topo);
      centro.append(arco, placar);
    } else {
      // Entre amigos o monte fica no meio, do lado do pote.
      const meio = document.createElement('div');
      meio.className = 'meio-21';
      meio.append(monte);
      centro.append(arco, placar, meio);
      if (mesa.fichas && !espera && mesa.pote) {
        pote = document.createElement('div');
        pote.className = 'pote-21';
        pote.append(pilha(mesa.pote, 'Pote de ' + numero(mesa.pote) + ' fichas'));
        const rotulo = document.createElement('small');
        rotulo.textContent = 'Pote · ' + numero(mesa.pote);
        pote.append(rotulo);
        meio.append(pote);
      }
    }
    maos.append(centro);
    for (const p of mesa.pessoas) {
      const meu = p.id === socket.id;
      const estado = resultado ? ESTADOS[p.resultado] : jogando ? (p.parou ? (p.pontos > 21 ? 'estourou' : 'parou') : 'vez') : p.confirmou ? 'pronto' : '';
      const linha = [
        resultado ? p.resultado : jogando ? (p.dobrou ? 'Dobrou' : p.parou ? 'Parou' : 'Jogando…') : p.confirmou ? 'Apostou' : '',
        mesa.fichas && numero(p.saldo) + ' fichas'
      ].filter(Boolean).join(' · ');
      // O que está no círculo: a aposta da vez; entre amigos, ela vai pro pote ao distribuir.
      // Você montando vê a pilha crescer no seu círculo.
      const ordem = meu && podeApostar ? montando : p.confirmou || (mesa.modo === 'banca' && p.aposta && (jogando || resultado)) ? p.pilha : null;
      const naRoda = !mesa.fichas ? undefined
        : ordem ? soma(ordem) : mesa.modo === 'banca' && (jogando || (resultado && p.cartas.length)) ? p.aposta : 0;
      novas.push(...assento({ id: p.id, nome: p.nome + (meu ? ' (você)' : ''), cartas: p.cartas, pontos: p.cartas.length ? p.pontos : null,
        lugar: meu ? 'minha-mao' : 'amigo-21', estado, linha, aposta: naRoda, ordem, angulo: lugares.get(p.id),
        ganhoRodada: mesa.fichas && resultado && p.resultado ? p.ganho - p.aposta : null }, agenda));
    }

    // Sons e fichas que não são de carta.
    // Se o monte já foi embaralhado na limpeza, não embaralha de novo ao dar as cartas.
    if (rodadaNova && !embaralhado) tocar('embaralhar', 0, .5);
    if (rodadaNova) embaralhado = false;
    for (const p of mesa.pessoas) {
      const antes = anterior?.pessoas.find(a => a.id === p.id);
      if (p.confirmou && antes && !antes.confirmou && p.id !== socket.id) {
        tocar(ficha());
        const roda = rodaDe(p.id);
        const pilhaNova = roda?.querySelector('.pilhas-21');
        const placa = roda?.closest('.lugar-21').querySelector('.placa-21');
        if (pilhaNova && placa && !semMovimento.matches) {
          const a = placa.getBoundingClientRect(), b = pilhaNova.getBoundingClientRect();
          pilhaNova.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }],
            { duration: 380, easing: 'cubic-bezier(.16, 1, .3, 1)' });
        }
      }
    }
    // Entre amigos, as apostas saem dos círculos e formam o pote.
    if (rodadaNova && pote && anterior) {
      const destino = pote.querySelector('.pilhas-21');
      if (!semMovimento.matches) destino?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 520, fill: 'backwards' });
      for (const [i, p] of mesa.pessoas.entries()) voarFichas(rodaDe(p.id), destino, p.aposta, i * 70);
      tocar('fichas', .2, .45);
    }
    if (mesa.pessoas.some(p => p.dobrou && !anterior?.pessoas.find(a => a.id === p.id)?.dobrou && anterior?.rodada === mesa.rodada)) tocar(ficha());
    if (bancaVirou && mesa.modo === 'banca') tocar('virar', 80);
    if (eu && jogando && anterior?.rodada === mesa.rodada) {
      const antes = anterior.pessoas.find(a => a.id === eu.id);
      if (eu.pontos > 21 && antes?.pontos <= 21) tocar('bater', 260, .5);
    }

    if (resultado) {
      maos.classList.toggle('revelando', atrasoResultado > 0);
      const mostrar = () => {
        maos.classList.remove('revelando');
        mostrarPlacar(eu);
        liquidar(pote, resultadoVisto !== mesa.rodada);
        resultadoVisto = mesa.rodada;
      };
      if (atrasoResultado) revelacao = setTimeout(mostrar, atrasoResultado);
      else mostrar();
      if (bancaVirou && mesa.modo === 'banca' && !semMovimento.matches) {
        virarRetro(maos.querySelector('.banca-21 .carta-21:nth-child(2)'), 80);
      }
    } else maos.classList.remove('revelando');
    voar(novas);
    anterior = mesa;

    if (!eu && mesa.fichas && !appState.myUser.accountId) aviso.textContent = 'Entre na sua conta pra jogar valendo fichas.';
    else if (!eu && !jogando && mesa.pessoas.length < 8) botao('Entrar na mesa', 'entrar');
    const comFichas = mesa.pessoas.filter(p => !mesa.fichas || p.saldo >= MENOR_FICHA).length;
    if (eu && espera && comFichas >= minimo && (!mesa.fichas || eu.saldo >= MENOR_FICHA)) {
      if (eu.confirmou) botao('Cancelar aposta', 'cancelar', undefined, true);
      else if (mesa.fichas) {
        const total = soma(montando);
        const el = botao(total ? 'Apostar ' + numero(total) + ' fichas' : 'Monte a aposta', 'iniciar');
        el.dataset.vazio = total ? '' : '1';
        el.disabled = !total || ocupado;
      } else botao('Dar as cartas', 'iniciar');
    }
    // Sua vez: parar, pedir e dobrar, sempre nessa ordem e com a cor de cada uma.
    const vez = Boolean(eu && jogando && !eu.parou);
    painel.toggleAttribute('data-vez', vez);
    if (vez) {
      botao('Parar', 'parar', undefined, true, 'vermelho');
      botao('Pedir carta', 'pedir', undefined, false, 'verde');
      // Dobrar: só contra a banca, nas duas primeiras cartas e com fichas pra cobrir
      if (mesa.modo === 'banca' && eu.cartas.length === 2 && (!mesa.fichas || eu.saldo >= eu.aposta)) {
        const el = botao('Dobrar', 'dobrar', undefined, true, 'amarelo');
        if (mesa.fichas) { const q = document.createElement('small'); q.textContent = '+' + numero(eu.aposta) + ' fichas'; el.append(q); }
      }
    }
    if (eu) botao('Sair da mesa', 'sair', undefined, true);
    if (foco && !ocupado) acoes.querySelector('[data-acao="' + foco + '"]')?.focus();
  }

  // Acerto das fichas: a banca recolhe de quem perdeu e paga quem ganhou;
  // entre amigos, o pote vai pros vencedores.
  function liquidar(pote, animar) {
    if (!mesa.fichas) return;
    let perdeu = false, ganhou = false;
    for (const p of mesa.pessoas) {
      const roda = rodaDe(p.id);
      if (!roda || !p.cartas.length || p.confirmou) continue;
      const final = p.resultado === 'Empatou' ? p.aposta : p.resultado.startsWith('Ganhou') ? p.ganho : 0;
      if (!animar) { encher(roda, final); continue; }
      if (mesa.modo === 'banca') {
        if (p.resultado.startsWith('Ganhou')) { ganhou = true; voarFichas(bandeja, roda, p.ganho - p.aposta, 0, () => { encher(roda, final); brilhar(roda); }); }
        else if (!final) { perdeu = true; voarFichas(roda, bandeja, p.aposta); encher(roda, 0); }
      } else if (final) { ganhou = true; voarFichas(pote?.querySelector('.pilhas-21'), roda, final, 0, () => { encher(roda, final); brilhar(roda); }); }
    }
    // O pote some assim que as fichas saem dele.
    pote?.remove();
    if (perdeu) tocar('fichas', .05, .4);
    if (ganhou) tocar('pote', .45, .6);
  }

  // O resultado de quem joga aparece no meio do feltro; quem assiste vê quem levou.
  function mostrarPlacar(eu) {
    let grande = '', pequeno = '', tom = '';
    const delta = eu && mesa.fichas ? eu.ganho - eu.aposta : 0;
    const fichasTexto = n => numero(Math.abs(n)) + (Math.abs(n) === 1 ? ' ficha' : ' fichas');
    if (eu) {
      const r = eu.resultado;
      if (r.startsWith('Ganhou')) { grande = r === 'Ganhou' ? (mesa.modo === 'banca' && eu.cartas.length === 2 && eu.pontos === 21 ? '21 de cara!' : eu.pontos === 21 ? 'Vinte e um!' : 'Você ganhou') : 'Ganhou por W.O.'; tom = 'ganhou'; }
      else if (r === 'Empatou') { grande = 'Empate'; tom = 'empatou'; pequeno = mesa.fichas && eu.aposta ? 'Aposta devolvida' : ''; }
      else if (r === 'Estourou') { grande = 'Estourou'; tom = 'perdeu'; }
      else { grande = mesa.modo === 'banca' ? 'A banca levou' : 'Não foi dessa vez'; tom = 'perdeu'; }
      if (mesa.fichas && delta) pequeno = (delta > 0 ? '+' : '−') + fichasTexto(delta);
    } else {
      const vencedores = mesa.pessoas.filter(p => p.resultado.startsWith('Ganhou')).map(p => p.nome);
      if (!vencedores.length) return;
      grande = vencedores.length === 1 ? vencedores[0] + ' levou' : vencedores.join(' e ') + ' levaram';
      tom = 'neutro';
    }
    placar.dataset.tom = tom;
    placar.querySelector('strong').textContent = grande;
    placar.querySelector('span').textContent = pequeno;
    placar.hidden = false;
    if (!semMovimento.matches && resultadoVisto !== mesa.rodada) {
      placar.animate([
        { opacity: 0, transform: 'scale(.86)', filter: 'blur(6px)' },
        { opacity: 1, transform: 'scale(1)', filter: 'blur(0)' }
      ], { duration: 420, easing: 'cubic-bezier(.16, 1, .3, 1)' });
    }
  }

  function enviar(acao, modo) {
    if (ocupado) return;
    if (!socket.connected) {
      aviso.textContent = 'Conecte-se ao servidor para jogar.';
      acoes.replaceChildren(); painel.removeAttribute('data-vez');
      botao('Atualizar mesa', 'ver');
      return;
    }
    const foco = document.activeElement?.dataset.acao;
    ocupado = true;
    for (const el of acoes.querySelectorAll('button')) el.disabled = true;
    const vez = ++consulta;
    const eu = mesa?.pessoas.find(p => p.id === socket.id);
    tocar.precarregar();
    socket.timeout(5000).emit('jogar-21', { canal, acao, modo, fichas: entrada.querySelector(':checked').value === '1', pilha: montando, rodada: mesa?.rodada, quantidade: eu?.cartas.length }, (erro, resposta) => {
      if (vez !== consulta || canal !== appState.currentChannelId || palco.hidden) return;
      ocupado = false;
      if (erro) {
        acoes.replaceChildren(); painel.removeAttribute('data-vez');
        aviso.textContent = 'A mesa não respondeu.';
        botao('Atualizar mesa', 'ver');
        return;
      }
      if (resposta?.carteira) novaCarteira(resposta.carteira);
      if (acao === 'ver') {
        mesa = resposta?.mesa;
        anterior = mesa;
        resultadoVisto = mesa?.fase === 'resultado' ? mesa.rodada : resultadoVisto;
        desenhar(foco);
      } else {
        // O servidor já enviou a mesa. Preserva as cartas que estão chegando.
        for (const el of acoes.querySelectorAll('button')) el.disabled = el.dataset.vazio === '1';
        if (foco) acoes.querySelector('[data-acao="' + foco + '"]')?.focus();
      }
      if (foco && document.activeElement === document.body) acoes.querySelector('button')?.focus();
      if (resposta?.erro) aviso.textContent = resposta.erro;
    });
  }

  // ---------- Carteira, aposta e ranking ----------
  const semFichas = () => Boolean(carteira && carteira.saldo < MENOR_FICHA);
  function quandoVolta() {
    if (!carteira?.voltaEm) return 'Na segunda você ganha mais 1.000.';
    const dia = new Date(carteira.voltaEm).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
    return 'Você ganha mais 1.000 ' + (dia.startsWith('segunda') ? 'na ' : 'em ') + dia + '.';
  }
  // Uma carteira só pra todas as atividades: avisa as outras e ouve quando elas mudam.
  function novaCarteira(c) {
    carteira = c;
    window.dispatchEvent(new CustomEvent('teletela-carteira', { detail: { carteira: c, de: '21' } }));
  }
  window.addEventListener('teletela-carteira', ev => {
    if (ev.detail.de === '21') return;
    carteira = ev.detail.carteira;
    const eu = mesa?.pessoas.find(p => p.id === socket.id);
    if (eu) eu.saldo = carteira.saldo;
    if (!palco.hidden) mostrarCarteira();
  });
  function mostrarCarteira() {
    const eu = mesa?.pessoas.find(p => p.id === socket.id);
    const saldo = eu?.saldo ?? carteira?.saldo;
    carteiraEl.hidden = saldo == null;
    if (saldo == null) return;
    carteiraEl.lastElementChild.textContent = numero(saldo);
    carteiraEl.title = 'Suas fichas: ' + numero(saldo);
    carteiraEl.setAttribute('aria-label', 'Suas fichas: ' + numero(saldo));
  }
  // Clicar numa ficha põe ela na pilha; a pilha cresce no seu círculo na mesa.
  montar.addEventListener('click', ev => {
    const el = ev.target.closest('button');
    const eu = mesa?.pessoas.find(p => p.id === socket.id);
    if (!el || !eu) return;
    if (el.dataset.ficha) {
      const v = Number(el.dataset.ficha);
      if (soma(montando) + v > eu.saldo) return;
      montando.push(v);
    } else if (el.dataset.montar === 'tudo') montando = decompor(eu.saldo).reverse();
    else montando = [];
    tocar(montando.length ? ficha() : 'bater', 0, montando.length ? .55 : .35);
    const foco = el.dataset.ficha ? '[data-ficha="' + el.dataset.ficha + '"]' : '[data-montar="' + el.dataset.montar + '"]';
    desenhar();
    // A ficha clicada cai no topo da coluna da cor dela.
    if (el.dataset.ficha) cairFicha(feltro, [...(rodaDe(socket.id)?.querySelectorAll('.pilha-21') || [])].findLast(c => c.dataset.cor === COR_FICHA[el.dataset.ficha]));
    montar.querySelector(foco)?.focus();
  });
  entrada.addEventListener('change', () => tocar(ficha()));

  function abrirRanking(abrir = painelRanking.hidden) {
    painelRanking.hidden = !abrir;
    botaoRanking.setAttribute('aria-expanded', String(abrir));
    if (!abrir) return;
    const lista = painelRanking.querySelector('ol');
    lista.replaceChildren();
    lista.setAttribute('aria-busy', 'true');
    socket.timeout(5000).emit('ranking-fichas', (erro, resposta) => {
      lista.removeAttribute('aria-busy');
      if (erro || !resposta?.lista) {
        const li = document.createElement('li');
        li.className = 'vazio-21';
        li.textContent = 'O ranking não respondeu.';
        lista.replaceChildren(li);
        return;
      }
      for (const p of resposta.lista) {
        const li = document.createElement('li');
        if (p.voce) li.classList.add('voce');
        if (p.posicao <= 3) li.dataset.podio = p.posicao;
        const pos = document.createElement('span');
        pos.className = 'posicao-21';
        pos.textContent = p.posicao;
        const nome = document.createElement('span');
        nome.className = 'nome-21';
        nome.textContent = p.nome + (p.voce ? ' (você)' : '');
        if (p.zerado) {
          const zerou = document.createElement('small');
          zerou.textContent = 'zerou · +1.000 na segunda';
          nome.append(zerou);
        }
        const saldo = document.createElement('span');
        saldo.className = 'saldo-21';
        saldo.textContent = numero(p.saldo);
        li.append(pos, nome, saldo);
        lista.append(li);
      }
    });
  }
  botaoRanking.onclick = () => abrirRanking();
  document.querySelector('#fechar-ranking-21').onclick = () => { abrirRanking(false); botaoRanking.focus(); };
  painelRanking.addEventListener('keydown', ev => { if (ev.key === 'Escape') { abrirRanking(false); botaoRanking.focus(); } });

  const atividades = document.querySelector('#btn-atividades');
  const ampliar = document.querySelector('#ampliar-21');

  function recolher() {
    if (palco.hidden) return;
    if (document.fullscreenElement === palco) document.exitFullscreen().catch(() => {});
    clearTimeout(revelacao);
    abrirRanking(false);
    feltro.querySelectorAll('.voando-21').forEach(el => el.remove());
    palco.hidden = true;
    atividades.setAttribute('aria-expanded', 'false');
    restaurarChat?.();
    restaurarChat = null;
    consulta++;
  }

  document.querySelector('#voltar-21').onclick = () => {
    recolher();
    const retorno = atividades.offsetWidth ? atividades : document.querySelector('#mobile-call-more');
    retorno?.focus();
  };
  ampliar.hidden = !document.fullscreenEnabled;
  ampliar.onclick = async () => {
    try {
      if (document.fullscreenElement === palco) await document.exitFullscreen();
      else await palco.requestFullscreen();
    } catch {
      aviso.textContent = 'A tela cheia está indisponível nesta janela.';
    }
  };
  document.addEventListener('fullscreenchange', () => {
    const rotulo = document.fullscreenElement === palco ? 'Reduzir mesa' : 'Tela cheia';
    ampliar.title = rotulo;
    ampliar.setAttribute('aria-label', rotulo);
  });

  // Se a pessoa ajustar o chat enquanto joga, vale a escolha dela.
  for (const id of ['btn-toggle-chat', 'btn-close-chat']) {
    document.getElementById(id)?.addEventListener('click', () => { restaurarChat = null; });
  }

  atividades.onclick = () => {
    if (!palco.hidden) { recolher(); return; }
    canal = appState.currentChannelId;
    if (!canal) return;
    restaurarChat = mostrarSala();
    mesa = null;
    anterior = null;
    ocupado = false;
    mostrarTitulo('Jogar 21');
    aviso.textContent = 'Abrindo a mesa…';
    entrada.hidden = true;
    fichas.hidden = true;
    montar.hidden = true;
    placar.hidden = true;
    maos.replaceChildren();
    acoes.replaceChildren(); painel.removeAttribute('data-vez');
    palco.hidden = false;
    atividades.setAttribute('aria-expanded', 'true');
    titulo.focus();
    enviar('ver');
  };
  // Fim do resultado: as cartas voltam pro monte e as fichas que ficaram nos círculos
  // vão pra placa de cada um. Depois a mesa é redesenhada vazia.
  function limparMesa(depois) {
    const origem = monte.getBoundingClientRect();
    const cartas = [...maos.querySelectorAll('.carta-21')];
    cartas.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      el.animate([{ transform: 'none', opacity: 1 }, { opacity: 1, offset: .7 },
        { transform: `translate(${origem.left + origem.width / 2 - r.left - r.width / 2}px, ${origem.top + origem.height / 2 - r.top - r.height / 2}px)`, opacity: 0 }],
      { duration: 380, delay: i * 35, easing: 'cubic-bezier(.5, 0, .75, 0)', fill: 'forwards' });
    });
    for (const roda of maos.querySelectorAll('.aposta-21')) {
      const valor = Number(roda.querySelector('small')?.textContent.replace(/\D/g, ''));
      if (valor) voarFichas(roda, roda.closest('.lugar-21')?.querySelector('.placa-21'), valor);
      roda.replaceChildren();
    }
    tocar('leque', 0, .4);
    limpando = setTimeout(depois, 420 + cartas.length * 35);
  }
  socket.on('mesa-21', dados => {
    if (!palco.hidden && dados.canal === canal && canal === appState.currentChannelId) {
      const limpou = mesa?.fase === 'resultado' && dados.mesa?.fase === 'espera' && dados.mesa.rodada === mesa.rodada;
      clearTimeout(limpando);
      mesa = dados.mesa;
      if (dados.carteira) novaCarteira(dados.carteira);
      if (limpou) montando = [];
      if (limpou && !semMovimento.matches) limparMesa(() => {
        desenhar();
        // Enquanto todo mundo monta a aposta, a banca embaralha o monte.
        embaralharMonte(monte);
        tocar('embaralhar', 0, .5);
        embaralhado = true;
      });
      else desenhar();
    }
  });
  socket.on('disconnect', recolher);
  return {
    recolher,
    sincronizar() {
      if (canal !== appState.currentChannelId || appState.browsingHome) recolher();
    }
  };
}
