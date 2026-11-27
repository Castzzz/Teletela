// Roleta de ponta a ponta: duas contas na mesma call apostam, ficam prontas, a roda gira e paga.
// Rodar: env -u DISPLAY WAYLAND_DISPLAY=teletela-teste-sem-monitor /usr/lib/electron42/electron \
//   --ozone-platform=headless --disable-gpu tests/roleta-browser.cjs
// Com PRINTS=/alguma/pasta, salva prints.
const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const { registerAppScheme, handleAppProtocol, roomUrl } = require('../electron/app-protocol.cjs');
registerAppScheme();
app.on('window-all-closed', () => {});
const profile = require('node:fs').mkdtempSync(path.join(os.tmpdir(), 'teletela-roleta-ui-'));
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
    const win = new BrowserWindow({ width: largura, height: altura, show: false, webPreferences: { partition: `roleta-${name}`, offscreen: true, backgroundThrottling: false } });
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
  const b = await open('Bia');
  await until(a, 'document.querySelector(".salao-cartao[data-jogo=roleta] .salao-status").textContent === "Ninguém jogando"');
  await print(a, '0-salao');
  for (const w of [a, b]) {
    await click(w, '.salao-cartao[data-jogo="roleta"]');
    await until(w, '!document.querySelector("#jogo-roleta").hidden && document.querySelector("#titulo-21").textContent === "Roleta"');
    await until(w, 'document.querySelectorAll(".casa-roleta").length === 49');
  }
  const antesA = await saldo(a), antesB = await saldo(b);

  // Cast: ficha de 25 no 17 e de 10 no vermelho. Bia: 100 no preto.
  await click(a, '#fichas-roleta [data-valor="25"]');
  await click(a, '.casa-roleta[data-alvo="n17"]');
  await until(a, 'document.querySelector("#jogo-roleta").dataset.fase === "apostando" && document.querySelector(".casa-roleta[data-alvo=n17] .marca-roleta")?.textContent === "25"');
  await click(a, '#fichas-roleta [data-valor="10"]');
  await click(a, '.casa-roleta[data-alvo="vermelho"]');
  await click(b, '#fichas-roleta [data-valor="100"]');
  await click(b, '.casa-roleta[data-alvo="preto"]');
  // Os dois veem as fichas dos dois.
  await until(a, 'document.querySelector(".casa-roleta[data-alvo=preto] .marca-roleta")?.textContent === "100"');
  await until(b, 'document.querySelector(".casa-roleta[data-alvo=n17] .marca-roleta")?.textContent === "25"');
  await until(a, `Number(document.querySelector("#carteira-21").lastElementChild.textContent.replace(/\\D/g, "")) === ${antesA - 35}`);
  await until(a, 'document.querySelector(".salao-cartao[data-jogo=roleta] .salao-status").textContent === "Apostas abertas · 2 pessoas"');
  // O status de um jogo não pode cair no cartão de outro (o palco também tem data-jogo).
  await until(a, 'document.querySelector(".salao-cartao[data-jogo=\'21\'] .salao-status").textContent === "Ninguém jogando"');
  await print(a, '1-apostando');
  // Desfazer tira a última ficha.
  await click(a, '#acoes-roleta [data-acao="desfazer"]');
  await until(a, '!document.querySelector(".casa-roleta[data-alvo=vermelho] .marca-roleta")');
  await click(a, '#acoes-roleta [data-acao="pronto"]');
  await click(b, '#acoes-roleta [data-acao="pronto"]');
  await until(a, 'document.querySelector("#jogo-roleta").dataset.fase === "girando"');
  await print(a, '2-girando');
  await until(a, 'document.querySelector("#jogo-roleta").dataset.fase === "resultado" && !document.querySelector("#placar-roleta").hidden', 260);
  await print(a, '3-resultado');
  const n = Number(await js(a, 'document.querySelector(".historico-roleta li").textContent'));
  const vermelho = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(n);
  const esperadoA = antesA - 25 + (n === 17 ? 900 : 0);
  const esperadoB = antesB - 100 + (n !== 0 && !vermelho ? 200 : 0);
  await until(a, `Number(document.querySelector("#carteira-21").lastElementChild.textContent.replace(/\\D/g, "")) === ${esperadoA}`);
  await until(b, `Number(document.querySelector("#carteira-21").lastElementChild.textContent.replace(/\\D/g, "")) === ${esperadoB}`);
  // A roda parou com o número no topo (o 0 está no topo do desenho).
  const RODA = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  const angulo = await js(a, 'Number(document.querySelector(".roda-img").style.transform.match(/-?[\\d.]+/)[0])');
  const topo = (((angulo + RODA.indexOf(n) * 360 / 37) % 360) + 360) % 360;
  if (Math.min(topo, 360 - topo) > .5) throw Error(`A roda parou fora do número ${n} (${topo}°)`);

  // Salão com 5 cartões em várias telas: nada se sobrepõe, todos do mesmo tamanho, a fileira
  // de baixo centralizada e, de 1600x900 pra cima, sem rolar (em 1366x768 rola um pouco).
  for (const [w, h] of [[1920, 1080], [1745, 980], [1600, 900], [1366, 768], [1100, 800]]) {
    const t = await open('Tela' + w, w, h);
    await new Promise(r => setTimeout(r, 300));
    const m = await js(t, `(() => {
      const cs = [...document.querySelectorAll('#salao-jogos .salao-cartao')].map(e => e.getBoundingClientRect());
      const sobre = cs.some((x, i) => cs.some((y, j) => i < j && x.left < y.right - 1 && y.left < x.right - 1 && x.top < y.bottom - 1 && y.top < x.bottom - 1));
      const larg = Math.round(Math.max(...cs.map(c => c.width)) - Math.min(...cs.map(c => c.width)));
      const lista = document.querySelector('#salao-jogos .salao-cartoes').getBoundingClientRect();
      const ult = cs.filter(c => Math.abs(c.top - cs.at(-1).top) < 2);
      const centro = Math.round(Math.abs((ult[0].left + ult.at(-1).right) / 2 - (lista.left + lista.right) / 2));
      let rola = 0;
      for (let e = document.querySelector('#salao-jogos'); e; e = e.parentElement) if (/(auto|scroll)/.test(getComputedStyle(e).overflowY)) rola = Math.max(rola, e.scrollHeight - e.clientHeight);
      const mi = document.querySelector("#salao-jogos .salao-miolo"); const quem = []; for (let e = document.querySelector("#salao-jogos"); e; e = e.parentElement) if (/(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 1) quem.push((e.id || e.className) + ":" + e.scrollHeight + "/" + e.clientHeight); return { sobre, larg, centro, rola, n: cs.length, mi: Math.round(mi.getBoundingClientRect().width), miw: getComputedStyle(mi).width, quem, vh: innerHeight };
    })()`);
    await print(t, '5-salao-' + w);
    if (m.n !== 5 || m.sobre || m.larg > 2 || m.centro > 2 || (w >= 1600 && m.rola > 1)) throw Error('Salão torto em ' + w + 'x' + h + ': ' + JSON.stringify(m));
    t.destroy();
  }

  // Celular só pra print.
  const c = await open('Caio', 420, 860);
  await click(c, '.salao-cartao[data-jogo="roleta"]');
  await until(c, '!document.querySelector("#jogo-roleta").hidden');
  await print(c, '4-celular');

  if (errors.length) throw Error('Erros na interface: ' + errors.join(' | '));
  console.log('Roleta ok, deu ' + n);
  app.exit(0);
}).catch(err => { console.error(err); app.exit(1); });
