// Regras do cassino e da roça (atividade idle). Sem tela e sem relógio próprio: tudo
// recebe "agora" em ms. O servidor (cassino.js) é quem conta as fichas de verdade; o
// app usa as mesmas contas só pra mostrar o cofre enchendo e as plantas crescendo.
// e.fichas é o saldo da carteira, posto pelo servidor antes de cada ação.
export const MIN = 60e3, HORA = 3600e3, DIA = 86400e3;

// Cada plantio rende porções proporcionais ao tempo (1 porção a cada 5 min).
// preco = quanto o bar cobra por porção: semente cara vale mais por canteiro.
export const CULTURAS = {
  milho:   { nome: 'Milho',   tempo: 5 * MIN,  porcoes: 1,  preco: 1, produto: 'Pipoca',            icone: 'snack_popcorn',     desbloqueio: 0,      folha: [9, 0] },
  morango: { nome: 'Morango', tempo: 20 * MIN, porcoes: 4,  preco: 1.5, produto: 'Bolo de morango',   icone: 'cake_strawberry',    desbloqueio: 300,    folha: [6, 0] },
  laranja: { nome: 'Laranja', tempo: 1 * HORA, porcoes: 12, preco: 2, produto: 'Suco de laranja',   icone: 'fruit_orange_slice', desbloqueio: 1500,   folha: [8, 0] },
  cafe:    { nome: 'Café',    tempo: 2 * HORA, porcoes: 24, preco: 3, produto: 'Expresso',          icone: 'coffee_espresso',    desbloqueio: 5000,  folha: [7, 1] },
  uva:     { nome: 'Uva',     tempo: 4 * HORA, porcoes: 48, preco: 4, produto: 'Vinho',             icone: 'drink_wine',          desbloqueio: 15000,  folha: [5, 1] },
  abacaxi: { nome: 'Abacaxi', tempo: 8 * HORA, porcoes: 96, preco: 5, produto: 'Piña colada',       icone: 'drink_pinacolada',    desbloqueio: 35000, folha: [4, 0] },
};
export const VENDA_DIRETA = 0.3; // vender direto paga 30% do preço do bar
export const precoVenda = c => CULTURAS[c].preco * VENDA_DIRETA;

export const MAQUINAS = {
  caca:   { nome: 'Caça-níquel',   taxa: 5,  custo: 150,   max: 10, mesa: false },
  roleta: { nome: 'Roleta',        taxa: 15, custo: 1200,  max: 8,  mesa: false },
  vinte:  { nome: 'Mesa de 21',    taxa: 50, custo: 4000,  max: 4,  mesa: true },
  poker:  { nome: 'Mesa de poker', taxa: 95, custo: 12000, max: 2,  mesa: true },
};
export const CRESCE = 1.15; // cada máquina igual custa 15% a mais que a anterior
export const DEVOLVE = 0.7;  // vender devolve 70% do que a última custou

// Melhorias com níveis: custo[n] é o preço pra ir do nível n pro n+1.
export const MELHORIAS = {
  salao:     { nome: 'Ampliar o salão',   valores: [6, 10, 14, 19, 24],        custo: [800, 3000, 8000, 20000],    unidade: 'lugares' },
  cofre:     { nome: 'Cofre maior',       valores: [6, 8, 10, 12],             custo: [800, 4000, 15000],           unidade: 'h' },
  canteiros: { nome: 'Mais canteiros',    valores: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], custo: [200, 250, 315, 390, 490, 610, 765, 955, 1200, 1500, 1850, 2350, 2900, 3650, 4550, 5700, 7100], unidade: 'canteiros' }, // +25% por canteiro
  adubo:     { nome: 'Adubo',             valores: [0, 10, 20, 30, 40],        custo: [1500, 5000, 12000, 30000],   unidade: '% mais rápido' },
  celeiro:   { nome: 'Celeiro',           valores: [60, 200, 600, 1500],       custo: [1200, 6000, 20000],          unidade: 'porções' },
  bar:       { nome: 'Abrir o bar',       valores: [0, 1],                     custo: [1500],                       unidade: '' },
  irrigacao: { nome: 'Irrigação automática', valores: [0, 1],                  custo: [20000],                      unidade: '' },
};

export const BONUS_BAR = 0.05; // por produto diferente no bar

// Equipe contratável (corpo = boneco de cassino/corpo0N.png). Só o cargo aparece;
// as chaves antigas (neves, ll…) ficam porque estão nos saves.
export const FUNCIONARIOS = {
  neves:   { cargo: 'Barman',    custo: 4000,  corpo: 1, efeito: 'Cada produto no bar dá +8% em vez de +5%' },
  ll:      { cargo: 'Crupiê',    custo: 15000, corpo: 2, efeito: '+20% nas mesas de 21 e poker' },
  gg:      { cargo: 'Segurança', custo: 25000, corpo: 3, efeito: 'Cofre guarda +4 h' },
  cast:    { cargo: 'Gerente',   custo: 50000, corpo: 1, efeito: '+10% em tudo' },
};

// Lojinha das estrelas: o que se compra aqui fica pra sempre, passando por todo reset.
// As estrelas são a moeda (gastou, saiu); custo[n] leva do nível n pro n+1.
export const LEGADO = {
  fama:      { nome: 'Fama',              custo: [1, 1, 1, 2, 2], efeito: n => `+${n * 10}% em tudo` },
  bar:       { nome: 'Bar da casa',       custo: [1],             efeito: () => 'O bar já começa aberto' },
  canteiros: { nome: 'Terra boa',         custo: [1, 1],          efeito: n => `Começa com +${n * 2} canteiros` },
  cofre:     { nome: 'Cofre reforçado',   custo: [1, 1],          efeito: n => `Cofre guarda +${n * 2} h` },
  sementes:  { nome: 'Banco de sementes', custo: [1],             efeito: () => 'As sementes liberadas continuam no reset' },
  irrigacao: { nome: 'Irrigação pra sempre', custo: [2],          efeito: () => 'Começa com a irrigação automática' },
};
export const legado = (e, id) => e.legado?.[id] || 0;
export const custoLegado = (e, id) => LEGADO[id].custo[legado(e, id)] ?? null;
// Aplica o que vale desde o 1º dia (bar, canteiros, irrigação). Roda no estado novo e ao comprar.
function aplicarLegado(e) {
  if (legado(e, 'bar')) e.niveis.bar = Math.max(e.niveis.bar, 1);
  if (legado(e, 'irrigacao')) e.niveis.irrigacao = Math.max(e.niveis.irrigacao, 1);
  while (e.niveis.canteiros < legado(e, 'canteiros') * 2) { e.niveis.canteiros++; e.canteiros.push(null); }
  return e;
}

// Inauguração: o cassino rende em dobro nas primeiras 72 h (de cada um, então quem
// chega no meio da temporada também ganha). e.inauguracao = { de, ate } em ms.
export const INAUGURACAO = 72 * HORA, INAUGURACAO_FATOR = 2;
export const novaInauguracao = agora => ({ de: agora, ate: agora + INAUGURACAO });
export const emInauguracao = (e, t) => t != null && e.inauguracao != null && t >= e.inauguracao.de && t < e.inauguracao.ate;

export const FICHAS_TEMPORADA = 5000;
export const DIAS_TEMPORADA = 60;
export const CLIQUES_DIA = 300;
export const VISITAS_DIA = 8;
export const CLIQUES_POR_SEGUNDO = 12;  // acima disso o servidor ignora (autoclicker)
const BRASILIA = -3 * HORA;

export function diaDe(ms) { return Math.floor((ms + BRASILIA) / DIA); }

// legado: o que foi comprado na lojinha das estrelas; culturas só passam com o Banco de sementes.
export function novoEstado(agora, estrelas = 0, temporada = 1, legado = {}, culturas = { milho: true }) {
  return garantirLayout(aplicarLegado({
    versao: 1, temporada, estrelas, legado: { ...legado }, inicio: agora, ultimo: agora, inauguracao: novaInauguracao(agora),
    fichas: FICHAS_TEMPORADA, cofre: 0, ganhoTemporada: 0,
    maquinas: { caca: 0, roleta: 0, vinte: 0, poker: 0 },
    niveis: { salao: 0, cofre: 0, canteiros: 0, adubo: 0, celeiro: 0, bar: 0, irrigacao: 0 },
    culturas: { ...culturas, milho: true },
    canteiros: [null, null, null], // { cultura, plantado }
    estoque: {},                    // porções por cultura (fração conta)
    funcionarios: {},
    dia: diaDe(agora), cliquesHoje: 0, visitasHoje: 0, ajudasHoje: {},
    cliquesRecentes: [],
  }));
}

export const nivel = (e, id) => MELHORIAS[id].valores[e.niveis[id]];

// ---- Layout do salão ----
// O salão é uma grade de células de 8 px (no tamanho original da arte). Cada peça
// ocupa um retângulo; ninguém anda por cima delas e duas não se sobrepõem.
export const CELULA = 8;
export const PECAS = {
  caca:   { nome: 'Caça-níquel', w: 4,  h: 6,  px: [32, 48] },
  roleta: { nome: 'Roleta',      w: 15, h: 7,  px: [118, 54] },
  vinte:  { nome: 'Mesa de 21',  w: 12, h: 7,  px: [96, 50] },
  poker:  { nome: 'Mesa de poker', w: 14, h: 11, px: [110, 83] },
  bar:    { nome: 'Bar',         w: 18, h: 6,  px: [144, 44] },
  vaso:   { nome: 'Planta',      w: 5,  h: 8,  px: [36, 62] },
  dados:  { nome: 'Dados',       w: 4,  h: 3,  px: [30, 24] },
};
// A sala cresce com "Ampliar o salão" (só pra baixo e pra direita, então nada sai dela).
const SALAS = [[56, 34], [64, 38], [72, 42], [84, 48], [96, 56]];
export const PAREDE = 2; // linhas de parede no topo
export function sala(e) {
  const [w, h] = SALAS[Math.min(e.niveis.salao, SALAS.length - 1)];
  return { w, h, porta: { x: Math.floor(w / 2) - 4, y: h - 4, w: 8, h: 4 } };
}
const quantasPecas = e => ({ ...e.maquinas, bar: 1, vaso: 2, dados: 1 });
const cruza = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
export function retangulos(e, exceto) {
  const lista = [];
  for (const [tipo, posicoes] of Object.entries(e.layout || {})) {
    posicoes.forEach(([x, y], i) => {
      if (exceto && exceto.tipo === tipo && exceto.i === i) return;
      lista.push({ tipo, i, x, y, w: PECAS[tipo].w, h: PECAS[tipo].h });
    });
  }
  return lista;
}
// Cabe ali? Dentro da sala, abaixo da parede, fora da porta e sem encostar em outra
// peça (folga = células livres em volta, pra sobrar corredor).
export function cabe(e, tipo, x, y, exceto = null, folga = 0) {
  const { w, h, porta } = sala(e), p = PECAS[tipo];
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < PAREDE || x + p.w > w || y + p.h > h) return false;
  const r = { x, y, w: p.w, h: p.h };
  if (cruza(r, porta)) return false;
  const largo = { x: x - folga, y: y - folga, w: p.w + folga * 2, h: p.h + folga * 2 };
  return !retangulos(e, exceto).some(o => cruza(largo, o));
}
function lugarLivre(e, tipo) {
  const { w, h } = sala(e);
  for (const folga of [2, 1, 0]) {
    for (let y = PAREDE + 1; y < h; y++) for (let x = 1; x < w; x++) if (cabe(e, tipo, x, y, null, folga)) return [x, y];
  }
  return null;
}
// Põe no lugar o que ainda não tem posição (máquina nova, estado antigo, sala maior).
export function garantirLayout(e) {
  if (!e.layout) {
    const { w, h } = sala(e);
    e.layout = { bar: [[w - PECAS.bar.w - 2, PAREDE + 1]], dados: [[w - PECAS.bar.w - 7, PAREDE + 3]], vaso: [[1, h - PECAS.vaso.h - 1], [w - PECAS.vaso.w - 1, h - PECAS.vaso.h - 1]] };
  }
  for (const [tipo, n] of Object.entries(quantasPecas(e))) {
    const lista = e.layout[tipo] = (e.layout[tipo] || []).slice(0, n);
    // posição que deixou de valer (arquivo mexido) volta pra fila
    for (let i = lista.length - 1; i >= 0; i--) if (!cabe(e, tipo, lista[i][0], lista[i][1], { tipo, i })) lista.splice(i, 1);
    while (lista.length < n) {
      const lugar = lugarLivre(e, tipo);
      if (!lugar) break; // não deve acontecer: a sala maior comporta o salão cheio
      lista.push(lugar);
    }
  }
  return e;
}
export const lugares = e => nivel(e, 'salao');
export const usados = e => Object.values(e.maquinas).reduce((a, b) => a + b, 0);
// Preço redondo: de 5 em 5 até 1.000, de 50 em 50 até 10.000, depois de 100 em 100.
const redondo = v => { const p = v < 1000 ? 5 : v < 10000 ? 50 : 100; return Math.round(v / p) * p; };
export const custoMaquina = (e, id) => redondo(MAQUINAS[id].custo * CRESCE ** e.maquinas[id]);
// Quanto volta ao vender a última máquina desse tipo (null se não tem nenhuma).
export const valorVendaMaquina = (e, id) => e.maquinas[id] ? redondo(MAQUINAS[id].custo * CRESCE ** (e.maquinas[id] - 1) * DEVOLVE) : null;
export const custoMelhoria = (e, id) => MELHORIAS[id].custo[e.niveis[id]] ?? null;
export const cofreHoras = e => nivel(e, 'cofre') + (e.funcionarios.gg ? 4 : 0) + legado(e, 'cofre') * 2;
export const capacidadeCeleiro = e => nivel(e, 'celeiro');
export const totalEstoque = e => Object.values(e.estoque).reduce((a, b) => a + b, 0);
export const tempoCultura = (e, c) => CULTURAS[c].tempo * (1 - nivel(e, 'adubo') / 100);

export function multiplicadorGeral(e) {
  let m = 1 + legado(e, 'fama') * 0.10;
  if (e.funcionarios.cast) m *= 1.10;
  return m;
}
export function produtosNoBar(e) {
  if (!e.niveis.bar) return [];
  return Object.keys(e.estoque).filter(c => e.estoque[c] >= 0.01);
}
export function bonusBar(e) {
  return produtosNoBar(e).length * (e.funcionarios.neves ? 0.08 : BONUS_BAR);
}
export function taxaBase(e) {
  let t = 0;
  for (const [id, m] of Object.entries(MAQUINAS)) {
    t += e.maquinas[id] * m.taxa * (m.mesa && e.funcionarios.ll ? 1.2 : 1);
  }
  return t;
}
// Quantas porções de cada produto os clientes do bar pedem por hora. A parte fixa
// faz o bar valer a pena já no começo; o resto cresce com o movimento do cassino.
export function consumoBar(e) { return 3 + taxaBase(e) / 60; }
// Fichas por hora que o bar fatura vendendo o que tem no celeiro.
export function rendaBar(e) {
  const pedido = consumoBar(e);
  return produtosNoBar(e).reduce((t, c) => t + pedido * CULTURAS[c].preco, 0) * multiplicadorGeral(e);
}
// Fichas por hora: cassino com o bônus do bar, mais as vendas do bar. Com "agora",
// conta também a inauguração (×2 nas primeiras 72 h).
export function taxaHora(e, agora) {
  const t = taxaBase(e) * (1 + bonusBar(e)) * multiplicadorGeral(e) + rendaBar(e);
  return emInauguracao(e, agora) ? t * INAUGURACAO_FATOR : t;
}

function virarDia(e, agora) {
  const d = diaDe(agora);
  if (d !== e.dia) { e.dia = d; e.cliquesHoje = 0; e.visitasHoje = 0; e.ajudasHoje = {}; }
}

// Com irrigação o canteiro replanta sozinho: a "próxima" escolhida pelo jogador, ou a mesma.
function replantar(cant) {
  if (cant.proxima) { cant.cultura = cant.proxima; delete cant.proxima; }
  return cant;
}
// Venda direta: a fração de coin que sobra fica guardada pra próxima venda.
function venderPorcoes(e, c, n) {
  const total = n * precoVenda(c) + (e.troco || 0);
  const v = Math.floor(total + 1e-6);
  e.troco = total - v;
  if (v) ganhar(e, v);
  return v;
}
function guardarColheita(e, c, porcoes) {
  const livre = Math.max(0, capacidadeCeleiro(e) - totalEstoque(e));
  const guarda = Math.min(livre, porcoes);
  e.estoque[c] = (e.estoque[c] || 0) + guarda;
  return porcoes - guarda; // o que não coube
}

// Avança o tempo de "e.ultimo" até "agora", de minuto em minuto. Máximo 14 dias
// de uma vez (o cofre enche muito antes disso).
export function avancar(e, agora) {
  garantirLayout(e);
  if (agora <= e.ultimo) return e;
  let t = e.ultimo;
  const fim = Math.min(agora, t + 14 * DIA);
  while (t < fim) {
    const passo = Math.min(MIN, fim - t);
    const h = passo / HORA;
    // Cassino: produção vai pro cofre até o limite de horas.
    const taxa = taxaHora(e, t);
    const limite = taxa * cofreHoras(e);
    const cheio = e.cofre >= limite;
    if (!cheio) e.cofre = Math.min(limite, e.cofre + taxa * h);
    // Bar vende um pouco de cada produto (com o cofre cheio ele fecha e não gasta).
    if (e.niveis.bar && !cheio) {
      const gasto = consumoBar(e) * h;
      for (const c of produtosNoBar(e)) e.estoque[c] = Math.max(0, e.estoque[c] - gasto);
    }
    t += passo;
    // Irrigação: o que ficou pronto é colhido e replantado sozinho. O que não cabe no
    // celeiro é vendido a preço de venda direta e vai pro cofre (com o cofre cheio, perde).
    if (e.niveis.irrigacao) {
      e.canteiros.forEach(cant => {
        if (!cant) return;
        while (cant.plantado + tempoCultura(e, cant.cultura) <= t) {
          const sobra = guardarColheita(e, cant.cultura, CULTURAS[cant.cultura].porcoes);
          if (sobra) e.cofre = Math.min(Math.max(e.cofre, limite), e.cofre + sobra * precoVenda(cant.cultura));
          cant.plantado += tempoCultura(e, cant.cultura);
          replantar(cant);
        }
      });
    }
  }
  e.ultimo = agora;
  virarDia(e, agora);
  return e;
}

function ganhar(e, valor) {
  e.fichas += valor;
  e.ganhoTemporada += valor;
}

// ---- Ações (cada uma devolve { ok, erro?, ... }) ----
export const acoes = {
  coletar(e) {
    const v = Math.floor(e.cofre + 1e-6); // soma de minutos deixa 5,9999…
    if (v < 1) return { ok: false, erro: 'O cofre está vazio.' };
    e.cofre -= v; ganhar(e, v);
    return { ok: true, valor: v };
  },
  plantar(e, i, cultura, agora) {
    if (!e.culturas[cultura]) return { ok: false, erro: 'Semente ainda não liberada.' };
    if (i < 0 || i >= e.canteiros.length || e.canteiros[i]) return { ok: false, erro: 'Canteiro ocupado.' };
    e.canteiros[i] = { cultura, plantado: agora };
    return { ok: true };
  },
  colher(e, i, agora) {
    const cant = e.canteiros[i];
    if (!cant) return { ok: false, erro: 'Nada plantado.' };
    if (cant.plantado + tempoCultura(e, cant.cultura) > agora) return { ok: false, erro: 'Ainda não está pronto.' };
    const sobra = guardarColheita(e, cant.cultura, CULTURAS[cant.cultura].porcoes);
    // O que não coube no celeiro é vendido na hora, barato.
    const venda = sobra ? venderPorcoes(e, cant.cultura, sobra) : 0;
    e.canteiros[i] = e.niveis.irrigacao ? replantar({ ...cant, plantado: agora }) : null;
    return { ok: true, porcoes: CULTURAS[cant.cultura].porcoes - sobra, venda };
  },
  // Escolhe o que entra no lugar quando este canteiro for colhido (null volta pra mesma).
  proxima(e, i, cultura) {
    const cant = e.canteiros[i];
    if (!cant) return { ok: false, erro: 'Canteiro vazio: é só plantar.' };
    if (cultura != null && !e.culturas[cultura]) return { ok: false, erro: 'Semente ainda não liberada.' };
    if (cultura == null || cultura === cant.cultura) delete cant.proxima; else cant.proxima = cultura;
    return { ok: true };
  },
  // Tira o que está plantado (perde o que estava crescendo).
  arrancar(e, i) {
    if (!e.canteiros[i]) return { ok: false, erro: 'Canteiro já está vazio.' };
    e.canteiros[i] = null;
    return { ok: true };
  },
  vender(e, cultura) {
    const n = Math.floor(e.estoque[cultura] || 0);
    if (!n) return { ok: false, erro: 'Nada pra vender.' };
    e.estoque[cultura] -= n;
    return { ok: true, valor: venderPorcoes(e, cultura, n) };
  },
  liberar(e, cultura) {
    const c = CULTURAS[cultura];
    if (!c || e.culturas[cultura]) return { ok: false, erro: 'Já liberada.' };
    if (e.fichas < c.desbloqueio) return { ok: false, erro: 'Coins insuficientes.' };
    e.fichas -= c.desbloqueio; e.culturas[cultura] = true;
    return { ok: true };
  },
  comprarMaquina(e, id) {
    const m = MAQUINAS[id];
    if (!m) return { ok: false, erro: '?' };
    if (e.maquinas[id] >= m.max) return { ok: false, erro: 'Já tem o máximo.' };
    if (usados(e) >= lugares(e)) return { ok: false, erro: 'Salão cheio. Amplie o salão.' };
    const c = custoMaquina(e, id);
    if (e.fichas < c) return { ok: false, erro: 'Coins insuficientes.' };
    e.fichas -= c; e.maquinas[id]++;
    garantirLayout(e);
    return { ok: true };
  },
  // Volta pra carteira sem contar como ganho da temporada (não é renda).
  venderMaquina(e, id) {
    if (!MAQUINAS[id]) return { ok: false, erro: '?' };
    const v = valorVendaMaquina(e, id);
    if (v == null) return { ok: false, erro: 'Você não tem essa máquina.' };
    e.maquinas[id]--; e.fichas += v;
    garantirLayout(e);
    return { ok: true, valor: v };
  },
  melhorar(e, id) {
    const c = custoMelhoria(e, id);
    if (c == null) return { ok: false, erro: 'Já está no máximo.' };
    if (e.fichas < c) return { ok: false, erro: 'Coins insuficientes.' };
    e.fichas -= c; e.niveis[id]++;
    if (id === 'canteiros') e.canteiros.push(null);
    garantirLayout(e);
    return { ok: true };
  },
  // Lojinha das estrelas: paga em estrelas, não em coins.
  legado(e, id) {
    const c = custoLegado(e, id);
    if (c == null) return { ok: false, erro: 'Já está no máximo.' };
    if (e.estrelas < c) return { ok: false, erro: 'Estrelas insuficientes.' };
    e.estrelas -= c; e.legado = { ...e.legado, [id]: legado(e, id) + 1 };
    aplicarLegado(e); garantirLayout(e);
    return { ok: true };
  },
  contratar(e, id) {
    const f = FUNCIONARIOS[id];
    if (!f || e.funcionarios[id]) return { ok: false, erro: 'Já contratado.' };
    if (e.fichas < f.custo) return { ok: false, erro: 'Coins insuficientes.' };
    e.fichas -= f.custo; e.funcionarios[id] = true;
    return { ok: true };
  },
  // Arrastar uma peça no modo de editar o salão.
  mover(e, tipo, i, x, y) {
    const lista = e.layout?.[tipo];
    if (!lista || !Number.isInteger(i) || !lista[i]) return { ok: false, erro: 'Essa peça não existe.' };
    if (!cabe(e, tipo, x, y, { tipo, i })) return { ok: false, erro: 'Não cabe aí.' };
    lista[i] = [x, y];
    return { ok: true };
  },
  // Alavanca: vale 30 s de produção (mínimo 1), até CLIQUES_DIA por dia.
  clicar(e, agora) {
    virarDia(e, agora);
    e.cliquesRecentes = e.cliquesRecentes.filter(t => agora - t < 1000);
    if (e.cliquesRecentes.length >= CLIQUES_POR_SEGUNDO) return { ok: false, erro: 'Calma!' };
    if (e.cliquesHoje >= CLIQUES_DIA) return { ok: false, erro: 'A alavanca esfriou. Volta amanhã.' };
    e.cliquesRecentes.push(agora); e.cliquesHoje++;
    const v = Math.max(1, Math.floor(taxaHora(e, agora) / 120 * (e.funcionarios.cast ? 2 : 1)));
    ganhar(e, v);
    return { ok: true, valor: v };
  },
  // Visita surpresa: um amigo atravessa a tela; pegar vale 20 min de produção.
  visita(e, agora) {
    virarDia(e, agora);
    if (e.visitasHoje >= VISITAS_DIA) return { ok: false, erro: 'Chega de visita hoje.' };
    e.visitasHoje++;
    const v = Math.max(10, Math.floor(taxaHora(e, agora) / 3));
    ganhar(e, v);
    return { ok: true, valor: v };
  },
  // Ajudar um amigo: uma vez por dia por amigo, os dois ganham 30 min.
  ajudar(e, amigo, agora) {
    virarDia(e, agora);
    if (e.ajudasHoje[amigo]) return { ok: false, erro: 'Você já ajudou hoje.' };
    e.ajudasHoje[amigo] = true;
    const v = Math.max(15, Math.floor(taxaHora(e, agora) / 2));
    ganhar(e, v);
    return { ok: true, valor: v };
  },
};

// Estrelas da temporada: fixas. Quem deixou tudo no máximo (máquinas, melhorias,
// equipe e sementes) ganha 3; o resto ganha 1.
export const ESTRELAS_MAXIMO = 3, ESTRELAS_BASE = 1;
export function faltamProMaximo(e) {
  let falta = 0;
  for (const [id, m] of Object.entries(MAQUINAS)) falta += m.max - e.maquinas[id];
  for (const [id, m] of Object.entries(MELHORIAS)) falta += m.valores.length - 1 - e.niveis[id];
  for (const id of Object.keys(FUNCIONARIOS)) if (!e.funcionarios[id]) falta++;
  for (const id of Object.keys(CULTURAS)) if (!e.culturas[id]) falta++;
  return falta;
}
export const estrelasGanhas = e => faltamProMaximo(e) ? ESTRELAS_BASE : ESTRELAS_MAXIMO;
export function fimTemporada(e, agora) {
  const novas = estrelasGanhas(e);
  const culturas = legado(e, 'sementes') ? e.culturas : undefined;
  return { novas, estado: novoEstado(agora, e.estrelas + novas, e.temporada + 1, e.legado, culturas) };
}
export function diaTemporada(e, agora) { return Math.floor((agora - e.inicio) / DIA) + 1; }

// O amigo que recebe a ajuda ganha meia hora da produção dele.
export function receberAjuda(e) {
  const v = Math.max(15, Math.floor(taxaHora(e) / 2));
  ganhar(e, v);
  return v;
}

// Só no servidor de teste: faz o tempo "ter passado" recuando todas as marcas.
export function recuarTempo(e, ms) {
  e.inicio -= ms; e.ultimo -= ms;
  for (const c of e.canteiros) if (c) c.plantado -= ms;
}
