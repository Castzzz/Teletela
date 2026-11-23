// Exercita os controles reais e a atualização de fala sem reabrir a captura ou recriar fotos.
const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const { registerAppScheme, handleAppProtocol, roomUrl } = require('../electron/app-protocol.cjs');
registerAppScheme();
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('use-fake-ui-for-media-stream');
app.commandLine.appendSwitch('use-fake-device-for-media-stream');
const profile = require('node:fs').mkdtempSync(path.join(os.tmpdir(), 'teletela-mic-controles-'));
app.setPath('userData', profile);
app.on('window-all-closed', () => {});
let io, visitante;
app.whenReady().then(async () => {
  const backend = await import('../server.js'); io = backend.io;
  const server = await backend.startServer(0, '127.0.0.1'); handleAppProtocol();
  const win = new BrowserWindow({ width: 1280, height: 900, show: false, webPreferences: { offscreen: true, backgroundThrottling: false } });
  const errors = [];
  win.webContents.on('console-message', event => { if (event.level === 'error') errors.push(event.message); });
  await win.loadURL(roomUrl(`http://127.0.0.1:${server.address().port}`));
  await win.webContents.executeJavaScript(`(async () => {
    const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
    const check = (ok, message) => { if (!ok) throw new Error(message); };
    const until = async predicate => {
      for (let i = 0; i < 100; i++) { if (predicate()) return; await pause(40); }
      check(predicate(), 'A captura não chegou ao estado esperado.');
    };
    await until(() => window.appState && document.querySelector('#channel-geral .channel-row'));
    document.querySelectorAll('.modal-backdrop').forEach(el => el.classList.add('hidden'));
    const noise = document.querySelector('#select-noise-suppression');
    noise.value = 'off'; noise.dispatchEvent(new Event('change'));
    document.querySelector('#channel-geral .channel-row').click();
    await until(() => appState.currentChannelId === 'geral');
    document.querySelector('#btn-toggle-mic').click();
    await until(() => appState.micProcessor && appState.localMicStream?.getAudioTracks()[0].enabled);
    const track = appState.localMicStream.getAudioTracks()[0];
    const boost = document.querySelector('#input-mic-voice-boost');
    check(!boost, 'O reforço automático da 3.8 deve ter sido removido');
    document.querySelector('#modal-settings').classList.remove('hidden');
    document.querySelector('[data-settings-tab="microfone"]').click();
    const gain = document.querySelector('#input-mic-gain');
    for (const value of [200, 0, 100]) {
      gain.value = value; gain.dispatchEvent(new Event('input')); gain.dispatchEvent(new Event('change'));
      check(document.querySelector('#mic-gain-text').textContent === value + '%', 'O volume precisa refletir o ajuste manual');
      check(appState.localMicStream.getAudioTracks()[0] === track, 'Ajustar ganho não pode trocar a faixa enviada');
    }
    const avatar = document.querySelector('.lounge-user-card .user-avatar');
    check(avatar, 'A call precisa manter o avatar visível');
    const ctx = appState.mixerManager.audioContext;
    const sinal = ctx.createOscillator();
    const entrada = ctx.createMediaStreamDestination();
    sinal.connect(entrada);
    sinal.start();
    appState.vadDetector.setStream(entrada.stream);
    await until(() => appState.myUser.isSpeaking && avatar.parentElement.classList.contains('is-speaking'));
    sinal.stop();
    await until(() => !appState.myUser.isSpeaking && !avatar.parentElement.classList.contains('is-speaking'));
    appState.vadDetector.setStream(appState.localMicStream);
    for (let i = 0; i < 8; i++) { appState.vadDetector.onSpeakingChange(i % 2 === 0); await pause(80); }
    check(document.querySelector('.lounge-user-card .user-avatar') === avatar, 'Atualizar a fala não pode recriar o avatar');
    document.querySelector('#btn-toggle-mic').click();
    for (const [mode, filter] of Object.entries({ ia: 'rnnoise', 'pausa-leve': 'pausa-leve', 'pausa-forte': 'pausa-forte', basico: 'off', off: 'off' })) {
      const oldTrack = appState.localMicStream.getAudioTracks()[0];
      noise.value = mode; noise.dispatchEvent(new Event('change'));
      await until(() => appState.localMicStream.getAudioTracks()[0] !== oldTrack);
      check(oldTrack.readyState === 'ended', 'Trocar filtro deve liberar a captura anterior');
      check(!appState.localMicStream.getAudioTracks()[0].enabled && !appState.myUser.isMicOn, 'Trocar filtro precisa manter o mute');
      check(appState.micProcessor, 'O ganho manual deve existir com qualquer filtro');
      check(appState.micProcessor.noiseFilter === filter, 'O filtro escolhido precisa carregar de verdade');
    }
  })()`);
  // O aviso real deve reativar o contexto e produzir sinal na saída geral.
  await new Promise(resolve => setTimeout(resolve, 1550));
  await win.webContents.executeJavaScript(`(async () => {
    const ctx = appState.mixerManager.audioContext;
    window.medidorAviso = ctx.createAnalyser();
    appState.mixerManager.outputGain.connect(medidorAviso);
    await ctx.suspend();
  })()`);
  const { voiceWav } = await import('../public/voice-clips.js');
  const tom = Float32Array.from({ length: 8000 }, (_, i) => Math.sin(i * 0.2) * 0.2);
  const joinSound = 'data:audio/wav;base64,' + Buffer.from(voiceWav(tom, 8000)).toString('base64');
  visitante = require('socket.io-client').io(`http://127.0.0.1:${server.address().port}`, { reconnection: false });
  await visitante.timeout(3000).emitWithAck('join-channel', { channelId: 'geral', profile: { joinSound } });
  await win.webContents.executeJavaScript(`(async () => {
    const amostras = new Float32Array(medidorAviso.fftSize);
    for (let i = 0; i < 200; i++) {
      medidorAviso.getFloatTimeDomainData(amostras);
      if (amostras.some(v => Math.abs(v) > 0.001)) return;
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    throw new Error('O aviso de entrada não chegou à saída da call');
  })()`);
  // Registra o áudio efetivamente iniciado no mixer, com os arquivos decodificados.
  const js = code => win.webContents.executeJavaScript(code);
  await js(`(() => {
    document.querySelector('[data-settings-tab="som"]').click();
    const option = document.querySelector('#input-stream-sounds');
    option.scrollIntoView({block:'center'});
    if (!option.checkVisibility()) throw new Error('O ajuste de transmissão precisa aparecer em Som');
    window.avisosDeStream = [];
    const duracoes = [0.45, 0.275, 0.32]; // Os três toques, excluindo o som de entrada do visitante.
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      if (duracoes.some(d => Math.abs(d - this.buffer.duration) < 0.001)) avisosDeStream.push(this.buffer.duration);
      return start.apply(this, args);
    };
    const canvas = document.createElement('canvas');
    appState.localScreenStream = canvas.captureStream(1);
  })()`);
  const meuId = await js('appState.myId');
  const estado = patch => visitante.emit('user-state-changed', patch);
  const aguardar = ms => new Promise(resolve => setTimeout(resolve, ms));
  const conferir = async n => {
    for (let i = 0; i < 100; i++) {
      if (await js('avisosDeStream.length') === n) return;
      await aguardar(20);
    }
    throw new Error('Quantidade inesperada de avisos de transmissão: ' + await js('avisosDeStream.length'));
  };
  estado({ isSharing: true }); await conferir(1);
  estado({ watching: [meuId] }); await conferir(2);
  if (await js('avisosDeStream[0] === avisosDeStream[1]')) throw new Error('Os dois avisos devem soar diferentes');
  await aguardar(1600);
  estado({ isSharing: true, watching: [meuId] });
  estado({ isSharing: false, watching: [] });
  await conferir(3);
  if (await js('Math.abs(avisosDeStream[2] - 0.32) > 0.001')) throw new Error('Faltou o toque de saída');
  estado({ watching: [visitante.id] });
  estado({ watching: [] });
  await aguardar(150); await conferir(3);
  await js("document.querySelector('#input-stream-sounds').click()");
  estado({ isCameraOn: true, watching: [meuId] });
  estado({ watching: [] });
  await aguardar(150); await conferir(3);
  await aguardar(1500);
  await js("document.querySelector('#input-stream-sounds').click()");
  estado({ watching: [meuId] }); await conferir(4);
  visitante.disconnect(); await conferir(5);
  if (await js('avisosDeStream[4] !== avisosDeStream[2]')) throw new Error('Faltou o toque ao desconectar o espectador');
  await js("appState.localScreenStream.getTracks().forEach(t=>t.stop());appState.localScreenStream=null");
  console.log('O mixer tocou os avisos de transmissão, entrada e saída do espectador, inclusive ao desconectar da call.');
  win.setSize(1200, 860);
  await js("document.querySelector('#input-stream-sounds').scrollIntoView({block:'center',behavior:'instant'})");
  await new Promise(resolve => setTimeout(resolve, 150));
  const capture = await win.webContents.capturePage();
  if (capture.getSize().width < 1000) throw new Error('A captura do painel de som ficou incompleta');
  await fs.writeFile(path.join(os.tmpdir(), 'teletela-avisos-transmissao.png'), capture.toPNG());
  await js(`document.querySelector('[data-settings-tab="microfone"]').click()`);
  for (const theme of ['escuro', 'preto', 'claro']) {
    await win.webContents.executeJavaScript(`document.querySelector('#select-theme').value='${theme}';document.querySelector('#select-theme').dispatchEvent(new Event('change'));void 0`);
    await new Promise(resolve => setTimeout(resolve, 100));
    await fs.writeFile(path.join(os.tmpdir(), `teletela-mic-controles-${theme}.png`), (await win.webContents.capturePage()).toPNG());
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Controles passaram: três temas, cinco opções de redução de ruído, ganho, mute e avatar estável durante fala.');
  await finish(0);
}).catch(async err => { console.error(err); await finish(1); });
const timeout = setTimeout(() => { console.error('Teste dos controles excedeu 45 segundos.'); finish(1); }, 45000);
async function finish(code) {
  clearTimeout(timeout);
  visitante?.disconnect();
  BrowserWindow.getAllWindows().forEach(win => win.destroy());
  await new Promise(resolve => io ? io.close(resolve) : resolve());
  await fs.rm(profile, { recursive: true, force: true }); app.exit(code);
}
