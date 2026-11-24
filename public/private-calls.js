// Ligação privada entre amigos. Chamando, é um cartão flutuante no topo; atendida, vira a
// sala da ligação no palco (avatares, quem fala, conversa ao lado e tela cheia). Saindo da
// sala para outra tela, a ligação continua e volta a ser o cartão.
export function setupPrivateCalls({ socket, showToast, mic, output, mobileState, ring, createSession,
  inChannel = () => false, leftChannel = () => {}, me = () => ({ name: 'Você' }), screen = null }) {
  const el = id => document.getElementById('private-' + id);
  const dialog = el('dialog'), audio = el('audio'), mute = el('mute'), answer = el('answer'), hang = el('end');
  const room = el('room'), chatBox = el('room-chat');
  const roomButtons = { mute: el('room-mute'), deafen: el('room-deafen'), chat: el('room-chat-toggle'), full: el('room-fullscreen'), share: el('room-share') };
  const screens = el('room-screens');
  let current = null, inviting = false, clock = null;
  // Conversa ao lado: aberta no PC, escondida no celular, até a pessoa escolher.
  let chatWanted = !matchMedia('(max-width: 760px)').matches;
  const tone = createTone(output);

  function setPhase(phase) {
    dialog.dataset.phase = phase;
    if (phase === 'incoming') ring() !== false ? tone.play('incoming') : tone.stop();
    else if (phase === 'outgoing') tone.play('outgoing');
    else tone.stop();
  }
  function reset(reason) {
    const previous = current;
    current = null;
    clearInterval(clock); clock = null;
    tone.stop();
    previous?.meters?.forEach(meter => meter.stop());
    if (previous) previous.shareRun = null;
    if (previous?.share) { previous.share.stream.getTracks().forEach(track => track.stop()); screen?.release(); }
    previous?.share?.session.close(); previous?.view?.close();
    screens.replaceChildren(); room.classList.remove('has-screens');
    previous?.sessions.forEach(session => session.close());
    previous?.stream?.getTracks().forEach(track => track.stop());
    previous?.notice?.close();
    audio.pause(); audio.srcObject = null; audio.muted = false;
    if (previous?.stream) mobileState(false);
    hideRoom();
    api.chat?.undock();
    if (dialog.open) dialog.close();
    delete dialog.dataset.phase;
    el('expand').hidden = true;
    if (reason) showToast(reason);
  }
  function end(reason) {
    if (current && socket.connected) socket.emit('private-end', { id: current.id });
    reset(reason);
  }
  function setAvatar(box, person) {
    const name = person.name || '?';
    box.replaceChildren();
    box.textContent = name.trim().slice(0, 2).toUpperCase();
    if (person.color) box.style.backgroundColor = person.color; else box.style.removeProperty('background-color');
    if (!person.avatarUrl) return;
    const photo = document.createElement('img');
    photo.alt = ''; photo.src = person.avatarUrl;
    if (person.avatarStyle) photo.style.cssText = person.avatarStyle;
    // A moldura corta o zoom do recorte; o avatar fica livre para as ondas e o anel de fala.
    const frame = document.createElement('span'); frame.className = 'private-call-photo';
    photo.addEventListener('load', () => { box.textContent = ''; frame.append(photo); box.append(frame); }, { once: true });
  }
  function open(id, person, incoming) {
    current = { id, sessions: [], meters: [], stream: null, peerAccount: person.id, person, muted: false, deafened: false };
    setAvatar(el('avatar'), person);
    el('name').textContent = person.name;
    el('label').textContent = incoming ? 'Ligação de amigo' : 'Ligando';
    el('status').textContent = incoming
      ? (inChannel() ? 'Atender tira você do canal de voz.' : 'Quer falar com você.')
      : (inChannel() ? 'Chamando… quando atender, você sai do canal.' : 'Chamando…');
    answer.hidden = !incoming; answer.disabled = false;
    mute.hidden = true; el('expand').hidden = true;
    setHang(incoming ? 'Recusar' : 'Cancelar');
    if (!dialog.open) dialog.show();
    setPhase(incoming ? 'incoming' : 'outgoing');
    (incoming ? answer : hang).focus({ preventScroll: true });
    if (incoming && !document.hasFocus()) current.notice = notify(person.name);
  }
  function setHang(label) { hang.setAttribute('aria-label', label); hang.title = label; el('end-label').textContent = label; }
  function toggleButton(button, pressed, on, off) {
    button.setAttribute('aria-pressed', String(pressed));
    const label = pressed ? on : off;
    button.setAttribute('aria-label', label); button.title = label;
  }
  // Cartão e sala mostram o mesmo estado; o outro lado recebe mutado/ensurdecido pelo servidor.
  function syncControls() {
    const muted = Boolean(current?.muted || current?.deafened), deafened = Boolean(current?.deafened);
    toggleButton(mute, muted, 'Abrir microfone', 'Mutar microfone');
    el('mute-label').textContent = muted ? 'Mutado' : 'Mutar';
    toggleButton(roomButtons.mute, muted, 'Abrir microfone', 'Mutar microfone');
    toggleButton(roomButtons.deafen, deafened, 'Ativar áudio', 'Desativar áudio');
    setFlags(el('room-me'), muted, deafened);
    const track = current?.stream?.getAudioTracks()[0];
    if (track) track.enabled = !muted;
    audio.muted = deafened;
    const peerScreen = screens.querySelector('[data-key=peer] video');
    if (peerScreen) peerScreen.muted = deafened;
    const sharing = Boolean(current?.share);
    toggleButton(roomButtons.share, sharing, 'Parar de transmitir', 'Transmitir tela');
    roomButtons.share.hidden = !screen;
    if (current?.active) socket.emit('private-state', { id: current.id, muted, deafened, sharing });
  }
  function setFlags(figure, muted, deafened) {
    figure.dataset.muted = String(muted); figure.dataset.deafened = String(deafened);
    if (muted) figure.dataset.speaking = 'false';
  }
  function setMuted(muted) {
    if (!current?.stream) return;
    current.muted = muted;
    if (!muted) current.deafened = false;
    syncControls();
  }
  function setDeafened(deafened) {
    if (!current?.active) return;
    current.deafened = deafened;
    syncControls();
  }
  function startClock() {
    const started = Date.now();
    const tick = () => {
      const s = Math.floor((Date.now() - started) / 1000);
      const text = (s >= 3600 ? Math.floor(s / 3600) + ':' : '') +
        String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
      el('status').textContent = text; el('room-time').textContent = text;
    };
    tick(); clock = setInterval(tick, 1000);
  }
  // Fora da janela, a notificação do sistema chama atenção mesmo com o app minimizado.
  function notify(name) {
    try {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return null;
      const n = new Notification(name + ' está te ligando', { body: 'Abra o Teletela para atender.', icon: 'icon.png', silent: true });
      n.onclick = () => { window.focus(); answer.focus(); n.close(); };
      return n;
    } catch { return null; }
  }

  // ---- Transmissão de tela na ligação ----
  // Cada tela vira um quadro no palco; os cartões de vocês dois encolhem para uma faixa.
  function screenTile(key, label, stream, local) {
    let tile = screens.querySelector(`[data-key=${key}]`);
    if (!tile) {
      tile = document.createElement('figure');
      tile.className = 'private-room-screen'; tile.dataset.key = key;
      const video = document.createElement('video');
      video.autoplay = true; video.playsInline = true;
      tile.append(video, document.createElement('figcaption'));
      tile.title = 'Duplo clique para tela cheia';
      tile.ondblclick = () => document.fullscreenElement === tile
        ? document.exitFullscreen().catch(() => {}) : tile.requestFullscreen?.().catch(() => {});
      key === 'peer' ? screens.prepend(tile) : screens.append(tile);
    }
    const video = tile.querySelector('video');
    video.muted = local || Boolean(current?.deafened);
    if (video.srcObject !== stream) video.srcObject = stream;
    if (!local && video.setSinkId && output()) video.setSinkId(output()).catch(() => {});
    video.play().catch(() => {});
    tile.querySelector('figcaption').textContent = label;
    room.classList.add('has-screens');
  }
  function dropTile(key) {
    const tile = screens.querySelector(`[data-key=${key}]`);
    if (tile && document.fullscreenElement === tile) document.exitFullscreen().catch(() => {});
    tile?.remove();
    room.classList.toggle('has-screens', screens.children.length > 0);
  }
  async function startShare() {
    const call = current;
    if (!screen || !call?.active || !call.stream || call.share || call.shareRun) return;
    const run = {};
    call.shareRun = run;
    const isCurrent = () => current === call && call.shareRun === run;
    roomButtons.share.disabled = true;
    try {
      const stream = await screen.start({ isCurrent, onEnded: () => { if (isCurrent()) stopShare(); } });
      if (!stream) { if (isCurrent()) call.shareRun = null; return; }
      if (!isCurrent()) { stream.getTracks().forEach(track => track.stop()); screen.release(); return; }
      const session = createSession({ kind: 'screen', privateId: call.id, role: 'host', ownerId: socket.id, stream, onClose: () => {
        if (current === call && call.share?.session === session) { stopShare(); showToast('A transmissão da tela caiu.', 'error'); }
      } });
      call.share = { stream, session };
      session.start();
      screenTile('me', 'Sua tela', stream, true);
      syncControls();
    } catch (err) {
      if (isCurrent()) call.shareRun = null;
      screen.release();
      if (err?.name !== 'NotAllowedError') showToast('❌ Não deu para transmitir: ' + (err?.message || err?.name || 'erro'), 'error');
    } finally { roomButtons.share.disabled = false; }
  }
  function stopShare() {
    const call = current;
    if (!call) return;
    call.shareRun = null;
    const share = call.share;
    call.share = null;
    if (share) {
      share.session.close();
      share.stream.getTracks().forEach(track => track.stop());
      screen?.release();
    }
    dropTile('me');
    syncControls();
  }
  function watchPeer(sharing) {
    const call = current;
    if (!call?.active) return;
    el('label').textContent = sharing ? call.person.name + ' está transmitindo' : 'Ligação privada';
    if (!sharing) { const view = call.view; call.view = null; view?.close(); dropTile('peer'); return; }
    if (call.view) return;
    const view = createSession({ kind: 'screen', privateId: call.id, role: 'viewer', ownerId: call.peerSocket, onStream: remote => {
      if (current === call && call.view === view) screenTile('peer', 'Tela de ' + call.person.name, remote, false);
    }, onClose: () => { if (current === call && call.view === view) { call.view = null; dropTile('peer'); } } });
    call.view = view;
    view.start();
  }
  roomButtons.share.onclick = () => current?.share ? stopShare() : startShare();

  // ---- Sala da ligação ----
  function showRoom() {
    if (!current?.active) return;
    document.body.classList.remove('friends-open');
    document.getElementById('friends-open')?.removeAttribute('aria-current');
    document.body.classList.add('private-room-open');
    if (chatWanted && !chatOpen()) openChat();
    syncChatButton();
    roomButtons.mute.focus({ preventScroll: true });
  }
  function hideRoom() {
    if (document.fullscreenElement === room) document.exitFullscreen().catch(() => {});
    document.body.classList.remove('private-room-open');
  }
  const chatOpen = () => Boolean(chatBox.querySelector('dialog[open]'));
  function openChat() { if (current?.peerAccount) api.chat?.dock(current.peerAccount, chatBox); }
  function syncChatButton() {
    toggleButton(roomButtons.chat, chatOpen(), 'Esconder conversa', 'Mostrar conversa');
    room.classList.toggle('chat-open', chatOpen());
  }
  // O ✕ da conversa também conta como escolher escondê-la.
  new MutationObserver(() => {
    if (!current) return;
    if (!chatOpen() && room.classList.contains('chat-open')) chatWanted = false;
    syncChatButton();
  }).observe(chatBox, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] });
  roomButtons.chat.onclick = () => {
    if (chatOpen()) { chatWanted = false; chatBox.querySelector('dialog').close(); }
    else { chatWanted = true; openChat(); }
    syncChatButton();
  };
  roomButtons.full.onclick = () => {
    if (document.fullscreenElement === room) document.exitFullscreen().catch(() => {});
    else room.requestFullscreen?.().catch(() => showToast('Não deu para abrir em tela cheia.', 'error'));
  };
  document.addEventListener('fullscreenchange', () =>
    toggleButton(roomButtons.full, document.fullscreenElement === room, 'Sair da tela cheia', 'Tela cheia'));
  roomButtons.mute.onclick = () => setMuted(!(current?.muted || current?.deafened));
  roomButtons.deafen.onclick = () => setDeafened(!current?.deafened);
  el('room-end').onclick = () => end();
  el('room-minimize').onclick = () => { hideRoom(); el('expand').focus({ preventScroll: true }); };
  el('expand').onclick = () => showRoom();
  room.addEventListener('keydown', event => {
    if (event.target.closest('input, textarea')) return;
    if (event.key === 'Escape' && document.fullscreenElement !== room) { event.preventDefault(); hideRoom(); }
  });
  function fillRoom(call) {
    const self = me();
    setAvatar(el('room-me').querySelector('.private-room-avatar'), self);
    el('room-me').querySelector('strong').textContent = self.name || 'Você';
    setAvatar(el('room-peer').querySelector('.private-room-avatar'), call.person);
    el('room-peer').querySelector('strong').textContent = call.person.name;
    el('room-title').textContent = 'Ligação com ' + call.person.name;
    el('room-time').textContent = 'Conectando…';
    for (const figure of [el('room-me'), el('room-peer')]) { setFlags(figure, false, false); figure.dataset.speaking = 'false'; }
  }

  const api = {
    // A lista de amigos preenche: id da conta -> { name, avatarUrl, avatarStyle }; e a conversa encaixável.
    ready: false, onReady: null, lookup: null, chat: null,
    get active() { return Boolean(current); },
    hangup() { if (!current) return false; end(); return true; },
    showRoom,
    async invite(person) {
      if (current) return showToast('Termine a ligação atual antes de ligar de novo.', 'error');
      if (inviting || !socket.connected) return;
      inviting = true;
      try {
        const result = await socket.timeout(5000).emitWithAck('private-invite', { accountId: person.id });
        const info = { name: person.name || person.username, ...(api.lookup?.(person.id) || {}), id: person.id };
        if (result?.id) open(result.id, info, false);
        else showToast(result?.error || 'Ligação indisponível.', 'error');
      } catch { showToast('O servidor não respondeu ao convite.', 'error'); }
      finally { inviting = false; }
    }
  };
  function ready() {
    socket.timeout(5000).emit('private-ready', {}, (error, enabled) => {
      api.ready = !error && enabled === true && socket.connected; api.onReady?.();
    });
  }
  socket.on('connect', ready);
  if (socket.connected) ready();
  socket.on('private-ring', ({ id, name, accountId }) => {
    if (current) return socket.emit('private-end', { id });
    open(id, { name: name || 'Amigo', ...(api.lookup?.(accountId) || {}), id: accountId }, true);
  });
  socket.on('private-ended', ({ id, reason }) => { if (current?.id === id) reset(reason); });
  socket.on('private-state', ({ id, muted, deafened, sharing }) => {
    if (current?.id !== id) return;
    setFlags(el('room-peer'), Boolean(muted), Boolean(deafened));
    watchPeer(sharing === true);
  });
  socket.on('disconnect', () => { api.ready = false; reset(current && 'A conexão caiu.'); api.onReady?.(); });
  answer.onclick = () => {
    if (!current) return;
    answer.disabled = true;
    tone.stop();
    socket.emit('private-answer', { id: current.id });
  };
  hang.onclick = () => end();
  dialog.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); end(); } });
  mute.onclick = () => setMuted(!(current?.muted || current?.deafened));
  socket.on('private-active', async ({ id, peer, leftSeed }) => {
    const call = current;
    if (!call || call.id !== id) return;
    // O servidor já tirou do canal; aqui só desliga a voz do canal no app.
    if (leftSeed !== null && leftSeed !== undefined) leftChannel(leftSeed);
    call.active = true; call.peerSocket = peer;
    answer.hidden = true; setHang('Desligar');
    setPhase('connecting');
    el('label').textContent = 'Ligação privada';
    el('status').textContent = 'Conectando o áudio…';
    el('expand').hidden = false;
    fillRoom(call); syncControls(); showRoom();
    try {
      const stream = await mic();
      if (call !== current) { stream?.getTracks().forEach(track => track.stop()); return; }
      call.stream = stream;
      if (!stream?.getAudioTracks().length) throw new Error();
      mobileState(true);
      mute.hidden = false;
      syncControls();
      call.meters.push(speakingMeter(stream, on => {
        if (current === call) el('room-me').dataset.speaking = String(on && !(call.muted || call.deafened));
      }));
      const base = { kind: 'voice', privateId: id, onClose: () => {
        if (current === call) end('O servidor de voz desconectou.');
      } };
      call.sessions.push(createSession({ ...base, role: 'host', ownerId: socket.id, stream }),
        createSession({ ...base, role: 'viewer', ownerId: peer, onStream: remote => {
          if (current !== call) return;
          audio.srcObject = remote;
          if (audio.setSinkId && output()) audio.setSinkId(output()).catch(() => {});
          call.meters.push(speakingMeter(remote, on => {
            if (current === call) el('room-peer').dataset.speaking = String(on && el('room-peer').dataset.muted !== 'true');
          }));
          audio.play().then(() => {
            if (current === call && !clock) { setPhase('active'); startClock(); }
          }).catch(() => { if (current === call) end('Não foi possível reproduzir o áudio.'); });
        } }));
      call.sessions.forEach(session => session.start());
    } catch { if (current === call) end('Confira a permissão e o dispositivo de microfone antes de ligar de novo.'); }
  });
  return api;
}

// Quem está falando: nível do áudio com uma folga curta para o anel não piscar entre palavras.
let meterContext = null;
function speakingMeter(stream, onChange) {
  try {
    meterContext ||= new AudioContext();
    meterContext.resume().catch(() => {});
    const source = meterContext.createMediaStreamSource(stream), analyser = meterContext.createAnalyser();
    analyser.fftSize = 512; source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    let speaking = false, quietSince = 0;
    const timer = setInterval(() => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const value of data) sum += ((value - 128) / 128) ** 2;
      const loud = Math.sqrt(sum / data.length) > 0.035, now = performance.now();
      if (loud) quietSince = now;
      const next = loud || now - quietSince < 350;
      if (next !== speaking) { speaking = next; onChange(speaking); }
    }, 80);
    return { stop() { clearInterval(timer); source.disconnect(); onChange(false); } };
  } catch { return { stop() {} }; }
}

// Toque sintetizado: não depende de arquivo nem do áudio da call já estar ligado.
function createTone(output) {
  let ctx = null, gain = null, timer = null;
  function beep(freqs, start, length, volume) {
    for (const freq of freqs) {
      const osc = ctx.createOscillator(), env = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      env.gain.setValueAtTime(0, start);
      env.gain.linearRampToValueAtTime(volume, start + 0.02);
      env.gain.setValueAtTime(volume, start + length - 0.05);
      env.gain.linearRampToValueAtTime(0, start + length);
      osc.connect(env).connect(gain);
      osc.start(start); osc.stop(start + length + 0.02);
    }
  }
  // Recebendo: duas notas subindo, duas vezes. Ligando: tom de chamada brasileiro (1 s a cada 5 s).
  const patterns = {
    incoming: { every: 2600, play: t => [0, 0.32, 0.9, 1.22].forEach((d, i) => beep([i % 2 ? 1175 : 880], t + d, 0.26, 0.16)) },
    outgoing: { every: 5000, play: t => beep([425], t, 1, 0.07) }
  };
  return {
    play(kind) {
      this.stop();
      try {
        ctx ||= new AudioContext({ latencyHint: 'interactive' });
        gain ||= ctx.createGain(); gain.connect(ctx.destination);
        const sink = output?.();
        if (ctx.setSinkId && sink && sink !== 'default' && ctx.sinkId !== sink) ctx.setSinkId(sink).catch(() => {});
        ctx.resume().catch(() => {});
        const pattern = patterns[kind];
        const loop = () => pattern.play(ctx.currentTime + 0.05);
        loop(); timer = setInterval(loop, pattern.every);
      } catch {}
    },
    stop() {
      clearInterval(timer); timer = null;
      // Trocar o ganho corta na hora o que já estava agendado.
      if (gain) { gain.disconnect(); gain = null; }
    }
  };
}
