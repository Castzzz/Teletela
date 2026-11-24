// Apostas estilo Twitch: alguém do canal de voz faz uma pergunta com opções, a turma
// põe fichas numa delas enquanto está aberta e quem criou marca o resultado. O pote vai
// pra quem acertou, na proporção do que cada um pôs. Ninguém acertou ou cancelou: devolve.
// Uma aposta por canal. Fica em apostas.json pra um reinício não sumir com fichas.
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export const TEMPOS_APOSTA = [60, 120, 300, 600, 1800];
const LIMPA_DEPOIS = 15 * 60e3; // o resultado fica no card por 15 minutos
const texto = (v, max) => typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '';

export function criarApostas({ io, channels, fichas, isOwner = () => false, diretorio = '', agora = Date.now, aoMudarFichas = () => {} }) {
  const arquivo = diretorio ? path.join(diretorio, 'apostas.json') : null;
  const apostas = new Map(); // canal -> aposta
  const pessoas = new Map(); // socket.id -> user
  const timers = new Map();

  function salvar() {
    if (!arquivo) return;
    const tmp = arquivo + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ version: 1, apostas: [...apostas.values()] }), { mode: 0o600 });
    fs.renameSync(tmp, arquivo);
  }

  const chaveDe = user => user.accountId ? user.accessId : null;

  function agendar(aposta) {
    clearTimeout(timers.get(aposta.canal));
    const fim = aposta.fase === 'aberta' ? aposta.fechaEm : ['resolvida', 'cancelada'].includes(aposta.fase) ? aposta.terminouEm + LIMPA_DEPOIS : null;
    if (!fim) return;
    const t = setTimeout(() => {
      if (apostas.get(aposta.canal) !== aposta) return;
      if (aposta.fase === 'aberta') aposta.fase = 'fechada';
      else apostas.delete(aposta.canal);
      salvar();
      atualizar(aposta.canal);
      agendar(aposta);
    }, Math.max(0, fim - agora()));
    t.unref?.();
    timers.set(aposta.canal, t);
  }

  function estado(aposta, user) {
    const chave = user ? chaveDe(user) : null;
    const carteira = chave ? fichas.resumo(chave, user.name) : null;
    if (!aposta) return { aposta: null, carteira };
    const total = aposta.palpites.reduce((s, p) => s + p.valor, 0);
    const meu = aposta.palpites.find(p => p.chave === chave);
    return {
      carteira,
      aposta: {
        id: aposta.id, titulo: aposta.titulo, fase: aposta.fase, fechaEm: aposta.fechaEm, vencedora: aposta.vencedora, devolvida: Boolean(aposta.devolvida),
        criador: aposta.criador.nome, souCriador: aposta.criador.chave === chave, possoDecidir: aposta.criador.chave === chave || Boolean(user && isOwner(user)),
        total,
        opcoes: aposta.opcoes.map(o => {
          const delas = aposta.palpites.filter(p => p.opcao === o.id).sort((a, b) => b.valor - a.valor);
          const soma = delas.reduce((s, p) => s + p.valor, 0);
          return { id: o.id, texto: o.texto, total: soma, pessoas: delas.length, paga: soma ? total / soma : null,
            maiores: delas.slice(0, 3).map(p => ({ nome: p.nome, valor: p.valor })) };
        }),
        meu: meu ? { opcao: meu.opcao, valor: meu.valor, ganho: meu.ganho ?? null } : null
      }
    };
  }

  function atualizar(canal) {
    const aposta = apostas.get(canal);
    for (const id of channels.get(canal)?.users.keys() || []) {
      const user = pessoas.get(id);
      io.sockets.sockets.get(id)?.emit('aposta', { canal, ...estado(aposta, user) });
    }
  }

  // Paga o pote proporcional; sem acertador (ou cancelada) devolve a cada um o que pôs.
  function liquidar(aposta, vencedora) {
    const total = aposta.palpites.reduce((s, p) => s + p.valor, 0);
    const ganhadores = vencedora ? aposta.palpites.filter(p => p.opcao === vencedora) : [];
    const base = ganhadores.reduce((s, p) => s + p.valor, 0);
    for (const p of aposta.palpites) p.ganho = base ? 0 : p.valor;
    if (base) {
      let pago = 0;
      for (const p of ganhadores) { p.ganho = Math.floor(total * p.valor / base); pago += p.ganho; }
      for (let i = 0; pago < total; i = (i + 1) % ganhadores.length, pago++) ganhadores[i].ganho++;
    }
    for (const p of aposta.palpites) fichas.mover(p.chave, p.ganho);
    aposta.fase = vencedora ? 'resolvida' : 'cancelada';
    aposta.vencedora = vencedora;
    aposta.devolvida = !base;
    aposta.terminouEm = agora();
  }

  // Volta do arquivo: apostas abertas que venceram durante a parada ficam fechadas.
  if (arquivo && fs.existsSync(arquivo)) {
    const dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
    for (const a of Array.isArray(dados?.apostas) ? dados.apostas : []) {
      if (!a?.canal || !Array.isArray(a.palpites) || !Array.isArray(a.opcoes)) continue;
      if (a.fase === 'aberta' && agora() >= a.fechaEm) a.fase = 'fechada';
      apostas.set(a.canal, a);
      agendar(a);
    }
  }

  function conectar(socket, user) {
    pessoas.set(socket.id, user);
    socket.on('disconnect', () => pessoas.delete(socket.id));
    socket.on('aposta', (pedido, cb) => {
      if (typeof cb !== 'function') return;
      const canal = user.channelId;
      if (!canal || !pedido || pedido.canal !== canal || !channels.get(canal)?.users.has(socket.id)) return cb({ erro: 'Entre no canal de voz.' });
      let aposta = apostas.get(canal);
      const chave = chaveDe(user);
      const decide = aposta && (aposta.criador.chave === chave || isOwner(user));
      const { acao } = pedido;
      if (acao === 'ver') return cb(estado(aposta, user));

      if (!chave && ['criar', 'palpitar'].includes(acao)) return cb({ erro: 'Entre na sua conta pra apostar.' });
      if (acao === 'criar') {
        if (aposta && ['aberta', 'fechada'].includes(aposta.fase)) return cb({ erro: 'Já tem uma aposta rolando neste canal.' });
        const titulo = texto(pedido.titulo, 90);
        const opcoes = (Array.isArray(pedido.opcoes) ? pedido.opcoes : []).map(o => texto(o, 40)).filter(Boolean);
        if (titulo.length < 3) return cb({ erro: 'Escreva a pergunta.' });
        if (opcoes.length < 2 || opcoes.length > 10) return cb({ erro: 'Coloque de 2 a 10 opções.' });
        if (new Set(opcoes.map(o => o.toLowerCase())).size !== opcoes.length) return cb({ erro: 'Tem opção repetida.' });
        if (!TEMPOS_APOSTA.includes(pedido.segundos)) return cb({ erro: 'Escolha o tempo da aposta.' });
        aposta = {
          id: randomUUID(), canal, titulo, criadaEm: agora(), fechaEm: agora() + pedido.segundos * 1000, fase: 'aberta', vencedora: null,
          criador: { chave, nome: user.name }, opcoes: opcoes.map((t, i) => ({ id: 'o' + (i + 1), texto: t })), palpites: []
        };
        fichas.pegar(chave, user.name);
        apostas.set(canal, aposta);
      } else if (!aposta || pedido.id !== aposta.id) {
        return cb({ erro: 'Essa aposta já mudou.' });
      } else if (acao === 'palpitar') {
        const valor = pedido.valor;
        const opcao = aposta.opcoes.find(o => o.id === pedido.opcao);
        if (aposta.fase !== 'aberta' || agora() >= aposta.fechaEm) return cb({ erro: 'As apostas já fecharam.' });
        if (!opcao) return cb({ erro: 'Escolha uma opção.' });
        if (!Number.isSafeInteger(valor) || valor < 1) return cb({ erro: 'Escolha quantas fichas.' });
        if (valor > fichas.pegar(chave, user.name).saldo) return cb({ erro: 'Você não tem essas fichas.' });
        let meu = aposta.palpites.find(p => p.chave === chave);
        if (meu && meu.opcao !== opcao.id) return cb({ erro: 'Você já apostou em outra opção.' });
        if (!meu) { meu = { chave, nome: user.name, opcao: opcao.id, valor: 0 }; aposta.palpites.push(meu); }
        meu.valor += valor;
        meu.nome = user.name;
        fichas.mover(chave, -valor);
      } else if (acao === 'fechar' && decide && aposta.fase === 'aberta') {
        aposta.fase = 'fechada';
        aposta.fechaEm = agora();
      } else if (acao === 'resolver' && decide && ['aberta', 'fechada'].includes(aposta.fase)) {
        if (!aposta.opcoes.some(o => o.id === pedido.opcao)) return cb({ erro: 'Escolha a opção que aconteceu.' });
        liquidar(aposta, pedido.opcao);
      } else if (acao === 'cancelar' && decide && ['aberta', 'fechada'].includes(aposta.fase)) {
        liquidar(aposta, null);
      } else return cb({ erro: 'Essa ação está indisponível.' });
      salvar();
      agendar(aposta);
      atualizar(canal);
      if (['palpitar', 'resolver', 'cancelar'].includes(acao)) aoMudarFichas(canal);
      cb({});
    });
  }

  function atualizarTodas() { for (const canal of apostas.keys()) atualizar(canal); }
  return { conectar, atualizar, atualizarTodas };
}
