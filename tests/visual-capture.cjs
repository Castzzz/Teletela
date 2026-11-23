// Tira prints de um visual nos 3 temas, sem abrir janela: início, call com duas pessoas,
// chat, configurações e celular. Uso: VISUAL=aconchego OUT=/tmp/prints electron tests/visual-capture.cjs
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { registerAppScheme, handleAppProtocol, roomUrl } = require('../electron/app-protocol.cjs');
registerAppScheme();
app.disableHardwareAcceleration();
const visual = process.env.VISUAL || 'aconchego', out = process.env.OUT || path.join(os.tmpdir(), 'teletela-prints');
const temas = (process.env.TEMAS || 'escuro,preto,claro').split(',');
fs.mkdirSync(out, { recursive: true });
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'teletela-visual-'));
app.setPath('userData', path.join(directory, 'electron'));
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('use-fake-ui-for-media-stream');
app.commandLine.appendSwitch('use-fake-device-for-media-stream');
app.on('window-all-closed', () => {});
process.env.TELINHA_DATA_DIR = path.join(directory, 'data'); process.env.SFU_SECRET = ''; process.env.TELINHA_MUSIC = '0';
fs.mkdirSync(path.join(process.env.TELINHA_DATA_DIR, 'text'), { recursive: true });
fs.writeFileSync(path.join(process.env.TELINHA_DATA_DIR, 'channels.json'), JSON.stringify({
  channels: [{ id: 'jogatina', name: 'Jogatina' }, { id: 'cinema', name: 'Cinema da madrugada' }],
  textChannels: [{ id: 'resenha', name: 'resenha' }]
}));
const agora = Date.now();
const conversa = [['Bia', 'alguém vai entrar hoje?'], ['Cast', 'tô chegando, só terminando a janta'], ['Bia', 'bora ver aquele filme que o Lucas falou'], ['Lucas', 'é longo, 2h40, preparem a pipoca'], ['Cast', 'fechou, eu transmito']];
fs.writeFileSync(path.join(process.env.TELINHA_DATA_DIR, 'text', 'resenha.jsonl'),
  conversa.map(([userName, text], i) => JSON.stringify({ id: 'm' + i, channelId: 'resenha', userName, text, timestamp: agora - (conversa.length - i) * 60000 })).join('\n') + '\n');
const pause = ms => new Promise(r => setTimeout(r, ms));
const js = (win, code) => win.webContents.executeJavaScript(code);
async function until(win, cond) { for (let i = 0; i < 160; i++) { if (await js(win, cond)) return; await pause(75); } throw new Error('Estado não chegou: ' + cond); }
setTimeout(() => { console.error('Tempo esgotado'); app.exit(1); }, 90000);
app.whenReady().then(async () => {
  const prefs = new Map();
  ipcMain.handle('prefs-get', e => prefs.get(e.sender.id) || {});
  ipcMain.handle('prefs-set', (e, patch) => { prefs.set(e.sender.id, { ...prefs.get(e.sender.id), ...patch }); return true; });
  ipcMain.handle('get-game-activity', () => ({ activity: null })); ipcMain.handle('set-global-hotkeys', () => ({}));
  ipcMain.handle('autostart-get', () => ({ supported: false })); ipcMain.handle('autostart-set', () => ({ supported: false }));
  const backend = await import('../server.js'); const server = await backend.startServer(0, '127.0.0.1');
  async function open(name, color) {
    const win = new BrowserWindow({ width: 1440, height: 900, show: false, webPreferences: { partition: 'visual-' + name, preload: path.join(__dirname, '../electron/preload.cjs'), offscreen: true, backgroundThrottling: false } });
    prefs.set(win.webContents.id, { visual, profile: { id: 'visual-' + name, name, color }, seenWhatsNew: '99', micOn: false });
    handleAppProtocol(win.webContents.session); await win.loadURL(roomUrl('http://127.0.0.1:' + server.address().port));
    await until(win, 'Boolean(window.appState?.myId && document.querySelector("#channel-geral"))');
    await js(win, "document.querySelectorAll('.modal-backdrop').forEach(el=>el.classList.add('hidden'));void 0");
    win.setSize(1441, 900); await pause(100); win.setSize(1440, 900); // o offscreen só pinta depois de um resize
    return win;
  }
  const eu = await open('Cast', '#e8590c'), bia = await open('Bia', '#2f9e44');
  const shot = async (win, nome) => { await pause(250); fs.writeFileSync(path.join(out, nome + '.png'), (await win.webContents.capturePage()).toPNG()); };
  const tema = (win, t) => js(win, `document.documentElement.dataset.theme='${t}';void 0`);
  for (const t of temas) { await tema(eu, t); await shot(eu, `inicio-${t}`); }
  for (const win of [eu, bia]) { await js(win, "document.querySelector('#channel-geral .channel-row').click();void 0"); await until(win, "appState.currentChannelId === 'geral'"); }
  for (const t of temas) { await tema(eu, t); await shot(eu, `call-${t}`); }
  if (process.env.EVAL) console.log('EVAL', await js(eu, process.env.EVAL));
  // Alguém chegando com a call aberta e alguém falando (a fala é simulada só na tela).
  const lucas = await open('Lucas', '#1971c2');
  await js(lucas, "document.querySelector('#channel-geral .channel-row').click();void 0");
  await until(eu, "document.querySelectorAll('#lounge-users-grid > .lounge-user-card[data-user-id]').length === 3");
  await pause(80); fs.writeFileSync(path.join(out, 'chegada.png'), (await eu.webContents.capturePage()).toPNG());
  await js(eu, "document.querySelector('#lounge-users-grid > .lounge-user-card[data-user-id] .user-avatar-wrap').classList.add('is-speaking');void 0");
  for (const t of temas) { await tema(eu, t); await shot(eu, `fala-${t}`); }
  if (process.env.EVAL2) console.log('EVAL', await js(eu, process.env.EVAL2));
  await js(eu, "document.querySelector('[data-text-channel-id=resenha] .channel-row, [data-text-channel-id=resenha]').click();void 0"); await pause(400);
  for (const t of temas) { await tema(eu, t); await shot(eu, `chat-${t}`); }
  await js(eu, "document.querySelector('#btn-open-settings').click();void 0"); await until(eu, '!document.querySelector("#modal-settings").classList.contains("hidden")');
  for (const t of temas) { await tema(eu, t); await shot(eu, `config-${t}`); }
  await js(eu, "document.querySelectorAll('.modal-backdrop').forEach(el=>el.classList.add('hidden'));void 0");
  eu.setSize(390, 844); await pause(300); await tema(eu, temas[0]); await shot(eu, 'celular');
  console.log('Prints em', out); app.exit(0);
}).catch(e => { console.error(e); app.exit(1); });
