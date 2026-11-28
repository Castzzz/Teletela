// Cassino e roça de cada pessoa (atividade idle das Atividades). As regras ficam em
// public/cassino-regras.js (o app usa as mesmas pra mostrar o cofre enchendo); aqui o
// servidor guarda o estado de cada conta em cassino.json e passa as fichas pela
// carteira de verdade (FichasStore), então nada do que o cliente manda vira ficha
// sem passar pelas regras.
import fs from 'node:fs';
import path from 'node:path';
import * as R from './public/cassino-regras.js';

const texto = (v, max) => typeof v === 'string' ? v.slice(0, max) : '';

// Amigos de mentira, só no servidor de teste, pra dar pra visitar e ajudar sozinho.
const DEMOS = {
  'demo-ll': { nome: 'LL', dias: 24, maq: { caca: 10, roleta: 5, vinte: 3, poker: 1 }, niv: { salao: 3, cofre: 3, canteiros: 5, bar: 1, celeiro: 2, adubo: 1 }, func: { ll: true, neves: true }, culturas: ['milho', 'morango', 'laranja', 'cafe'], estoque: { laranja: 30, cafe: 40, morango: 8 }, ganho: 98000 },
  'demo-neves': { nome: 'Neves', dias: 9, maq: { caca: 8, roleta: 2 }, niv: { salao: 1, cofre: 1, canteiros: 2, bar: 1, celeiro: 1 }, func: {}, culturas: ['milho', 'morango', 'laranja'], estoque: { morango: 12 }, ganho: 21000 },
  'demo-gg': { nome: 'GG', dias: 41, maq: { caca: 10, roleta: 8, vinte: 4, poker: 2 }, niv: { salao: 4, cofre: 3, canteiros: 9, bar: 1, celeiro: 3, adubo: 3, irrigacao: 1 }, func: { ll: true, neves: true, gg: true }, culturas: ['milho', 'morango', 'laranja', 'cafe', 'uva', 'abacaxi'], estoque: { laranja: 200, cafe: 300, uva: 400, abacaxi: 300, morango: 90 }, ganho: 412000 },
};

export function criarCassino({ io, fichas, diretorio = '', agora = Date.now, teste = false, aoMudarFichas = () => {} }) {
  const arquivo = diretorio ? path.join(diretorio, 'cassino.json') : null;
  const jogadores = new Map(); // chave da conta -> { nome, estado }
  const conectados = new Map(); // chave -> Set de sockets (pra avisar de ajuda)
  // Temporada global: todo mundo joga a mesma. Dura DIAS_TEMPORADA e acaba às 03h de
  // Brasília (06h UTC), na janela de manutenção, quando quase ninguém está jogando.
  let temporada = null;

  if (arquivo && fs.existsSync(arquivo)) {
    const dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
    if (dados.version !== 1 || !dados.jogadores) throw new Error('cassino.json inválido. Restaure o backup.');
    for (const [chave, j] of Object.entries(dados.jogadores)) if (j?.estado?.versao === 1) jogadores.set(chave, j);
    // Cassino de antes da inauguração existir (5.1.2) ganha as 72 h a partir de agora.
    const desde = agora();
    for (const j of jogadores.values()) if (!j.estado.inauguracao) j.estado.inauguracao = R.novaInauguracao(desde);
    const t = dados.temporada;
    if (Number.isSafeInteger(t?.numero) && Number.isFinite(t.inicio) && Number.isFinite(t.fim)) temporada = t;
  }

  let timerSalvar = null;
  function gravar() {
    timerSalvar = null;
    if (!arquivo) return;
    const tmp = arquivo + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ version: 1, temporada, jogadores: Object.fromEntries(jogadores) }), { mode: 0o600 });
    fs.renameSync(tmp, arquivo);
  }
  // Clique de alavanca vem em rajada: junta as gravações num segundo.
  function salvar() { if (!timerSalvar) { timerSalvar = setTimeout(gravar, 1000); timerSalvar.unref?.(); } }

  if (teste) {
    for (const [chave, c] of Object.entries(DEMOS)) {
      if (jogadores.has(chave)) continue;
      const t = agora();
      const e = R.novoEstado(t - c.dias * R.DIA);
      Object.assign(e.maquinas, c.maq);
      Object.assign(e.niveis, c.niv);
      e.funcionarios = { ...c.func };
      for (const k of c.culturas) e.culturas[k] = true;
      e.canteiros = Array.from({ length: R.nivel(e, 'canteiros') }, (_, i) => {
        const cult = c.culturas[i % c.culturas.length];
        return { cultura: cult, plantado: t - (i / 10) * R.tempoCultura(e, cult) };
      });
      e.estoque = { ...c.estoque };
      e.ultimo = t; e.ganhoTemporada = c.ganho;
      delete e.fichas;
      jogadores.set(chave, { nome: c.nome, estado: e });
    }
  }

  function fimDaTemporada(inicio) {
    const alvo = inicio + R.DIAS_TEMPORADA * R.DIA;
    const d = new Date(alvo);
    d.setUTCHours(6, 0, 0, 0);
    if (d.getTime() < alvo) d.setUTCDate(d.getUTCDate() + 1);
    return d.getTime();
  }
  if (!temporada) {
    // Primeira temporada (lançamento): ninguém perde coins, quem tem menos sobe pra 5.000.
    temporada = { numero: 1, inicio: agora(), fim: fimDaTemporada(agora()) };
    fichas.garantirMinimo(R.FICHAS_TEMPORADA);
    gravar();
  }
  // Fim da temporada: cada um fecha o cofre até a hora do fim, ganha as estrelas (3 com
  // tudo no máximo, senão 1) e recomeça com o que comprou na lojinha; toda carteira de
  // conta volta pra 5.000. Os amigos de mentira do servidor de teste ficam como estão.
  function encerrarTemporada() {
    const fim = temporada.fim, t = agora();
    for (const [chave, j] of jogadores) {
      if (Object.hasOwn(DEMOS, chave)) continue;
      R.avancar(j.estado, fim);
      const ganho = Math.floor(j.estado.ganhoTemporada);
      const { novas, estado } = R.fimTemporada(j.estado, t);
      delete estado.fichas;
      estado.temporada = temporada.numero + 1;
      j.estado = estado;
      j.fimTemporada = { numero: temporada.numero, novas, ganho };
    }
    fichas.resetarTodas(R.FICHAS_TEMPORADA);
    // Com o servidor desligado na hora do fim, a próxima conta a partir de agora.
    const inicio = t - fim > R.DIA ? t : fim;
    temporada = { numero: temporada.numero + 1, inicio, fim: fimDaTemporada(inicio) };
    gravar();
    aoMudarFichas();
    for (const sockets of conectados.values()) for (const s of sockets) s.emit('cassino-temporada');
  }
  function verificarTemporada() { if (agora() >= temporada.fim) encerrarTemporada(); }
  verificarTemporada();
  const relogio = setInterval(verificarTemporada, 60e3);
  relogio.unref?.();

  function pegar(chave, nome) {
    let j = jogadores.get(chave);
    if (!j) {
      j = { nome: texto(nome, 40), estado: R.novoEstado(agora(), 0, temporada.numero) };
      delete j.estado.fichas;
      jogadores.set(chave, j);
      salvar();
      // A temporada começa com 5.000 na carteira. Por enquanto só no servidor de teste:
      // a troca de 1.000 pra 5.000 pra todo mundo vem junto com as temporadas de verdade.
      if (teste) { const c = fichas.pegar(chave, nome); if (c.saldo < R.FICHAS_TEMPORADA) fichas.ajustar(chave, R.FICHAS_TEMPORADA - c.saldo); }
    }
    if (nome && j.nome !== nome) j.nome = texto(nome, 40);
    R.avancar(j.estado, agora());
    return j;
  }

  // O que vai pro app: tudo menos o controle anti-autoclicker.
  function visao(j) {
    const { cliquesRecentes, fichas: _f, ...resto } = j.estado;
    return resto;
  }
  function resposta(chave, nome) {
    const j = pegar(chave, nome);
    return { estado: visao(j), carteira: fichas.resumo(chave, nome), agora: agora(), teste,
      temporada: { numero: temporada.numero, fim: temporada.fim }, fimTemporada: j.fimTemporada || null };
  }

  // Roda uma ação com o saldo da carteira e devolve a diferença pra carteira.
  function comFichas(chave, nome, j, fn) {
    const antes = fichas.pegar(chave, nome).saldo;
    j.estado.fichas = antes;
    let r;
    try { r = fn(j.estado); } finally {
      const diferenca = Math.round(j.estado.fichas - antes);
      delete j.estado.fichas;
      if (diferenca) { fichas.mover(chave, diferenca); aoMudarFichas(); }
      salvar();
    }
    return r;
  }

  function amigos(chave) {
    const eu = pegar(chave);
    const t = agora();
    return [...jogadores].filter(([k]) => k !== chave).map(([k, j]) => {
      R.avancar(j.estado, t);
      const e = j.estado;
      return { chave: k, nome: j.nome || 'Alguém', taxa: Math.floor(R.taxaHora(e, t)), dia: R.diaTemporada(e, t), maquinas: R.usados(e),
        canteiros: e.canteiros.length, equipe: Object.keys(e.funcionarios).length, ganho: Math.floor(e.ganhoTemporada), ajudouHoje: Boolean(eu.estado.ajudasHoje[k]) };
    }).sort((a, b) => b.ganho - a.ganho);
  }

  const inteiro = v => Number.isSafeInteger(v) && v >= 0 && v < 100;
  const de = (obj, id) => typeof id === 'string' && Object.hasOwn(obj, id);

  function conectar(socket, user) {
    let registrado = null;
    socket.on('disconnect', () => { if (registrado) conectados.get(registrado)?.delete(socket); });
    socket.on('cassino', (pedido, cb) => {
      if (typeof cb !== 'function') return;
      const chave = user.accountId ? user.accessId : null;
      if (!chave) return cb({ erro: 'Entre na sua conta pra ter seu cassino.' });
      if (registrado !== chave) {
        if (registrado) conectados.get(registrado)?.delete(socket);
        registrado = chave;
        if (!conectados.has(chave)) conectados.set(chave, new Set());
        conectados.get(chave).add(socket);
      }
      const p = pedido && typeof pedido === 'object' ? pedido : {};
      const nome = user.name;
      const j = pegar(chave, nome);
      const t = agora();
      const rodar = fn => comFichas(chave, nome, j, fn);
      let r = { ok: true };

      switch (p.acao) {
        case 'ver': break;
        case 'coletar': r = rodar(e => R.acoes.coletar(e)); break;
        case 'plantar':
          if (!inteiro(p.i) || !de(R.CULTURAS, p.cultura)) return cb({ erro: 'Escolha a semente.' });
          r = rodar(e => R.acoes.plantar(e, p.i, p.cultura, t)); break;
        case 'plantarVazios': {
          if (!de(R.CULTURAS, p.cultura)) return cb({ erro: 'Escolha a semente.' });
          if (!j.estado.culturas[p.cultura]) { r = { ok: false, erro: 'Semente ainda não liberada.' }; break; }
          let n = 0;
          rodar(e => e.canteiros.forEach((c, i) => { if (!c && R.acoes.plantar(e, i, p.cultura, t).ok) n++; }));
          r = n ? { ok: true, plantados: n } : { ok: false, erro: 'Nenhum canteiro vazio.' };
          break;
        }
        case 'proxima':
          if (!inteiro(p.i) || (p.cultura != null && !de(R.CULTURAS, p.cultura))) return cb({ erro: 'Escolha a semente.' });
          r = rodar(e => R.acoes.proxima(e, p.i, p.cultura ?? null)); break;
        case 'proximaTodos': {
          if (!de(R.CULTURAS, p.cultura)) return cb({ erro: 'Escolha a semente.' });
          if (!j.estado.culturas[p.cultura]) { r = { ok: false, erro: 'Semente ainda não liberada.' }; break; }
          let n = 0;
          rodar(e => e.canteiros.forEach((c, i) => { if (c && R.acoes.proxima(e, i, p.cultura).ok) n++; }));
          r = n ? { ok: true, trocados: n } : { ok: false, erro: 'Nenhum canteiro plantado.' };
          break;
        }
        case 'arrancar':
          if (!inteiro(p.i)) return cb({ erro: 'Escolha o canteiro.' });
          r = rodar(e => R.acoes.arrancar(e, p.i)); break;
        case 'colher':
          if (!inteiro(p.i)) return cb({ erro: 'Escolha o canteiro.' });
          r = rodar(e => R.acoes.colher(e, p.i, t)); break;
        case 'colherTudo': {
          let porcoes = 0, venda = 0;
          rodar(e => e.canteiros.forEach((c, i) => {
            if (c && c.plantado + R.tempoCultura(e, c.cultura) <= t) { const x = R.acoes.colher(e, i, t); if (x.ok) { porcoes += x.porcoes; venda += x.venda; } }
          }));
          r = porcoes || venda ? { ok: true, porcoes, venda } : { ok: false, erro: 'Nada pronto ainda.' };
          break;
        }
        case 'vender':
          if (!de(R.CULTURAS, p.cultura)) return cb({ erro: 'Escolha o que vender.' });
          r = rodar(e => R.acoes.vender(e, p.cultura)); break;
        case 'liberar':
          if (!de(R.CULTURAS, p.cultura)) return cb({ erro: 'Escolha a semente.' });
          r = rodar(e => R.acoes.liberar(e, p.cultura)); break;
        case 'maquina':
          if (!de(R.MAQUINAS, p.id)) return cb({ erro: 'Escolha a máquina.' });
          r = rodar(e => R.acoes.comprarMaquina(e, p.id)); break;
        case 'venderMaquina':
          if (!de(R.MAQUINAS, p.id)) return cb({ erro: 'Escolha a máquina.' });
          r = rodar(e => R.acoes.venderMaquina(e, p.id)); break;
        case 'melhorar':
          if (!de(R.MELHORIAS, p.id)) return cb({ erro: 'Escolha a melhoria.' });
          r = rodar(e => R.acoes.melhorar(e, p.id)); break;
        case 'legado':
          if (!de(R.LEGADO, p.id)) return cb({ erro: 'Escolha o bônus.' });
          r = rodar(e => R.acoes.legado(e, p.id)); break;
        case 'contratar':
          if (!de(R.FUNCIONARIOS, p.id)) return cb({ erro: 'Escolha quem contratar.' });
          r = rodar(e => R.acoes.contratar(e, p.id)); break;
        case 'mover': {
          if (!de(R.PECAS, p.tipo) || !inteiro(p.i)) return cb({ erro: 'Escolha a peça.' });
          r = R.acoes.mover(j.estado, p.tipo, p.i, p.x, p.y);
          if (r.ok) salvar();
          break;
        }
        case 'alavanca': r = rodar(e => R.acoes.clicar(e, t)); break;
        case 'visita': r = rodar(e => R.acoes.visita(e, t)); break;
        case 'amigos': return cb({ amigos: amigos(chave) });
        case 'visitar': {
          const outro = typeof p.chave === 'string' && p.chave !== chave ? jogadores.get(p.chave) : null;
          if (!outro) return cb({ erro: 'Esse cassino não existe.' });
          R.avancar(outro.estado, t);
          return cb({ amigo: { chave: p.chave, nome: outro.nome, estado: visao(outro), ajudouHoje: Boolean(j.estado.ajudasHoje[p.chave]) } });
        }
        case 'ajudar': {
          const outro = typeof p.chave === 'string' && p.chave !== chave ? jogadores.get(p.chave) : null;
          if (!outro) return cb({ erro: 'Esse cassino não existe.' });
          r = rodar(e => R.acoes.ajudar(e, p.chave, t));
          if (r.ok) {
            const nomeOutro = outro.nome;
            const recebeu = comFichas(p.chave, nomeOutro, pegar(p.chave, nomeOutro), e => R.receberAjuda(e));
            r.amigo = { nome: nomeOutro, valor: recebeu };
            for (const s of conectados.get(p.chave) || []) s.emit('cassino-ajuda', { nome: nome || 'Alguém', valor: recebeu });
          }
          break;
        }
        // Só no servidor de teste (TELINHA_CASSINO_TESTE=1)
        case 'pular':
          if (!teste) return cb({ erro: 'Só no servidor de teste.' });
          if (![R.HORA, R.DIA].includes(p.ms)) return cb({ erro: 'Tempo inválido.' });
          R.recuarTempo(j.estado, p.ms);
          R.avancar(j.estado, t);
          salvar();
          break;
        case 'encerrarTemporada': {
          if (!teste) return cb({ erro: 'Só no servidor de teste.' });
          const { novas, estado } = R.fimTemporada(j.estado, t);
          delete estado.fichas;
          const ganho = j.estado.ganhoTemporada;
          j.estado = estado;
          // A temporada nova começa com 5.000 fichas na carteira.
          fichas.ajustar(chave, R.FICHAS_TEMPORADA - fichas.pegar(chave, nome).saldo);
          aoMudarFichas();
          salvar();
          r = { ok: true, novas, ganho };
          break;
        }
        default: return cb({ erro: 'Ação desconhecida.' });
      }
      if (!r.ok) return cb({ erro: r.erro, ...resposta(chave, nome) });
      const { ok, erro, ...extra } = r;
      cb({ ...resposta(chave, nome), resultado: extra });
    });
  }

  return { conectar, gravar, verificarTemporada, temporada: () => ({ ...temporada }), parar: () => clearInterval(relogio) };
}
