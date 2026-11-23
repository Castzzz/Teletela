export function setupPrivateCalls({ socket, showToast, mic, output, mobileState, ring, createSession }) {
  const el = id => document.getElementById('private-' + id);
  const dialog = el('dialog'), audio = el('audio'), mute = el('mute'), answer = el('answer');
  let current = null, inviting = false;
  function reset(reason) {
    const previous = current;
    current = null;
    previous?.sessions.forEach(session => session.close());
    previous?.stream?.getTracks().forEach(track => track.stop());
    audio.pause(); audio.srcObject = null;
    if (previous?.stream) mobileState(false);
    if (dialog.open) dialog.close();
    if (reason) showToast(reason);
  }
  function end(reason) {
    if (current && socket.connected) socket.emit('private-end', { id: current.id });
    reset(reason);
  }
  function open(id, name, incoming) {
    current = { id, sessions: [], stream: null };
    el('name').textContent = name;
    el('status').textContent = incoming ? 'Quer falar com você.' : 'Chamando…';
    answer.hidden = !incoming; answer.disabled = false;
    mute.hidden = true; mute.textContent = 'Mutar microfone'; mute.setAttribute('aria-pressed', 'false');
    el('end').textContent = incoming ? 'Recusar' : 'Cancelar';
    dialog.showModal();
    el('end').focus();
  }
  const api = {
    ready: false, onReady: null,
    hangup() { if (!current) return false; end(); return true; },
    async invite(person) {
      if (inviting || current || !socket.connected) return;
      inviting = true;
      try {
        const result = await socket.timeout(5000).emitWithAck('private-invite', { accountId: person.id });
        if (result?.id) open(result.id, person.name || person.username, false);
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
  socket.on('private-ring', ({ id, name }) => { open(id, name, true); ring(); });
  socket.on('private-ended', ({ id, reason }) => { if (current?.id === id) reset(reason); });
  socket.on('disconnect', () => { api.ready = false; reset(current && 'A conexão caiu.'); api.onReady?.(); });
  answer.onclick = () => {
    if (!current) return;
    answer.disabled = true;
    socket.emit('private-answer', { id: current.id });
  };
  el('end').onclick = () => end();
  dialog.oncancel = event => { event.preventDefault(); end(); };
  mute.onclick = () => {
    const track = current?.stream?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    mute.textContent = track.enabled ? 'Mutar microfone' : 'Abrir microfone';
    mute.setAttribute('aria-pressed', String(!track.enabled));
  };
  socket.on('private-active', async ({ id, peer }) => {
    const call = current;
    if (!call || call.id !== id) return;
    answer.hidden = true; el('end').textContent = 'Desligar';
    el('status').textContent = 'Conectando o áudio…';
    try {
      const stream = await mic();
      if (call !== current) { stream?.getTracks().forEach(track => track.stop()); return; }
      call.stream = stream;
      if (!stream?.getAudioTracks().length) throw new Error();
      mobileState(true);
      mute.hidden = false;
      const base = { kind: 'voice', privateId: id, onClose: () => {
        if (current === call) end('O servidor de voz desconectou.');
      } };
      call.sessions.push(createSession({ ...base, role: 'host', ownerId: socket.id, stream }),
        createSession({ ...base, role: 'viewer', ownerId: peer, onStream: remote => {
          if (current !== call) return;
          audio.srcObject = remote;
          if (audio.setSinkId && output()) audio.setSinkId(output()).catch(() => {});
          audio.play().then(() => {
            if (current === call) el('status').textContent = 'Em ligação';
          }).catch(() => { if (current === call) end('Não foi possível reproduzir o áudio.'); });
        } }));
      call.sessions.forEach(session => session.start());
    } catch { if (current === call) end('Confira a permissão e o dispositivo de microfone antes de ligar de novo.'); }
  });
  return api;
}
