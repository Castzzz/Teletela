// Poker de ponta a ponta com duas janelas: abas, sentar, dar as cartas, apostar e largar.
// Rodar: env -u DISPLAY WAYLAND_DISPLAY=teletela-teste-sem-monitor /usr/lib/electron42/electron \
//   --ozone-platform=headless --disable-gpu tests/poker-browser.cjs
// Com PRINTS=/alguma/pasta, salva prints da mesa pra conferir o visual.
const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const { registerAppScheme, handleAppProtocol, roomUrl } = require('../electron/app-protocol.cjs');
registerAppScheme();
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.on('window-all-closed', () => {});
const profile = require('node:fs').mkdtempSync(path.join(os.tmpdir(), 'teletela-poker-ui-'));
app.setPath('userData', profile);
process.env.TELINHA_DATA_DIR = path.join(profile, 'servidor');
let io;
const errors = [];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const js = (win, source) => win.webContents.executeJavaScript(source);
const until = async (win, expression, vezes = 120) => {
  for (let i = 0; i < vezes; i++) { if (await js(win, expression)) return; await wait(50); }
  throw new Error('O estado não chegou: ' + expression);
};
const click = (win, selector) => js(win, `document.querySelector(${JSON.stringify(selector)}).click();void 0`);
const PRINTS = process.env.PRINTS;
async function print(win, nome) {
  if (!PRINTS) return;
  await wait(1200); // deixa as cartas pousarem
  await fs.writeFile(path.join(PRINTS, nome + '.png'), (await win.webContents.capturePage()).toPNG());
}

app.whenReady().then(async () => {
  const backend = await import('../server.js'); io = backend.io;
  const server = await backend.startServer(0, '127.0.0.1'); handleAppProtocol();
  async function open(name, largura = 1440, altura = 960, visitante = false) {
    const win = new BrowserWindow({ width: largura, height: altura, show: false, webPreferences: { partition: `poker-${name}`, offscreen: true, backgroundThrottling: false } });
    handleAppProtocol(win.webContents.session);
    win.webContents.on('console-message', event => { if (event.level === 'error') { errors.push(event.message); console.error('[Interface]', event.sourceId, event.lineNumber, event.message); } });
    await win.loadURL(roomUrl(`http://127.0.0.1:${server.address().port}`));
    win.setSize(largura + 1, altura); await wait(100); win.setSize(largura, altura); // o offscreen só pinta depois de um resize
    await until(win, 'Boolean(window.appState && document.querySelector("#channel-geral"))');
    await js(win, `document.querySelector('#input-profile-name').value=${JSON.stringify(name)};document.querySelector('#form-profile').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));document.querySelectorAll('.modal-backdrop').forEach(el=>el.classList.add('hidden'));void 0`);
    if (!visitante) await require('./conta-atividades.cjs')(win, name, { click, js, until });
    return win;
  }
  const a = await open('Lia'), b = await open('Davi'), c = await open('Caio', 420, 860, true);
  for (const w of [a, b, c]) {
    await click(w, '#channel-geral .channel-row');
    await until(w, 'appState.currentChannelId === "geral"');
    await click(w, '#btn-atividades');
    await until(w, '!document.querySelector("#mesa-21").hidden && !document.querySelector("#salao-jogos").hidden');
    if (w === c) {
      await print(c, '0-salao-celular');
      // O cartão das Apostas abre o painel por cima do salão.
      await click(c, '.salao-cartao[data-jogo="apostas"]');
      await until(c, '!document.querySelector("#apostas-21").hidden');
      await until(c, 'document.querySelector("#apostas-21").textContent.includes("Entre na sua conta")');
      await click(c, '#fechar-apostas-21');
      await until(c, 'document.querySelector("#apostas-21").hidden');
    }
    await click(w, '.salao-cartao[data-jogo="poker"]');
    await until(w, '!document.querySelector("#jogo-poker").hidden && document.querySelector("#jogo-21").hidden');
    await until(w, 'Boolean(document.querySelector("#acoes-poker [data-acao=sentar]"))');
  }
  if (await js(a, 'document.querySelector("#titulo-21").textContent') !== 'Jogar poker') throw Error('Título da aba errado');
  await print(a, '1-abertura');

  // Lia senta com 300 digitando; Davi com o valor sugerido (500); Caio assiste no celular.
  // Digitado fora dos 5 em 5, o valor arredonda ao sair do campo.
  await js(a, `{const n=document.querySelector('#valor-poker-numero');n.value='302';n.dispatchEvent(new Event('input'));n.dispatchEvent(new Event('blur'))}void 0`);
  if (await js(a, 'document.querySelector("#valor-poker-numero").value') !== '300') throw Error('O valor não foi pra 5 em 5');
  await js(a, `const n=document.querySelector('#valor-poker-numero');n.value='300';n.dispatchEvent(new Event('input'));void 0`);
  if (!await js(a, 'document.querySelector("#acoes-poker [data-acao=sentar]").textContent.includes("300")')) throw Error('O botão não acompanhou o valor');
  await click(a, '#acoes-poker [data-acao=sentar]');
  await until(a, 'Boolean(document.querySelector(".lugar-poker.minha-mao"))');
  await until(b, 'document.querySelectorAll(".lugar-poker").length === 1');
  await click(b, '#acoes-poker [data-acao=sentar]');
  await until(a, 'Boolean(document.querySelector("#acoes-poker [data-acao=comecar]"))');
  await click(a, '#acoes-poker [data-acao=comecar]');
  for (const w of [a, b]) await until(w, 'document.querySelectorAll(".lugar-poker.minha-mao img").length === 2 && document.querySelectorAll(".lugar-poker.amigo-21 .carta-21.coberta").length === 2');
  await until(c, 'document.querySelectorAll(".lugar-poker .carta-21.coberta").length === 4');
  if (await js(c, 'document.querySelectorAll(".lugar-poker img").length')) throw Error('Quem assiste viu as cartas');
  // As fichas dos blinds saíram da carteira na hora.
  await until(a, 'document.querySelector("#carteira-21").textContent.replace(/\\D/g,"") === "995"');
  await print(a, '2-preflop-lia');

  // Quem tem a vez: Lia é dealer e small blind, fala primeiro.
  const vez = async () => (await js(a, 'Boolean(document.querySelector("#acoes-poker [data-acao=largar]"))')) ? a : b;
  if (await vez() !== a) throw Error('No mano a mano o dealer fala primeiro');
  // Davi volta pro salão enquanto chega a vez dele: o cartão do poker chama.
  await click(b, '#voltar-salao');
  await until(b, '!document.querySelector("#salao-jogos").hidden');
  await click(a, '#acoes-poker [data-acao=pagar]');
  await until(b, 'document.querySelector(".salao-cartao[data-jogo=poker]").classList.contains("chamando") && document.querySelector(".salao-cartao[data-jogo=poker] .salao-status").textContent === "Sua vez!"');
  if (PRINTS) await print(b, '0-salao-sua-vez');
  await click(b, '.salao-cartao[data-jogo="poker"]');
  await until(b, 'Boolean(document.querySelector("#acoes-poker [data-acao=passar]"))');
  if (!await js(b, '/Sua vez · \\d+s/.test(document.querySelector("#aviso-poker").textContent)')) throw Error('Sem o relógio da vez');
  if (!await js(b, 'Boolean(document.querySelector(".lugar-poker.minha-mao .tempo-poker"))')) throw Error('Sem a barra do tempo');
  await click(b, '#acoes-poker [data-acao=passar]');
  await until(a, 'document.querySelectorAll("#mesa-cartas-poker img").length === 3');
  // As cartas do flop viram no estilo retrô (achatam e abrem), não giram em 3D.
  if (!await js(a, `[...document.querySelectorAll("#mesa-cartas-poker .miolo-21")].some(m => m.getAnimations().some(x => String(x.effect.getKeyframes().map(k => k.transform)).includes("scaleX(0)")))`)) throw Error('Sem a virada retrô no flop');
  await until(c, 'document.querySelectorAll("#mesa-cartas-poker img").length === 3');
  await print(b, '3-flop-davi');
  await print(c, '3-flop-celular');
  // O nome da sua mão fica ao lado do seu nome e acompanha o flop.
  await until(a, '!document.querySelector(".minha-mao .mao-poker").hidden && document.querySelector(".minha-mao .mao-poker").textContent.length > 3');
  if (await js(c, 'Boolean(document.querySelector(".mao-poker:not([hidden])"))')) throw Error('Quem assiste não tem mão pra mostrar');
  // A tabela das mãos: dez categorias com as cartas do baralho e a sua marcada.
  if (await js(a, 'document.querySelector("#maos-poker-botao").hidden')) throw Error('Sem o botão Mãos no poker');
  await click(a, '#maos-poker-botao');
  await until(a, '!document.querySelector("#maos-poker").hidden && document.querySelectorAll("#maos-poker li").length === 10 && document.querySelectorAll("#maos-poker img").length === 50');
  if (await js(a, 'document.querySelectorAll("#maos-poker li.sua-mao").length') !== 1) throw Error('A tabela não marcou a sua mão');
  await print(a, '3-maos-lia');
  await click(a, '#fechar-maos-poker');

  // Depois do flop fala Davi. Ele aposta o pote; Lia larga.
  await until(b, 'Boolean(document.querySelector("#acoes-poker [data-acao=aumentar]"))');
  const pote = [...await js(b, 'Array.from(document.querySelectorAll(".valor-poker-rapidos button"), x => x.firstChild.textContent)')];
  if (pote.join() !== 'Mínimo,½ pote,Pote,All-in') throw Error('Atalhos de aposta: ' + pote.join());
  await js(b, `Array.from(document.querySelectorAll('.valor-poker-rapidos button')).find(x => x.firstChild.textContent === 'Pote').click();void 0`);
  if (!await js(b, 'document.querySelector("#acoes-poker [data-acao=aumentar]").textContent === "Apostar 20"')) throw Error('Aposta do pote errada');
  await click(b, '#acoes-poker [data-acao=aumentar]');
  await until(a, 'Boolean(document.querySelector("#acoes-poker [data-acao=largar]"))');
  await print(a, '4-aposta-lia');
  await click(a, '#acoes-poker [data-acao=largar]');
  await until(a, '!document.querySelector("#placar-poker").hidden && document.querySelector("#placar-poker").textContent.includes("Davi levou")');
  await until(b, 'document.querySelector("#placar-poker").textContent.includes("Você levou")');
  await print(b, '5-resultado-davi');
  if (PRINTS) { await js(b, "document.documentElement.dataset.theme='claro';void 0"); await print(b, '6-resultado-claro'); await js(b, "document.documentElement.dataset.theme='escuro';void 0"); }
  await until(b, 'document.querySelector("#carteira-21").textContent.replace(/\\D/g,"") === "1010"');
  // Antes da próxima mão as cartas voltam pro monte e ele embaralha.
  await until(a, 'document.querySelector("#jogo-poker").classList.contains("mesa-limpa")', 120);
  await print(a, '5b-embaralhando');

  // A próxima mão sai sozinha e o botão gira pro Davi.
  await until(a, 'document.querySelectorAll(".lugar-poker.minha-mao img").length === 2 && document.querySelector(".lugar-poker.amigo-21 .dealer-poker") !== null', 300);
  // Lia levanta no meio da mão (confirma) e Davi leva os blinds.
  await click(a, '#acoes-poker [data-acao=sair]');
  await until(a, 'Boolean(document.querySelector(".confirmar-dialogo[open]"))');
  await click(a, '.confirmar-dialogo[open] button[value=sim]');
  await until(a, 'Boolean(document.querySelector("#acoes-poker [data-acao=sentar]"))');
  await until(b, 'document.querySelector("#placar-poker").textContent.includes("Você levou")');

  // O 21 continua no lugar dele, pelo salão.
  await click(a, '#voltar-salao');
  await until(a, '!document.querySelector("#salao-jogos").hidden && document.querySelector("#titulo-21").textContent === "Atividades"');
  await click(a, '.salao-cartao[data-jogo="21"]');
  await until(a, 'document.querySelector("#titulo-21").textContent === "Jogar 21" && Boolean(document.querySelector("#acoes-21 [data-acao=banca]"))');
  {
    // Uma rodada de 21 com aposta: as fichas empilhadas e a banca.
    await click(a, '#acoes-21 [data-acao=banca]');
    await until(a, '!document.querySelector("#montar-21").hidden');
    for (const v of [100, 50, 25, 10, 5, 5]) await click(a, `#montar-21 [data-ficha="${v}"]`);
    // A última ficha cai na coluna da cor dela; a aposta vira um montinho, uma coluna por cor.
    if (!await js(a, 'Boolean(document.querySelector(".ficha-caindo"))')) throw Error('A ficha não caiu na pilha');
    if (await js(a, 'document.querySelectorAll(".minha-mao .aposta-21 .pilha-21").length') !== 5) throw Error('Uma coluna por cor');
    await print(a, '7a-21-aposta');
    await click(a, '#acoes-21 [data-acao=iniciar]');
    await until(a, 'document.querySelectorAll(".minha-mao .carta-21").length === 2');
    await print(a, '7-vinte-e-um');
    // Acabou a rodada: a mesa se limpa sozinha e a aposta se monta do zero.
    if (await js(a, 'Boolean(document.querySelector("#acoes-21 [data-acao=parar]"))')) await click(a, '#acoes-21 [data-acao=parar]');
    await until(a, 'document.querySelector("#aviso-21").textContent.includes("encerrada")');
    if (!await js(a, 'document.querySelector("#montar-21").hidden')) throw Error('Com o resultado na mesa não se aposta');
    await until(a, '!document.querySelector("#maos-21 .carta-21") && !document.querySelector("#montar-21").hidden', 300);
    // Enquanto se monta a aposta, a banca embaralha o monte.
    if (!await js(a, 'Boolean(document.querySelector("#monte-21 .embaralhando"))')) throw Error('O monte não embaralhou');
    if (PRINTS) for (const [i, ms] of [[1, 150], [2, 200], [3, 200]].entries()) { await wait(ms[1]); await fs.writeFile(path.join(PRINTS, '9-embaralhando-' + i + '.png'), (await a.webContents.capturePage()).toPNG()); }
    if (await js(a, 'document.querySelectorAll(".minha-mao .pilha-21").length')) throw Error('A aposta antiga ficou no círculo');
    if (!await js(a, 'document.querySelector("#acoes-21 [data-acao=iniciar]").textContent === "Monte a aposta"')) throw Error('A aposta não começou do zero');
    await print(a, '8-mesa-limpa');
    // O crédito das cartas e fichas (exigido pela CC BY) fica no pé do ranking.
    await click(a, '#ranking-21-botao');
    await until(a, '!document.querySelector("#ranking-21").hidden && document.querySelectorAll("#ranking-21 li").length > 0');
    if (!await js(a, 'document.querySelector("#ranking-21 .creditos-21").textContent.includes("IvoryRed")')) throw Error('Sem o crédito das cartas');
    await print(a, '10-ranking-creditos');
    // E fica fixo no fim das novidades, em todas as versões.
    await click(a, '#fechar-ranking-21');
    await js(a, `document.querySelector('#modal-whats-new').classList.remove('hidden');document.querySelector('#modal-whats-new .modal-body').scrollTop=1e6;void 0`);
    if (!await js(a, 'document.querySelector("#modal-whats-new .whats-new-creditos").offsetHeight > 0')) throw Error('Sem os créditos nas novidades');
    await print(a, '11-novidades-creditos');
    await js(a, `document.querySelector('#modal-whats-new').classList.add('hidden');void 0`);
  }
  console.log('poker passou');
  if (errors.length) throw new Error(errors.join('\n'));
  await terminar(0);
}).catch(async erro => { console.error(erro); await terminar(1); });

async function terminar(codigo) {
  BrowserWindow.getAllWindows().forEach(win => win.destroy());
  if (io) await new Promise(resolve => io.close(resolve));
  await fs.rm(profile, { recursive: true, force: true });
  app.exit(codigo);
}
