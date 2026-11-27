// Seu cassino de ponta a ponta: duas contas, comprar, coletar, plantar, colher, visitar e ajudar.
// Rodar: env -u DISPLAY WAYLAND_DISPLAY=teletela-teste-sem-monitor /usr/lib/electron42/electron \
//   --ozone-platform=headless --disable-gpu tests/cassino-browser.cjs
// Com PRINTS=/alguma/pasta, salva prints. Liga o servidor de teste (pular o tempo, amigos de mentira).
const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const { registerAppScheme, handleAppProtocol, roomUrl } = require('../electron/app-protocol.cjs');
registerAppScheme();
app.on('window-all-closed', () => {});
const profile = require('node:fs').mkdtempSync(path.join(os.tmpdir(), 'teletela-cassino-ui-'));
app.setPath('userData', profile);
process.env.TELINHA_DATA_DIR = path.join(profile, 'servidor');
process.env.TELINHA_CASSINO_TESTE = '1';
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
  await wait(900);
  await fs.writeFile(path.join(PRINTS, nome + '.png'), (await win.webContents.capturePage()).toPNG());
}

app.whenReady().then(async () => {
  const backend = await import('../server.js');
  const server = await backend.startServer(0, '127.0.0.1'); handleAppProtocol();
  async function open(name, largura = 1440, altura = 960, tema = null) {
    const win = new BrowserWindow({ width: largura, height: altura, show: false, webPreferences: { partition: `cassino-${name}`, offscreen: true, backgroundThrottling: false } });
    handleAppProtocol(win.webContents.session);
    win.webContents.on('console-message', event => { if (event.level === 'error') { errors.push(event.message); console.error('[Interface]', event.sourceId, event.lineNumber, event.message); } });
    await win.loadURL(roomUrl(`http://127.0.0.1:${server.address().port}`));
    win.setSize(largura + 1, altura); await wait(100); win.setSize(largura, altura);
    await until(win, 'Boolean(window.appState && document.querySelector("#channel-geral"))');
    await js(win, `document.querySelector('#input-profile-name').value=${JSON.stringify(name)};document.querySelector('#form-profile').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));document.querySelectorAll('.modal-backdrop').forEach(el=>el.classList.add('hidden'));void 0`);
    await require('./conta-atividades.cjs')(win, name, { click, js, until });
    if (tema) await js(win, `document.documentElement.dataset.theme=${JSON.stringify(tema)};void 0`);
    await click(win, '#channel-geral .channel-row');
    await until(win, 'appState.currentChannelId === "geral"');
    await click(win, '#btn-atividades');
    await until(win, '!document.querySelector("#salao-jogos").hidden');
    return win;
  }
  const a = await open('Cast');
  await until(a, 'document.querySelector(".salao-cartao[data-jogo=cassino] .salao-status").textContent.includes("primeira máquina")');
  await print(a, '0-salao');
  await click(a, '.salao-cartao[data-jogo="cassino"]');
  await until(a, '!document.querySelector("#jogo-cassino").hidden && !document.querySelector(".cassino-jogo").hidden');
  if (await js(a, 'document.querySelector("#titulo-21").textContent') !== 'Seu cassino') throw Error('Título errado');
  await until(a, '!document.querySelector(".cassino-teste").hidden');

  // Compra 6 caça-níqueis: a carteira do cabeçalho acompanha.
  const saldo = () => js(a, 'Number(document.querySelector("#carteira-21").lastElementChild.textContent.replace(/\\D/g, ""))');
  const antes = await saldo();
  for (let i = 0; i < 6; i++) {
    await click(a, '[data-tipo="maquina"][data-id="caca"]');
    await until(a, `document.querySelectorAll(".cassino-slot:not(.grande)").length === ${i + 1}`);
  }
  if (await saldo() >= antes) throw Error('A carteira não desceu');
  await click(a, '[data-pular="3600000"]');
  await until(a, 'Number(document.querySelector(".cassino-cofre-valor").textContent) >= 18');
  await print(a, '1-cassino');
  await click(a, '.cassino-coletar');
  await until(a, 'document.querySelector(".cassino-cofre-valor").textContent === "0"');

  // Fazenda: planta milho no primeiro canteiro e nos vazios, pula 1 hora e colhe tudo.
  await click(a, '[data-cena-aba="roca"]');
  await until(a, 'document.querySelectorAll(".faz-canteiro:not(.bloqueado)").length === 3 && document.querySelectorAll(".faz-canteiro.bloqueado").length === 17');
  // a cena do cassino some e os canteiros têm o estilo da fazenda
  await until(a, '!document.querySelector(".cassino-sala").offsetWidth && document.querySelector(".faz-canteiro").offsetWidth >= 32 && !document.querySelector(".cassino-celeiro").hidden && document.querySelector(".cassino-loja-titulo").textContent === "Loja da fazenda"');
  await click(a, '.faz-canteiro[data-canteiro="0"]');
  await until(a, '!document.querySelector(".cassino-sementes").hidden');
  await print(a, '2-sementes');
  await click(a, '.cassino-sementes [data-semente="milho"]');
  await until(a, '!document.querySelector(".faz-canteiro[data-canteiro=\\"0\\"]").classList.contains("vazio")');
  await click(a, '[data-roca="plantar"]');
  await until(a, '!document.querySelector(".cassino-sementes").hidden');
  await click(a, '.cassino-sementes [data-semente="milho"][data-modo="vazios"]');
  await until(a, '!document.querySelector(".faz-canteiro.vazio")');
  await click(a, '[data-pular="3600000"]');
  await until(a, 'document.querySelectorAll(".faz-canteiro.pronto").length === 3');
  await print(a, '3-roca-pronta');
  await click(a, '[data-roca="colher"]');
  await until(a, 'document.querySelector(".cassino-celeiro").textContent.includes("3 de 60")');

  // Loja: equipe e sementes.
  await click(a, '[data-cena-aba="cassino"]');
  await until(a, 'document.querySelector(".cassino-celeiro").hidden && document.querySelector(".cassino-loja-titulo").textContent === "Loja do cassino"');
  await until(a, 'document.querySelector(".cassino-loja-lista").textContent.includes("Barman")');

  // Amigos de mentira (servidor de teste): visitar o GG e ajudar.
  await click(a, '[data-cena-aba="amigos"]');
  await until(a, 'document.querySelectorAll(".cassino-amigo").length === 3');
  await print(a, '4-amigos');
  await click(a, '[data-visitar="demo-gg"]');
  await until(a, '!document.querySelector(".cassino-visitando").hidden && document.querySelectorAll(".obj-poker").length === 2');
  const antesAjuda = await saldo();
  await click(a, '.cassino-ajudar');
  await until(a, 'document.querySelector(".cassino-ajudar").disabled');
  await until(a, `Number(document.querySelector("#carteira-21").lastElementChild.textContent.replace(/\\D/g, "")) > ${antesAjuda}`);
  await print(a, '5-visita-gg');
  await click(a, '.cassino-voltar');
  await until(a, 'document.querySelector(".cassino-visitando").hidden');

  // Editar o salão: com o foco num caça-níquel, a seta pra baixo move uma célula e o servidor guarda.
  await click(a, '[data-cena-aba="cassino"]');
  await click(a, '.cassino-editar');
  await until(a, 'document.querySelector(".cassino-sala").classList.contains("editando")');
  const yAntes = Number(await js(a, 'document.querySelector(".obj-caca[data-i=\\"0\\"]").style.getPropertyValue("--y")'));
  await js(a, 'const o = document.querySelector(".obj-caca[data-i=\\"0\\"]"); o.focus(); o.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })); void 0');
  await until(a, `document.querySelector(".obj-caca[data-i=\\"0\\"]").style.getPropertyValue("--y") === "${yAntes + 1}"`);
  await print(a, '7-editar');
  await click(a, '.cassino-editar');
  await until(a, '!document.querySelector(".cassino-sala").classList.contains("editando")');
  // Em 1080p o cassino cabe sem rolar a mesa.
  const c = await open('Caio', 1920, 1080);
  await click(c, '.salao-cartao[data-jogo="cassino"]');
  await until(c, '!document.querySelector(".cassino-jogo").hidden && document.querySelector(".cassino-sala").offsetWidth > 0');
  await wait(400);
  const rola = await js(c, 'const m = document.querySelector("#mesa-21"); m.scrollHeight - m.clientHeight');
  if (rola > 1) throw Error('A mesa rola ' + rola + ' px em 1080p');
  await print(c, '8-1080p');

  // Tema claro e celular só pra print.
  const b = await open('Bia', 420, 860, 'claro');
  await click(b, '.salao-cartao[data-jogo="cassino"]');
  await until(b, '!document.querySelector(".cassino-jogo").hidden');
  await print(b, '6-celular-claro');
  await click(b, '[data-cena-aba="amigos"]');
  await until(b, 'document.querySelectorAll(".cassino-amigo").length === 5');

  if (errors.length) throw Error('Erros na interface: ' + errors.join(' | '));
  console.log('Cassino ok');
  app.exit(0);
}).catch(err => { console.error(err); app.exit(1); });
