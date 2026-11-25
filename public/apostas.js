// Apostas estilo Twitch no canal de voz: o card fica no topo do chat da call e também
// no painel de Atividades. Quem cria marca o resultado; o pote vai pra quem acertou,
// na proporção do que cada um pôs. As fichas são as mesmas do 21.
import { confirmar } from './confirmar.js';
import { criarSons, somDeFicha } from './sons-mesa.js';

const numero = n => n.toLocaleString('pt-BR');
const SVG = 'http://www.w3.org/2000/svg';

function icone(d) {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('class', 'icon-svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(SVG, 'path');
  p.setAttribute('d', d);
  svg.append(p);
  return svg;
}
const ICONE_APOSTA = 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4v10m-3-7.5c0-1.4 1.3-2 3-2s3 .7 3 2-1.3 1.8-3 2.2-3 .9-3 2.3 1.3 2 3 2 3-.6 3-2';
const ICONE_CERTO = 'M5 12.5 10 17 19 7';
const el = (tag, classe, texto) => { const e = document.createElement(tag); if (classe) e.className = classe; if (texto != null) e.textContent = texto; return e; };
const botao = (texto, classe = 'btn-secondary') => { const b = el('button', classe, texto); b.type = 'button'; return b; };

export function configurarApostas({ socket, appState, showToast }) {
  const hostChat = document.querySelector('#aposta-chat');
  const hostAtividades = document.querySelector('#aposta-atividades');
  const botaoChat = document.querySelector('#btn-chat-aposta');
  const botaoAtividades = document.querySelector('#apostas-21-botao');
  const painel = document.querySelector('#apostas-21');
  const dialogo = document.querySelector('#dialogo-aposta');
  const form = dialogo.querySelector('form');
  const listaOpcoes = dialogo.querySelector('.aposta-form-opcoes');
  const erroForm = dialogo.querySelector('.aposta-form-erro');

  let aposta = null, carteira = null, canal = null;
  let escolhida = null, valor = 100, ocupado = false, recolhido = false;
  let relogio = 0;
  const vistas = new Set(); // apostas que já avisaram com toast
  const ocultas = new Set(JSON.parse(sessionStorage.getItem('teletela-apostas-ocultas') || '[]'));

  // Toca pra quem está vendo o card, no chat da call ou no painel das Atividades.
  const tocar = criarSons(appState, () => !hostChat.hidden || !painel.hidden);

  const ativa = () => aposta && ['aberta', 'fechada'].includes(aposta.fase);
  const restante = () => Math.max(0, Math.ceil((aposta.fechaEm - Date.now()) / 1000));
  const tempo = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

  function pedir(acao, extra = {}) {
    if (!canal) return Promise.resolve({ erro: 'Entre num canal de voz.' });
    tocar.precarregar();
    return new Promise(resolve => {
      socket.timeout(6000).emit('aposta', { canal, id: aposta?.id, acao, ...extra }, (erro, r) => resolve(erro ? { erro: 'O servidor não respondeu.' } : r || {}));
    });
  }

  function status() {
    if (aposta.fase === 'aberta') return 'Aposta de ' + aposta.criador + ' · fecha em ' + tempo(restante());
    if (aposta.fase === 'fechada') return 'Apostas fechadas · ' + aposta.criador + ' vai marcar o resultado';
    if (aposta.fase === 'cancelada') return 'Aposta cancelada · as fichas voltaram';
    return aposta.devolvida ? 'Ninguém acertou · as fichas voltaram' : 'Resultado';
  }

  function resumoMeu() {
    const meu = aposta.meu;
    const saldo = carteira ? ' · você tem ' + numero(carteira.saldo) + ' fichas' : '';
    if (!appState.myUser.accountId && aposta.fase === 'aberta') return 'Entre na sua conta pra apostar.';
    if (!meu) return aposta.fase === 'aberta' ? 'Escolha uma opção e quantas fichas.' + saldo : 'Você ficou de fora dessa.';
    const nome = aposta.opcoes.find(o => o.id === meu.opcao)?.texto;
    if (aposta.fase === 'resolvida' && !aposta.devolvida) {
      return meu.ganho ? 'Você ganhou ' + numero(meu.ganho) + ' fichas (lucro de ' + numero(meu.ganho - meu.valor) + ').' : 'Você perdeu ' + numero(meu.valor) + ' fichas em ' + nome + '.';
    }
    if (['cancelada', 'resolvida'].includes(aposta.fase)) return 'Suas ' + numero(meu.valor) + ' fichas voltaram.';
    return 'Você pôs ' + numero(meu.valor) + ' em ' + nome + saldo + '.';
  }

  // O mesmo card nos dois lugares; cada host recebe uma cópia.
  function card(noChat) {
    const raiz = el('section', 'aposta-card');
    raiz.dataset.fase = aposta.fase;
    raiz.setAttribute('aria-label', 'Aposta: ' + aposta.titulo);
    const topo = el('header', 'aposta-topo');
    const st = el('span', 'aposta-status', status());
    st.dataset.relogio = '';
    topo.append(icone(ICONE_APOSTA), st);
    if (noChat) {
      const fim = !ativa();
      const b = botao('', 'btn-icon-close aposta-recolher');
      b.setAttribute('aria-label', fim ? 'Esconder resultado' : recolhido ? 'Mostrar aposta' : 'Recolher aposta');
      b.title = b.getAttribute('aria-label');
      b.append(icone(fim ? 'M6 6l12 12M18 6 6 18' : recolhido ? 'm6 9 6 6 6-6' : 'm6 15 6-6 6 6'));
      b.onclick = () => {
        if (fim) { ocultas.add(aposta.id); sessionStorage.setItem('teletela-apostas-ocultas', JSON.stringify([...ocultas])); }
        else recolhido = !recolhido;
        desenhar();
      };
      topo.append(b);
    }
    raiz.append(topo, el('h3', 'aposta-titulo', aposta.titulo));
    if (noChat && recolhido && ativa()) return raiz;

    const aberta = aposta.fase === 'aberta';
    const decidindo = aposta.possoDecidir && ativa();
    const travada = aposta.meu?.opcao;
    const lista = el('ol', 'aposta-opcoes');
    for (const o of aposta.opcoes) {
      const li = el('li');
      const linha = botao('', 'aposta-opcao');
      linha.dataset.opcao = o.id;
      linha.style.setProperty('--parte', (aposta.total ? o.total / aposta.total * 100 : 0) + '%');
      const venceu = aposta.fase === 'resolvida' && aposta.vencedora === o.id;
      if (venceu) linha.classList.add('venceu');
      if (aposta.meu?.opcao === o.id) linha.classList.add('minha');
      const selecionada = (travada || escolhida) === o.id;
      linha.setAttribute('aria-pressed', String(Boolean(aberta && selecionada)));
      linha.disabled = !appState.myUser.accountId || !aberta || Boolean(travada && travada !== o.id) || !canal;
      const nome = el('span', 'aposta-nome', o.texto);
      if (venceu) nome.prepend(icone(ICONE_CERTO));
      const pct = aposta.total ? Math.round(o.total / aposta.total * 100) : 0;
      const num = el('span', 'aposta-num', pct + '%');
      const detalhes = el('span', 'aposta-detalhe',
        numero(o.total) + ' fichas · ' + o.pessoas + (o.pessoas === 1 ? ' pessoa' : ' pessoas') + (o.paga ? ' · paga ' + o.paga.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '×' : ''));
      if (o.maiores.length) detalhes.title = o.maiores.map(m => m.nome + ': ' + numero(m.valor)).join('\n');
      linha.append(nome, num, detalhes);
      linha.onclick = () => { escolhida = o.id; desenhar(); hostDe(noChat).querySelector('.aposta-valor input')?.focus(); };
      li.append(linha);
      // O resultado só é marcado depois de fechar, como na Twitch: evita clique sem querer.
      if (decidindo && aposta.fase === 'fechada') {
        const marcar = botao('Aconteceu', 'btn-secondary aposta-marcar');
        marcar.setAttribute('aria-label', 'Marcar "' + o.texto + '" como resultado');
        marcar.onclick = async () => {
          if (!await confirmar('Marcar "' + o.texto + '" como o que aconteceu? O pote vai pra quem apostou nela.', { confirmar: 'Marcar resultado' })) return;
          aviso(await pedir('resolver', { opcao: o.id }));
        };
        li.append(marcar);
      }
      lista.append(li);
    }
    raiz.append(lista);

    const saldo = carteira?.saldo || 0;
    if (aberta && canal && appState.myUser.accountId) {
      const opcao = travada || escolhida;
      const form = el('form', 'aposta-valor');
      const rotulo = el('label', 'sr-only', 'Quantas fichas');
      const id = 'aposta-valor-' + (noChat ? 'chat' : 'atividades');
      rotulo.htmlFor = id;
      const input = el('input', 'form-input');
      // De 5 em 5, como o resto do app; só o all-in vale o que sobrou na carteira.
      const cinco = v => v >= saldo ? saldo : Math.max(5, Math.round(v / 5) * 5);
      Object.assign(input, { id, type: 'number', min: 5, max: Math.max(5, saldo), step: 5, inputMode: 'numeric', value: Math.min(cinco(valor), saldo) || '' });
      valor = Number(input.value) || 0;
      input.oninput = () => { valor = Math.floor(Number(input.value)) || 0; enviar.textContent = rotuloEnviar(); enviar.disabled = !pode(); };
      input.onblur = () => { if (valor) { valor = cinco(valor); input.value = valor; input.oninput(); } };
      const rapidos = el('div', 'aposta-rapidos');
      for (const [r, v] of [['+10', 10], ['+50', 50], ['+100', 100], ['All-in', null]]) {
        const b = botao(r);
        b.onclick = () => { valor = v == null ? saldo : Math.min(saldo, cinco(Number(input.value) || 0) + v); input.value = valor; input.oninput(); };
        rapidos.append(b);
      }
      const nomeOpcao = aposta.opcoes.find(o => o.id === opcao)?.texto;
      const pode = () => Boolean(opcao) && valor >= Math.min(5, saldo) && valor <= saldo && !ocupado;
      const rotuloEnviar = () => !opcao ? 'Escolha uma opção' : (travada ? 'Pôr mais ' : 'Apostar ') + numero(valor || 0) + ' em ' + nomeOpcao;
      const enviar = el('button', 'btn-primary', rotuloEnviar());
      enviar.type = 'submit';
      enviar.disabled = !pode();
      form.onsubmit = async ev => {
        ev.preventDefault();
        valor = cinco(valor);
        if (!pode()) return;
        ocupado = true; enviar.disabled = true;
        const r = await pedir('palpitar', { opcao, valor });
        ocupado = false;
        aviso(r);
        if (!r.erro) escolhida = null;
        desenhar();
      };
      form.append(rotulo, input, rapidos, enviar);
      raiz.append(form);
    }
    raiz.append(el('p', 'aposta-meu', resumoMeu()));

    if (decidindo) {
      const rodape = el('footer', 'aposta-dono');
      if (aberta) {
        const fechar = botao('Fechar apostas');
        fechar.onclick = async () => aviso(await pedir('fechar'));
        rodape.append(fechar);
      }
      const cancelar = botao('Cancelar e devolver');
      cancelar.onclick = async () => {
        if (await confirmar('Cancelar a aposta? Todo mundo recebe as fichas de volta.', { confirmar: 'Cancelar aposta', perigo: true })) aviso(await pedir('cancelar'));
      };
      rodape.append(cancelar);
      raiz.append(rodape);
    }
    return raiz;
  }
  const hostDe = noChat => noChat ? hostChat : hostAtividades;

  function vazio() {
    const raiz = el('div', 'aposta-vazia');
    raiz.append(el('p', '', canal && !appState.myUser.accountId ? 'Nenhuma aposta rolando neste canal. Entre na sua conta pra criar uma.' : canal ? 'Nenhuma aposta rolando neste canal. Pergunte algo que vai acontecer na call ou no jogo e a turma aposta fichas.' : 'Entre num canal de voz pra ver e criar apostas.'));
    if (canal && appState.myUser.accountId) {
      const criar = botao('Criar aposta', 'btn-primary');
      criar.onclick = abrirDialogo;
      raiz.append(criar);
    }
    return raiz;
  }

  function aviso(r) { if (r?.erro) showToast(r.erro, 'error'); }

  function desenhar() {
    // Mantém o foco no que a pessoa estava usando quando o card é refeito.
    const ativo = document.activeElement;
    const foco = ativo && (hostChat.contains(ativo) || hostAtividades.contains(ativo))
      ? { chat: hostChat.contains(ativo), opcao: ativo.dataset.opcao, valor: ativo.closest('.aposta-valor') && ativo.tagName === 'INPUT', texto: ativo.textContent } : null;
    const noTexto = Boolean(appState.textView);
    const mostrarChat = Boolean(aposta && canal && !noTexto && !ocultas.has(aposta.id));
    hostChat.hidden = !mostrarChat;
    hostChat.replaceChildren(...(mostrarChat ? [card(true)] : []));
    hostAtividades.replaceChildren(aposta ? card(false) : vazio());
    if (appState.myUser.accountId && aposta && !ativa()) {
      const nova = botao('Criar outra aposta', 'btn-secondary aposta-outra');
      nova.onclick = abrirDialogo;
      hostAtividades.append(nova);
    }
    botaoChat.hidden = !canal || noTexto || (!ativa() && !appState.myUser.accountId);
    const rotulo = ativa() ? 'Ver a aposta' : 'Criar aposta';
    botaoChat.title = rotulo;
    botaoChat.setAttribute('aria-label', rotulo);
    botaoChat.classList.toggle('tem-aposta', Boolean(ativa()));
    botaoAtividades.classList.toggle('tem-aposta', Boolean(ativa()));
    if (foco) {
      const host = hostDe(foco.chat);
      const alvo = foco.valor ? host.querySelector('.aposta-valor input')
        : foco.opcao ? host.querySelector('[data-opcao="' + foco.opcao + '"]')
        : [...host.querySelectorAll('button')].find(b => b.textContent === foco.texto);
      alvo?.focus();
    }
    clearInterval(relogio);
    if (aposta?.fase === 'aberta') {
      relogio = setInterval(() => {
        if (aposta?.fase !== 'aberta') return clearInterval(relogio);
        for (const s of document.querySelectorAll('.aposta-status[data-relogio]')) s.textContent = status();
      }, 1000);
    }
  }

  function receber(dados) {
    if (!dados || dados.canal !== canal) return;
    const antes = aposta;
    aposta = dados.aposta;
    if (dados.carteira) { carteira = dados.carteira; window.dispatchEvent(new CustomEvent('teletela-carteira', { detail: { carteira, de: 'apostas' } })); }
    if (aposta?.id !== antes?.id) { escolhida = null; recolhido = false; }
    // Avisa quem está na call quando abre uma aposta nova (menos quem criou).
    if (aposta?.fase === 'aberta' && !vistas.has(aposta.id)) {
      vistas.add(aposta.id);
      if (antes !== undefined && !aposta.souCriador) showToast(aposta.criador + ' abriu uma aposta: ' + aposta.titulo, 'normal', 5000);
    }
    if (antes?.id === aposta?.id && antes?.fase !== aposta?.fase && aposta && ['resolvida', 'cancelada'].includes(aposta.fase) && aposta.meu) {
      showToast(resumoMeu(), aposta.meu.ganho > aposta.meu.valor ? 'success' : 'normal', 5000);
    }
    desenhar();
    if (antes !== undefined) somDaMudanca(antes, aposta);
  }

  function somDaMudanca(antes, agora) {
    if (!agora) return;
    if (agora.id !== antes?.id) { if (agora.fase === 'aberta') tocar('bater', 0, .5); return; }
    // Suas fichas fazem a pilha inteira; as dos outros, uma ficha baixinho.
    if ((agora.meu?.valor || 0) > (antes.meu?.valor || 0)) tocar('fichas', 0, .6);
    else if (agora.total > antes.total) tocar(somDeFicha(), 0, .3);
    if (agora.fase === antes.fase) return;
    if (agora.fase === 'fechada') tocar('virar', 0, .5);
    else if (agora.fase === 'cancelada') tocar('fichas', 0, .45);
    else if (agora.fase === 'resolvida') {
      const meu = agora.meu;
      if (agora.devolvida) tocar('fichas', 0, .45);
      else if (meu?.ganho) { tocar('pote', 0, .6); tocar('fichas', 260, .55); }
      else if (meu) tocar('bater', 0, .3);
      else tocar('pote', 0, .3);
    }
  }

  async function entrar() {
    canal = appState.currentChannelId || null;
    aposta = null;
    desenhar();
    if (!canal) return;
    const pedido = canal;
    const r = await pedir('ver');
    if (pedido !== canal || r.erro) return;
    aposta = undefined;
    receber({ canal, ...r });
  }

  // ---------- Criar ----------
  function linhaOpcao(valorInicial = '') {
    const li = el('li');
    const n = listaOpcoes.children.length + 1;
    const input = el('input', 'form-input');
    Object.assign(input, { type: 'text', maxLength: 40, value: valorInicial, placeholder: 'Opção ' + n, required: n <= 2 });
    input.setAttribute('aria-label', 'Opção ' + n);
    const tirar = botao('', 'btn-icon-close');
    tirar.setAttribute('aria-label', 'Tirar opção ' + n);
    tirar.title = 'Tirar opção';
    tirar.append(icone('M6 6l12 12M18 6 6 18'));
    tirar.onclick = () => { li.remove(); renumerar(); listaOpcoes.querySelector('input')?.focus(); };
    li.append(input, tirar);
    return li;
  }
  function renumerar() {
    [...listaOpcoes.children].forEach((li, i) => {
      const input = li.querySelector('input');
      input.placeholder = 'Opção ' + (i + 1);
      input.setAttribute('aria-label', 'Opção ' + (i + 1));
      input.required = i < 2;
      li.querySelector('button').hidden = listaOpcoes.children.length <= 2;
    });
    dialogo.querySelector('[data-mais]').disabled = listaOpcoes.children.length >= 10;
  }
  function abrirDialogo() {
    if (!canal) return showToast('Entre num canal de voz pra criar uma aposta.');
    if (!appState.myUser.accountId) return showToast('Entre na sua conta pra apostar.');
    if (ativa()) return showToast('Já tem uma aposta rolando neste canal.');
    form.reset();
    erroForm.textContent = '';
    listaOpcoes.replaceChildren(linhaOpcao(), linhaOpcao());
    renumerar();
    dialogo.showModal();
    form.elements.titulo.focus();
  }
  dialogo.querySelector('[data-mais]').onclick = () => {
    if (listaOpcoes.children.length >= 10) return;
    const li = linhaOpcao();
    listaOpcoes.append(li);
    renumerar();
    li.querySelector('input').focus();
  };
  dialogo.querySelector('[data-cancelar]').onclick = () => dialogo.close();
  form.onsubmit = async ev => {
    ev.preventDefault();
    const enviar = form.querySelector('[type=submit]');
    enviar.disabled = true;
    const r = await pedir('criar', {
      titulo: form.elements.titulo.value,
      opcoes: [...listaOpcoes.querySelectorAll('input')].map(i => i.value.trim()).filter(Boolean),
      segundos: Number(form.elements.tempo.value)
    });
    enviar.disabled = false;
    if (r.erro) { erroForm.textContent = r.erro; return; }
    dialogo.close();
  };

  // ---------- Onde aparece ----------
  botaoChat.onclick = () => {
    if (!ativa()) return abrirDialogo();
    ocultas.delete(aposta.id);
    recolhido = false;
    desenhar();
    hostChat.querySelector('.aposta-opcao:not(:disabled), button')?.focus();
  };
  function abrirPainel(abrir = painel.hidden) {
    painel.hidden = !abrir;
    botaoAtividades.setAttribute('aria-expanded', String(abrir));
    if (abrir) { desenhar(); painel.querySelector('button:not(:disabled)')?.focus(); }
  }
  botaoAtividades.onclick = () => {
    if (painel.hidden && !document.querySelector('#ranking-21').hidden) document.querySelector('#fechar-ranking-21').click();
    abrirPainel();
  };
  // Um painel por vez em cima da mesa; sair das Atividades fecha.
  for (const id of ['ranking-21-botao', 'voltar-21', 'btn-atividades']) document.getElementById(id)?.addEventListener('click', () => { if (!painel.hidden) abrirPainel(false); });
  document.querySelector('#fechar-apostas-21').onclick = () => { abrirPainel(false); botaoAtividades.focus(); };
  painel.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !dialogo.open) { abrirPainel(false); botaoAtividades.focus(); } });

  // As fichas são uma carteira só: o 21 também avisa quando o saldo muda.
  window.addEventListener('teletela-carteira', ev => {
    if (ev.detail.de === 'apostas') return;
    carteira = ev.detail.carteira;
    if (aposta) desenhar();
  });
  socket.on('aposta', receber);
  socket.on('connect', () => { if (appState.currentChannelId) entrar(); });
  window.addEventListener('teletela-call-joined', entrar);
  window.addEventListener('teletela-call-left', entrar);
  window.addEventListener('teletela-chat-view', desenhar);
  entrar();

  return { abrirDialogo, fecharPainel: () => abrirPainel(false) };
}
