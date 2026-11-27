import { randomInt, randomUUID } from 'node:crypto';
import { FichasStore, VALORES_FICHA, MENOR_FICHA } from './fichas-store.js';

// 21 de cara: ás + carta de 10 nas duas primeiras cartas.
export const natural = cartas => cartas.length === 2 && pontos(cartas) === 21;

export function pontos(cartas) {
  let total = 0, ases = 0;
  for (const carta of cartas) {
    const valor = carta.slice(0, -1);
    if (valor === 'A') ases++;
    total += valor === 'A' ? 1 : Number(valor) || 10;
  }
  return total + (ases && total <= 11 ? 10 : 0);
}

function embaralhar() {
  const cartas = [];
  for (let baralho = 0; baralho < 2; baralho++) {
    for (const naipe of '♠♥♦♣') {
      for (const valor of 'A 2 3 4 5 6 7 8 9 10 J Q K'.split(' ')) cartas.push(valor + naipe);
    }
  }
  for (let i = cartas.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
  }
  return cartas;
}

const soma = pilha => pilha.reduce((a, b) => a + b, 0);

// A aposta chega como a pilha que a pessoa montou, ficha por ficha.
function pilhaValida(pilha) {
  return Array.isArray(pilha) && pilha.length >= 1 && pilha.length <= 300 && pilha.every(v => VALORES_FICHA.includes(v));
}

// Depois do resultado, o placar fica uns segundos na tela e a mesa se limpa sozinha;
// só aí se monta a aposta da próxima rodada.
export const PAUSA_RESULTADO = 5000;
// A tela só mostra o placar depois que a banca compra as cartas dela, uma a uma
// (mesmos tempos de public/vinte-e-um.js); a pausa conta a partir daí.
export function tempoDoResultado(mesa) {
  if (mesa.modo !== 'banca') return 450 + PAUSA_RESULTADO;
  const compras = mesa.banca.length - 2;
  return (compras > 0 ? 700 + (compras - 1) * 650 : 0) + 550 + PAUSA_RESULTADO;
}
const relogioReal = { setTimeout: (fn, ms) => { const t = setTimeout(fn, ms); t.unref?.(); return t; }, clearTimeout };

export function criarMesas21({ io, channels, novoBaralho = embaralhar, fichas = new FichasStore(), relogio = relogioReal }) {
  const mesas = new Map();
  const usuarios = new Map(); // socket.id -> { chave, nome }
  const saldo = p => fichas.pegar(p.chave, p.nome).saldo;

  function distribuirCartas(mesa, baralho) {
    mesa.rodada = randomUUID();
    mesa.fase = 'jogando';
    mesa.baralho = baralho;
    mesa.banca = mesa.modo === 'banca' ? mesa.baralho.splice(-2) : [];
    mesa.pote = 0;
    for (const p of mesa.pessoas.values()) {
      p.aposta = mesa.fichas ? soma(p.pilha) : 0;
      fichas.mover(p.chave, -p.aposta);
      mesa.pote += p.aposta;
      p.confirmou = false;
      p.cartas = mesa.baralho.splice(-2);
      p.parou = pontos(p.cartas) === 21;
      p.resultado = '';
      p.ganho = 0;
      p.dobrou = false;
    }
  }

  function concluir(mesa) {
    if (mesa.fase !== 'jogando') return;
    const pessoas = [...mesa.pessoas.values()];
    const abandono = mesa.modo === 'amigos' && pessoas.length < 2;
    if (!abandono && pessoas.some(p => !p.parou)) return;
    mesa.fase = 'resultado';
    const banca = mesa.modo === 'banca';
    if (banca) while (pontos(mesa.banca) < 17) mesa.banca.push(mesa.baralho.pop());
    const totais = pessoas.map(p => pontos(p.cartas)).filter(v => v <= 21);
    const melhor = banca ? pontos(mesa.banca) : Math.max(...totais);
    // Como no cassino: 21 de cara ganha de qualquer outro 21, e o da banca leva quem não tem
    const bancaNatural = banca && natural(mesa.banca);
    for (const p of pessoas) {
      const valor = pontos(p.cartas);
      const meuNatural = banca && natural(p.cartas);
      if (abandono && valor <= 21) p.resultado = 'Ganhou por desistência';
      else if (valor > 21) p.resultado = 'Estourou';
      else if (meuNatural !== bancaNatural) p.resultado = meuNatural ? 'Ganhou' : 'Perdeu';
      else if (banca && valor === melhor) p.resultado = 'Empatou';
      else if (banca ? melhor > 21 || valor > melhor : valor === melhor) p.resultado = 'Ganhou';
      else p.resultado = 'Perdeu';
    }
    const vencedores = pessoas.filter(p => p.resultado.startsWith('Ganhou'));
    if (banca) {
      // 21 de cara paga 3:2 (fichas inteiras: a fração fica com a banca)
      for (const p of pessoas) {
        p.ganho = p.resultado === 'Empatou' ? p.aposta : p.resultado !== 'Ganhou' ? 0
          : natural(p.cartas) ? p.aposta + Math.ceil(p.aposta * 3 / 2 / 5) * 5 : 2 * p.aposta;
      }
    } else if (vencedores.length) {
      // Entre amigos o pote vai pros vencedores na proporção do que cada um apostou.
      // Partes de 5 em 5: a sobra vai pelos assentos, de 5 em 5 (o que não fecha 5, de 1 em 1).
      // Sem aposta de ninguém, divide igual.
      const base = soma(vencedores.map(p => p.aposta));
      let pago = 0;
      for (const p of vencedores) {
        p.ganho = Math.floor((base ? mesa.pote * p.aposta / base : mesa.pote / vencedores.length) / 5) * 5;
        pago += p.ganho;
      }
      for (let i = 0; pago < mesa.pote; i = (i + 1) % vencedores.length) { const d = mesa.pote - pago >= 5 ? 5 : 1; vencedores[i].ganho += d; pago += d; }
    }
    for (const p of pessoas) fichas.mover(p.chave, p.ganho);
    relogio.clearTimeout(mesa.limpeza);
    mesa.limpeza = relogio.setTimeout(() => limpar(mesa), tempoDoResultado(mesa));
  }

  // Recolhe cartas e fichas da rodada que acabou. Cada um monta a aposta de novo.
  function limpar(mesa) {
    if (mesas.get(mesa.canal) !== mesa || mesa.fase !== 'resultado') return;
    mesa.fase = 'espera';
    mesa.banca = [];
    mesa.pote = 0;
    for (const p of mesa.pessoas.values()) Object.assign(p, { cartas: [], pilha: [], aposta: 0, ganho: 0, parou: false, resultado: '', confirmou: false });
    atualizar(mesa.canal);
  }

  function estado(mesa, id) {
    const eu = usuarios.get(id);
    const carteira = eu?.chave ? fichas.resumo(eu.chave, eu.nome) : null;
    if (!mesa) return { mesa: null, carteira };
    const revelar = mesa.fase === 'resultado';
    return {
      carteira,
      mesa: {
        fichas: mesa.fichas, pote: mesa.pote, modo: mesa.modo, fase: mesa.fase, rodada: mesa.rodada,
        pontosBanca: revelar && mesa.banca.length ? pontos(mesa.banca) : null,
        banca: mesa.banca.map((c, i) => i === 0 || revelar ? c : null),
        pessoas: [...mesa.pessoas.values()].map(p => {
          const visivel = revelar || p.id === id;
          return { id: p.id, nome: p.nome, saldo: mesa.fichas ? saldo(p) : null, dobrou: Boolean(p.dobrou), confirmou: p.confirmou, pilha: p.confirmou || p.aposta ? p.pilha : [],
            aposta: p.aposta, ganho: p.ganho, cartas: p.cartas.map(c => visivel ? c : null),
            pontos: visivel ? pontos(p.cartas) : null, parou: p.parou, resultado: p.resultado };
        })
      }
    };
  }
  function atualizar(canal) {
    for (const id of channels.get(canal)?.users.keys() || []) {
      io.sockets.sockets.get(id)?.emit('mesa-21', { canal, ...estado(mesas.get(canal), id) });
    }
  }
  function sair(canal, id) {
    const mesa = mesas.get(canal);
    if (!mesa?.pessoas.delete(id)) return;
    if (mesa.fase !== 'jogando') for (const p of mesa.pessoas.values()) p.confirmou = false;
    if (!mesa.pessoas.size) { relogio.clearTimeout(mesa.limpeza); mesas.delete(canal); }
    else concluir(mesa);
    atualizar(canal);
  }
  function conectar(socket, user) {
    const chave = user.accountId ? user.accessId : null;
    const lugar = chave || user.accessId || socket.id;
    socket.on('ranking-fichas', cb => {
      if (typeof cb !== 'function') return;
      if (chave) fichas.pegar(chave, user.name);
      cb({ lista: fichas.ranking(chave) });
    });
    socket.on('disconnect', () => usuarios.delete(socket.id));
    socket.on('jogar-21', (pedido, cb) => {
      if (typeof cb !== 'function') return;
      usuarios.set(socket.id, { chave, nome: user.name });
      const canal = user.channelId;
      if (!canal || canal !== pedido?.canal || !channels.get(canal)?.users.has(socket.id)) return cb({ erro: 'Entre no canal de voz.' });
      let mesa = mesas.get(canal);
      const { acao, modo } = pedido;
      if (acao === 'ver') return cb(estado(mesa, socket.id));
      const comFichas = mesa ? mesa.fichas : pedido.fichas !== false;
      if (comFichas && !chave && ['criar', 'entrar'].includes(acao)) {
        return cb({ erro: 'Entre na sua conta pra jogar valendo coins.' });
      }
      if (acao === 'criar') {
        if (mesa || !['banca', 'amigos'].includes(modo)) return cb({ erro: 'Escolha uma mesa disponível.' });
        mesa = { canal, fichas: pedido.fichas !== false, pote: 0, modo, fase: 'espera', rodada: randomUUID(), banca: [], pessoas: new Map() };
        mesas.set(canal, mesa);
      } else if (!mesa || pedido.rodada !== mesa.rodada) return cb({ erro: 'A mesa mudou. Confira a rodada atual.' });
      const pessoa = mesa.pessoas.get(socket.id);
      const minimo = mesa.modo === 'amigos' ? 2 : 1;
      if (['criar', 'entrar'].includes(acao) && !pessoa && mesa.fase !== 'jogando' && mesa.pessoas.size < 8) {
        if ([...mesa.pessoas.values()].some(p => p.chave === lugar)) return cb({ erro: 'Você já ocupa um lugar nesta mesa.' });
        if (mesa.fichas && fichas.pegar(chave, user.name).saldo < MENOR_FICHA) {
          if (!mesa.pessoas.size) mesas.delete(canal);
          return cb({ erro: 'Seus coins acabaram. Junte mais no Seu cassino.' });
        }
        for (const p of mesa.pessoas.values()) p.confirmou = false;
        mesa.pessoas.set(socket.id, { chave: lugar, confirmou: false, pilha: [], aposta: 0, ganho: 0, id: socket.id, nome: user.name, cartas: [], parou: false, resultado: '' });
      } else if (acao === 'sair' && pessoa) {
        sair(canal, socket.id);
        return cb({});
      } else if (acao === 'iniciar' && pessoa && mesa.fase === 'espera' && mesa.pessoas.size >= minimo) {
        if (mesa.fichas) {
          if (!pilhaValida(pedido.pilha)) return cb({ erro: 'Monte a aposta com os coins.' });
          if (soma(pedido.pilha) > saldo(pessoa)) return cb({ erro: 'Você não tem coins para essa aposta.' });
          pessoa.pilha = pedido.pilha.slice();
          pessoa.confirmou = true;
        }
        const jogadores = [...mesa.pessoas.values()].filter(p => !mesa.fichas || saldo(p) >= MENOR_FICHA);
        if (jogadores.length < minimo) {
          pessoa.confirmou = false;
          return cb({ erro: 'Aguarde outro jogador com coins.' });
        }
        if (!mesa.fichas || jogadores.every(p => p.confirmou)) {
          // Quem ficou sem fichas pode acompanhar o resultado antes da próxima rodada.
          for (const p of mesa.pessoas.values()) if (!jogadores.includes(p)) mesa.pessoas.delete(p.id);
          distribuirCartas(mesa, novoBaralho());
        }
      } else if (acao === 'cancelar' && pessoa?.confirmou && mesa.fase === 'espera') {
        pessoa.confirmou = false;
      } else if (acao === 'dobrar' && pessoa && !pessoa.parou && mesa.fase === 'jogando' && mesa.modo === 'banca' && pessoa.cartas.length === 2 && pedido.quantidade === 2) {
        // Dobrar: a aposta dobra e vem só mais uma carta
        if (mesa.fichas) {
          if (saldo(pessoa) < pessoa.aposta) return cb({ erro: 'Você não tem coins para dobrar.' });
          fichas.mover(pessoa.chave, -pessoa.aposta);
          mesa.pote += pessoa.aposta;
          pessoa.aposta *= 2;
          pessoa.pilha = [...pessoa.pilha, ...pessoa.pilha];
        }
        pessoa.dobrou = true;
        pessoa.cartas.push(mesa.baralho.pop());
        pessoa.parou = true;
      } else if (pessoa && !pessoa.parou && mesa.fase === 'jogando' && ['pedir', 'parar'].includes(acao) && pedido.quantidade === pessoa.cartas.length) {
        if (acao === 'pedir') pessoa.cartas.push(mesa.baralho.pop());
        pessoa.parou = acao === 'parar' || pontos(pessoa.cartas) >= 21;
      } else return cb({ erro: 'Essa jogada está indisponível.' });
      concluir(mesa);
      atualizar(canal);
      cb({});
    });
  }
  // Depois de um reset do dono, as mesas abertas mostram o saldo novo.
  function atualizarTodas() { for (const canal of mesas.keys()) atualizar(canal); }
  return { conectar, sair, atualizarTodas };
}
