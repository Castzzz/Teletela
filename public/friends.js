import { setupDirectMessages } from './direct-messages.js';
import { imageCropStyle } from './image-crop.js';
import { PRESENCE_LABELS, normalizePresence } from './presence.js';
const friendIcons = {
  chat: 'M21 11a8 8 0 0 1-8 8H8l-5 3 1-6a8.5 8.5 0 1 1 17-5Z',
  phone: 'M5 3h4l1 5-3 2a15 15 0 0 0 7 7l2-3 5 1v4a2 2 0 0 1-2 2C10 20 4 14 3 5a2 2 0 0 1 2-2Z',
};
function actionIcon(kind) {
  return '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="' + friendIcons[kind] + '"/></svg>';
}

export function setupFriends({ socket, calls, getAccount, openSettings, showToast, serverUrl = '', assetKey = () => '' }) {
  const tab = document.getElementById('friends-open');
  const section = document.getElementById('friends-page');
  let filter = 'friends';
  const $ = selector => section.querySelector(selector);
  let supported = false, busy = false, state = { friends: [], incoming: [], outgoing: [] };
  const mobileTab = document.querySelector('.mobile-nav [data-mobile-view="amigos"]');
  const tabs = [tab, mobileTab];
  const status = document.getElementById('friends-unread-status');
  function updateUnread(unread) {
    const description = unread.size === 1 ? 'Uma conversa com mensagem não lida' : unread.size + ' conversas com mensagens não lidas';
    for (const button of tabs) {
      const dot = button.querySelector('.friends-unread-dot');
      dot.hidden = !unread.size;
      if (unread.size) button.setAttribute('aria-describedby', status.id);
      else button.removeAttribute('aria-describedby');
    }
    const text = unread.size ? description : '';
    if (status.textContent !== text) status.textContent = text;
    for (const label of section.querySelectorAll('[data-unread-for]')) {
      label.hidden = !unread.has(label.dataset.unreadFor);
      const chat = label.closest('.friend-row').querySelector('.friend-actions button');
      if (label.hidden) chat.removeAttribute('aria-describedby');
      else chat.setAttribute('aria-describedby', label.id);
    }
  }
  const direct = setupDirectMessages({ socket, getAccount, serverUrl, assetKey, onUnreadChanged: updateUnread });
  const feedback = (message = '', error = false) => {
    $('#friends-feedback').textContent = message;
    $('#friends-feedback').dataset.error = String(error);
  };
  const labels = { accept: 'Aceitar', reject: 'Recusar', cancel: 'Cancelar pedido', remove: 'Remover amigo' };
  function renderList(selector, list, kind) {
    const root = $(selector); root.replaceChildren();
    if (!list.length) {
      const empty = document.createElement('li'); empty.className = 'account-help';
      empty.textContent = kind === 'friends' ? (filter === 'online' ? 'Nenhum amigo online agora.' : 'Nenhum amigo ainda. Use Adicionar amigo para enviar um pedido.') : 'Nenhum pedido pendente.';
      root.append(empty); return;
    }
    for (const person of list) {
      const row = document.createElement('li'); row.className = 'friend-row';
      const info = document.createElement('div'), name = document.createElement('strong'), detail = document.createElement('span');
      name.textContent = person.name || person.username;
      detail.textContent = `@${person.username}${kind === 'friends' ? ` · ${!socket.connected ? 'Sem conexão' : person.online ? PRESENCE_LABELS[normalizePresence(person.presence || 'online')] : 'Offline'}` : ''}`;
      const avatar = document.createElement('span'); avatar.className = 'friend-initials'; avatar.textContent = (person.name || person.username).slice(0, 2).toUpperCase();
      const key = assetKey();
      if (serverUrl && key && person.id) {
        const photo = document.createElement('img');
        photo.className = 'friend-avatar-img';
        photo.src = `${serverUrl}/api/friend-avatar/${encodeURIComponent(person.id)}?access=${encodeURIComponent(key)}&v=${encodeURIComponent(person.avatarV || 0)}`;
        photo.alt = '';
        photo.style.cssText = imageCropStyle(person.avatarCrop);
        const frame = document.createElement('span'); frame.className = 'friend-avatar-frame';
        photo.addEventListener('error', () => frame.remove(), { once: true });
        frame.append(photo); avatar.append(frame);
      }
      if (kind === 'friends') { const dot = document.createElement('span'); dot.className = 'user-presence-dot'; dot.dataset.presence = socket.connected && person.online ? normalizePresence(person.presence || 'online') : 'offline'; avatar.append(dot); }
      info.append(name, detail); row.append(avatar, info);
      const actions = document.createElement('div'); actions.className = 'friend-actions';
      if (kind === 'friends') {
        const chat = document.createElement('button');
        chat.type = 'button'; chat.className = 'btn-secondary'; chat.innerHTML = actionIcon('chat');
        chat.title = 'Conversar com ' + name.textContent; chat.setAttribute('aria-label', chat.title);
        chat.disabled = !socket.connected;
        chat.onclick = () => direct.open(person.id);
        const call = document.createElement('button');
        call.type = 'button'; call.className = 'btn-secondary'; call.innerHTML = actionIcon('phone');
        call.title = !calls.ready ? 'Ligações indisponíveis nesta conexão' : !person.online ? 'Amigo offline' : 'Ligar para ' + name.textContent;
        call.disabled = !calls.ready || !person.online || !socket.connected;
        call.setAttribute('aria-label', 'Ligar para ' + name.textContent);
        call.onclick = () => calls.invite(person);
        const notice = document.createElement('small');
        notice.className = 'friend-unread-label';
        notice.id = 'friend-unread-' + person.id;
        notice.dataset.unreadFor = person.id;
        notice.textContent = 'Nova mensagem';
        notice.hidden = !direct.unread.has(person.id);
        info.append(notice);
        if (!notice.hidden) chat.setAttribute('aria-describedby', notice.id);
        actions.append(chat, call);
      }
      for (const action of kind === 'incoming' ? ['accept', 'reject'] : kind === 'outgoing' ? ['cancel'] : ['remove']) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'btn-secondary';
        button.textContent = labels[action]; button.disabled = busy || !socket.connected;
        button.setAttribute('aria-label', `${labels[action]}: @${person.username}`);
        button.addEventListener('click', () => request(action, { accountId: person.id }));
        if (action === 'remove') {
          const more = document.createElement('details'), trigger = document.createElement('summary');
          trigger.textContent = '⋯'; trigger.title = 'Mais opções para ' + name.textContent;
          trigger.setAttribute('aria-label', trigger.title);
          more.append(trigger, button); actions.append(more);
        } else actions.append(button);
      }
      row.append(actions); root.append(row);
    }
  }
  const perfil = document.getElementById('user-popover-friend');
  let pessoa = null;
  function atualizarPerfil() {
    if (!perfil) return;
    const conta = getAccount();
    perfil.hidden = !pessoa || !conta || pessoa === conta.id || !supported;
    if (perfil.hidden) return;
    const tem = lista => lista.some(item => item.id === pessoa);
    const amigo = tem(state.friends), enviado = tem(state.outgoing), recebido = tem(state.incoming);
    const label = amigo ? 'Amigos' : enviado ? 'Pedido enviado' : recebido ? 'Aceitar pedido' : 'Adicionar amigo';
    perfil.querySelector('span').textContent = label;
    perfil.querySelector('[data-sinal]').setAttribute('d', amigo || recebido ? 'm15 11 2 2 4-5' : enviado ? 'M16 11h5' : 'M18 8v6m-3-3h6');
    perfil.dataset.estado = amigo ? 'amigos' : enviado ? 'pendente' : 'disponivel';
    perfil.disabled = busy || amigo || enviado || !socket.connected;
    perfil.onclick = () => request(recebido ? 'accept' : 'request', { accountId: pessoa }, true);
  }
  function render() {
    atualizarPerfil();
    const account = getAccount();
    direct.sync(state.friends);
    $('#friends-status').textContent = !account ? 'Use uma conta para salvar seus amigos entre o PC e o celular.'
      : !socket.connected ? 'Sem conexão. Os pedidos voltam a funcionar quando a sala reconectar.'
      : !supported ? 'Esta sala ainda não oferece amigos. Atualize o servidor para usar esse recurso.'
      : `Seu usuário: @${account.username}`;
    $('#friends-open-account').classList.toggle('hidden', Boolean(account));
    $('#friends-content').classList.toggle('hidden', !account || !supported);
    $('#friends-form button').disabled = busy || !socket.connected;
    const list = state.friends.filter(person => filter !== 'online' || (socket.connected && person.online))
      .sort((a, b) => Number(direct.unread.has(b.id)) - Number(direct.unread.has(a.id)) || Number(b.online) - Number(a.online) || (a.name || a.username).localeCompare(b.name || b.username, 'pt-BR'));
    $('#friends-count').textContent = (filter === 'online' ? 'Online' : 'Todos os amigos') + ' · ' + list.length;
    renderList('#friends-list', list, 'friends');
    $('[data-filter="requests"]').textContent = state.incoming.length ? 'Pedidos (' + state.incoming.length + ')' : 'Pedidos';
    renderList('#friends-incoming', state.incoming, 'incoming');
    renderList('#friends-outgoing', state.outgoing, 'outgoing');
    tab.querySelector('span').textContent = state.incoming.length && account ? `Amigos (${state.incoming.length})` : 'Amigos';
  }
  async function request(action, payload, peloPerfil = false) {
    if (busy || !socket.connected || !getAccount()) return;
    busy = true; feedback(); render();
    try {
      const result = await socket.timeout(10000).emitWithAck(`friend-${action}`, payload);
      if (!result?.success) throw new Error(result?.error || 'Não deu para concluir.');
      state = result;
      if (action === 'request' && !peloPerfil) $('#friend-username').value = '';
      feedback(action === 'request' ? 'Pedido enviado.' : action === 'accept' ? 'Amizade aceita.' : 'Lista atualizada.');
    } catch (error) {
      const aviso = error.message === 'operation has timed out' ? 'A sala demorou para responder. Confira a lista antes de tentar de novo.' : error.message;
      feedback(aviso, true);
      if (peloPerfil) showToast?.(aviso, 'error');
    } finally { busy = false; render(); }
  }
  calls.onReady = render;
  for (const button of tabs) button.addEventListener('click', () => {
    if (direct.unread.size) $('[data-filter="friends"]').click();
  });
  tab.addEventListener('click', () => {
    document.body.classList.add('friends-open');
    tab.setAttribute('aria-current', 'page');
    $('#friends-heading').focus();
  });
  section.querySelectorAll('[data-filter]').forEach(button => button.onclick = () => {
    filter = button.dataset.filter;
    for (const item of section.querySelectorAll('[data-filter]')) item.setAttribute('aria-pressed', String(item === button));
    for (const view of section.querySelectorAll('[data-friends-view]')) view.hidden = view.dataset.friendsView !==
      (['online', 'friends'].includes(filter) ? 'list' : filter);
    feedback(); render();
    if (filter === 'add') $('#friend-username').focus();
  });
  $('#friends-open-account').addEventListener('click', () => openSettings('conta'));
  $('#friends-form').addEventListener('submit', event => { event.preventDefault(); request('request', { username: $('#friend-username').value.trim() }); });
  socket.on('friends-state', next => { supported = next?.supported === true; state = { friends: next?.friends || [], incoming: next?.incoming || [], outgoing: next?.outgoing || [] }; render(); });
  socket.on('account-state', () => { if (!getAccount()) state = { friends: [], incoming: [], outgoing: [] }; render(); });
  socket.on('room-info', ({ assetKey: key } = {}) => { if (key) render(); });
  socket.on('connect', () => { supported = false; state = { friends: [], incoming: [], outgoing: [] }; render(); });
  socket.on('disconnect', render);
  render();
  return { mostrarPerfil(id) { pessoa = id; atualizarPerfil(); } };
}
