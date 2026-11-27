// Salão das Atividades: a entrada, com um cartão por jogo e quem está jogando agora.
// Abrir Atividades cai aqui, a não ser que você esteja sentado numa mesa (aí volta
// pra ela). O status vem dos mesmos eventos que o servidor já manda pras mesas.
export function configurarSalao({ socket, appState }) {
  const palco = document.querySelector('#mesa-21');
  const titulo = document.querySelector('#titulo-21');
  const salao = document.querySelector('#salao-jogos');
  const voltar = document.querySelector('#voltar-salao');
  const paineis = { salao, '21': document.querySelector('#jogo-21'), poker: document.querySelector('#jogo-poker'), roleta: document.querySelector('#jogo-roleta'), comilanca: document.querySelector('#jogo-comilanca'), cassino: document.querySelector('#jogo-cassino') };
  // Pela classe do cartão: o próprio palco também tem data-jogo (o jogo aberto), e o
  // seletor solto pegava o primeiro cartão de dentro dele.
  const cartao = nome => salao.querySelector('.salao-cartao[data-jogo="' + nome + '"]');
  const statusEl = nome => cartao(nome).querySelector('.salao-status');

  let jogo = 'salao', canal = null;
  const estado = { '21': null, poker: null, roleta: null, aposta: null };

  function escolher(novo, focar = false) {
    jogo = novo;
    for (const [nome, el] of Object.entries(paineis)) el.hidden = nome !== novo;
    palco.dataset.jogo = novo;
    voltar.hidden = novo === 'salao';
    if (novo === 'salao') titulo.textContent = 'Atividades';
    window.dispatchEvent(new CustomEvent('teletela-aba-jogo', { detail: { jogo: novo } }));
    if (focar) (novo === 'salao' ? salao.querySelector('.salao-cartao') : titulo).focus();
  }

  // Sentado numa mesa: abrir Atividades leva de volta pra ela.
  const sentadoEm = () => estado.poker?.eu != null ? 'poker'
    : estado['21']?.pessoas.some(p => p.id === socket.id) ? '21'
    : estado.roleta?.apostas.some(a => a.id === socket.id) ? 'roleta' : 'salao';

  function marcar(nome, texto, vivo = false, chamando = false) {
    const el = statusEl(nome);
    el.textContent = texto;
    cartao(nome).dataset.vivo = vivo ? '1' : '';
    cartao(nome).classList.toggle('chamando', chamando);
  }

  function desenhar() {
    const m21 = estado['21'];
    const n21 = m21?.pessoas.length || 0;
    const eu21 = m21?.pessoas.some(p => p.id === socket.id);
    marcar('21', !n21 ? 'Ninguém jogando'
      : (n21 === 1 ? '1 pessoa' : n21 + ' pessoas') + (m21.modo === 'banca' ? ' contra a banca' : ' entre amigos') + (eu21 ? ' · você está na mesa' : ''), n21 > 0);

    const mp = estado.poker;
    const np = mp ? mp.lugares.filter(Boolean).length : 0;
    const suaVez = Boolean(mp?.jogadas);
    marcar('poker', suaVez ? 'Sua vez!' : !np ? 'Ninguém jogando'
      : (np === 1 ? '1 pessoa' : np + ' pessoas') + ' na mesa' + (mp.eu != null ? ' · você está nela' : ''), np > 0, suaVez);

    const mr = estado.roleta;
    const nr = mr?.apostas.length || 0;
    marcar('roleta', mr?.fase === 'girando' ? 'Girando…' : mr?.fase === 'resultado' ? 'Deu ' + mr.numero
      : mr?.fase === 'apostando' ? 'Apostas abertas · ' + (nr === 1 ? '1 pessoa' : nr + ' pessoas') : 'Ninguém jogando',
      Boolean(mr && mr.fase !== 'espera'));

    const a = estado.aposta;
    const aberta = a && a.fase === 'aberta';
    marcar('apostas', aberta ? 'Aberta: ' + a.titulo : a?.fase === 'fechada' ? 'Esperando o resultado' : 'Nenhuma aberta agora',
      Boolean(aberta || a?.fase === 'fechada'));
    // Quem fala por leitor de tela ouve o jogo e o status juntos.
    for (const nome of ['21', 'poker', 'roleta', 'apostas']) {
      const c = cartao(nome);
      c.setAttribute('aria-label', c.querySelector('strong').textContent + '. ' + statusEl(nome).textContent);
    }
  }

  // Pede o estado de todas ao entrar no canal e ao abrir o salão.
  function consultar() {
    if (!canal) return;
    const pedido = canal;
    socket.timeout(6000).emit('jogar-21', { canal, acao: 'ver' }, (erro, r) => { if (!erro && pedido === canal && r) { estado['21'] = r.mesa; desenhar(); } });
    socket.timeout(6000).emit('jogar-poker', { canal, acao: 'ver' }, (erro, r) => { if (!erro && pedido === canal && r && !r.erro) { estado.poker = r.mesa; desenhar(); } });
    socket.timeout(6000).emit('jogar-roleta', { canal, acao: 'ver' }, (erro, r) => { if (!erro && pedido === canal && r && !r.erro) { estado.roleta = r.mesa; desenhar(); } });
    socket.timeout(6000).emit('aposta', { canal, acao: 'ver' }, (erro, r) => { if (!erro && pedido === canal && r && !r.erro) { estado.aposta = r.aposta || null; desenhar(); } });
  }
  function entrarNoCanal() {
    canal = appState.currentChannelId || null;
    estado['21'] = estado.poker = estado.roleta = estado.aposta = null;
    desenhar();
    consultar();
  }

  socket.on('mesa-21', d => { if (d.canal === canal) { estado['21'] = d.mesa; desenhar(); } });
  socket.on('mesa-poker', d => { if (d.canal === canal) { estado.poker = d.mesa; desenhar(); } });
  socket.on('mesa-roleta', d => { if (d.canal === canal) { estado.roleta = d.mesa; desenhar(); } });
  socket.on('aposta', d => { if (d?.canal === canal) { estado.aposta = d.aposta || null; desenhar(); } });

  salao.addEventListener('click', ev => {
    const el = ev.target.closest('.salao-cartao');
    if (!el) return;
    // As apostas abrem no painel lateral, por cima do salão.
    if (el.dataset.jogo === 'apostas') document.querySelector('#apostas-21-botao').click();
    else escolher(el.dataset.jogo, true);
  });
  voltar.onclick = () => escolher('salao', true);

  // Ao abrir o palco: volta pra mesa onde você está, senão o salão.
  new MutationObserver(() => {
    if (palco.hidden) return;
    if (canal !== appState.currentChannelId) entrarNoCanal();
    else consultar();
    escolher(sentadoEm());
  }).observe(palco, { attributes: true, attributeFilter: ['hidden'] });

  socket.on('connect', () => { if (appState.currentChannelId) entrarNoCanal(); });
  window.addEventListener('teletela-call-joined', entrarNoCanal);
  window.addEventListener('teletela-call-left', entrarNoCanal);
  escolher('salao');
  entrarNoCanal();
  return { escolher, jogoAberto: () => jogo };
}
