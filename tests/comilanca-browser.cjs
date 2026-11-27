// Comilança de ponta a ponta: abre pelo salão, mostra o exemplo e gira 3 vezes conferindo a carteira.
// Rodar: env -u DISPLAY WAYLAND_DISPLAY=teletela-teste-sem-monitor /usr/lib/electron42/electron \
//   --ozone-platform=headless --disable-gpu tests/comilanca-browser.cjs
// Com PRINTS=/alguma/pasta, salva prints.
const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const { registerAppScheme, handleAppProtocol, roomUrl } = require('../electron/app-protocol.cjs');
registerAppScheme();
app.on('window-all-closed', () => {});
const profile = require('node:fs').mkdtempSync(path.join(os.tmpdir(), 'teletela-comilanca-ui-'));
app.setPath('userData', profile);
process.env.TELINHA_DATA_DIR = path.join(profile, 'servidor');
const errors = [];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const js = (win, source) => win.webContents.executeJavaScript(source);
const until = async (win, expression, vezes = 200) => {
  for (let i = 0; i < vezes; i++) { if (await js(win, expression)) return; await wait(50); }
  throw new Error('O estado não chegou: ' + expression);
};
const click = (win, selector) => js(win, `document.querySelector(${JSON.stringify(selector)}).click();void 0`);
const PRINTS = process.env.PRINTS;
async function print(win, nome) {
  if (!PRINTS) return;
  await wait(600);
  await fs.writeFile(path.join(PRINTS, nome + '.png'), (await win.webContents.capturePage()).toPNG());
}
const saldo = win => js(win, 'Number(document.querySelector("#carteira-21").lastElementChild.textContent.replace(/\\D/g, ""))');

app.whenReady().then(async () => {
  const backend = await import('../server.js');
  const server = await backend.startServer(0, '127.0.0.1'); handleAppProtocol();
  async function open(name, largura = 1440, altura = 960) {
    const win = new BrowserWindow({ width: largura, height: altura, show: false, webPreferences: { partition: `comilanca-${name}`, offscreen: true, backgroundThrottling: false } });
    handleAppProtocol(win.webContents.session);
    win.webContents.on('console-message', event => { if (event.level === 'error') { errors.push(event.message); console.error('[Interface]', event.sourceId, event.lineNumber, event.message); } });
    await win.loadURL(roomUrl(`http://127.0.0.1:${server.address().port}`));
    win.setSize(largura + 1, altura); await wait(100); win.setSize(largura, altura);
    await until(win, 'Boolean(window.appState && document.querySelector("#channel-geral"))');
    await js(win, `document.querySelector('#input-profile-name').value=${JSON.stringify(name)};document.querySelector('#form-profile').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));document.querySelectorAll('.modal-backdrop').forEach(el=>el.classList.add('hidden'));void 0`);
    await require('./conta-atividades.cjs')(win, name, { click, js, until });
    await click(win, '#channel-geral .channel-row');
    await until(win, 'appState.currentChannelId === "geral"');
    await click(win, '#btn-atividades');
    await until(win, '!document.querySelector("#salao-jogos").hidden');
    return win;
  }
  const a = await open('Cast');
  await print(a, '0-salao');
  await click(a, '.salao-cartao[data-jogo="comilanca"]');
  await until(a, '!document.querySelector("#jogo-comilanca").hidden && document.querySelector("#titulo-21").textContent === "Comilança"');
  // A grade de exemplo aparece sozinha, com os 4 amigos.
  await until(a, 'document.querySelectorAll(".comilanca-amigo").length === 4 && !document.querySelector(".comilanca-girar").disabled', 300);
  await print(a, '1-exemplo');
  await click(a, '.comilanca-turbo');
  for (let i = 0; i < 3; i++) {
    const antes = await saldo(a);
    await click(a, '.comilanca-girar');
    await until(a, 'document.querySelector(".comilanca-girar").disabled');
    await until(a, `document.querySelectorAll(".comilanca-historico span").length === ${i + 1} && !document.querySelector(".comilanca-girar").disabled`, 5000);
    const premio = Number(await js(a, 'document.querySelector(".comilanca-historico span").textContent.replace(/\\D/g, "")'));
    await until(a, `Number(document.querySelector("#carteira-21").lastElementChild.textContent.replace(/\\D/g, "")) === ${antes - 10 + premio}`);
  }
  await print(a, '2-depois');
  // Auto: escolhe 10 giros, o botão vira Parar com a contagem, e Parar encerra depois do giro atual.
  await click(a, '.comilanca-auto-botao');
  await until(a, '!document.querySelector(".comilanca-auto-menu").hidden');
  await print(a, '2b-menu-auto');
  await click(a, '[data-auto="10"]');
  await until(a, 'document.querySelector(".comilanca-girar").textContent.startsWith("Parar")');
  await wait(2500);
  await print(a, '2c-girando');
  await click(a, '.comilanca-girar');
  await until(a, 'document.querySelector(".comilanca-girar").textContent === "Girar" && !document.querySelector(".comilanca-girar").disabled', 5000);
  // Vitória grande (forçada só na tela, pra conferir o desenho).
  await js(a, 'const v = document.querySelector(".comilanca-vitoria"); v.hidden = false; v.dataset.faixa = "1"; document.querySelector(".comilanca-faixa").textContent = "Mega win"; document.querySelector(".comilanca-contador").textContent = "1.250"; void 0');
  await wait(400);
  await print(a, '2d-vitoria');
  await js(a, 'document.querySelector(".comilanca-vitoria").hidden = true; void 0');
  // Sem conta: não gira.
  const c = await open('Caio', 420, 860);
  await click(c, '.salao-cartao[data-jogo="comilanca"]');
  await until(c, '!document.querySelector("#jogo-comilanca").hidden');
  await wait(1500);
  await print(c, '3-celular');

  if (errors.length) throw Error('Erros na interface: ' + errors.join(' | '));
  console.log('Comilança ok');
  app.exit(0);
}).catch(err => { console.error(err); app.exit(1); });
