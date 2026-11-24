import { attachmentDraft, attachmentPayload } from './chat-attachments.js';
import { messageLinks } from './chat-links.js';
import { attachLinkPreview } from './link-previews.js';

export function setupDirectMessages({ socket, getAccount, serverUrl, assetKey, onUnreadChanged }) {
  const $ = id => document.getElementById(id);
  const dialog = $('dm-dialog'), log = $('dm-log'), input = $('dm-input');
  const unread = new Set();
  let friends = [], peer = null, generation = 0, before = null, owner = null;
  const messages = new Map(), latest = new Map(), seen = new Map();
  let membership = null;

  const send = $('dm-compose').querySelector('[type="submit"]');
  const attachments = attachmentDraft({ input, picker: $('dm-picker'), preview: $('dm-attachment-draft'), dropZone: dialog,
    destination: () => peer, report: message => { $('dm-status').textContent = message; } });
  let acceptsFiles = false;
  socket.on('room-info', info => { if (info?.assetKey) acceptsFiles = info.dmFiles === true; });
  socket.on('disconnect', () => { acceptsFiles = false; });
  $('dm-attach').onclick = () => $('dm-picker').click();

  function appendAttachment(row, attachment) {
    const url = new URL('/api/dm-file/' + encodeURIComponent(attachment.file), serverUrl);
    url.searchParams.set('access', assetKey());
    const name = attachment.name || 'Arquivo';
    if (attachment.mime.startsWith('image/')) {
      const img = document.createElement('img');
      img.className = 'dm-image'; img.src = url.href; img.alt = name; img.loading = 'lazy';
      row.append(img);
    } else if (attachment.mime.startsWith('video/') || attachment.mime === 'audio/wav') {
      const player = document.createElement(attachment.mime === 'audio/wav' ? 'audio' : 'video');
      player.src = url.href; player.controls = true; player.playsInline = true; player.preload = 'metadata';
      player.setAttribute('aria-label', name); row.append(player);
    }
    const link = document.createElement('a');
    url.searchParams.set('download', '1'); url.searchParams.set('name', name);
    link.href = url.href; link.download = name; link.className = 'dm-file';
    const label = document.createElement('strong'), detail = document.createElement('small');
    label.textContent = name;
    detail.textContent = 'Baixar · ' + (attachment.size >= 1048576 ? (attachment.size / 1048576).toFixed(1) + ' MB' : Math.ceil(attachment.size / 1024) + ' KB');
    link.append(label, detail); row.append(link);
  }

  function markRead(id, number) {
    if (number <= (seen.get(id) || 0)) return;
    seen.set(id, number);
    try { localStorage.setItem(JSON.stringify(['dm', serverUrl, owner, id]), String(number)); } catch {}
    if (number >= (latest.get(id)?.id || 0)) unread.delete(id);
  }

  function noteActivity(id, message) {
    if ((latest.get(id)?.id || 0) > message.id) return;
    latest.set(id, { id: message.id, timestamp: message.timestamp });
    if (!seen.has(id)) {
      let value = 0;
      try { value = Number(localStorage.getItem(JSON.stringify(['dm', serverUrl, owner, id]))) || 0; } catch {}
      seen.set(id, value);
    }
    if (message.from === owner || message.id <= seen.get(id)) unread.delete(id);
    else unread.add(id);
  }

  async function refreshInbox(key) {
    try {
      const result = await socket.timeout(10000).emitWithAck('dm-inbox', {});
      if (membership !== key || !result?.success) return;
      for (const item of result.latest) noteActivity(item.peer, item);
      onUnreadChanged(unread);
    } catch { /* As conversas abertas continuam recebendo mensagens ao vivo. */ }
  }

  function reset() {
    generation++; attachments.clear();
    peer = before = null;
    $('dm-latest').hidden = true;
    messages.clear(); log.replaceChildren(); input.value = '';
    $('dm-status').textContent = '';
    $('dm-title').textContent = 'Conversas';
    $('dm-thread').hidden = true;
  }

  function renderMessages() {
    // Inserir só as mensagens novas mantém o clipe tocando, inclusive ao carregar o histórico.
    let proxima = log.firstElementChild;
    if (!proxima) log.textContent = messages.size ? '' : 'Envie a primeira mensagem.';
    const person = friends.find(friend => friend.id === peer);
    for (const msg of [...messages.values()].sort((a, b) => a.id - b.id)) {
      if (Number(proxima?.dataset.id) === msg.id) {
        proxima = proxima.nextElementSibling;
        continue;
      }
      const row = document.createElement('article');
      const own = msg.from === owner;
      row.dataset.id = msg.id;
      row.className = 'dm-message' + (own ? ' dm-own' : '');
      const by = document.createElement('strong'), time = document.createElement('time'), body = document.createElement('p');
      by.textContent = own ? 'Você' : person?.name || person?.username;
      time.dateTime = new Date(msg.timestamp).toISOString();
      time.textContent = new Date(msg.timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
      let last = 0;
      for (const { index, label, url } of messageLinks(msg.text)) {
        const link = document.createElement('a');
        link.href = url.href; link.textContent = label;
        link.target = '_blank'; link.rel = 'noopener noreferrer'; link.className = 'chat-link';
        body.append(msg.text.slice(last, index), link);
        last = index + label.length;
      }
      body.append(msg.text.slice(last));
      row.append(by, time);
      if (msg.text) row.append(body);
      if (msg.attachment) appendAttachment(row, msg.attachment);
      attachLinkPreview(body);
      log.insertBefore(row, proxima);
    }
  }

  async function loadHistory(older = false) {
    const turn = generation;
    $('dm-older').disabled = true;
    try {
      const height = log.scrollHeight, top = log.scrollTop, at = seen.get(peer) || 0;
      let first;
      do {
        const result = await socket.timeout(10000).emitWithAck('dm-history', { accountId: peer, ...(before ? { before } : {}) });
        if (turn !== generation) return;
        if (!result?.success) throw new Error(result?.error || 'Conversa indisponível.');
        for (const msg of result.messages) messages.set(msg.id, msg);
        first = result.messages[0]?.id;
        before = result.before;
      } while (!older && before && first > at && unread.has(peer));
      $('dm-older').hidden = !before;
      renderMessages();
      const next = !older && [...log.children].find(row => Number(row.dataset.id) > at);
      if (next) next.scrollIntoView({ block: 'start' });
      else log.scrollTop = older ? top + log.scrollHeight - height : log.scrollHeight;
      recordVisible();
      $('dm-status').textContent = '';
    } catch (err) {
      if (turn === generation) $('dm-status').textContent = err.message === 'operation has timed out' ? 'A sala demorou para responder. Abra a conversa de novo.' : err.message;
    } finally { if (turn === generation) $('dm-older').disabled = false; }
  }

  // Na ligação, a conversa vira painel fixo ao lado do palco (sem modal).
  const home = { parent: dialog.parentNode, next: dialog.nextSibling };
  function undock() {
    if (!dialog.classList.contains('dm-docked')) return;
    if (dialog.open) dialog.close();
    dialog.classList.remove('dm-docked');
    home.parent.insertBefore(dialog, home.next);
  }
  function dock(id, container) {
    if (dialog.open) dialog.close();
    container.append(dialog); dialog.classList.add('dm-docked');
    open(id, true);
  }
  function open(id, docked = false) {
    if (!owner || !socket.connected) return;
    const person = friends.find(friend => friend.id === id);
    if (!person) return;
    if (!docked) undock();
    reset();
    if (!dialog.open) docked ? dialog.show() : dialog.showModal();
    peer = id;

    $('dm-title').textContent = person.name || person.username;
    $('dm-thread').hidden = false;
    $('dm-older').hidden = true;
    send.disabled = false;
    $('dm-status').textContent = 'Carregando conversa…';
    loadHistory(); if (!docked) input.focus();
  }

  function sync(list) {
    const id = getAccount()?.id || null;
    if (id !== owner || !socket.connected) {
      if (dialog.open) dialog.close();
      reset(); unread.clear(); latest.clear(); seen.clear(); membership = null;
    }
    owner = socket.connected ? id : null;
    friends = owner ? list : [];
    const ids = new Set(friends.map(person => person.id));
    const key = JSON.stringify([owner, ...[...ids].sort()]);
    if (membership !== key) {
      membership = key;
      if (ids.size) refreshInbox(key);
    }
    for (const id of unread) if (!ids.has(id)) unread.delete(id);
    if (peer && !ids.has(peer)) { dialog.close(); reset(); }
    onUnreadChanged(unread);
  }

  function recordVisible() {
    if (!dialog.open || !peer || !log.clientHeight || document.hidden) return;
    const bounds = log.getBoundingClientRect();
    for (let i = log.children.length - 1; i >= 0; i--) {
      const row = log.children[i], box = row.getBoundingClientRect();
      if (box.top >= bounds.bottom || box.bottom <= bounds.top) continue;
      markRead(peer, Number(row.dataset.id));
      break;
    }
    $('dm-latest').hidden = log.scrollHeight - log.clientHeight - log.scrollTop < 4;
    onUnreadChanged(unread);
  }
  log.addEventListener('scroll', recordVisible);
  $('dm-latest').onclick = () => { log.scrollTop = log.scrollHeight; recordVisible(); };
  document.addEventListener('visibilitychange', recordVisible);
  $('dm-close').onclick = () => dialog.close();
  dialog.addEventListener('close', reset);
  $('dm-older').onclick = () => loadHistory(true);
  $('dm-compose').onsubmit = async event => {
    event.preventDefault();
    const file = attachments.file;
    const draft = input.value, text = draft.trim(), turn = generation;
    if (!peer || !socket.connected || send.disabled || (!text && !file)) return;
    if (file && !acceptsFiles) { $('dm-status').textContent = 'O servidor precisa ser atualizado para receber anexos privados.'; return; }
    send.disabled = true;
    if (file) $('dm-status').textContent = 'Enviando anexo…';
    try {
      const data = file ? await attachmentPayload(file) : {};
      if (turn !== generation || !socket.connected || attachments.file !== file) return;
      const result = await socket.timeout(file ? 60000 : 10000).emitWithAck(file ? 'dm-send-file' : 'dm-send', { accountId: peer, text, ...data });
      if (turn !== generation) return;
      if (!result?.success) throw new Error(result?.error || 'Mensagem não enviada.');
      if (attachments.file === file) {
        attachments.clear();
        if (input.value === draft) input.value = '';
      }
      $('dm-status').textContent = ''; input.focus();
    } catch (err) {
      if (turn === generation) $('dm-status').textContent = err.message === 'operation has timed out' ? 'Envio sem confirmação. Confira a conversa.' : err.message;
    } finally { if (turn === generation) send.disabled = false; }
  };
  socket.on('dm-message', msg => {
    const other = msg.from === owner ? msg.to : msg.from;
    if (!owner || !friends.some(friend => friend.id === other)) return;
    noteActivity(other, msg);
    if (dialog.open && peer === other) {

      const atEnd = log.scrollHeight - log.scrollTop - log.clientHeight < 40;
      messages.set(msg.id, msg); renderMessages();
      if (atEnd || msg.from === owner) log.scrollTop = log.scrollHeight;
      recordVisible();
    }
    onUnreadChanged(unread);
  });
  return { open, dock, undock, sync, unread };
}
