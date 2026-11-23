const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), assert = require('node:assert/strict');
const { registerAppScheme, handleAppProtocol, roomUrl } = require('../electron/app-protocol.cjs');
registerAppScheme(); app.disableHardwareAcceleration();
app.commandLine.appendSwitch('use-fake-device-for-media-stream');
app.commandLine.appendSwitch('use-fake-ui-for-media-stream');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.on('window-all-closed', () => {});
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'teletela-controles-amigos-ui-'));
app.setPath('userData', path.join(dir, 'electron'));
process.env.TELINHA_DATA_DIR = path.join(dir, 'data'); process.env.TELINHA_MUSIC = '0'; if (!process.env.PRIVATE_CALL_TEST) process.env.SFU_SECRET = '';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const js = (win, code) => win.webContents.executeJavaScript(code, true).catch(error => {
  throw new Error('Falha no Electron: ' + code.slice(0, 180), { cause: error });
});
const click = (win, selector) => js(win, `document.querySelector(${JSON.stringify(selector)}).click();void 0`);
async function until(win, code) { for (let i = 0; i < 160; i++) { if (await js(win, code)) return; await pause(50); } throw new Error('Estado esperado: ' + code); }
const windows = [], prefs = new Map(); let backend, failPrefs = false;
const timeout = setTimeout(() => { console.error('Tempo esgotado'); app.exit(1); }, 120000);
app.whenReady().then(async () => {
  ipcMain.handle('prefs-get', event => prefs.get(event.sender.id) || {});
  ipcMain.handle('prefs-set', (event, patch) => { if (failPrefs) return false; prefs.set(event.sender.id, { ...prefs.get(event.sender.id), ...patch }); return true; });
  ipcMain.handle('get-game-activity', () => ({ activity: null })); ipcMain.handle('set-global-hotkeys', () => ({}));
  ipcMain.handle('autostart-get', () => ({ supported: false })); ipcMain.handle('system-idle-seconds', () => 0);
  backend = await import('../server.js'); const server = await backend.startServer(0, '127.0.0.1');
  const url = `http://127.0.0.1:${server.address().port}`;
  async function open(name) {
    const win = new BrowserWindow({ width: 1180, height: 900, show: false, webPreferences: { partition: 'amigos-' + name, preload: path.join(__dirname, '../electron/preload.cjs'), offscreen: true, backgroundThrottling: false } });
    windows.push(win); prefs.set(win.webContents.id, { profile: { id: 'amigos-ui-' + name, name, color: '#5865F2' }, seenWhatsNew: '99', micOn: false });
    handleAppProtocol(win.webContents.session); await win.loadURL(roomUrl(url)); await until(win, 'Boolean(window.appState?.myId)');
    await js(win, "document.querySelectorAll('.modal-backdrop').forEach(el=>el.classList.add('hidden'));void 0"); return win;
  }
  async function account(win, username) {
    await click(win, '#btn-open-settings'); await click(win, '[data-settings-tab=conta]'); await click(win, '[data-account-mode=register]');
    await js(win, `document.querySelector('#account-user').value=${JSON.stringify(username)};document.querySelector('#account-password').value='senha-dos-testes';document.querySelector('#account-confirm').value='senha-dos-testes';document.querySelector('#account-form').requestSubmit();void 0`);
    await until(win, "!document.querySelector('#account-recovery-result').classList.contains('hidden')");
    assert.match(await js(win, "document.querySelector('#account-recovery-code').textContent"), /^[a-f0-9-]{53}$/);
    await until(win, "document.querySelector('#account-status').textContent.includes('vinculado')");
    const loaded = new Promise(resolve => win.webContents.once('did-finish-load', resolve)); await click(win, '#account-continue'); await loaded;
    await until(win, 'Boolean(window.appState?.myId)');
    await click(win, '#friends-open');
    await until(win, "!document.querySelector('#friends-content').classList.contains('hidden')");
  }
  const a = await open('Cast'), b = await open('Amigo'); await account(a, 'cast_teste'); await account(b, 'amigo_teste');
  await click(a, '[data-filter=add]'); await click(b, '[data-filter=requests]');
  await js(a, "document.querySelector('#friend-username').value='@amigo_teste';document.querySelector('#friends-form').requestSubmit();void 0");
  await until(b, 'Boolean(document.querySelector("#friends-incoming button"))');
  await click(b, '#friends-incoming button'); await until(a, "document.querySelector('#friends-list').textContent.includes('Online')");
  await click(a, '[data-filter=friends]'); await click(b, '[data-filter=friends]');
  if (process.env.PRIVATE_CALL_TEST) {
    await click(a, '#friends-list [aria-label^="Ligar"]');
    await until(b, "document.querySelector('#private-dialog').open");
    await click(b, '#private-end');
    await until(a, "!document.querySelector('#private-dialog').open");
    await click(a, '#friends-list [aria-label^="Ligar"]');
    await until(b, "document.querySelector('#private-dialog').open");
    await click(b, '#private-answer');
    for (const win of [a, b]) await until(win, "document.querySelector('#private-audio').currentTime > 0.2");
    await click(a, '#private-mute');
    assert.equal(await js(a, "document.querySelector('#private-mute').getAttribute('aria-pressed')"), 'true');
    await click(b, '#private-end'); await until(a, "!document.querySelector('#private-dialog').open");
    console.log('Voz recebida nos dois sentidos pelo SFU, recusa, mute e desligamento conferidos.');
  }
  const friendAvatar = await js(b, `(()=>{
    const canvas=document.createElement('canvas');canvas.width=80;canvas.height=80;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#44bb55';ctx.fillRect(0,0,80,80);
    return canvas.toDataURL();
  })()`);
  const photoSocket = require('socket.io-client').io(url, { autoConnect: false, transports: ['websocket'], reconnection: false,
    auth: { accountToken: prefs.get(b.webContents.id).accountSessions[url].token } });
  try {
    await new Promise(resolve => { photoSocket.once('connect', resolve); photoSocket.connect(); });
    await photoSocket.timeout(2000).emitWithAck('update-profile', { avatar: friendAvatar, avatarCrop: { x:.2, y:.8, zoom:2 } });
  } finally { photoSocket.disconnect(); }
  await until(a, "Boolean(document.querySelector('#friends-list img')?.naturalWidth)");
  assert.equal(await js(a, "document.querySelector('#friends-list img').style.width"), '200%');
  assert.equal(await js(a, "getComputedStyle(document.querySelector('#friends-list .friend-avatar-frame')).overflow"), 'hidden');
  for (const theme of ['escuro', 'preto', 'claro']) {
    await js(a, `document.documentElement.dataset.theme='${theme}';void 0`); await pause(100);
    fs.writeFileSync(`/tmp/teletela-amigos-${theme}.png`, (await a.webContents.capturePage()).toPNG());
  }
  b.setSize(390, 844); await pause(200); await click(b, '.mobile-nav [data-mobile-view="amigos"]');
  await until(b, "document.body.dataset.mobileView === 'amigos' && document.querySelector('#friends-page').offsetWidth > 0"); await pause(150);
  assert(await js(b, 'document.documentElement.scrollWidth <= innerWidth'));
  fs.writeFileSync('/tmp/teletela-amigos-celular.png', (await b.webContents.capturePage()).toPNG());
  await click(a, '#friends-list .friend-actions button');
  await until(a, "document.querySelector('#dm-dialog').open && !document.querySelector('#dm-thread').hidden");
  a.setSize(2560, 1440); await pause(150);
  assert(await js(a, "document.querySelector('#dm-dialog').getBoundingClientRect().width >= 1000"));
  async function pasteImage(win) {
    await js(win, `(async()=>{
      const blob=await (await fetch('${friendAvatar}')).blob();
      const data=new DataTransfer();data.items.add(new File([blob],'foto.png',{type:'image/png'}));
      document.querySelector('#dm-input').dispatchEvent(new ClipboardEvent('paste',{bubbles:true,clipboardData:data}));
    })()`);
  }
  await pasteImage(a);
  await until(a, "Boolean(document.querySelector('#dm-attachment-draft img')?.naturalWidth)");
  assert.equal(await js(b, "document.querySelector('#friends-open .friends-unread-dot').hidden"), true);
  await click(a, '#dm-attachment-draft button');
  assert(await js(a, "document.querySelector('#dm-attachment-draft').hidden"));
  await pasteImage(a);
  await js(a, "document.querySelector('#dm-input').focus()");
  a.webContents.sendInputEvent({type:'keyDown',keyCode:'Enter'}); a.webContents.sendInputEvent({type:'char',keyCode:'\r'}); a.webContents.sendInputEvent({type:'keyUp',keyCode:'Enter'});
  await until(a, "Boolean(document.querySelector('#dm-log img')?.naturalWidth) && document.querySelector('#dm-attachment-draft').hidden").catch(async error => {
    throw new Error(await js(a, "JSON.stringify({status:document.querySelector('#dm-status').textContent,log:document.querySelector('#dm-log').textContent,preview:!document.querySelector('#dm-attachment-draft').hidden})"), {cause:error});
  });
  await fs.promises.writeFile('/tmp/teletela-dm-1440p.png', (await a.webContents.capturePage()).toPNG());
  a.setSize(1180, 900);
  await js(a, "document.querySelector('#dm-input').value='Só entre nós';document.querySelector('#dm-compose').requestSubmit();void 0");
  const aviso = "Array.from(document.querySelectorAll('.friends-unread-dot')).every(dot => !dot.hidden)";
  await until(b, aviso);
  await b.loadURL(roomUrl(url));
  await until(b, aviso);
  await click(b, '.mobile-nav [data-mobile-view="amigos"]');
  await until(b, "document.querySelector('#friends-list .friend-unread-label')?.checkVisibility()");
  await pause(150);
  fs.writeFileSync('/tmp/teletela-amigos-aviso-mobile.png', (await b.webContents.capturePage()).toPNG());
  b.setSize(1180, 900); await pause(200);
  await click(b, '#friends-open'); await pause(150);
  fs.writeFileSync('/tmp/teletela-amigos-aviso-desktop.png', (await b.webContents.capturePage()).toPNG());
  b.setSize(390, 844); await pause(200);
  await click(b, '.mobile-nav [data-mobile-view="amigos"]');
  await click(b, '#friends-list [aria-label^="Conversar"]');
  await until(b, "document.querySelector('#dm-log').textContent.includes('Só entre nós')");
  await until(b, "Boolean(document.querySelector('#dm-log img')?.naturalWidth)");
  await until(b, "document.querySelector('#friends-list .friend-unread-label').hidden && Array.from(document.querySelectorAll('.friends-unread-dot')).every(dot => dot.hidden)");
  assert.equal(await js(b, "document.querySelector('#dm-dialog').getBoundingClientRect().width<=innerWidth"), true);
  fs.writeFileSync('/tmp/teletela-conversa-celular.png', (await b.webContents.capturePage()).toPNG());
  await js(a, `(async()=>{
    const canvas=document.createElement('canvas');canvas.width=96;canvas.height=64;
    const ctx=canvas.getContext('2d'),stream=canvas.captureStream(10);
    const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8'}), chunks=[];
    recorder.ondataavailable=e=>chunks.push(e.data);
    const stopped=new Promise(resolve=>recorder.onstop=resolve);recorder.start();
    for(const color of ['red','blue','green','orange']) {
      ctx.fillStyle=color;ctx.fillRect(0,0,96,64);await new Promise(resolve=>setTimeout(resolve,125));
    }
    recorder.stop();await stopped;stream.getTracks().forEach(track=>track.stop());
    const picker=document.querySelector('#dm-picker'), transfer=new DataTransfer();
    transfer.items.add(new File(chunks,'teste.webm',{type:'video/webm'}));
    picker.files=transfer.files;picker.dispatchEvent(new Event('change'));
  })()`);
  await click(a, '#dm-compose [type=submit]');
  await until(b, "document.querySelector('#dm-log video')?.readyState >= 1");
  await js(b, "document.querySelector('#dm-log video').play()");
  await until(b, "document.querySelector('#dm-log video').currentTime > 0");
  await js(a, `(()=>{
    const data=new DataTransfer();data.items.add(new File(['conteúdo particular'],'nota.txt',{type:'text/plain'}));
    document.querySelector('#dm-dialog').dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:data}));
    document.querySelector('#dm-compose').requestSubmit();
  })()`);
  await until(b, "Boolean(document.querySelector('#dm-log a[download=\"nota.txt\"]'))");
  const saved = path.join(dir,'nota-baixada.txt');
  const received = new Promise((resolve,reject)=>b.webContents.session.once('will-download',(_event,item)=>{
    item.setSavePath(saved);item.once('done',(_event,state)=>state==='completed'?resolve():reject(new Error(state)));
  }));
  await click(b,'#dm-log a[download="nota.txt"]'); await received;
  assert.equal(fs.readFileSync(saved,'utf8'),'conteúdo particular');
  await click(a, '#dm-close'); await click(b, '#dm-close');
  await click(a, '#btn-open-settings'); await click(a, '[data-settings-tab=conta]'); failPrefs = true; await click(a, '#account-logout');
  await until(a, "document.querySelector('#account-feedback').textContent.includes('Não foi possível salvar')"); failPrefs = false;
  assert(prefs.get(a.webContents.id).accountSessions[url]?.token);
  await click(a, '#btn-settings-done'); await click(a, '#friends-open');
  await click(a, '#friends-list summary'); await click(a, '#friends-list button[aria-label^="Remover"]'); await until(b, "document.querySelector('#friends-list').textContent.includes('Nenhum amigo')");
  // Reabrir preserva conta e perfil, sem publicar o visitante salvo no aparelho.
  await a.webContents.reload(); await until(a, 'Boolean(window.appState?.myId)');
  await click(a, '#btn-open-settings'); await click(a, '[data-settings-tab=conta]'); await until(a, "document.querySelector('#account-username').textContent === '@cast_teste'");
  await click(a, '#account-logout'); await until(a, "document.querySelector('#account-status').textContent.includes('sem conta')");
  await js(a, "document.querySelectorAll('.modal-backdrop').forEach(el=>el.classList.add('hidden'));document.querySelector('#channel-geral .channel-row').click();void 0");
  await until(a, 'Boolean(appState.currentChannelId)');
  await js(a, `(async()=>{
    const canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#18243c';ctx.fillRect(0,0,960,540);
    ctx.fillStyle='#b3c9ff';ctx.font='36px sans-serif';ctx.fillText('Transmissão de teste',100,260);
    window.fixtureStream=canvas.captureStream(5);
    const tile=document.createElement('div');tile.className='video-tile';tile.id='video-tile-controles';
    const video=document.createElement('video');video.muted=true;video.autoplay=true;video.srcObject=fixtureStream;tile.append(video);
    document.querySelector('#videos-grid').append(tile);document.querySelector('#videos-grid').classList.remove('hidden');document.querySelector('#voice-lounge').classList.add('hidden');
    appState.activeStreams.set('controles',{stream:fixtureStream,userName:'Teste',isLocal:true});appState.focusedStreamUserId='controles';await video.play();
  })()`);
  async function hideAndReveal() {
    await js(a, 'document.activeElement?.blur();void 0');
    a.webContents.sendInputEvent({ type: 'mouseMove', x: 350, y: 200 });
    await until(a, "document.body.classList.contains('stage-controls-idle')"); await pause(250);
    assert.equal(await js(a, "getComputedStyle(document.querySelector('#stage-controls-bar')).opacity"), '0');
    fs.writeFileSync('/tmp/teletela-controles-ocultos.png', (await a.webContents.capturePage()).toPNG());
    a.webContents.sendInputEvent({ type: 'mouseMove', x: 360, y: 210 });
    await until(a, "!document.body.classList.contains('stage-controls-idle')");
    await js(a, "document.querySelector('#btn-stage-fullscreen').focus();void 0");
    a.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Tab' }); a.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Tab' });
    assert(await js(a, "!document.body.classList.contains('stage-controls-idle')"));
    await js(a, "document.activeElement?.blur();document.querySelector('#stage-controls-bar').dispatchEvent(new PointerEvent('pointerenter',{pointerType:'mouse'}));void 0");
    await pause(3250); assert(await js(a, "!document.body.classList.contains('stage-controls-idle')"));
    await js(a, "document.querySelector('#stage-controls-bar').dispatchEvent(new PointerEvent('pointerleave',{pointerType:'mouse'}));void 0");
  }
  for (const selector of ['#videos-grid', '#video-tile-controles']) {
    await js(a, `document.querySelector('${selector}').requestFullscreen()`);
    await hideAndReveal(); await js(a, 'document.exitFullscreen()');
    await until(a, "!document.fullscreenElement && !document.body.classList.contains('stage-controls-idle')");
  }
  await js(a, "document.body.classList.add('stage-fullscreen');void 0"); await hideAndReveal();
  await js(a, "document.body.classList.remove('stage-fullscreen');void 0");
  await until(a, "!document.body.classList.contains('stage-controls-idle')");
  console.log('Contas: cadastro, recuperação exibida, sessão ao reabrir, falha ao salvar logout e saída. Amigos: pedido, aceite, sincronização, remoção e três temas/celular. Tela cheia: vídeo, mosaico, alternativa CSS, inatividade, mouse, teclado e interação nos controles passaram.');
}).then(() => finish(0)).catch(error => { console.error(error); finish(1); });
async function finish(code) { clearTimeout(timeout); windows.forEach(win => win.destroy()); if (backend) await new Promise(resolve => backend.io.close(resolve)); fs.rmSync(dir, { recursive: true, force: true }); app.exit(code); }
