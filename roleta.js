// Roleta na call: uma mesa por canal, roda europeia (0 a 36). Quem tem conta põe fichas
// nos números e nas apostas de fora; a primeira ficha abre o tempo de apostas, a roda
// gira e paga. As fichas saem da carteira na hora em que vão pra mesa (como no 21), e
// quem sai da call com as apostas abertas recebe de volta.
import { randomInt, randomUUID } from 'node:crypto';
import { FichasStore, VALORES_FICHA } from './fichas-store.js';

// Ordem dos números na roda europeia, a partir do 0, no sentido horário.
export const RODA = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
export const VERMELHOS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
export const FORA = ['vermelho', 'preto', 'par', 'impar', 'baixo', 'alto', 'd1', 'd2', 'd3', 'c1', 'c2', 'c3'];
export const TEMPO_APOSTAS = 25e3;  // a partir da primeira ficha da rodada
export const TEMPO_GIRO = 7e3;      // mesmo tempo da animação em public/roleta.js
export const PAUSA_RESULTADO = 6e3; // placar na tela antes de limpar a mesa
export const MAX_FICHAS = 200;      // por pessoa, por rodada

export const alvoValido = alvo => typeof alvo === 'string' && (/^n(\d|[12]\d|3[0-6])$/.test(alvo) || FORA.includes(alvo));

// Quanto volta por ficha (aposta incluída) se cair o número n. Com 0, as de fora perdem.
export function multiplicador(alvo, n) {
  if (alvo[0] === 'n') return Number(alvo.slice(1)) === n ? 36 : 0;
  if (n === 0) return 0;
  const ok = {
    vermelho: VERMELHOS.has(n), preto: !VERMELHOS.has(n), par: n % 2 === 0, impar: n % 2 === 1,
    baixo: n <= 18, alto: n >= 19, d1: n <= 12, d2: n > 12 && n <= 24, d3: n > 24,
    c1: n % 3 === 1, c2: n % 3 === 2, c3: n % 3 === 0,
  }[alvo];
  return ok ? (alvo[0] === 'd' || alvo[0] === 'c' ? 3 : 2) : 0;
}

const relogioReal = { setTimeout: (fn, ms) => { const t = setTimeout(fn, ms); t.unref?.(); return t; }, clearTimeout };
const soma = lista => lista.reduce((a, [, v]) => a + v, 0);

export function criarMesasRoleta({ io, channels, fichas = new FichasStore(), relogio = relogioReal, agora = Date.now, sortear = () => randomInt(37) }) {
  const mesas = new Map();
  const usuarios = new Map(); // socket.id -> { chave, nome }

  function nova(canal) {
    return { canal, fase: 'espera', rodada: randomUUID(), fim: 0, numero: null, historico: [], apostas: new Map(), timer: null };
  }
  function agendar(mesa, ms, fn) {
    relogio.clearTimeout(mesa.timer);
    mesa.fim = agora() + ms;
    mesa.timer = relogio.setTimeout(fn, ms);
  }
  const comFichas = mesa => [...mesa.apostas.values()].filter(a => a.fichas.length);

  // Fecha as apostas e sorteia. A tela recebe o número já agora pra animar a roda até ele.
  function girar(mesa) {
    if (mesa.fase !== 'apostando') return;
    for (const [id, a] of mesa.apostas) if (!a.fichas.length) mesa.apostas.delete(id);
    if (!mesa.apostas.size) return voltarPraEspera(mesa);
    mesa.fase = 'girando';
    mesa.numero = sortear();
    agendar(mesa, TEMPO_GIRO, () => pagar(mesa));
    atualizar(mesa.canal);
  }
  function pagar(mesa) {
    if (mesa.fase !== 'girando') return;
    mesa.fase = 'resultado';
    for (const a of mesa.apostas.values()) {
      a.ganho = a.fichas.reduce((t, [alvo, v]) => t + v * multiplicador(alvo, mesa.numero), 0);
      if (a.ganho) fichas.mover(a.chave, a.ganho);
    }
    mesa.historico = [mesa.numero, ...mesa.historico].slice(0, 12);
    agendar(mesa, PAUSA_RESULTADO, () => limpar(mesa));
    atualizar(mesa.canal);
  }
  function limpar(mesa) {
    if (mesa.fase !== 'resultado') return;
    voltarPraEspera(mesa);
  }
  function voltarPraEspera(mesa) {
    relogio.clearTimeout(mesa.timer);
    Object.assign(mesa, { fase: 'espera', rodada: randomUUID(), fim: 0, numero: null, timer: null });
    mesa.apostas.clear();
    if (!channels.get(mesa.canal)?.users.size) mesas.delete(mesa.canal);
    atualizar(mesa.canal);
  }
  // Devolve as fichas de alguém (desfazer, limpar ou saiu da call com as apostas abertas).
  function devolver(a, quantas = a.fichas.length) {
    const tiradas = a.fichas.splice(a.fichas.length - quantas, quantas);
    if (tiradas.length) fichas.mover(a.chave, soma(tiradas));
    a.pronto = false;
  }
  // Ninguém mais tem ficha na mesa: a contagem para até a próxima ficha.
  function talvezEsvaziou(mesa) {
    if (mesa.fase === 'apostando' && !comFichas(mesa).length) voltarPraEspera(mesa);
  }
  function talvezTodosProntos(mesa) {
    const com = comFichas(mesa);
    if (mesa.fase === 'apostando' && com.length && com.every(a => a.pronto)) girar(mesa);
  }

  function estado(mesa, id) {
    const eu = usuarios.get(id);
    const carteira = eu?.chave ? fichas.resumo(eu.chave, eu.nome) : null;
    if (!mesa) return { mesa: null, carteira };
    const revelar = mesa.fase === 'girando' || mesa.fase === 'resultado';
    return {
      carteira,
      mesa: {
        fase: mesa.fase, rodada: mesa.rodada, restante: mesa.fim ? Math.max(0, mesa.fim - agora()) : null,
        numero: revelar ? mesa.numero : null, historico: mesa.historico,
        apostas: [...mesa.apostas.values()].map(a => ({ id: a.id, nome: a.nome, fichas: a.fichas, total: soma(a.fichas),
          pronto: a.pronto, ganho: mesa.fase === 'resultado' ? a.ganho : null })),
      },
    };
  }
  function atualizar(canal) {
    const mesa = mesas.get(canal);
    for (const id of channels.get(canal)?.users.keys() || []) {
      io.sockets.sockets.get(id)?.emit('mesa-roleta', { canal, ...estado(mesa, id) });
    }
  }

  function sair(canal, id) {
    const mesa = mesas.get(canal);
    const a = mesa?.apostas.get(id);
    if (!a) return;
    // Com a roda girando a aposta fica (e paga, se ganhar); antes disso volta pra carteira.
    if (mesa.fase === 'espera' || mesa.fase === 'apostando') {
      devolver(a);
      mesa.apostas.delete(id);
      talvezEsvaziou(mesa);
      talvezTodosProntos(mesa);
    }
    atualizar(canal);
  }

  function conectar(socket, user) {
    const chave = user.accountId ? user.accessId : null;
    socket.on('disconnect', () => usuarios.delete(socket.id));
    socket.on('jogar-roleta', (pedido, cb) => {
      if (typeof cb !== 'function') return;
      usuarios.set(socket.id, { chave, nome: user.name });
      const canal = user.channelId;
      if (!canal || canal !== pedido?.canal || !channels.get(canal)?.users.has(socket.id)) return cb({ erro: 'Entre no canal de voz.' });
      let mesa = mesas.get(canal);
      const { acao } = pedido;
      if (acao === 'ver') return cb(estado(mesa, socket.id));
      if (!chave) return cb({ erro: 'Entre na sua conta pra apostar.' });
      if (mesa && pedido.rodada !== mesa.rodada) return cb({ erro: 'A rodada mudou. Confira a mesa.', ...estado(mesa, socket.id) });
      const minha = mesa?.apostas.get(socket.id);

      if (acao === 'apostar') {
        const { alvo, valor } = pedido;
        if (!alvoValido(alvo) || !VALORES_FICHA.includes(valor)) return cb({ erro: 'Escolha a ficha e onde apostar.' });
        if (mesa && !['espera', 'apostando'].includes(mesa.fase)) return cb({ erro: 'As apostas estão fechadas. Espere a próxima rodada.' });
        if (fichas.pegar(chave, user.name).saldo < valor) return cb({ erro: 'Você não tem coins pra essa ficha.' });
        if (minha && minha.fichas.length >= MAX_FICHAS) return cb({ erro: 'Já tem muita ficha sua na mesa.' });
        if (!mesa) { mesa = nova(canal); mesas.set(canal, mesa); }
        let a = mesa.apostas.get(socket.id);
        if (!a) { a = { id: socket.id, chave, nome: user.name, fichas: [], pronto: false, ganho: 0 }; mesa.apostas.set(socket.id, a); }
        fichas.mover(chave, -valor);
        a.fichas.push([alvo, valor]);
        a.pronto = false;
        if (mesa.fase === 'espera') {
          mesa.fase = 'apostando';
          agendar(mesa, TEMPO_APOSTAS, () => girar(mesa));
        }
      } else if (['desfazer', 'limpar'].includes(acao) && minha?.fichas.length && mesa.fase === 'apostando') {
        devolver(minha, acao === 'desfazer' ? 1 : minha.fichas.length);
        talvezEsvaziou(mesa);
      } else if (acao === 'pronto' && minha?.fichas.length && mesa.fase === 'apostando') {
        minha.pronto = true;
        talvezTodosProntos(mesa);
      } else return cb({ erro: 'Essa jogada está indisponível.', ...estado(mesa, socket.id) });
      if (mesas.get(canal)) atualizar(canal);
      cb(estado(mesas.get(canal), socket.id));
    });
  }
  // Depois de um reset do dono, as mesas abertas mostram o saldo novo.
  function atualizarTodas() { for (const canal of mesas.keys()) atualizar(canal); }
  return { conectar, sair, atualizarTodas };
}
