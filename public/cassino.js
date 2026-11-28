// Seu cassino e sua roça (atividade idle). O servidor (cassino.js) guarda o estado e
// mexe na carteira; aqui o app desenha e usa as mesmas regras (cassino-regras.js) só
// pra mostrar o cofre enchendo e as plantas crescendo entre uma resposta e outra.
import * as R from './cassino-regras.js';
import { criarSons, somDeFicha } from './sons-mesa.js';

const { HORA, DIA } = R;
const fmt = n => Math.floor(n).toLocaleString('pt-BR');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Boneco de corpo inteiro (16×24 por quadro, folha de 4×4) pra equipe e visitas.
const corpo = n => `cassino/corpo0${n}.png`;
const corpoSorteado = () => corpo(1 + Math.floor(Math.random() * 3));
// Ícone da loja: o primeiro quadro em 2×, cortando o vazio acima da cabeça.
const iconeCorpo = n => `background-image:url(${corpo(n)});background-size:128px 192px;background-position:4px -6px;background-repeat:no-repeat`;

function fmtTempo(ms) {
  if (ms <= 0) return 'pronto';
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.ceil(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} h ${String(r).padStart(2, '0')}` : `${h} h`;
}
// Recorte de uma folha de sprites: coluna, linha, quadro, tamanho da folha e escala.
const folha = (src, col, lin, q, w, h, k) =>
  `background-image:url(${src});background-size:${w * k}px ${h * k}px;background-position:-${col * q * k}px -${lin * q * k}px;background-repeat:no-repeat`;
const iconePlanta = (c, k = 2) => { const [lin, lado] = R.CULTURAS[c].folha; return folha('cassino/plantas.png', lado * 6, lin, 16, 192, 160, k); };
const img = src => `background-image:url(${src})`;

export function configurarCassino({ socket, appState, showToast }) {
  const palco = document.querySelector('#mesa-21');
  const titulo = document.querySelector('#titulo-21');
  const raiz = document.querySelector('#jogo-cassino');
  const $ = s => raiz.querySelector(s);
  const status = document.querySelector('.salao-cartao[data-jogo="cassino"] .salao-status');
  const cartao = document.querySelector('.salao-cartao[data-jogo="cassino"]');

  let aba = 'salao';            // qual jogo o salão está mostrando
  let e = null;                 // seu estado (vindo do servidor)
  let saldo = null;             // carteira
  let diferenca = 0;            // relógio do servidor - relógio daqui
  let teste = false, erroConta = null, temporada = null;
  let cena = 'cassino';
  let visitando = null;         // { chave, nome, estado, ajudouHoje }
  let listaAmigos = null;
  let ultimaSemente = 'milho';
  const agora = () => Date.now() + diferenca;
  const ativo = () => !palco.hidden && aba === 'cassino';
  // Sons: os do pacote de cassino (fichas, pote) e notas feitas na hora pra fazenda.
  // Seguem o botão de som da mesa e o ensurdecer, como no 21 e no poker.
  const tocar = criarSons(appState, ativo);
  const SOM = {
    coletar: () => { tocar('pote', 0, .6); tocar.tom([[1568, 0], [2093, .08]], { atraso: 150, volume: .08 }); },
    maquina: () => tocar('fichas', 0, .5), melhorar: () => tocar('fichas', 0, .5),
    contratar: () => tocar('fichas', 0, .5), liberar: () => tocar('fichas', 0, .5),
    legado: () => tocar.tom([[784, 0], [988, .08], [1175, .16], [1568, .24]], { onda: 'sine', dura: .5, volume: .1 }),
    plantar: () => tocar.tom([[196, 0], [262, .05]], { onda: 'sine', dura: .12, volume: .2 }),
    colher: () => tocar.tom([[523, 0], [784, .06]], { dura: .2 }),
    arrancar: () => tocar.tom([[262, 0], [175, .05]], { onda: 'sine', dura: .14, volume: .2 }),
    proxima: () => tocar.tom([[659, 0]], { onda: 'sine', dura: .1, volume: .1 }),
    vender: () => tocar(somDeFicha(), 0, .5), venderMaquina: () => tocar(somDeFicha(), 0, .5), ajudar: () => tocar('fichas', 0, .5),
  };
  Object.assign(SOM, { plantarVazios: SOM.plantar, colherTudo: SOM.colher, proximaTodos: SOM.proxima });

  // ---------- Conversa com o servidor ----------
  function pedir(acao, extra = {}) {
    return new Promise(resolve => {
      socket.timeout(8000).emit('cassino', { acao, ...extra }, (falha, r) => {
        if (falha) return resolve({ erro: 'O servidor não respondeu.' });
        if (r?.estado) receber(r);
        resolve(r || {});
      });
    });
  }
  function receber(r) {
    e = r.estado; erroConta = null;
    if (r.temporada) temporada = r.temporada;
    avisarFimDaTemporada(r.fimTemporada);
    diferenca = r.agora - Date.now();
    if (r.teste !== teste) { teste = Boolean(r.teste); $('.cassino-teste').hidden = !teste; }
    if (r.carteira) {
      saldo = r.carteira.saldo;
      window.dispatchEvent(new CustomEvent('teletela-carteira', { detail: { carteira: r.carteira, de: 'cassino' } }));
    }
    desenhar();
  }
  window.addEventListener('teletela-carteira', ev => {
    if (ev.detail.de === 'cassino') return;
    saldo = ev.detail.carteira?.saldo ?? saldo;
    if (ativo()) desenharLoja();
  });
  async function acao(nome, extra, ev, rotulo) {
    tocar.precarregar();
    const r = await pedir(nome, extra);
    if (r.erro) { showToast(r.erro, 'error'); tocar('bater', 0, .25); return null; }
    SOM[nome]?.();
    if (rotulo && ev) voar(rotulo(r.resultado || {}), ev.clientX, ev.clientY);
    return r.resultado || {};
  }
  async function ver() {
    const r = await pedir('ver');
    if (r.erro && !r.estado) { erroConta = r.erro; desenhar(); }
  }

  // ---------- Efeitos ----------
  function voar(texto, x, y) {
    if (!texto) return;
    const v = document.createElement('div');
    v.className = 'cassino-voa'; v.textContent = texto;
    v.style.left = `${x}px`; v.style.top = `${y}px`;
    document.body.append(v);
    setTimeout(() => v.remove(), 900);
  }
  const cache = new WeakMap();
  const por = (el, html) => { if (cache.get(el) !== html) { el.innerHTML = html; cache.set(el, html); } };

  // ---------- Desenho ----------
  function desenhar() {
    desenharSalao();
    if (!ativo()) return;
    $('.cassino-sem-conta').hidden = !erroConta;
    $('.cassino-jogo').hidden = Boolean(erroConta) || !e;
    if (erroConta) { $('.cassino-sem-conta p').textContent = erroConta; return; }
    if (!e) return;
    R.avancar(e, agora());
    if (visitando) R.avancar(visitando.estado, agora());
    desenharTopo(); desenharLoja();
    if (cena === 'cassino') desenharCassino();
    else if (cena === 'roca') desenharRoca();
    else desenharAmigos();
  }

  // Cartão do salão: quanto tem no cofre (dourado quando encheu).
  function desenharSalao() {
    if (!status) return;
    if (!e) { status.textContent = 'Rende coins até com o app fechado'; return; }
    R.avancar(e, agora());
    const taxa = R.taxaHora(e, agora()), cheio = taxa > 0 && e.cofre >= taxa * R.cofreHoras(e) - 0.01;
    status.textContent = !taxa ? 'Compre a primeira máquina' : cheio ? 'Cofre cheio! Venha coletar' : `${fmt(e.cofre)} no cofre · ${fmt(taxa)}/h`;
    cartao.dataset.vivo = taxa ? '1' : '';
    cartao.classList.toggle('chamando', cheio);
    cartao.setAttribute('aria-label', 'Seu cassino. ' + status.textContent);
  }

  // A temporada é a mesma pra todo mundo e acaba às 03h de Brasília (servidor, cassino.js).
  function quantoFalta(ms) {
    const dias = Math.floor(ms / R.DIA), horas = Math.ceil(ms / R.HORA);
    if (ms <= 0) return 'acabando';
    if (dias >= 2) return `acaba em ${dias} dias`;
    if (dias === 1) return 'acaba amanhã';
    return horas <= 1 ? 'acaba em menos de 1 h' : `acaba em ${horas} h`;
  }
  // Aviso de fim de temporada, uma vez por temporada (guardado neste aparelho).
  function avisarFimDaTemporada(fim) {
    if (!fim) return;
    const chave = 'teletela-cassino-fim-visto';
    let visto = null;
    try { visto = localStorage.getItem(chave); } catch {}
    if (visto === String(fim.numero)) return;
    try { localStorage.setItem(chave, String(fim.numero)); } catch {}
    showToast(`A temporada ${fim.numero} acabou: você juntou ${fmt(fim.ganho)} coins e ganhou ★ ${fim.novas}. Seu cassino e sua fazenda recomeçaram, e a carteira voltou pra 5.000.`, 'success', 12000);
  }

  function desenharTopo() {
    const t = agora(), taxa = R.taxaHora(e, t), horas = R.cofreHoras(e), limite = taxa * horas;
    const pct = limite ? Math.min(100, e.cofre / limite * 100) : 0;
    $('.cassino-taxa').textContent = fmt(taxa);
    // Selo da inauguração do lado da taxa (criado aqui pra não mexer no HTML da tela)
    let selo = $('.cassino-inaug');
    if (!selo) { selo = document.createElement('span'); selo.className = 'cassino-inaug'; $('.cassino-taxa').parentElement.append(selo); }
    selo.hidden = !R.emInauguracao(e, t);
    if (!selo.hidden) {
      const falta = Math.ceil((e.inauguracao.ate - t) / HORA);
      selo.textContent = `×${R.INAUGURACAO_FATOR}`;
      selo.title = `Inauguração: o cassino rende em dobro por mais ${falta} h`;
    }
    $('.cassino-dia').textContent = temporada ? `Temporada ${temporada.numero} · ${quantoFalta(temporada.fim - t)}`
      : `Dia ${Math.min(R.DIAS_TEMPORADA, R.diaTemporada(e, t))} de ${R.DIAS_TEMPORADA}`;
    $('.cassino-estrelas').textContent = `★ ${e.estrelas}`;
    $('.cassino-cofre-valor').textContent = fmt(e.cofre);
    $('.cassino-barra > div').style.width = `${pct}%`;
    $('.cassino-barra').classList.toggle('cheio', pct >= 99.9);
    $('.cassino-cofre-horas').textContent = `guarda ${horas} h`;
    $('.cassino-coletar').disabled = e.cofre < 1;
    $('.cassino-cofre-dica').textContent = !taxa ? 'Compre um caça-níquel pra começar a produzir.'
      : pct >= 99.9 ? 'Cofre cheio: parou de produzir até você coletar.'
      : `Enche em ${fmtTempo((limite - e.cofre) / taxa * HORA)}.`;
  }

  // ---------- Loja ----------
  function item({ icone, nome, texto, preco, tipo, id, feito, rotulo, venda }) {
    const pode = preco != null && saldo != null && saldo >= preco;
    const botao = feito
      ? `<button type="button" class="cassino-preco" disabled>${feito}</button>`
      : `<button type="button" class="cassino-preco${pode ? ' pode' : ''}" data-tipo="${tipo}" data-id="${id}" aria-label="${rotulo || 'Comprar'} por ${fmt(preco)} coins" ${pode ? '' : 'aria-disabled="true"'}>${fmt(preco)}</button>`;
    // venda: máquina que dá pra devolver (2 cliques: o primeiro só pede confirmação)
    const vender = venda == null ? '' : `<button type="button" class="cassino-vender" data-vender-maq="${id}" data-valor="${venda}">Vender por ${fmt(venda)}</button>`;
    return `<li class="cassino-item"><span class="cassino-icone" style="${icone}"></span><div><strong>${nome}</strong><span>${texto}</span>${vender}</div>${botao}</li>`;
  }
  function melhoria(id, icone, texto, rotulo) {
    const m = R.MELHORIAS[id], n = e.niveis[id], preco = R.custoMelhoria(e, id);
    const varios = m.valores.length > 2;
    const t = preco == null ? texto(m.valores[n]) : rotulo ? texto(m.valores[n + 1]) : `${texto(m.valores[n])} → ${m.valores[n + 1]}`;
    return item({ icone, nome: m.nome + (varios ? ` <small>${n + 1}/${m.valores.length}</small>` : ''), texto: t, preco, tipo: 'melhoria', id,
      feito: preco == null ? (varios ? 'Máximo' : 'Feito') : null, rotulo });
  }
  // Lojinha das estrelas: igual à loja, mas o preço é em estrelas.
  const ESTRELA_SVG = img(`'data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#f5c542" stroke="#8a5a00" stroke-width="1.2" d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>')}'`);
  const ICONE_LEGADO = {
    fama: ESTRELA_SVG, bar: img('cassino-local/balcao.png'), canteiros: img('cassino/terra.png'), cofre: img('cassino-local/saco.png'),
    sementes: iconePlanta('morango', 2.5), irrigacao: folha('cassino/fazenda.png', 0, 7, 16, 192, 176, 2.5),
  };
  function itemLegado(id) {
    const l = R.LEGADO[id], n = R.legado(e, id), preco = R.custoLegado(e, id), varios = l.custo.length > 1;
    const texto = preco == null ? l.efeito(n) : n && varios ? `${l.efeito(n)} → ${l.efeito(n + 1)}` : l.efeito(n + 1);
    const pode = preco != null && e.estrelas >= preco;
    const botao = preco == null
      ? `<button type="button" class="cassino-preco" disabled>${varios ? 'Máximo' : 'Seu'}</button>`
      : `<button type="button" class="cassino-preco estrela${pode ? ' pode' : ''}" data-legado="${id}" aria-label="Comprar por ${preco} estrela(s)" ${pode ? '' : 'aria-disabled="true"'}>★ ${preco}</button>`;
    return `<li class="cassino-item"><span class="cassino-icone" style="${ICONE_LEGADO[id]}"></span><div><strong>${l.nome}${varios ? ` <small>${n}/${l.custo.length}</small>` : ''}</strong><span>${texto}</span></div>${botao}</li>`;
  }
  const ICONE_MAQ = { caca: img('cassino-local/slot.png'), roleta: img('cassino-local/roleta.png'), vinte: img('cassino-local/blackjack.png'), poker: img('cassino-local/poker-duplo.png') };
  function desenharLoja() {
    // A loja segue a aba: cassino (com a equipe, que trabalha lá) ou fazenda.
    const fazenda = cena === 'roca';
    $('.cassino-loja-titulo').textContent = fazenda ? 'Loja da fazenda' : 'Loja do cassino';
    let h = '';
    if (!fazenda) {
      const cheio = R.usados(e) >= R.lugares(e);
      h += `<li class="cassino-secao">Máquinas · ${R.usados(e)} de ${R.lugares(e)} lugares</li>`;
      for (const [id, m] of Object.entries(R.MAQUINAS)) {
        const n = e.maquinas[id];
        h += item({ icone: ICONE_MAQ[id], nome: `${m.nome} <small>${n}/${m.max}</small>`, texto: `+${m.taxa} coins/h${m.mesa && e.funcionarios.ll ? ' (+20% com o crupiê)' : ''}`,
          preco: R.custoMaquina(e, id), tipo: 'maquina', id, feito: n >= m.max ? 'Máximo' : cheio ? 'Sem lugar' : null, venda: R.valorVendaMaquina(e, id) });
      }
      h += '<li class="cassino-secao">Prédio</li>';
      h += melhoria('salao', img('cassino-local/mesinha.png'), v => `${v} lugares`);
      h += melhoria('cofre', img('cassino-local/saco.png'), v => `Guarda ${v} h de produção`);
      h += melhoria('bar', img('cassino-local/balcao.png'), () => `Vende o que a fazenda colhe e dá +${e.funcionarios.neves ? 8 : 5}% por produto`, 'Abrir');
      h += '<li class="cassino-secao">Equipe</li>';
      for (const [id, f] of Object.entries(R.FUNCIONARIOS)) {
        h += item({ icone: iconeCorpo(f.corpo), nome: f.cargo, texto: f.efeito,
          preco: f.custo, tipo: 'func', id, feito: e.funcionarios[id] ? 'Contratado' : null, rotulo: 'Contratar' });
      }
      h += `<li class="cassino-secao">Lojinha das estrelas · ★ ${e.estrelas}</li>`;
      const falta = R.faltamProMaximo(e);
      h += `<li class="cassino-dica">Fica pra sempre, até depois do reset. No fim da temporada: ★ ${R.ESTRELAS_MAXIMO} com tudo no máximo, senão ★ ${R.ESTRELAS_BASE}. ${falta ? `Faltam ${falta} compra(s) pro máximo.` : 'Tudo no máximo!'}</li>`;
      for (const id of Object.keys(R.LEGADO)) h += itemLegado(id);
    } else {
      h += '<li class="cassino-secao">Sementes</li>';
      for (const [id, c] of Object.entries(R.CULTURAS)) {
        if (!c.desbloqueio) continue;
        h += item({ icone: iconePlanta(id, 2.5), nome: c.nome, texto: `${fmtTempo(c.tempo)} · ${c.porcoes} porções · ${c.produto} a ${String(c.preco).replace('.', ',')} no bar`,
          preco: c.desbloqueio, tipo: 'cultura', id, feito: e.culturas[id] ? 'Liberada' : null, rotulo: 'Liberar' });
      }
      h += '<li class="cassino-secao">Fazenda</li>';
      h += melhoria('canteiros', img('cassino/terra.png'), v => `${v} canteiros`);
      h += melhoria('adubo', folha('cassino/fazenda.png', 2, 6, 16, 192, 176, 2.5), v => `Plantas ${v}% mais rápidas`);
      h += melhoria('celeiro', img('cassino/celeiro.png'), v => `Guarda ${v} porções`);
      h += melhoria('irrigacao', folha('cassino/fazenda.png', 0, 7, 16, 192, 176, 2.5), () => 'Colhe e replanta sozinho, até com o app fechado', 'Instalar');
    }
    por($('.cassino-loja-lista'), h);
  }

  // ---------- Cena do cassino ----------
  // O salão é a grade de cassino-regras.js (células de 8 px da arte), desenhada numa
  // escala que cabe na tela sem rolar. As peças e as pessoas ficam na mesma camada,
  // empilhadas pela linha do pé: quem está atrás de uma mesa fica escondido por ela.
  const vendo = () => visitando ? visitando.estado : e;
  const C = R.CELULA;
  let k = 2, editando = false, salaAtual = null, assinaturaSala = '';
  const salaEl = () => $('.cassino-sala');

  function medirEscala() {
    const cenaEl = $('.cassino-cena[data-cena="cassino"]');
    if (!salaAtual || cenaEl.hidden) return false;
    const larg = cenaEl.clientWidth - 16, alt = cenaEl.clientHeight - 16;
    if (larg <= 0 || alt <= 0) return false;
    // múltiplo de 1/4: perto do inteiro, sem deixar sobra grande na tela
    const novo = Math.max(0.5, Math.min(4, Math.floor(Math.min(larg / (salaAtual.w * C), alt / (salaAtual.h * C)) * 4) / 4));
    if (novo === k) return false;
    k = novo; salaEl().style.setProperty('--k', k);
    for (const p of gente) colocar(p);
    return true;
  }
  new ResizeObserver(() => medirEscala()).observe($('.cassino-cena[data-cena="cassino"]'));

  function htmlPeca(x, tipo, i, [px, py]) {
    const p = R.PECAS[tipo];
    const fundo = (py + p.h) * C; // linha do pé da peça
    let dentro;
    if (tipo === 'caca') dentro = `<span class="cassino-slot${i % 2 ? ' outro' : ''}"></span>`;
    else if (tipo === 'bar') dentro = '<img src="cassino-local/balcao.png" alt="">' + (x.niveis.bar ? '<span class="cassino-bar-info"></span>' : '<span class="cassino-placa">Bar fechado</span>');
    else dentro = `<img src="cassino-local/${{ roleta: 'roleta', vinte: 'blackjack', poker: 'poker-duplo', vaso: 'planta', dados: 'dados' }[tipo]}.png" alt="">`;
    return `<div class="cassino-obj obj-${tipo}${tipo === 'bar' && !x.niveis.bar ? ' fechado' : ''}" data-tipo="${tipo}" data-i="${i}" role="img" aria-label="${p.nome}"`
      + ` style="--x:${px};--y:${py};--w:${p.w};--h:${p.h};--pw:${p.px[0]};--ph:${p.px[1]};z-index:${fundo}">${dentro}</div>`;
  }

  function desenharCassino() {
    const x = vendo();
    const s = R.sala(x);
    const nova = `${visitando?.chave}|${s.w}|${x.niveis.bar}|${JSON.stringify(x.layout)}|${editando}`;
    $('.cassino-editar').hidden = Boolean(visitando);
    $('.cassino-editar').textContent = editando ? 'Pronto' : 'Editar salão';
    $('.cassino-editar').classList.toggle('ouro', editando);
    if (nova !== assinaturaSala && !arrasto) {
      assinaturaSala = nova; salaAtual = s;
      const el = salaEl();
      el.style.setProperty('--sw', s.w); el.style.setProperty('--sh', s.h);
      el.classList.toggle('editando', editando);
      let h = `<div class="cassino-porta" style="--x:${s.porta.x};--y:${s.porta.y};--w:${s.porta.w};--h:${s.porta.h}"></div>`;
      for (const [tipo, lista] of Object.entries(x.layout)) lista.forEach((pos, i) => { h += htmlPeca(x, tipo, i, pos); });
      $('.cassino-pecas').innerHTML = h;
      for (const p of gente) $('.cassino-pecas').append(p.el);
      montarGrade(x);
      medirEscala();
      if (editando) for (const o of raiz.querySelectorAll('.cassino-obj')) o.tabIndex = 0;
    }
    const info = $('.cassino-bar-info');
    if (info) por(info, '<span class="cassino-produtos">' + Object.entries(R.CULTURAS).filter(([c]) => x.culturas[c]).map(([c, cu]) =>
      `<img src="cassino/${cu.icone}.png" class="${(x.estoque[c] || 0) >= 0.01 ? '' : 'vazio'}" title="${cu.produto}: ${fmt(x.estoque[c] || 0)} porções" alt="${cu.produto}">`).join('')
      + `</span><span class="cassino-aviso">+${Math.round(R.bonusBar(x) * 100)}% · ${fmt(R.rendaBar(x))}/h</span>`);
    atualizarGente(x);
  }

  // ---------- Onde dá pra andar ----------
  let grade = null; // 1 = bloqueado
  function montarGrade(x) {
    const s = R.sala(x);
    grade = { w: s.w, h: s.h, b: new Uint8Array(s.w * s.h) };
    for (let y = 0; y < R.PAREDE; y++) for (let cx = 0; cx < s.w; cx++) grade.b[y * s.w + cx] = 1;
    for (const r of R.retangulos(x)) for (let y = r.y; y < r.y + r.h; y++) for (let cx = r.x; cx < r.x + r.w; cx++) grade.b[y * s.w + cx] = 1;
  }
  const livre = (cx, cy) => grade && cx >= 0 && cy >= 0 && cx < grade.w && cy < grade.h && !grade.b[cy * grade.w + cx];
  // Caminho em 8 direções (sem cortar quina de peça). A sala é pequena, então busca em largura basta.
  function caminho(de, para) {
    const { w, h } = grade, ini = de[1] * w + de[0], fim = para[1] * w + para[0];
    const veio = new Int32Array(w * h).fill(-1); veio[ini] = ini;
    const fila = [ini];
    for (let q = 0; q < fila.length; q++) {
      const at = fila[q];
      if (at === fim) break;
      const cx = at % w, cy = (at - cx) / w;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const nx = cx + dx, ny = cy + dy, n = ny * w + nx;
        if (!livre(nx, ny) || veio[n] !== -1) continue;
        if (dx && dy && (!livre(cx + dx, cy) || !livre(cx, cy + dy))) continue;
        veio[n] = at; fila.push(n);
      }
    }
    if (veio[fim] === -1) return null;
    const passos = [];
    for (let at = fim; at !== ini; at = veio[at]) passos.push([at % w, Math.floor(at / w)]);
    return passos.reverse();
  }

  // ---------- Gente ----------
  // Clientes jogam nas máquinas e no bar; a equipe tem lugar: barman atrás do balcão,
  // crupiê nas mesas, segurança na porta (de vez em quando faz a ronda), gerente circulando.
  const PAPEL = { neves: 'barman', ll: 'crupie', gg: 'seguranca', cast: 'gerente' };
  let gente = [], assinatura = '';
  const sorteio = l => l[Math.floor(Math.random() * l.length)];
  const celulaDe = p => [Math.max(0, Math.min(grade.w - 1, Math.floor(p.fx / C))), Math.max(0, Math.min(grade.h - 1, Math.floor(p.fy / C)))];
  const pe = ([cx, cy]) => [cx * C + C / 2, cy * C + C - 2];

  function atualizarGente(x) {
    const clientes = Math.max(1, Math.min(10, 1 + Math.floor(R.taxaBase(x) / 60)));
    const equipe = Object.keys(x.funcionarios).filter(id => x.funcionarios[id]);
    const nova = `${visitando?.chave}|${clientes}|${equipe}`;
    if (nova === assinatura) return;
    assinatura = nova;
    for (const p of gente) p.el.remove();
    gente = [];
    for (const id of equipe) {
      const f = R.FUNCIONARIOS[id];
      gente.push(pessoa(corpo(f.corpo), PAPEL[id], f.cargo));
    }
    for (let i = 0; i < clientes; i++) gente.push(pessoa(corpoSorteado(), 'cliente'));
  }
  function pessoa(sprite, papel, placa) {
    const el = document.createElement('div');
    el.className = 'cassino-pessoa' + (placa ? ' equipe' : '');
    el.innerHTML = `<span class="corpo" style="background-image:url(${sprite})"></span>` + (placa ? `<span class="placa">${esc(placa)}</span>` : '');
    const p = { el, papel, fx: 0, fy: 0, rota: [], espera: 0, fixo: null };
    const s = salaAtual || R.sala(vendo());
    // clientes entram pela porta; a equipe já começa no posto
    const porta = pe([s.porta.x + 1 + Math.floor(Math.random() * (s.porta.w - 2)), s.h - 1]);
    [p.fx, p.fy] = porta;
    p.espera = performance.now() + Math.random() * 2500;
    $('.cassino-pecas').append(el);
    if (grade) proximo(p, true);
    colocar(p);
    return p;
  }
  function colocar(p) {
    const z = p.fixo?.z ?? Math.round(p.fy);
    p.el.style.transform = `translate(${Math.round((p.fx - 8) * k)}px, ${Math.round((p.fy - 24) * k)}px)`;
    p.el.style.zIndex = z;
  }
  // Pra onde a pessoa vai agora (célula livre na frente de algo, conforme o papel).
  function alvos(p, x) {
    const pecas = R.retangulos(x), s = R.sala(x);
    const frente = r => Array.from({ length: r.w }, (_, i) => [r.x + i, r.y + r.h]).filter(c => livre(...c));
    const atras = r => [[r.x + Math.floor(r.w / 2), r.y - 1], [r.x + Math.floor(r.w / 2) - 1, r.y - 1]].filter(c => livre(...c));
    const maquinas = pecas.filter(r => R.MAQUINAS[r.tipo]);
    const mesas = pecas.filter(r => R.MAQUINAS[r.tipo]?.mesa);
    if (p.papel === 'cliente') {
      const opcoes = maquinas.flatMap(frente);
      if (x.niveis.bar && Math.random() < 0.25) opcoes.splice(0, opcoes.length, ...pecas.filter(r => r.tipo === 'bar').flatMap(frente));
      return opcoes;
    }
    if (p.papel === 'crupie') return mesas.flatMap(atras);
    if (p.papel === 'seguranca' && Math.random() < 0.7) return [[s.porta.x - 2, s.h - 2], [s.porta.x + s.porta.w + 1, s.h - 2]].filter(c => livre(...c));
    return [];
  }
  function proximo(p, comeco = false) {
    const x = vendo();
    if (p.papel === 'barman') {
      const bar = R.retangulos(x).find(r => r.tipo === 'bar');
      // atrás do balcão, na parte em que ele não tem parede: o balcão cobre as pernas
      p.fixo = { z: (bar.y + bar.h) * C - 1 };
      p.rota = [[bar.x * C + 72 + Math.random() * 56, bar.y * C + 26]];
      if (comeco) [p.fx, p.fy] = p.rota[0];
      p.olhar = 0; p.espera = Infinity; p.parado = 2000 + Math.random() * 5000;
      return;
    }
    p.fixo = null;
    let opcoes = alvos(p, x);
    const alvosDeFrente = opcoes.length > 0;
    if (!opcoes.length) opcoes = Array.from({ length: 30 }, () => [Math.floor(Math.random() * grade.w), R.PAREDE + Math.floor(Math.random() * (grade.h - R.PAREDE))]).filter(c => livre(...c));
    const de = celulaDe(p);
    for (let tentativa = 0; tentativa < 6 && opcoes.length; tentativa++) {
      const alvo = sorteio(opcoes);
      const rota = comeco && p.papel !== 'cliente' ? [alvo] : caminho(de, alvo);
      if (!rota) continue;
      if (comeco && p.papel !== 'cliente') [p.fx, p.fy] = pe(alvo);
      p.rota = rota.map(pe);
      const parado = p.papel === 'cliente' ? 4000 + Math.random() * 9000 : p.papel === 'seguranca' ? 6000 + Math.random() * 8000 : p.papel === 'crupie' ? 5000 + Math.random() * 6000 : 1500 + Math.random() * 4000;
      p.espera = Infinity; p.parado = parado;
      // cliente para de costas pra tela, olhando a máquina; a equipe olha pro salão
      p.olhar = p.papel === 'cliente' && alvosDeFrente ? 3 : 0;
      return;
    }
    p.espera = performance.now() + 1500;
  }
  let ultimoQuadro = 0;
  function quadro(t) {
    requestAnimationFrame(quadro);
    const dt = Math.min(0.1, (t - ultimoQuadro) / 1000); ultimoQuadro = t;
    if (!ativo() || document.hidden) return;
    if (cena === 'roca') return animarFazenda(t, dt);
    if (cena !== 'cassino' || editando || !grade) return;
    const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (const p of gente) {
      if (!p.rota.length) {
        if (p.espera === Infinity) p.espera = t + p.parado;
        if (p.el.classList.contains('andando')) { p.el.classList.remove('andando'); p.el.style.setProperty('--dir', p.olhar ?? 0); }
        if (t >= p.espera) proximo(p);
        continue;
      }
      const [ax, ay] = p.rota[0];
      const dx = ax - p.fx, dy = ay - p.fy, d = Math.hypot(dx, dy), passo = (p.papel === 'barman' ? 14 : 24) * dt;
      if (reduzir || d <= passo) { p.fx = ax; p.fy = ay; p.rota.shift(); } else { p.fx += dx / d * passo; p.fy += dy / d * passo; }
      p.el.classList.add('andando');
      // linhas da folha: 0 frente, 1 esquerda, 2 direita, 3 costas
      if (d > 0.01) p.el.style.setProperty('--dir', Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0));
      colocar(p);
    }
  }
  requestAnimationFrame(quadro);

  // ---------- Editar o salão ----------
  // Arrasta a peça pela grade (ou foca e usa as setas). Verde cabe, vermelho não.
  let arrasto = null;
  function alternarEdicao(ligar = !editando) {
    editando = ligar;
    $('.cassino-dica-edicao').hidden = !editando;
    desenharCassino();
    if (!editando) for (const p of gente) proximo(p);
  }
  async function salvarPosicao(tipo, i, nx, ny) {
    const x = e, antes = x.layout[tipo][i];
    if (antes[0] === nx && antes[1] === ny) return;
    x.layout[tipo][i] = [nx, ny]; // já mostra no lugar novo
    const r = await pedir('mover', { tipo, i, x: nx, y: ny });
    if (r.erro) { showToast(r.erro, 'error'); x.layout[tipo][i] = antes; }
    assinaturaSala = ''; desenharCassino();
  }
  $('.cassino-pecas').addEventListener('pointerdown', ev => {
    const o = ev.target.closest('.cassino-obj');
    if (!editando || !o || ev.button !== 0) return;
    ev.preventDefault();
    const tipo = o.dataset.tipo, i = Number(o.dataset.i), [px, py] = e.layout[tipo][i];
    const caixa = salaEl().getBoundingClientRect();
    const celula = C * k;
    arrasto = { o, tipo, i, px, py, nx: px, ny: py, dx: (ev.clientX - caixa.left) / celula - px, dy: (ev.clientY - caixa.top) / celula - py };
    o.setPointerCapture(ev.pointerId);
    o.classList.add('arrastando');
  });
  $('.cassino-pecas').addEventListener('pointermove', ev => {
    if (!arrasto) return;
    const caixa = salaEl().getBoundingClientRect(), celula = C * k;
    arrasto.nx = Math.round((ev.clientX - caixa.left) / celula - arrasto.dx);
    arrasto.ny = Math.round((ev.clientY - caixa.top) / celula - arrasto.dy);
    const ok = R.cabe(e, arrasto.tipo, arrasto.nx, arrasto.ny, { tipo: arrasto.tipo, i: arrasto.i });
    arrasto.o.style.setProperty('--x', arrasto.nx); arrasto.o.style.setProperty('--y', arrasto.ny);
    arrasto.o.style.zIndex = 100000;
    arrasto.o.classList.toggle('nao-cabe', !ok);
  });
  const soltar = () => {
    if (!arrasto) return;
    const a = arrasto; arrasto = null;
    a.o.classList.remove('arrastando', 'nao-cabe');
    if (R.cabe(e, a.tipo, a.nx, a.ny, { tipo: a.tipo, i: a.i })) salvarPosicao(a.tipo, a.i, a.nx, a.ny);
    else { if (a.nx !== a.px || a.ny !== a.py) showToast('Não cabe aí.', 'error'); assinaturaSala = ''; desenharCassino(); }
  };
  $('.cassino-pecas').addEventListener('pointerup', soltar);
  $('.cassino-pecas').addEventListener('pointercancel', soltar);
  $('.cassino-pecas').addEventListener('keydown', ev => {
    const o = ev.target.closest('.cassino-obj');
    const seta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[ev.key];
    if (!editando || !o || !seta) return;
    ev.preventDefault();
    const tipo = o.dataset.tipo, i = Number(o.dataset.i), [px, py] = e.layout[tipo][i];
    const nx = px + seta[0], ny = py + seta[1];
    if (!R.cabe(e, tipo, nx, ny, { tipo, i })) return;
    salvarPosicao(tipo, i, nx, ny).then(() => raiz.querySelector(`.cassino-obj[data-tipo="${tipo}"][data-i="${i}"]`)?.focus());
  });

  // ---------- Fazenda ----------
  // Cena fixa de 22×13 tiles de 16 px (Kenney Tiny Farm/Town), na mesma escala que
  // cabe na tela do salão: campo de terra com 20 lugares de canteiro (os que você
  // ainda não comprou aparecem apagados), celeiro, poço, feno, fazendeiro e bichos.
  const FAZ = { w: 352, h: 208 };
  const CANT = i => ({ x: 27 + (i % 10) * 26, y: 50 + Math.floor(i / 10) * 40 }); // canteiro de 24×24, 10 por fileira
  let kFaz = 3, assinaturaFaz = '';
  const fazEl = () => $('.cassino-fazenda');
  // tile de uma folha 192×176: coluna, linha, posição e tamanho em pixel da arte
  const tile = (folhaUrl, col, lin, x, y, cls = '') => `<span class="faz-tile ${cls}" style="--fx:${x};--fy:${y};--tx:${col};--ty:${lin};background-image:url(${folhaUrl})"></span>`;
  const FZ = 'cassino/fazenda.png', CD = 'cassino/cidade.png';
  // folha das galinhas (128×128): galinheiro, ninho, comedouro e pintinhos
  const GA = 'cassino/galinhas.png';
  const tileG = (col, lin, x, y) => tile(GA, col, lin, x, y).replace('style="', 'style="--sw:128;--sh:128;');
  // Áreas dos bichos (canto de cima da caixa de 16×16, em pixel da arte)
  const GALINHEIRO = { x: 8, y: 160, w: 7 }, CURRAL = { x: 146, y: 160, w: 7 };
  const GALINHAS = [46, 168, 96, 180], PASTO = [156, 168, 190, 178];
  const FRENTE = 134; // linha onde o fazendeiro anda e capina, de frente pros canteiros

  function medirFazenda() {
    const cenaEl = $('.cassino-cena[data-cena="roca"]');
    if (cenaEl.hidden) return;
    const larg = cenaEl.clientWidth - 16, alt = cenaEl.clientHeight - 16;
    if (larg <= 0 || alt <= 0) return;
    const novo = Math.max(1, Math.min(6, Math.floor(Math.min(larg / FAZ.w, alt / FAZ.h) * 4) / 4));
    if (novo !== kFaz) { kFaz = novo; fazEl().style.setProperty('--k', kFaz); for (const b of bichos) colocarBicho(b); }
  }
  new ResizeObserver(medirFazenda).observe($('.cassino-cena[data-cena="roca"]'));

  function fundoFazenda(x) {
    let h = '';
    // mata no fundo: miolo e borda de baixo da floresta (9 fatias da folha da cidade)
    for (let fx = 0; fx < FAZ.w; fx += 16) h += tile(CD, 7, 1, fx, -6, 'chao') + tile(CD, 7, 2, fx, 10, 'chao');
    // árvores altas (2 tiles) nas laterais
    for (const [ax, ay, col] of [[0, 40, 4], [2, 96, 3], [338, 96, 4], [336, 150, 3]]) h += tile(CD, col, 0, ax, ay) + tile(CD, col, 1, ax, ay + 16);
    // campo: remendo de terra (9 fatias da folha da cidade) sob os canteiros
    const cx = 20, cy = 36, cw = 17, ch = 6; // em tiles
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      const col = i === 0 ? 0 : i === cw - 1 ? 2 : 1, lin = j === 0 ? 1 : j === ch - 1 ? 3 : 2;
      h += tile(CD, col, lin, cx + i * 16, cy + j * 16, 'chao');
    }
    // celeiro (cresce de enfeite com o nível), poço, feno, ferramentas
    h += `<img class="faz-img" src="cassino/celeiro.png" alt="" style="--fx:296;--fy:20;--fw:48;--fh:64">`;
    h += tile(FZ, 0, 6, 300, 100);                 // poço
    h += tile(FZ, 0, 8, 294, 150) + tile(FZ, 1, 8, 310, 150);   // feno
    if (x.niveis.celeiro >= 2) h += tile(FZ, 0, 8, 302, 136);
    if (x.niveis.irrigacao) h += tile(FZ, 0, 7, 272, 138);      // regador
    if (x.niveis.adubo) for (let i = 0; i < x.niveis.adubo; i++) h += tile(FZ, 9, 4 + (i % 2), 296 + i * 11, 84); // sacos de adubo
    h += tile(FZ, 2, 7, 296, 186) + tile(FZ, 4, 7, 310, 188);   // pá e foice encostadas
    // galinheiro e curral: cercas de 3 fileiras com porteira embaixo
    for (const c of [GALINHEIRO, CURRAL]) h += cerca(c.x, c.y, c.w);
    const { x: gx, y: gy } = GALINHEIRO;
    h += tileG(4, 4, gx + 4, gy - 6) + tileG(5, 4, gx + 20, gy - 6) + tileG(4, 5, gx + 4, gy + 10) + tileG(5, 5, gx + 20, gy + 10);
    h += tileG(2, 4, gx + 86, gy + 12) + tileG(3, 3, gx + 42, gy + 26) + tileG(4, 3, gx + 62, gy + 26);
    h += tile(CD, 11, 6, gx + GALINHEIRO.w * 16 + 2, gy + 20);   // placa
    // cocho d'água no curral; a vaca só chega com o celeiro 1
    h += tile(FZ, 2, 9, CURRAL.x + 70, CURRAL.y + 24) + tile(FZ, 3, 9, CURRAL.x + 86, CURRAL.y + 24);
    // flores no gramado da frente
    for (const [fx, fy] of [[278, 168], [126, 196], [268, 196], [110, 140]]) h += tile(CD, 2, 0, fx, fy, 'flor');
    return h;
  }

  // cerca de w×3 tiles (folha da cidade): cantos, laterais e porteira no meio de baixo
  function cerca(x, y, w) {
    let h = '';
    const porteira = Math.floor(w / 2);
    for (let i = 0; i < w; i++) {
      const ponta = i === 0 ? 8 : i === w - 1 ? 10 : null;
      h += tile(CD, ponta ?? 9, 3, x + i * 16, y);
      if (ponta) h += tile(CD, ponta, 4, x + i * 16, y + 16);
      h += tile(CD, ponta ?? 9, ponta || i === porteira ? 5 : 6, x + i * 16, y + 32);
    }
    return h;
  }

  function desenharRoca() {
    const x = vendo(), t = agora();
    const nova = `${visitando?.chave}|${x.canteiros.length}|${x.niveis.irrigacao}|${x.niveis.adubo}|${x.niveis.celeiro}`;
    if (nova !== assinaturaFaz) {
      assinaturaFaz = nova;
      $('.cassino-fazenda-fundo').innerHTML = fundoFazenda(x);
      montarBichos(x);
      medirFazenda();
    }
    // colheita (à mão ou pela irrigação): o canteiro mudou de plantio desde o último desenho
    const chave = visitando?.chave ?? 'eu';
    if (plantios.chave !== chave) plantios = { chave, de: [] };
    x.canteiros.forEach((c, i) => {
      const antes = plantios.de[i];
      if (antes != null && antes !== (c?.plantado ?? null) && !filaColheita.includes(i) && filaColheita.length < 5) filaColheita.push(i);
      plantios.de[i] = c?.plantado ?? null;
    });
    let h = '';
    for (let i = 0; i < R.MELHORIAS.canteiros.valores.at(-1); i++) {
      const { x: px, y: py } = CANT(i), pos = `style="--fx:${px};--fy:${py}"`;
      if (i >= x.canteiros.length) { h += `<span class="faz-canteiro bloqueado" ${pos}></span>`; continue; }
      const c = x.canteiros[i];
      if (!c) { h += `<button type="button" class="faz-canteiro vazio" data-canteiro="${i}" ${pos} aria-label="Canteiro vazio"><span class="tempo">plantar</span></button>`; continue; }
      const dur = R.tempoCultura(x, c.cultura), falta = c.plantado + dur - t, p = Math.min(1, (t - c.plantado) / dur);
      const col = falta <= 0 ? 1 : p < 0.15 ? 5 : p < 0.4 ? 4 : p < 0.7 ? 3 : 2; // 5 = semente, 1 = pronta
      const [lin, lado] = R.CULTURAS[c.cultura].folha;
      h += `<button type="button" class="faz-canteiro${falta <= 0 ? ' pronto' : ''}" data-canteiro="${i}" ${pos} aria-label="${R.CULTURAS[c.cultura].nome}${falta <= 0 ? ', pronto' : ', falta ' + fmtTempo(falta)}${c.proxima ? ', depois ' + R.CULTURAS[c.proxima].nome : ''}">`
        + `<span class="planta" style="--tx:${lado * 6 + col};--ty:${lin}"></span><span class="tempo">${falta > 0 ? fmtTempo(falta) : 'colher'}</span>`
        + (c.proxima ? `<span class="proxima" title="Depois: ${R.CULTURAS[c.proxima].nome}" style="${iconePlanta(c.proxima, 1.25)}"></span>` : '') + '</button>';
    }
    por($('.cassino-fazenda-canteiros'), h);
    $('.cassino-acoes-fazenda').hidden = Boolean(visitando);
    $('.cassino-acoes-fazenda [data-roca="plantar"]').textContent = x.canteiros.some(c => !c) || !x.niveis.irrigacao ? 'Plantar nos vazios…' : 'Trocar todos…';
    desenharCeleiro(x);
  }

  // Celeiro na coluna da direita, enquanto a aba Fazenda está aberta.
  function desenharCeleiro(x) {
    const cap = R.capacidadeCeleiro(x), total = R.totalEstoque(x);
    let h = `<div class="cassino-cartao-topo"><h3>Celeiro</h3><span>${fmt(total)} de ${fmt(cap)} porções</span></div>`
      + `<div class="cassino-barra"><div style="width:${Math.min(100, total / cap * 100)}%"></div></div>`
      + `<p>${x.niveis.bar ? `O bar vende ${R.consumoBar(x).toFixed(1).replace('.', ',')} porções/h de cada produto (${fmt(R.rendaBar(x))} coins/h).` : 'Sem bar, a colheita só serve pra vender barato.'}</p><ul>`;
    for (const [c, cu] of Object.entries(R.CULTURAS)) {
      if (!x.culturas[c]) continue;
      const q = x.estoque[c] || 0, valor = Math.floor(Math.floor(q) * R.precoVenda(c) + (x.troco || 0) + 1e-6);
      h += `<li><span class="mini" style="${iconePlanta(c, 1.5)}"></span><span>${cu.nome}</span><b>${fmt(q)}</b>`
        + (visitando ? '<span></span>' : `<button type="button" class="cassino-botao pequeno" data-vender="${c}" ${valor >= 1 ? '' : 'disabled'}>Vender ${fmt(valor)}</button>`) + '</li>';
    }
    if (x.niveis.irrigacao && total >= cap - 0.01)
      h = h.replace('<ul>', '<p class="cassino-aviso">Celeiro cheio: a irrigação vende o que não cabe e manda pro cofre.</p><ul>');
    por($('.cassino-celeiro'), h + '</ul>');
  }

  // Fazendeiro passeia entre os canteiros, o poço e o celeiro; galinhas e vaca ciscam na
  // frente. Sprites animados CC0 (ver public/cassino/LICENCA.txt): cada animação é uma
  // lista de quadros [coluna, linha] da folha. O fazendeiro tem uma linha por direção
  // (cima, direita, baixo, esquerda); galinha e vaca olham pra direita e viram com scaleX.
  const SPRITE = {
    // o fazendeiro (11 px de altura) vai em 2× e a vaca em 1,5×, pra ficarem na proporção das
    // galinhas, dos canteiros e do celeiro
    fazendeiro: {
      w: 21, h: 17, pe: [10, 16], esc: 2, direcoes: true,
      andar: { url: 'cassino/fazendeiro-andar.png', folha: [168, 68], q: [0, 1, 2, 3, 4, 5, 6, 7], ms: 95 },
      parado: { url: 'cassino/fazendeiro-parado.png', folha: [84, 68], q: [0, 1, 2, 3], ms: 260 },
      gesto: { url: 'cassino/fazendeiro-enxada.png', folha: [84, 68], q: [0, 1, 2, 3], ms: 150, vezes: 4 },
    },
    galinha: {
      w: 16, h: 16, pe: [8, 15],
      andar: { url: 'cassino/galinhas.png', folha: [128, 128], q: [[0, 0], [1, 0], [2, 0], [3, 0]], ms: 110 },
      parado: { url: 'cassino/galinhas.png', folha: [128, 128], q: [[0, 2], [0, 2], [0, 2], [1, 2], [2, 2], [0, 0]], ms: 380 },
      gesto: { url: 'cassino/galinhas.png', folha: [128, 128], q: [[0, 1], [1, 1]], ms: 170, vezes: 4 },
    },
    vaca: {
      w: 20, h: 13, pe: [10, 13], esc: 1.5,
      andar: { url: 'cassino/vaca.png', folha: [240, 13], q: [6, 7, 8, 9, 10, 11], ms: 140 },
      parado: { url: 'cassino/vaca.png', folha: [240, 13], q: [0, 1, 2, 3, 4, 5], ms: 220 },
      gesto: { url: 'cassino/vaca.png', folha: [240, 13], q: [0, 1, 2, 3, 4, 5], ms: 220, vezes: 2 },
    },
  };
  const DIRECAO = { cima: 0, direita: 1, baixo: 2, esquerda: 3 };
  const semMovimento = matchMedia('(prefers-reduced-motion: reduce)');
  let bichos = [], filaColheita = [], plantios = { chave: null, de: [] };
  function montarBichos(x) {
    const camada = $('.cassino-fazenda-bichos');
    camada.innerHTML = ''; bichos = [];
    // cor: coluna inicial na folha das galinhas (0 marrom, 4 branca)
    const novo = (papel, fx, fy, cor = 0) => {
      const sp = SPRITE[papel], el = document.createElement('span');
      el.className = `faz-bicho faz-${papel}`;
      el.style.setProperty('--w', sp.w); el.style.setProperty('--h', sp.h); el.style.setProperty('--e', sp.esc || 1);
      camada.append(el);
      const b = { el, papel, sp, cor, fx, fy, alvo: null, dir: 'baixo', anim: null, t0: 0, espera: performance.now() + Math.random() * 3000 };
      animacao(b, 'parado', performance.now() - Math.random() * 2000);
      colocarBicho(b); bichos.push(b);
    };
    novo('fazendeiro', 150, FRENTE);
    novo('galinha', 50, 170);
    novo('galinha', 84, 176, 4);
    if (x.canteiros.length > 6) novo('galinha', 66, 172);
    if (x.niveis.celeiro >= 1) novo('vaca', 170, 172);
  }
  function animacao(b, nome, t) {
    if (b.anim === nome) return;
    const a = b.sp[nome];
    b.anim = nome; b.t0 = t; b.quadro = -1;
    b.el.style.backgroundImage = `url(${a.url})`;
    b.el.style.setProperty('--sw', a.folha[0]); b.el.style.setProperty('--sh', a.folha[1]);
  }
  // troca o quadro conforme o tempo; devolve true quando um gesto (vezes) terminou
  function quadroBicho(b, t) {
    const a = b.sp[b.anim], n = a.q.length;
    let i = Math.floor((t - b.t0) / a.ms);
    if (a.vezes && i >= n * a.vezes) return true;
    if (semMovimento.matches) i = 0;
    i %= n;
    if (i === b.quadro && b.dirDesenhada === b.dir) return false;
    b.quadro = i; b.dirDesenhada = b.dir;
    const q = a.q[i];
    const [col, lin] = Array.isArray(q) ? [q[0] + b.cor, q[1]] : [q, b.sp.direcoes ? DIRECAO[b.dir] : 0];
    b.el.style.setProperty('--qx', col); b.el.style.setProperty('--qy', lin);
    return false;
  }
  function colocarBicho(b) {
    // fx/fy: canto de cima de uma caixa de 16×16; os pés ficam no meio da base dela
    const vira = !b.sp.direcoes && b.esquerda;
    const e = b.sp.esc || 1, x = (b.fx + 8 - b.sp.pe[0] * e) * kFaz, y = (b.fy + 16 - b.sp.pe[1] * e) * kFaz;
    b.el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)${vira ? ' scaleX(-1)' : ''}`;
    b.el.style.zIndex = Math.round(b.fy);
  }
  function alvoBicho(b) {
    const area = b.papel === 'galinha' ? GALINHAS : b.papel === 'vaca' ? PASTO : null;
    if (area) return [area[0] + Math.random() * (area[2] - area[0]), area[1] + Math.random() * (area[3] - area[1])];
    const x = vendo(), n = x.canteiros.length;
    // na frente dos canteiros (sem pisar neles), o poço, o celeiro e a porteira do galinheiro
    const opcoes = [[300, 116], [302, 84], [GALINHEIRO.x + 48, FRENTE], ...Array.from({ length: Math.min(10, n) }, (_, i) => [CANT(i).x + 4, FRENTE])];
    return sorteio(opcoes);
  }
  function animarFazenda(t, dt) {
    for (const b of bichos) {
      // colheita na fila: o fazendeiro larga o passeio e vai até o canteiro
      if (b.papel === 'fazendeiro' && b.colhendo == null && filaColheita.length && b.anim !== 'gesto') {
        b.colhendo = filaColheita.shift();
        b.alvo = [CANT(b.colhendo).x + 4, FRENTE];
        animacao(b, 'andar', t);
      }
      if (!b.alvo) {
        if (b.anim === 'gesto') { if (quadroBicho(b, t)) animacao(b, 'parado', t); continue; }
        quadroBicho(b, t);
        if (t < b.espera) continue;
        b.alvo = alvoBicho(b);
        animacao(b, 'andar', t);
      }
      const [ax, ay] = b.alvo, dx = ax - b.fx, dy = ay - b.fy, d = Math.hypot(dx, dy);
      const passo = (b.papel === 'fazendeiro' ? 22 : b.papel === 'vaca' ? 7 : 12) * dt;
      if (Math.abs(dx) > 0.5) b.esquerda = dx < 0;
      b.dir = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'esquerda' : 'direita') : (dy < 0 ? 'cima' : 'baixo');
      if (d <= passo) {
        b.fx = ax; b.fy = ay; b.alvo = null;
        b.espera = t + (b.papel === 'fazendeiro' ? 2500 + Math.random() * 4000 : 1500 + Math.random() * 5000);
        // o fazendeiro só bate a enxada quando colhe; passeando, olha pros canteiros.
        // Os bichos ciscam/ruminam de vez em quando.
        let fazGesto = Math.random() < 0.7;
        if (b.papel === 'fazendeiro') {
          fazGesto = b.colhendo != null; b.colhendo = null;
          b.dir = ay === FRENTE && ax !== GALINHEIRO.x + 48 ? 'cima' : 'baixo';
        }
        animacao(b, fazGesto ? 'gesto' : 'parado', t);
      } else {
        b.fx += dx / d * passo; b.fy += dy / d * passo;
      }
      quadroBicho(b, t);
      colocarBicho(b);
    }
  }

  // Escolher semente. modo: 'plantar' (canteiro vazio), 'proxima' (o que entra depois da
  // colheita, com irrigação), 'vazios' (todos os vazios) ou 'todos' (próxima de todos).
  function abrirSementes(modo, i, alvo) {
    const pop = $('.cassino-sementes');
    const cant = i != null ? e.canteiros[i] : null;
    let h = '';
    if (modo === 'proxima' || (cant && modo === 'arrancar')) {
      const falta = cant.plantado + R.tempoCultura(e, cant.cultura) - agora();
      h += `<p class="pop-titulo">${R.CULTURAS[cant.cultura].nome} · falta ${fmtTempo(falta)}</p>`;
    }
    if (modo === 'proxima' || modo === 'todos') h += `<p class="pop-dica">${modo === 'todos' ? 'Em todos os canteiros, depois' : 'Depois'} da colheita, plantar:</p>`;
    if (modo !== 'arrancar') h += Object.entries(R.CULTURAS).map(([id, c]) => {
      const ok = e.culturas[id];
      const atual = modo === 'proxima' && (cant.proxima || cant.cultura) === id;
      const extra = modo === 'proxima' && id === cant.cultura ? ' · a mesma' : '';
      return `<button type="button" data-semente="${id}" data-modo="${modo}" data-i="${i ?? ''}" ${ok ? '' : 'disabled'} ${atual ? 'aria-current="true"' : ''}><span class="ic" style="${iconePlanta(id, 2)}"></span><b>${c.nome}${atual ? ' ✓' : ''}</b><small>${ok ? `${fmtTempo(R.tempoCultura(e, id))} · ${c.porcoes} porções${extra}` : `Libere na loja (${fmt(c.desbloqueio)})`}</small></button>`;
    }).join('');
    if (modo === 'proxima' || modo === 'arrancar') h += `<button type="button" class="pop-arrancar" data-arrancar="${i}"><span class="ic"></span><b>Arrancar agora</b><small>Esvazia o canteiro e perde o que cresceu</small></button>`;
    pop.innerHTML = h;
    pop.hidden = false;
    const r = alvo.getBoundingClientRect();
    pop.style.left = `${Math.max(8, Math.min(innerWidth - pop.offsetWidth - 8, r.right + 8))}px`;
    pop.style.top = `${Math.max(8, Math.min(innerHeight - pop.offsetHeight - 8, r.top))}px`;
    pop.querySelector('button:not([disabled])')?.focus();
  }

  // ---------- Amigos ----------
  function desenharAmigos() {
    if (!listaAmigos) { por($('.cassino-cena[data-cena="amigos"]'), '<p class="cassino-vazio">Carregando…</p>'); return; }
    if (!listaAmigos.length) { por($('.cassino-cena[data-cena="amigos"]'), '<p class="cassino-vazio">Ninguém mais abriu o cassino ainda. Chama a turma!</p>'); return; }
    por($('.cassino-cena[data-cena="amigos"]'), listaAmigos.map(a => {
      const ajudou = e.ajudasHoje[a.chave] || a.ajudouHoje;
      return `<article class="cassino-amigo"><div class="cassino-amigo-topo"><span class="inicial">${esc(a.nome[0] || '?')}</span><div><strong>${esc(a.nome)}</strong><span>${fmt(a.taxa)} coins/h · dia ${a.dia}</span></div></div>`
        + `<span class="cassino-amigo-info">${a.maquinas} máquinas · ${a.canteiros} canteiros · ${a.equipe} na equipe · ${fmt(a.ganho)} ganhas na temporada</span>`
        + `<div class="cassino-fileira"><button type="button" class="cassino-botao" data-visitar="${esc(a.chave)}">Visitar</button><button type="button" class="cassino-botao${ajudou ? '' : ' ouro'}" data-ajudar="${esc(a.chave)}" ${ajudou ? 'disabled' : ''}>${ajudou ? 'Ajudou hoje' : 'Ajudar'}</button></div></article>`;
    }).join(''));
  }
  async function carregarAmigos() {
    const r = await pedir('amigos');
    listaAmigos = r.amigos || [];
    desenhar();
  }
  async function visitar(chave) {
    const r = await pedir('visitar', { chave });
    if (r.erro) return showToast(r.erro, 'error');
    visitando = r.amigo;
    $('.cassino-visitando').hidden = false;
    $('.cassino-visitando span').textContent = `Você está no cassino de ${visitando.nome}`;
    atualizarAjudar();
    trocarCena('cassino');
  }
  function sairDaVisita() {
    visitando = null; assinatura = '';
    $('.cassino-visitando').hidden = true;
  }
  function atualizarAjudar() {
    if (!visitando) return;
    const b = $('.cassino-ajudar'), ajudou = e.ajudasHoje[visitando.chave];
    b.disabled = Boolean(ajudou);
    b.textContent = ajudou ? 'Ajudou hoje' : `Ajudar ${visitando.nome}`;
  }
  async function ajudar(chave, ev) {
    const r = await acao('ajudar', { chave }, ev, x => `+${fmt(x.amigo ? x.amigo.valor : 0)}`);
    if (!r) return;
    showToast(`Você e ${r.amigo.nome} ganharam coins pela ajuda.`, 'success');
    if (listaAmigos) { const a = listaAmigos.find(x => x.chave === chave); if (a) a.ajudouHoje = true; }
    atualizarAjudar(); desenhar();
  }
  socket.on('cassino-ajuda', d => {
    showToast(`${d.nome} ajudou seu cassino: +${fmt(d.valor)} coins.`, 'success', 5000);
    tocar('fichas', 0, .5);
    ver();
  });

  // ---------- Cenas ----------
  function trocarCena(nova) {
    cena = nova;
    if (editando) { editando = false; $('.cassino-dica-edicao').hidden = true; }
    $('.cassino-editar').hidden = nova !== 'cassino' || Boolean(visitando);
    $('.cassino-acoes-fazenda').hidden = nova !== 'roca' || Boolean(visitando);
    $('.cassino-celeiro').hidden = nova !== 'roca';
    raiz.querySelectorAll('[data-cena-aba]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.cenaAba === nova)));
    raiz.querySelectorAll('.cassino-cena').forEach(c => { c.hidden = c.dataset.cena !== nova; });
    if (nova === 'amigos') { if (visitando) sairDaVisita(); carregarAmigos(); }
    desenhar();
  }

  // ---------- Cliques ----------
  raiz.addEventListener('click', async ev => {
    const b = ev.target.closest('button');
    const pop = $('.cassino-sementes');
    if (!pop.hidden && !ev.target.closest('.cassino-sementes') && !ev.target.closest('[data-canteiro]')) pop.hidden = true;
    if (!b) return;
    const d = b.dataset;
    if (d.cenaAba) return trocarCena(d.cenaAba);
    if (d.legado) {
      if (b.getAttribute('aria-disabled') === 'true') return showToast('Estrelas insuficientes.', 'error');
      if (await acao('legado', { id: d.legado })) showToast(`${R.LEGADO[d.legado].nome}: fica pra sempre!`, 'success', 2200);
      return;
    }
    if (d.venderMaq) {
      if (!b.classList.contains('confirmando')) {
        b.classList.add('confirmando'); b.textContent = `Confirmar: +${fmt(Number(d.valor))}?`;
        setTimeout(() => { if (b.isConnected) { b.classList.remove('confirmando'); b.textContent = `Vender por ${fmt(Number(d.valor))}`; } }, 3000);
        return;
      }
      const r = await acao('venderMaquina', { id: d.venderMaq }, ev, x => `+${fmt(x.valor)}`);
      if (r) showToast(`${R.MAQUINAS[d.venderMaq].nome} vendido por ${fmt(r.valor)}.`, 'success', 1800);
      return;
    }
    if (d.tipo) {
      if (b.getAttribute('aria-disabled') === 'true') return showToast('Coins insuficientes.', 'error');
      const nomes = { maquina: 'maquina', melhoria: 'melhorar', func: 'contratar', cultura: 'liberar' };
      const extra = d.tipo === 'cultura' ? { cultura: d.id } : { id: d.id };
      const r = await acao(nomes[d.tipo], extra);
      if (r) showToast(d.tipo === 'func' ? `${R.FUNCIONARIOS[d.id].cargo} começou a trabalhar!` : 'Comprado!', 'success', 1800);
      return;
    }
    if (d.canteiro != null) {
      if (visitando) return showToast(`Essa fazenda é de ${visitando.nome}.`);
      const i = Number(d.canteiro), c = e.canteiros[i];
      if (!c) return abrirSementes('plantar', i, b);
      const falta = c.plantado + R.tempoCultura(e, c.cultura) - agora();
      if (falta > 0) return abrirSementes(e.niveis.irrigacao ? 'proxima' : 'arrancar', i, b);
      const r = await acao('colher', { i }, ev, x => `+${x.porcoes} ${R.CULTURAS[c.cultura].nome}`);
      if (r?.venda) showToast(`Celeiro cheio: o resto foi vendido por ${fmt(r.venda)}.`);
      return;
    }
    if (d.semente) {
      ultimaSemente = d.semente; pop.hidden = true;
      if (d.modo === 'plantar') return acao('plantar', { i: Number(d.i), cultura: d.semente });
      if (d.modo === 'vazios') return acao('plantarVazios', { cultura: d.semente });
      if (d.modo === 'todos') {
        const r = await acao('proximaTodos', { cultura: d.semente });
        if (r) showToast(`Depois da colheita, ${r.trocados} canteiro(s) viram ${R.CULTURAS[d.semente].nome}.`, 'success');
        return;
      }
      return acao('proxima', { i: Number(d.i), cultura: d.semente });
    }
    if (d.arrancar != null) { pop.hidden = true; return acao('arrancar', { i: Number(d.arrancar) }); }
    if (d.roca === 'colher') {
      const r = await acao('colherTudo', {}, ev, x => `+${x.porcoes} porções`);
      if (r?.venda) showToast(`Celeiro cheio: o resto foi vendido por ${fmt(r.venda)}.`);
      return;
    }
    if (d.roca === 'plantar') return abrirSementes(e.canteiros.some(c => !c) || !e.niveis.irrigacao ? 'vazios' : 'todos', null, b);
    if (d.vender) return acao('vender', { cultura: d.vender }, ev, x => `+${fmt(x.valor)}`);
    if (d.visitar) return visitar(d.visitar);
    if (d.ajudar) return ajudar(d.ajudar, ev);
    if (b.classList.contains('cassino-editar')) return alternarEdicao();
    if (b.classList.contains('cassino-ajudar')) return ajudar(visitando.chave, ev);
    if (b.classList.contains('cassino-voltar')) { sairDaVisita(); return trocarCena('cassino'); }
    if (b.classList.contains('cassino-coletar')) {
      const r = await acao('coletar', {}, ev, x => `+${fmt(x.valor)}`);
      if (r) showToast(`Coletou ${fmt(r.valor)} coins.`, 'success', 1800);
      return;
    }
    if (d.pular) { await acao('pular', { ms: Number(d.pular) }); return showToast(`O tempo andou ${fmtTempo(Number(d.pular))}.`); }
    if (b.classList.contains('cassino-encerrar')) {
      if (!confirm('Encerrar a temporada agora? O cassino e a fazenda voltam do zero (fica só o que você comprou na lojinha das estrelas), a carteira volta pra 5.000 e você ganha as estrelas.')) return;
      const r = await acao('encerrarTemporada');
      if (r) { sairDaVisita(); showToast(`Temporada encerrada: ${fmt(r.ganho)} coins ganhos, ${r.novas} estrela(s) nova(s).`, 'success', 6000); }
    }
  });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape') $('.cassino-sementes').hidden = true; });

  window.addEventListener('teletela-aba-jogo', ev => {
    aba = ev.detail.jogo;
    if (aba === 'cassino') {
      titulo.textContent = 'Seu cassino';
      ver();
      if (cena === 'amigos') carregarAmigos();
    }
  });

  setInterval(() => { if (ativo()) desenhar(); else desenharSalao(); }, 1000);
  setInterval(() => { if (ativo()) ver(); }, 60e3);
  socket.on('connect', ver);
  socket.on('cassino-temporada', ver);
  if (socket.connected) ver();
}
