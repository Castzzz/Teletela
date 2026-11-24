// Avaliação das mãos de Texas Hold'em, usada pelo servidor (poker.js) e pela mesa no app
// (nome da sua mão ao lado do nome, tabela de mãos). Cartas no formato 'A♠', '10♥'.
const VALOR = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13, A: 14 };
const UM = { 14: 'ás', 13: 'rei', 12: 'dama', 11: 'valete', 10: '10', 9: '9', 8: '8', 7: '7', 6: '6', 5: '5', 4: '4', 3: '3', 2: '2' };
const VARIOS = { 14: 'ases', 13: 'reis', 12: 'damas', 11: 'valetes', 10: '10', 9: '9', 8: '8', 7: '7', 6: '6', 5: '5', 4: '4', 3: '3', 2: '2' };
export const valorDe = carta => VALOR[carta.slice(0, -1)];
export const naipeDe = carta => carta.slice(-1);

// Devolve [categoria, desempates...]: maior é melhor, comparando elemento por elemento.
function avaliar5(cartas) {
  const valores = cartas.map(valorDe).sort((a, b) => b - a);
  const flush = cartas.every(c => naipeDe(c) === naipeDe(cartas[0]));
  const unicos = [...new Set(valores)];
  let alta = 0;
  if (unicos.length === 5) {
    if (valores[0] - valores[4] === 4) alta = valores[0];
    else if (valores.join() === '14,5,4,3,2') alta = 5; // A-2-3-4-5, o ás vale 1
  }
  if (alta && flush) return [8, alta];
  const contagem = new Map();
  for (const v of valores) contagem.set(v, (contagem.get(v) || 0) + 1);
  // Grupos maiores primeiro; no empate, o valor maior.
  const grupos = [...contagem].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const ordem = grupos.map(g => g[0]);
  if (grupos[0][1] === 4) return [7, ...ordem];
  if (grupos[0][1] === 3 && grupos[1][1] === 2) return [6, ...ordem];
  if (flush) return [5, ...valores];
  if (alta) return [4, alta];
  if (grupos[0][1] === 3) return [3, ...ordem];
  if (grupos[0][1] === 2 && grupos[1][1] === 2) return [2, ...ordem];
  if (grupos[0][1] === 2) return [1, ...ordem];
  return [0, ...valores];
}

export function comparar(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) - (b[i] || 0);
  }
  return 0;
}

export function nomeDaMao(v) {
  switch (v[0]) {
    case 8: return v[1] === 14 ? 'Royal flush' : 'Straight flush até o ' + UM[v[1]];
    case 7: return 'Quadra de ' + VARIOS[v[1]];
    case 6: return 'Full house, ' + VARIOS[v[1]] + ' com ' + VARIOS[v[2]];
    case 5: return 'Flush, ' + UM[v[1]] + ' alto';
    case 4: return 'Sequência até o ' + UM[v[1]];
    case 3: return 'Trinca de ' + VARIOS[v[1]];
    case 2: return 'Dois pares, ' + VARIOS[v[1]] + ' e ' + VARIOS[v[2]];
    case 1: return 'Par de ' + VARIOS[v[1]];
    default: return 'Carta alta, ' + UM[v[1]];
  }
}

// A melhor mão de 5 entre 5 a 7 cartas (as 2 da pessoa + a mesa).
export function melhorMao(cartas) {
  let melhor = null;
  const n = cartas.length;
  const escolher = (inicio, atual) => {
    if (atual.length === 5) {
      const valor = avaliar5(atual);
      if (!melhor || comparar(valor, melhor.valor) > 0) melhor = { valor, cartas: atual.slice() };
      return;
    }
    for (let i = inicio; i <= n - (5 - atual.length); i++) { atual.push(cartas[i]); escolher(i + 1, atual); atual.pop(); }
  };
  if (n >= 5) escolher(0, []);
  else {
    // Antes do flop: só dá pra ter par ou carta alta.
    const vs = cartas.map(valorDe).sort((a, b) => b - a);
    melhor = { valor: vs.length === 2 && vs[0] === vs[1] ? [1, vs[0]] : [0, ...vs], cartas: [] };
  }
  return { ...melhor, nome: nomeDaMao(melhor.valor) };
}

// Categorias do melhor pro pior (o índice bate com o primeiro número de melhorMao().valor).
export const CATEGORIAS = [
  { valor: 9, nome: 'Royal flush', explica: 'A, K, Q, J e 10 do mesmo naipe.', exemplo: ['A♥', 'K♥', 'Q♥', 'J♥', '10♥'] },
  { valor: 8, nome: 'Straight flush', explica: 'Cinco em sequência do mesmo naipe.', exemplo: ['9♠', '8♠', '7♠', '6♠', '5♠'] },
  { valor: 7, nome: 'Quadra', explica: 'Quatro cartas do mesmo valor.', exemplo: ['Q♣', 'Q♦', 'Q♥', 'Q♠', '4♦'] },
  { valor: 6, nome: 'Full house', explica: 'Uma trinca e um par.', exemplo: ['K♠', 'K♥', 'K♦', '7♣', '7♥'] },
  { valor: 5, nome: 'Flush', explica: 'Cinco do mesmo naipe, fora de ordem.', exemplo: ['A♦', 'J♦', '8♦', '6♦', '2♦'] },
  { valor: 4, nome: 'Sequência', explica: 'Cinco em ordem, naipes misturados. O ás vale no começo ou no fim.', exemplo: ['10♣', '9♦', '8♠', '7♥', '6♣'] },
  { valor: 3, nome: 'Trinca', explica: 'Três cartas do mesmo valor.', exemplo: ['8♥', '8♣', '8♠', 'K♦', '3♣'] },
  { valor: 2, nome: 'Dois pares', explica: 'Dois pares diferentes.', exemplo: ['J♠', 'J♥', '4♣', '4♦', 'A♥'] },
  { valor: 1, nome: 'Par', explica: 'Duas cartas do mesmo valor.', exemplo: ['10♥', '10♠', 'A♣', '7♦', '3♥'] },
  { valor: 0, nome: 'Carta alta', explica: 'Nada combina: vale a carta mais alta.', exemplo: ['A♠', 'J♦', '9♣', '5♥', '2♠'] }
];
// Royal flush é o straight flush até o ás; na tabela ele tem a linha dele.
export const categoriaDe = valor => valor[0] === 8 && valor[1] === 14 ? 9 : valor[0];
