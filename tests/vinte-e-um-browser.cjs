const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const { registerAppScheme, handleAppProtocol, roomUrl } = require('../electron/app-protocol.cjs');
registerAppScheme();
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.on('window-all-closed', () => {});
const profile = require('node:fs').mkdtempSync(path.join(os.tmpdir(), 'teletela-mesa-ui-'));
app.setPath('userData', profile);
process.env.TELINHA_DATA_DIR = path.join(profile, 'servidor');
let io;
const errors = [];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const js = (win, source) => win.webContents.executeJavaScript(source);
const until = async (win, expression) => {
  for (let i = 0; i < 100; i++) { if (await js(win, expression)) return; await wait(50); }
  throw new Error('O estado não chegou: ' + expression);
};
const click = (win, selector) => js(win, `document.querySelector(${JSON.stringify(selector)}).click();void 0`);
app.whenReady().then(async () => {
  const backend = await import('../server.js'); io = backend.io;
  const server = await backend.startServer(0, '127.0.0.1'); handleAppProtocol();
  async function open(name) {
    const win = new BrowserWindow({ width: 1280, height: 900, show: false, webPreferences: { partition: `mesa-${name}`, offscreen: true, backgroundThrottling: false } });
    handleAppProtocol(win.webContents.session);
    win.webContents.on('console-message', event => { if (event.level === 'error') { errors.push(event.message); console.error('[Interface]', event.sourceId, event.lineNumber, event.message); } });
    await win.loadURL(roomUrl(`http://127.0.0.1:${server.address().port}`));
    await until(win, 'Boolean(window.appState && document.querySelector("#channel-geral"))');
    await js(win, `document.querySelector('#input-profile-name').value=${JSON.stringify(name)};document.querySelector('#form-profile').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));document.querySelectorAll('.modal-backdrop').forEach(el=>el.classList.add('hidden'));void 0`);
    await require('./conta-atividades.cjs')(win, name, { click, js, until });
    return win;
  }
  const a = await open('Lia'), b = await open('Davi');
  for (const w of [a, b]) {
    await click(w, '#channel-geral .channel-row');
    await until(w, 'appState.currentChannelId === "geral"');
    await click(w, '#btn-atividades');
    // Abre no salão; o cartão do 21 leva pra mesa.
    await until(w, '!document.querySelector("#salao-jogos").hidden && document.querySelector("#titulo-21").textContent === "Atividades"');
    await click(w, '.salao-cartao[data-jogo="21"]');
    await until(w, '!document.querySelector("#jogo-21").hidden && document.querySelector("#salao-jogos").hidden && !document.querySelector("#voltar-salao").hidden');
    await until(w, 'document.querySelector("[data-acao=amigos]")');
  }
  async function jogar(w, acao) {
    const sel = '[data-acao="'+acao+'"]:not(:disabled)';
    await until(w, 'document.querySelector('+JSON.stringify(sel)+') !== null');
    await click(w, sel);
  }
  await js(b, "document.documentElement.dataset.visual='terminal';void 0");
  await jogar(a, 'amigos');
  await jogar(b, 'entrar');
  // A aposta é montada clicando nas fichas: 5 + 5 = 10.
  for (const w of [a, b]) await until(w, '!document.querySelector("#montar-21").hidden');
  await click(a, '#montar-21 [data-ficha="5"]');
  await click(a, '#montar-21 [data-ficha="5"]');
  await until(a, 'document.querySelector(".minha-mao .aposta-21 small")?.textContent === "10"');
  await jogar(a, 'iniciar');
  await until(a, 'Boolean(document.querySelector("[data-acao=cancelar]"))');
  await click(b, '#montar-21 [data-ficha="10"]');
  await jogar(b, 'iniciar');
  await until(a, 'document.querySelector("#fichas-na-mesa").textContent.includes("Pote de 20")');
  if (await js(a, 'document.querySelector("#carteira-21").textContent') !== '990') throw Error('A carteira não debitou a aposta');
  await click(a, '#ranking-21-botao');
  await until(a, 'document.querySelectorAll("#ranking-21 li").length === 2');
  await click(a, '#fechar-ranking-21');
  await until(b, 'document.querySelectorAll(".carta-21").length === 4');
  const cartasAntes = await js(a, 'Array.from(document.querySelectorAll(".minha-mao img"), el => el.alt).join(",")');
  await click(a, '#voltar-21');
  await until(a, 'document.querySelector("#mesa-21").hidden && document.querySelector("#voice-lounge").getBoundingClientRect().height > 0');
  await click(a, '#btn-atividades');
  // Sentada no 21, reabrir as Atividades volta direto pra mesa.
  await until(a, 'document.querySelectorAll(".minha-mao img").length === 2 && !document.querySelector("#jogo-21").hidden');
  if (cartasAntes !== await js(a, 'Array.from(document.querySelectorAll(".minha-mao img"), el => el.alt).join(",")')) throw Error('A mão mudou ao voltar ao palco');
  await a.webContents.executeJavaScript("document.querySelector('#ampliar-21').click()", true);
  await until(a, 'document.fullscreenElement?.id === "mesa-21"');
  await click(a, '#ampliar-21');
  await until(a, '!document.fullscreenElement');
  const terminou = w => js(w, 'document.querySelector("#aviso-21").textContent.includes("encerrada")');
  if (!await terminou(b) && !await js(b, 'document.querySelectorAll(".carta-21.coberta").length === 2')) throw Error('Mão dos amigos exposta');
  if (await js(a, 'Boolean(document.querySelector("[data-acao=dobrar]"))')) throw Error('Entre amigos não tem dobrar');
  if (await js(a, 'Boolean(document.querySelector("[data-acao=pedir]"))')) {
    await jogar(a, 'pedir');
    await until(b, 'document.querySelectorAll(".carta-21").length === 5');
  }
  for (const w of [a,b]) {
    if (await js(w, 'Boolean(document.querySelector("[data-acao=parar]"))')) await jogar(w, 'parar');
  }
  await until(a, 'document.querySelector("#aviso-21").textContent.includes("encerrada")');
  await jogar(a, 'sair');
  await jogar(b, 'sair');
  await click(a, '#entrada-21 input[value="0"]');
  await jogar(a, 'banca');
  await jogar(a, 'iniciar');
  await until(a, 'document.querySelectorAll(".carta-21").length >= 4');
  // Contra a banca dá pra dobrar nas duas primeiras cartas: vem só mais uma (sem 21 de cara)
  if (await js(a, 'Boolean(document.querySelector("[data-acao=dobrar]"))')) {
    await wait(900);
    if (process.env.PRINTS) await fs.writeFile(path.join(process.env.PRINTS, '21-dobrar.png'), (await a.webContents.capturePage()).toPNG());
    await jogar(a, 'dobrar');
    await until(a, 'document.querySelector("#aviso-21").textContent.includes("encerrada")');
    if (await js(a, 'document.querySelectorAll(".minha-mao .carta-21").length') !== 3) throw Error('Dobrar deveria dar só uma carta');
    await wait(2500);
    if (process.env.PRINTS) await fs.writeFile(path.join(process.env.PRINTS, '21-dobrou.png'), (await a.webContents.capturePage()).toPNG());
  }
  if (await js(a, 'Boolean(document.querySelector("[data-acao=parar]"))')) await jogar(a, 'parar');
  await until(a, 'document.querySelector("#aviso-21").textContent.includes("encerrada")');
  console.log('21 nos dois modos passou');
  if (errors.length) throw new Error(errors.join('\n'));
  await terminar(0);
}).catch(async erro => { console.error(erro); await terminar(1); });

async function terminar(codigo) {
  BrowserWindow.getAllWindows().forEach(win => win.destroy());
  if (io) await new Promise(resolve => io.close(resolve));
  await fs.rm(profile, { recursive: true, force: true });
  app.exit(codigo);
}
