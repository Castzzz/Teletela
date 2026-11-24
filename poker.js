// Texas Hold'em na call: uma mesa por canal, ao lado da mesa de 21. Blinds fixos de
// 5/10, cada um senta com quanto quiser da carteira e sai quando quiser. As fichas só
// saem da carteira quando vão pro pote (como no 21), então o ranking mostra o saldo
// real e um reinício do servidor só perde o pote da mão em andamento.
import { randomInt, randomUUID } from 'node:crypto';
import { FichasStore } from './fichas-store.js';

export const SMALL = 5, BIG = 10;
export const PRAZO_VEZ = 60e3;
export const LUGARES = 8;
export const FICHAS_DIVERSAO = 1000;
const PAUSA_FOLD = 3500;     // mão que acabou sem mostrar cartas
const PAUSA_SHOWDOWN = 7000; // tempo pra ver quem levou antes da próxima
const FALTAS_PRA_AUSENTE = 2;

// ---------- Avaliação das mãos ----------
// Fica em public/poker-maos.js porque a mesa no app usa a mesma conta.
import { comparar, nomeDaMao, melhorMao } from './public/poker-maos.js';
export { comparar, nomeDaMao, melhorMao };

function embaralhar() {
  const cartas = [];
  for (const naipe of '♠♥♦♣') for (const v of 'A 2 3 4 5 6 7 8 9 10 J Q K'.split(' ')) cartas.push(v + naipe);
  for (let i = cartas.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
  }
  return cartas;
}

// Potes paralelos pelo que cada um pôs na mão inteira. Quem largou ajuda a pagar,
// mas não concorre. Um pote com um só elegível é a sobra que ninguém cobriu: volta.
export function montarPotes(jogadores) {
  const niveis = [...new Set(jogadores.filter(j => !j.foldou && j.total > 0).map(j => j.total))].sort((a, b) => a - b);
  const potes = [];
  let anterior = 0;
  for (const [i, nivel] of niveis.entries()) {
    const teto = i === niveis.length - 1 ? Infinity : nivel;
    const valor = jogadores.reduce((s, j) => s + Math.max(0, Math.min(j.total, teto) - anterior), 0);
    const elegiveis = jogadores.filter(j => !j.foldou && j.total >= nivel);
    if (valor) potes.push({ valor, elegiveis });
    anterior = nivel;
  }
  return potes;
}

export function criarMesasPoker({ io, channels, fichas = new FichasStore(), novoBaralho = embaralhar, agora = Date.now, relogio = globalThis }) {
  const mesas = new Map();    // canal -> mesa
  const usuarios = new Map(); // socket.id -> { chave, nome }

  const saldo = j => fichas.pegar(j.chave, j.nome).saldo;
  const sentados = mesa => mesa.lugares.filter(Boolean);
  const naMao = mesa => mesa.fase === 'jogando' ? sentados(mesa).filter(j => j.cartas.length) : [];
  const vivos = mesa => naMao(mesa).filter(j => !j.foldou);
  const podeJogar = j => !j.ausente && !j.saiu && j.pilha > 0;

  // Próximo lugar depois de `de`, girando a mesa, que passa no filtro.
  function proximo(mesa, de, filtro) {
    for (let k = 1; k <= LUGARES; k++) {
      const j = mesa.lugares[(de + k) % LUGARES];
      if (j && filtro(j)) return j;
    }
    return null;
  }

  function por(mesa, j, quanto) {
    const x = Math.max(0, Math.min(quanto, j.pilha));
    j.pilha -= x; j.naRua += x; j.total += x;
    if (mesa.fichas && x) fichas.mover(j.chave, -x);
    if (!j.pilha) j.allin = true;
    return x;
  }

  function limparTimer(mesa) { relogio.clearTimeout(mesa.timer); mesa.timer = null; }

  function agendarVez(mesa) {
    limparTimer(mesa);
    mesa.prazo = agora() + PRAZO_VEZ;
    const vez = mesa.vez, mao = mesa.mao, passo = mesa.passo;
    mesa.timer = relogio.setTimeout(() => {
      if (mesas.get(mesa.canal) !== mesa || mesa.mao !== mao || mesa.passo !== passo) return;
      const j = mesa.lugares[vez];
      if (!j) return;
      j.faltas++;
      if (j.faltas >= FALTAS_PRA_AUSENTE) j.ausente = true;
      agir(mesa, j, j.naRua === mesa.apostaAtual ? 'passar' : 'largar', 0, true);
      atualizar(mesa.canal);
    }, PRAZO_VEZ);
    mesa.timer?.unref?.();
  }

  function novaMao(mesa) {
    limparTimer(mesa);
    // Quem saiu durante a mão anterior libera o lugar agora.
    mesa.lugares = mesa.lugares.map(j => j && !j.saiu ? j : null);
    for (const j of sentados(mesa)) {
      // A carteira pode ter mudado no 21 ou nas apostas: a pilha nunca passa dela.
      if (mesa.fichas) j.pilha = Math.min(j.pilha, saldo(j));
      Object.assign(j, { cartas: [], naRua: 0, total: 0, foldou: false, allin: false, agiu: false, nivelVisto: -1, ganho: 0, maoFinal: null, melhores: [], acao: '' });
    }
    if (!sentados(mesa).length) { mesas.delete(mesa.canal); return; }
    const jogam = sentados(mesa).filter(podeJogar);
    mesa.mesaCartas = [];
    mesa.potes = [];
    mesa.vez = null;
    mesa.prazo = null;
    if (jogam.length < 2) { mesa.fase = 'espera'; mesa.mao = randomUUID(); mesa.passo++; return; }

    mesa.fase = 'jogando';
    mesa.etapa = 'preflop';
    mesa.mao = randomUUID();
    mesa.passo++;
    mesa.numero++;
    mesa.baralho = novoBaralho();
    const dealer = proximo(mesa, mesa.dealer ?? -1, podeJogar);
    mesa.dealer = dealer.lugar;
    for (const j of jogam) j.cartas = [];
    // Uma carta pra cada um a partir do small blind, duas voltas.
    for (let volta = 0; volta < 2; volta++) {
      let j = dealer;
      for (let k = 0; k < jogam.length; k++) { j = proximo(mesa, j.lugar, podeJogar); j.cartas.push(mesa.baralho.pop()); }
    }
    // No mano a mano o dealer é o small blind e fala primeiro antes do flop.
    const sb = jogam.length === 2 ? dealer : proximo(mesa, dealer.lugar, podeJogar);
    const bb = proximo(mesa, sb.lugar, podeJogar);
    por(mesa, sb, SMALL); sb.acao = 'Small blind';
    por(mesa, bb, BIG); bb.acao = 'Big blind';
    mesa.sb = sb.lugar; mesa.bb = bb.lugar;
    mesa.apostaAtual = BIG;
    mesa.ultimoAumento = BIG;
    mesa.nivel = 0;
    mesa.ultimaAcao = null;
    seguir(mesa, bb.lugar);
  }

  // Depois de cada jogada: passa a vez, fecha a rua ou termina a mão.
  function seguir(mesa, de) {
    const vivas = vivos(mesa);
    if (vivas.length === 1) return finalizar(mesa);
    const agem = vivas.filter(j => !j.allin);
    const falta = j => !(j.naRua === mesa.apostaAtual && (j.agiu || agem.length === 1));
    if (agem.some(falta)) {
      const j = proximo(mesa, de, x => agem.includes(x) && falta(x));
      mesa.vez = j.lugar;
      // Quem pediu pra sair um pouco passa ou larga sem esperar o tempo.
      if (j.ausente) return agir(mesa, j, j.naRua === mesa.apostaAtual ? 'passar' : 'largar', 0, true);
      return agendarVez(mesa);
    }
    // Rua fechada: recolhe as apostas e abre a próxima.
    for (const j of naMao(mesa)) { j.naRua = 0; j.agiu = false; }
    mesa.apostaAtual = 0;
    mesa.ultimoAumento = BIG;
    mesa.nivel++;
    if (mesa.etapa === 'river') return finalizar(mesa);
    const ordem = { preflop: ['flop', 3], flop: ['turn', 1], turn: ['river', 1] };
    // Ninguém mais pode apostar (todo mundo all-in): abre o resto da mesa de uma vez.
    const correr = agem.length <= 1;
    do {
      const [etapa, quantas] = ordem[mesa.etapa];
      mesa.baralho.pop(); // queima uma, como na mesa de verdade
      mesa.mesaCartas.push(...mesa.baralho.splice(-quantas));
      mesa.etapa = etapa;
    } while (correr && ordem[mesa.etapa]);
    if (correr) return finalizar(mesa);
    for (const j of agem) j.acao = '';
    mesa.passo++;
    seguir(mesa, mesa.dealer);
  }

  function finalizar(mesa) {
    limparTimer(mesa);
    mesa.vez = null;
    mesa.prazo = null;
    const jogaram = naMao(mesa);
    const vivas = jogaram.filter(j => !j.foldou);
    const showdown = vivas.length > 1;
    mesa.etapa = showdown ? 'showdown' : mesa.etapa;
    if (showdown) for (const j of vivas) {
      const m = melhorMao([...j.cartas, ...mesa.mesaCartas]);
      j.maoFinal = m.valor;
      j.nomeMao = m.nome;
      j.melhores = m.cartas;
    }
    // A sobra de um pote dividido vai pra quem senta primeiro depois do dealer.
    const depoisDoDealer = j => (j.lugar - mesa.dealer - 1 + LUGARES) % LUGARES;
    mesa.potes = montarPotes(jogaram).map(pote => {
      const ganham = pote.elegiveis.length === 1 ? pote.elegiveis : (() => {
        const melhor = pote.elegiveis.reduce((a, j) => comparar(j.maoFinal, a) > 0 ? j.maoFinal : a, pote.elegiveis[0].maoFinal);
        return pote.elegiveis.filter(j => comparar(j.maoFinal, melhor) === 0).sort((a, b) => depoisDoDealer(a) - depoisDoDealer(b));
      })();
      const parte = Math.floor(pote.valor / ganham.length);
      ganham.forEach((j, i) => { j.ganho += parte + (i < pote.valor - parte * ganham.length ? 1 : 0); });
      return { valor: pote.valor, ganhadores: ganham.map(j => j.lugar), devolvido: pote.elegiveis.length === 1 && pote.valor <= pote.elegiveis[0].total };
    });
    for (const j of jogaram) {
      j.pilha += j.ganho;
      if (mesa.fichas && j.ganho) fichas.mover(j.chave, j.ganho);
      j.naRua = 0;
    }
    mesa.fase = 'resultado';
    mesa.mostrou = showdown;
    mesa.passo++;
    const mao = mesa.mao;
    // O app usa o fim da pausa pra recolher as cartas e embaralhar antes da próxima.
    mesa.proximaEm = agora() + (showdown ? PAUSA_SHOWDOWN : PAUSA_FOLD);
    mesa.timer = relogio.setTimeout(() => {
      if (mesas.get(mesa.canal) !== mesa || mesa.mao !== mao) return;
      novaMao(mesa);
      atualizar(mesa.canal);
    }, showdown ? PAUSA_SHOWDOWN : PAUSA_FOLD);
    mesa.timer?.unref?.();
  }

  // Jogada da vez. valor: até quanto a aposta da rua vai (só no aumentar).
  function agir(mesa, j, acao, valor, automatico = false) {
    const pagar = mesa.apostaAtual - j.naRua;
    const outros = vivos(mesa).filter(x => x !== j && !x.allin);
    const podeAumentar = outros.length > 0 && j.nivelVisto < mesa.nivel && j.pilha > pagar;
    const minimo = Math.min(j.naRua + j.pilha, mesa.apostaAtual + mesa.ultimoAumento);
    if (acao === 'tudo') {
      if (j.naRua + j.pilha > mesa.apostaAtual && podeAumentar) { acao = 'aumentar'; valor = j.naRua + j.pilha; }
      else acao = 'pagar';
    }
    if (acao === 'largar') { j.foldou = true; j.acao = automatico ? 'Largou (tempo)' : 'Largou'; }
    else if (acao === 'passar') {
      if (pagar) return 'Tem aposta pra pagar.';
      j.acao = automatico ? 'Passou (tempo)' : 'Passou';
    } else if (acao === 'pagar') {
      if (!pagar) return 'Não tem aposta pra pagar.';
      por(mesa, j, pagar);
      j.acao = j.allin ? 'All-in' : 'Pagou';
    } else if (acao === 'aumentar') {
      if (!podeAumentar) return 'Agora só dá pra pagar ou largar.';
      if (!Number.isSafeInteger(valor) || valor < minimo || valor > j.naRua + j.pilha) return 'Aposte de ' + minimo + ' a ' + (j.naRua + j.pilha) + '.';
      const antes = mesa.apostaAtual;
      por(mesa, j, valor - j.naRua);
      // Aumento completo reabre a vez de quem já tinha falado; all-in curto só obriga a pagar.
      if (valor - antes >= mesa.ultimoAumento) { mesa.ultimoAumento = valor - antes; mesa.nivel++; }
      mesa.apostaAtual = valor;
      for (const x of vivos(mesa)) if (x !== j) x.agiu = false;
      j.acao = j.allin ? 'All-in' : antes ? 'Aumentou' : 'Apostou';
    } else return 'Essa jogada está indisponível.';
    j.agiu = true;
    j.nivelVisto = mesa.nivel;
    if (!automatico) j.faltas = 0;
    mesa.ultimaAcao = { lugar: j.lugar, texto: j.acao, valor: j.naRua };
    mesa.passo++;
    seguir(mesa, j.lugar);
    return null;
  }

  function sentar(mesa, j) {
    const livres = [...Array(LUGARES).keys()].filter(i => !mesa.lugares[i]);
    // Espalha a turma pela mesa em vez de amontoar do lado do primeiro.
    const ordem = [0, 4, 2, 6, 1, 5, 3, 7].filter(i => livres.includes(i));
    j.lugar = ordem[0];
    mesa.lugares[j.lugar] = j;
  }

  function estado(mesa, id) {
    const eu = usuarios.get(id);
    const carteira = eu?.chave ? fichas.resumo(eu.chave, eu.nome) : null;
    if (!mesa) return { mesa: null, carteira };
    const revelar = mesa.fase === 'resultado' && mesa.mostrou;
    const meu = sentados(mesa).find(j => j.id === id);
    const vez = mesa.vez != null && mesa.lugares[mesa.vez];
    let jogadas = null;
    if (meu && vez === meu) {
      const pagar = mesa.apostaAtual - meu.naRua;
      const outros = vivos(mesa).filter(x => x !== meu && !x.allin);
      const podeAumentar = outros.length > 0 && meu.nivelVisto < mesa.nivel && meu.pilha > pagar;
      jogadas = {
        pagar: Math.min(pagar, meu.pilha), podePassar: !pagar, podeAumentar,
        minimo: Math.min(meu.naRua + meu.pilha, mesa.apostaAtual + mesa.ultimoAumento), maximo: meu.naRua + meu.pilha,
        apostaAtual: mesa.apostaAtual, naRua: meu.naRua,
        pote: naMao(mesa).reduce((s, j) => s + j.total, 0)
      };
    }
    return {
      carteira,
      mesa: {
        fichas: mesa.fichas, fase: mesa.fase, etapa: mesa.etapa, mao: mesa.mao, passo: mesa.passo, numero: mesa.numero,
        small: SMALL, big: BIG, dealer: mesa.dealer, sb: mesa.sb, bb: mesa.bb, vez: mesa.vez,
        restante: mesa.prazo ? Math.max(0, mesa.prazo - agora()) : null, prazoTotal: PRAZO_VEZ,
        proxima: mesa.fase === 'resultado' && mesa.proximaEm ? Math.max(0, mesa.proximaEm - agora()) : null,
        mesaCartas: mesa.mesaCartas, apostaAtual: mesa.apostaAtual,
        pote: naMao(mesa).reduce((s, j) => s + j.total, 0) - naMao(mesa).reduce((s, j) => s + j.naRua, 0),
        potes: mesa.fase === 'resultado' ? mesa.potes : [],
        mostrou: revelar, ultimaAcao: mesa.ultimaAcao,
        eu: meu ? meu.lugar : null,
        jogadas,
        maoAtual: meu?.cartas.length && !meu.foldou && mesa.fase === 'jogando' ? melhorMao([...meu.cartas, ...mesa.mesaCartas]).nome : null,
        lugares: mesa.lugares.map(j => j && {
          lugar: j.lugar, id: j.id, nome: j.nome, pilha: j.pilha, naRua: j.naRua, total: j.total,
          cartas: j.cartas.map(c => j === meu || (revelar && !j.foldou) ? c : null),
          foldou: j.foldou, allin: j.allin, ausente: j.ausente, saiu: j.saiu, acao: j.acao,
          ganho: j.ganho, nomeMao: revelar && !j.foldou ? j.nomeMao : null, melhores: revelar && !j.foldou ? j.melhores : []
        })
      }
    };
  }

  function atualizar(canal) {
    for (const id of channels.get(canal)?.users.keys() || []) {
      io.sockets.sockets.get(id)?.emit('mesa-poker', { canal, ...estado(mesas.get(canal), id) });
    }
  }

  function sair(canal, id) {
    const mesa = mesas.get(canal);
    const j = mesa && sentados(mesa).find(x => x.id === id);
    if (!j) return;
    if (mesa.fase === 'jogando' && j.cartas.length) {
      // Na mão: larga e libera o lugar quando ela acabar (o que pôs fica no pote).
      j.saiu = true;
      if (!j.foldou) {
        if (mesa.vez === j.lugar) agir(mesa, j, 'largar', 0, true);
        else {
          j.foldou = true;
          mesa.passo++;
          // Recomeça a busca de quem joga no lugar de antes da vez atual.
          seguir(mesa, (mesa.vez - 1 + LUGARES) % LUGARES);
        }
      }
      j.acao = 'Saiu';
    } else mesa.lugares[j.lugar] = null;
    if (!sentados(mesa).length) { limparTimer(mesa); mesas.delete(canal); }
    else if (mesa.fase === 'espera') mesa.passo++;
    atualizar(canal);
  }

  function conectar(socket, user) {
    const chave = user.accountId ? user.accessId : null;
    const lugar = chave || user.accessId || socket.id;
    socket.on('disconnect', () => usuarios.delete(socket.id));
    socket.on('jogar-poker', (pedido, cb) => {
      if (typeof cb !== 'function' || !pedido || typeof pedido !== 'object') return;
      usuarios.set(socket.id, { chave, nome: user.name });
      const canal = user.channelId;
      if (!canal || canal !== pedido.canal || !channels.get(canal)?.users.has(socket.id)) return cb({ erro: 'Entre no canal de voz.' });
      let mesa = mesas.get(canal);
      const { acao } = pedido;
      if (acao === 'ver') return cb(estado(mesa, socket.id));
      const eu = mesa && sentados(mesa).find(j => j.id === socket.id);
      const valor = Math.floor(Number(pedido.valor));

      if (acao === 'sentar') {
        if (eu && !eu.saiu) return cb({ erro: 'Você já está na mesa.' });
        const comFichas = mesa ? mesa.fichas : pedido.fichas !== false;
        if (mesa && sentados(mesa).some(j => j.chave === lugar && !j.saiu)) return cb({ erro: 'Você já ocupa um lugar nesta mesa.' });
        if (mesa && sentados(mesa).length >= LUGARES) return cb({ erro: 'A mesa está cheia.' });
        let pilha = FICHAS_DIVERSAO;
        if (comFichas) {
          if (!chave) return cb({ erro: 'Entre na sua conta pra jogar valendo fichas.' });
          const tem = fichas.pegar(chave, user.name).saldo;
          if (tem < BIG) return cb({ erro: 'Precisa de pelo menos ' + BIG + ' fichas pra sentar.' });
          if (!Number.isSafeInteger(valor) || valor < BIG || valor > tem) return cb({ erro: 'Escolha de ' + BIG + ' até ' + tem.toLocaleString('pt-BR') + ' fichas.' });
          pilha = valor;
        }
        if (!mesa) {
          mesa = { canal, fichas: comFichas, fase: 'espera', etapa: null, mao: randomUUID(), passo: 0, numero: 0, lugares: Array(LUGARES).fill(null),
            dealer: null, vez: null, prazo: null, mesaCartas: [], potes: [], apostaAtual: 0, ultimoAumento: BIG, nivel: 0, timer: null };
          mesas.set(canal, mesa);
        }
        if (eu?.saiu) mesa.lugares[eu.lugar] = null;
        const j = { id: socket.id, chave: lugar, nome: user.name, pilha, cartas: [], naRua: 0, total: 0, foldou: false, allin: false,
          agiu: false, nivelVisto: -1, ausente: false, saiu: false, faltas: 0, ganho: 0, acao: '', melhores: [] };
        sentar(mesa, j);
        if (mesa.fase === 'espera') mesa.passo++;
      } else if (!mesa) return cb({ erro: 'A mesa fechou.' });
      else if (pedido.passo !== mesa.passo) return cb({ erro: 'A mesa mudou. Confira antes de jogar.' });
      else if (!eu) return cb({ erro: 'Sente na mesa pra jogar.' });
      else if (acao === 'sair') {
        sair(canal, socket.id);
        return cb({});
      } else if (acao === 'comecar') {
        if (mesa.fase !== 'espera') return cb({ erro: 'A mão já começou.' });
        if (sentados(mesa).filter(podeJogar).length < 2) return cb({ erro: 'Precisa de pelo menos duas pessoas com fichas.' });
        novaMao(mesa);
      } else if (acao === 'repor') {
        if (mesa.fase === 'jogando' && eu.cartas.length && !eu.foldou) return cb({ erro: 'Espere a mão acabar pra pôr mais fichas.' });
        const teto = mesa.fichas ? saldo(eu) : FICHAS_DIVERSAO;
        if (!Number.isSafeInteger(valor) || valor < 1 || eu.pilha + valor > teto) {
          return cb({ erro: mesa.fichas ? 'Sua carteira tem ' + teto.toLocaleString('pt-BR') + ' fichas.' : 'Só diversão vai até ' + FICHAS_DIVERSAO + '.' });
        }
        eu.pilha += valor;
        mesa.passo++;
      } else if (acao === 'ausentar') {
        eu.ausente = true;
        if (mesa.fase === 'jogando' && mesa.vez === eu.lugar) agir(mesa, eu, eu.naRua === mesa.apostaAtual ? 'passar' : 'largar');
        else mesa.passo++;
      } else if (acao === 'voltar') {
        eu.ausente = false;
        eu.faltas = 0;
        mesa.passo++;
      } else if (['largar', 'passar', 'pagar', 'aumentar', 'tudo'].includes(acao)) {
        if (mesa.fase !== 'jogando' || mesa.vez !== eu.lugar) return cb({ erro: 'Não é a sua vez.' });
        const erro = agir(mesa, eu, acao, valor);
        if (erro) return cb({ erro });
      } else return cb({ erro: 'Essa jogada está indisponível.' });
      // Duas pessoas sentadas na espera: a primeira mão sai sozinha.
      if (mesa.fase === 'espera' && mesa.numero > 0 && sentados(mesa).filter(podeJogar).length >= 2) novaMao(mesa);
      atualizar(canal);
      cb({});
    });
  }

  function atualizarTodas() { for (const canal of mesas.keys()) atualizar(canal); }
  return { conectar, sair, atualizarTodas, _mesas: mesas };
}
