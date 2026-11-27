// Motor da Comilança: grade de pedras, 4 amigos (um por cor) que andam comendo as pedras
// da cor deles que estiverem encostadas. Quando ninguém mais come, dois amigos encostados
// trocam de lugar se isso destrava alguém; se não, o que sobrou cai e entram pedras novas
// (avalanche); acaba quando nenhum amigo tem o que comer.
// Sem tela: devolve a lista de eventos pra animar. O servidor (comilanca.js) sorteia e
// paga; o app (public/comilanca.js) só anima os eventos.
export const CORES = ['vermelho', 'azul', 'verde', 'roxo'];
// Valor de uma pedra (× aposta) por nível. O nível de cada cor começa em 0 e sobe
// quando o amigo daquela cor come uma seta.
export const VALOR_BASE = [0.1, 0.25, 0.6, 1.5, 4, 10, 25];
const MAX_NIVEL = VALOR_BASE.length - 1;
export const MAX_LADO = 8;
export const TETO = 5000;           // ganho máximo de uma rodada, × aposta
export const GIROS_BONUS = 6, GIROS_EXTRA = 3, TREVOS_BONUS = 3;
// Chance de cada símbolo numa casa nova (soma 1). Toda pedra é da cor de um amigo, então
// quase todo giro paga um pouco; a rodada acaba quando nenhum amigo tem vizinha da cor dele.
export const SORTEIO = [
  ['gema', 0.9], ['curinga', 0.015], ['nivel', 0.05], ['bomba', 0.03], ['trevo', 0.005],
];
const VIZINHOS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

// escala 0.252: calibrada por simulação (tests/comilanca.test.js tem a conta) pra devolver ~95% do apostado.
export function criarMotor({ escala = 0.252, aleatorio = Math.random, sorteio = SORTEIO } = {}) {
  const valor = n => VALOR_BASE[n] * escala;
  const sortear = () => {
    let r = aleatorio();
    for (const [t, p] of sorteio) {
      if ((r -= p) >= 0) continue;
      if (t === 'gema') return { t, cor: CORES[Math.floor(aleatorio() * CORES.length)] };
      return { t };
    }
    return { t: 'gema', cor: CORES[0] };
  };
  const copiar = g => g.map(l => l.map(c => c && { ...c }));
  const comivel = (c, cor) => c && (c.t === 'gema' && c.cor === cor || c.t === 'curinga' || c.t === 'nivel' || c.t === 'bomba');

  // Uma rodada. "bonus" traz o que passa de um giro grátis pro outro (lado e níveis).
  function rodada(aposta, bonus = null) {
    let lado = bonus?.lado || 6;
    const niveis = bonus ? { ...bonus.niveis } : Object.fromEntries(CORES.map(c => [c, 0]));
    const grade = Array.from({ length: lado }, () => Array.from({ length: lado }, sortear));
    // Cada amigo começa numa casa sorteada (sem repetir).
    const livres = [];
    for (let y = 0; y < lado; y++) for (let x = 0; x < lado; x++) livres.push([x, y]);
    const amigos = CORES.map(cor => {
      const [x, y] = livres.splice(Math.floor(aleatorio() * livres.length), 1)[0];
      grade[y][x] = null;
      return { cor, x, y };
    });
    const ocupada = (x, y) => amigos.some(a => a.x === x && a.y === y);
    const eventos = [{ t: 'inicio', lado, grade: copiar(grade), amigos: amigos.map(a => ({ ...a })), niveis: { ...niveis } }];
    let ganho = 0, cascatas = 0;

    const alvoDe = a => {
      for (const [dx, dy] of VIZINHOS) {
        const x = a.x + dx, y = a.y + dy;
        if (x >= 0 && y >= 0 && x < lado && y < lado && !ocupada(x, y) && comivel(grade[y][x], a.cor)) return [x, y];
      }
      return null;
    };

    function acharTroca() {
      for (let i = 0; i < amigos.length; i++) for (let j = i + 1; j < amigos.length; j++) {
        const a = amigos[i], b = amigos[j];
        if (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) !== 1) continue;
        [a.x, b.x] = [b.x, a.x]; [a.y, b.y] = [b.y, a.y];
        const ajuda = alvoDe(a) || alvoDe(b);
        [a.x, b.x] = [b.x, a.x]; [a.y, b.y] = [b.y, a.y];
        if (ajuda) return [i, j];
      }
      return null;
    }

    for (;;) {
      // Cada amigo dá um passo por vez, em rodízio, até ninguém ter o que comer.
      let andou = true;
      while (andou && ganho < TETO * aposta) {
        andou = false;
        for (const [i, a] of amigos.entries()) {
          const alvo = alvoDe(a);
          if (!alvo) continue;
          andou = true;
          const [x, y] = alvo, s = grade[y][x];
          grade[y][x] = null;
          const de = [a.x, a.y];
          a.x = x; a.y = y;
          let v = 0;
          if (s.t === 'gema' || s.t === 'curinga') v = Math.round(valor(niveis[a.cor]) * aposta * 100) / 100;
          ganho += v;
          eventos.push({ t: 'comer', amigo: i, de, para: [x, y], simbolo: s, valor: v, total: ganho });
          if (s.t === 'nivel' && niveis[a.cor] < MAX_NIVEL) {
            niveis[a.cor]++;
            eventos.push({ t: 'nivel', amigo: i, cor: a.cor, nivel: niveis[a.cor] });
          }
          if (s.t === 'bomba' && lado < MAX_LADO) {
            // A grade cresce uma linha embaixo e uma coluna à direita; as casas novas
            // ficam vazias e se enchem na avalanche.
            lado++;
            for (const l of grade) l.push(null);
            grade.push(Array(lado).fill(null));
            eventos.push({ t: 'crescer', lado });
          }
        }
      }
      if (ganho >= TETO * aposta) { ganho = TETO * aposta; break; }
      // Troca: ninguém tem o que comer, mas dois amigos encostados trocando de lugar
      // fariam algum deles comer? Então eles trocam e a comilança segue sem avalanche.
      // Termina: toda troca é seguida de pelo menos uma pedra comida.
      const troca = acharTroca();
      if (troca) {
        const [i, j] = troca, a = amigos[i], b = amigos[j];
        const pa = [a.x, a.y], pb = [b.x, b.y];
        [a.x, a.y] = pb; [b.x, b.y] = pa;
        eventos.push({ t: 'trocar', amigos: [i, j], posicoes: [pb, pa] });
        continue;
      }
      // Avalanche: em cada coluna o que sobrou cai (os amigos ficam onde estão) e o
      // vazio de cima se enche com pedras novas.
      cascatas++;
      const novas = [];
      for (let x = 0; x < lado; x++) {
        const casas = [];
        for (let y = 0; y < lado; y++) if (!ocupada(x, y)) casas.push(y);
        const resto = casas.map(y => grade[y][x]).filter(Boolean);
        const vazias = casas.length - resto.length;
        casas.forEach((y, k) => {
          if (k < vazias) { grade[y][x] = sortear(); novas.push([x, y]); }
          else grade[y][x] = resto[k - vazias];
        });
      }
      eventos.push({ t: 'avalanche', grade: copiar(grade), novas });
      if (cascatas > 60 || !amigos.some(alvoDe)) break;
    }
    ganho = Math.round(ganho * 100) / 100;
    let trevos = 0;
    for (const l of grade) for (const c of l) if (c?.t === 'trevo') trevos++;
    const giros = trevos >= TREVOS_BONUS ? (bonus ? GIROS_EXTRA : GIROS_BONUS) : 0;
    eventos.push({ t: 'fim', ganho, trevos, giros });
    return { eventos, ganho, giros, lado, niveis };
  }

  // Um giro pago e, se der trevo, a sequência de giros grátis (que guarda lado e níveis).
  function jogar(aposta) {
    const base = rodada(aposta);
    const bonus = [];
    let restantes = base.giros, estado = { lado: base.lado, niveis: base.niveis };
    while (restantes > 0 && bonus.length < 60) {
      restantes--;
      const r = rodada(aposta, estado);
      bonus.push(r);
      restantes += r.giros;
      estado = { lado: r.lado, niveis: r.niveis };
    }
    const total = Math.min(TETO * aposta, base.ganho + bonus.reduce((t, r) => t + r.ganho, 0));
    return { base, bonus, total: Math.round(total * 100) / 100 };
  }
  return { rodada, jogar, valor };
}

