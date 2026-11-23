export const permissionLabels = {
  kickMembers: 'Tirar pessoas da call', moveMembers: 'Mover pessoas entre calls',
  muteMembers: 'Mutar pessoas', deafenMembers: 'Ensurdecer pessoas', manageChannels: 'Gerenciar canais e visibilidade',
  manageRoles: 'Gerenciar cargos abaixo do seu', manageServer: 'Gerenciar imagem, senha e entrada do servidor', manageMessages: 'Moderar mensagens e soundboard'
};

export function hasPermission(state, permission) {
  return Boolean(state.isAdmin || state.permissions?.includes(permission));
}

export function setupPermissions({ socket, state, saveIdentity, showToast, escapeHtml, onChange }) {
  const $ = selector => document.querySelector(selector);
  let directory = { roles: [], members: [] }, editingChannel = null, accessRequest = 0, settingsTarget = null, settingsRequest = 0;
  const request = async (event, data) => {
    try {
      const result = await socket.timeout(5000).emitWithAck(event, data).catch(() => {
        throw new Error('O servidor demorou para responder. Tente de novo.');
      });
      if (!result?.success) throw new Error(result?.error || 'Não deu para salvar.');
      return result;
    } catch (err) { showToast(err.message || 'Espere a conexão voltar.', 'error'); return null; }
  };
  const options = (items, selected) => items.map(item => `<option value="${escapeHtml(item.id)}"${item.id === selected ? ' selected' : ''}>${escapeHtml(item.name)}</option>`).join('');
  const checks = (items, selected = []) => items.map(item => `<label class="permission-choice"><input type="checkbox" value="${escapeHtml(item.id)}"${selected.includes(item.id) ? ' checked' : ''}> <span>${escapeHtml(item.name)}</span></label>`).join('');
  const selected = selector => [...document.querySelectorAll(`${selector} input:checked`)].map(input => input.value);
  const renderAccess = (prefix, access = { roles: [], members: [] }) => {
    $(`#${prefix}-roles`).innerHTML = checks(directory.roles, access.roles);
    $(`#${prefix}-members`).innerHTML = checks(directory.members.map(m => ({ ...m, name: `${m.name} · ${m.id.slice(0, 6)}` })), access.members);
  };
  // Tela de configurações do canal: cargos viram chips e pessoas viram uma lista com busca.
  // O código curto do perfil só aparece quando dois perfis têm o mesmo nome.
  const iniciais = name => escapeHtml((name || '?').trim().slice(0, 2).toUpperCase());
  const matiz = id => [...String(id)].reduce((total, letra) => (total * 31 + letra.charCodeAt(0)) % 360, 7);
  const renderPicker = (prefix, access = { roles: [], members: [] }) => {
    const roles = access.roles || [], members = access.members || [];
    $(`#${prefix}-roles`).innerHTML = directory.roles.length
      ? directory.roles.map(role => `<label class="cs-chip"><input type="checkbox" value="${escapeHtml(role.id)}"${roles.includes(role.id) ? ' checked' : ''}><span>${escapeHtml(role.name)}</span></label>`).join('')
      : '<span class="cs-empty">Nenhum cargo criado ainda.</span>';
    const repetidos = new Set(directory.members.map(m => m.name).filter((name, i, all) => all.indexOf(name) !== i));
    const ordem = [...directory.members].sort((a, b) => (members.includes(b.id) - members.includes(a.id)) || a.name.localeCompare(b.name, 'pt-BR'));
    $(`#${prefix}-members`).innerHTML = ordem.map(m => `<label class="cs-person" data-busca="${escapeHtml(m.name.toLowerCase())}">
      <input type="checkbox" value="${escapeHtml(m.id)}"${members.includes(m.id) ? ' checked' : ''}>
      <span class="cs-person-avatar" style="--cor: hsl(${matiz(m.id)} 52% 44%)" aria-hidden="true">${iniciais(m.name)}</span>
      <span class="cs-person-name">${escapeHtml(m.name)}${repetidos.has(m.name) ? `<small> · ${escapeHtml(m.id.slice(0, 6))}</small>` : ''}</span>
      <span class="cs-check" aria-hidden="true"></span></label>`).join('') || '<span class="cs-empty">Ninguém entrou na sala ainda.</span>';
    $(`#${prefix}-search`).value = '';
    $(`#${prefix}-search`).hidden = directory.members.length < 8;
    contarEscolhidos(prefix);
  };
  const contarEscolhidos = prefix => {
    const total = document.querySelectorAll(`#${prefix}-members input:checked`).length;
    $(`#${prefix}-count`).textContent = total ? `${total} ${total === 1 ? 'escolhida' : 'escolhidas'}` : 'ninguém escolhido';
  };
  for (const prefix of ['channel-settings-access', 'channel-settings-write']) {
    $(`#${prefix}-members`).addEventListener('change', () => contarEscolhidos(prefix));
    $(`#${prefix}-search`).addEventListener('input', event => {
      const busca = event.target.value.trim().toLowerCase();
      for (const row of document.querySelectorAll(`#${prefix}-members .cs-person`)) row.hidden = Boolean(busca) && !row.dataset.busca.includes(busca);
    });
  }
  const setMode = (prefix, restrito, travado = false) => {
    $(`#${prefix}-private`).checked = restrito;
    $(`#${prefix}-public`).checked = !restrito;
    for (const radio of [$(`#${prefix}-private`), $(`#${prefix}-public`)]) radio.disabled = travado;
  };
  const readAccess = prefix => ({ private: $(`#${prefix}-private`).checked, roles: selected(`#${prefix}-roles`), members: selected(`#${prefix}-members`) });
  const openChannelSettings = async (type, channelId) => {
    const generation = ++settingsRequest;
    settingsTarget = null;
    const result = await request('get-channel-settings', { type, channelId });
    if (!result || generation !== settingsRequest) return;
    settingsTarget = { type, channelId };
    const ch = result.channel;
    $('#channel-settings-title').textContent = `Configurar ${type === 'text' ? '#' : ''}${ch.name}`;
    $('#channel-settings-name').value = ch.name;
    $('#channel-settings-description').value = ch.description || '';
    setMode('channel-settings-access', ch.access.private, ch.isDefault);
    $('#channel-settings-access-note').textContent = ch.isDefault ? 'O Geral fica sempre aberto pra sala inteira.' : 'O dono sempre vê.';
    setMode('channel-settings-write', ch.writeAccess.private);
    renderPicker('channel-settings-access', ch.access);
    renderPicker('channel-settings-write', ch.writeAccess);
    $('#channel-settings-password-field').classList.toggle('hidden', type === 'text');
    $('#channel-settings-password').value = '';
    $('#channel-settings-password').placeholder = ch.hasPassword ? 'Tem senha. Deixe vazio pra manter.' : 'Sem senha';
    $('#channel-settings-remove-password').checked = false;
    $('#channel-settings-remove-password-row').hidden = !ch.hasPassword;
    $('#modal-channel-settings').classList.remove('hidden');
    $('#channel-settings-name').focus();
  };
  $('#form-channel-settings').addEventListener('submit', async event => {
    event.preventDefault();
    if (!settingsTarget) return;
    const payload = { ...settingsTarget, name: $('#channel-settings-name').value, description: $('#channel-settings-description').value,
      access: readAccess('channel-settings-access'), writeAccess: readAccess('channel-settings-write') };
    if (payload.type === 'voice') {
      if ($('#channel-settings-remove-password').checked) payload.password = '';
      else if ($('#channel-settings-password').value) payload.password = $('#channel-settings-password').value;
    }
    if (await request('channel-settings', payload)) {
      $('#modal-channel-settings').classList.add('hidden');
      showToast('Configurações do canal salvas.', 'success');
    }
  });
  $('#btn-owner-transfer').addEventListener('click', async () => {
    const memberId = $('#owner-transfer-member').value;
    const member = directory.members.find(m => m.id === memberId);
    if (!member || !window.confirm(`Transferir a propriedade para ${member.name} (${memberId.slice(0, 6)})? Você deixará de ser dono deste servidor.`)) return;
    if (await request('owner-transfer', { memberId })) showToast('Propriedade transferida.', 'success');
  });
  const fillRole = () => {
    const role = directory.roles.find(r => r.id === $('#permission-role-id').value);
    $('#permission-role-name').value = role?.name || '';
    $('#permission-role-position').value = role?.position || 10;
    $('#permission-role-delete').disabled = !role;
    $('#permission-role-flags').innerHTML = checks(Object.entries(permissionLabels).map(([id, name]) => ({ id, name })), role?.permissions);
  };
  const fillMember = () => {
    const member = directory.members.find(m => m.id === $('#permission-member-id').value);
    $('#permission-member-roles').innerHTML = checks(directory.roles, member?.roles);
    $('#permission-member-save').disabled = !member;
  };
  const loadChannel = async () => {
    const channelId = $('#permission-channel-id').value;
    const generation = ++accessRequest;
    editingChannel = null;
    $('#permission-channel-save').disabled = true;
    if (!channelId) return;
    const result = await request('get-channel-access', { channelId });
    if (!result || generation !== accessRequest) return;
    editingChannel = channelId;
    $('#channel-access-private').checked = result.access.private;
    renderAccess('channel-access', result.access);
    $('#permission-channel-save').disabled = false;
  };
  const refreshChannels = () => {
    const selector = $('#permission-channel-id');
    if (!selector) return;
    const current = selector.value;
    const channels = [...state.channels.values()].filter(ch => ch.canManageAccess);
    selector.innerHTML = '<option value="">Escolha um canal</option>' + options(channels, current);
    if (editingChannel && !channels.some(ch => ch.id === editingChannel)) { editingChannel = null; $('#permission-channel-save').disabled = true; }
  };
  $('#permission-role-id').addEventListener('change', fillRole);
  $('#permission-member-id').addEventListener('change', fillMember);
  $('#permission-channel-id').addEventListener('change', loadChannel);
  $('#permission-role-form').addEventListener('submit', async event => {
    event.preventDefault();
    const result = await request('role-save', { id: $('#permission-role-id').value || undefined, name: $('#permission-role-name').value,
      position: Number($('#permission-role-position').value), permissions: selected('#permission-role-flags') });
    if (result) { $('#permission-role-id').value = result.role.id; fillRole(); showToast('Cargo salvo.', 'success'); }
  });
  $('#permission-role-delete').addEventListener('click', async () => {
    const id = $('#permission-role-id').value;
    if (id && await request('role-delete', { id })) { fillRole(); showToast('Cargo removido.', 'success'); }
  });
  $('#permission-member-save').addEventListener('click', async () => {
    if (await request('member-roles', { memberId: $('#permission-member-id').value, roles: selected('#permission-member-roles') })) showToast('Cargos da pessoa salvos.', 'success');
  });
  $('#btn-permissions-clean-dedup')?.addEventListener('click', async () => {
    const result = await request('permissions-clean-members', { mode: 'dedup' });
    if (result) showToast(`Lista limpa (${result.merged || 0} mesclados, ${result.removed || 0} removidos).`, 'success');
  });
  $('#btn-permissions-clean-reset')?.addEventListener('click', async () => {
    if (!window.confirm('Resetar os códigos únicos de quem está offline? O seu perfil de dono e quem estiver online agora serão mantidos.')) return;
    const result = await request('permissions-clean-members', { mode: 'reset' });
    if (result) showToast(`Códigos únicos resetados (${result.removed || 0} antigos removidos).`, 'success');
  });
  $('#permission-channel-save').addEventListener('click', async () => {
    if (editingChannel && await request('channel-access', { channelId: editingChannel, access: readAccess('channel-access') })) showToast('Visibilidade do canal salva.', 'success');
  });
  $('#new-channel-access-private').addEventListener('change', () => {
    $('#new-channel-access-choices').classList.toggle('hidden', !$('#new-channel-access-private').checked);
  });
  socket.on('permission-identity', ({ token }) => { if (typeof token === 'string') saveIdentity(token); });
  socket.on('permissions-state', payload => {
    state.memberId = payload.memberId;
    state.permissions = payload.permissions || [];
    state.permissionRoles = payload.roles || [];
    $('#permission-device').textContent = payload.memberId ? `ID do seu perfil neste servidor: ${payload.memberId}. Permanece ao atualizar o app.` : '';
    state.ownershipSupported = payload.ownershipVersion === 2;
    state.isOwner = state.ownershipSupported && payload.owner === true;
    state.legacyAdmin = !state.ownershipSupported && payload.owner === true;
    state.isAdmin = state.isOwner || state.legacyAdmin;
    state.ownerClaimed = Boolean(payload.ownerClaimed);
    $('#permission-status').textContent = state.isOwner ? 'Você é o dono deste servidor. Seu perfil é reconhecido ao reabrir o app.'
      : state.legacyAdmin ? 'Você é admin neste servidor antigo. Isso não significa ser dono. Atualize o servidor para usar propriedade e cargos.'
      : state.permissionRoles.length ? `Seus cargos: ${state.permissionRoles.map(r => r.name).join(', ')}` : 'Seu perfil ainda não tem cargos neste servidor.';
    $('#permission-management').classList.toggle('hidden', !payload.directory);
    $('#permission-role-management').classList.toggle('hidden', !hasPermission(state, 'manageRoles'));
    $('#owner-transfer').classList.toggle('hidden', !state.isOwner);
    $('#btn-permissions-clean-reset')?.classList.toggle('hidden', !state.isOwner);
    $('#new-channel-access').classList.toggle('hidden', !hasPermission(state, 'manageChannels'));
    if (payload.directory) {
      const previous = directory;
      directory = payload.directory;
      const candidates = directory.members.filter(m => m.id !== payload.memberId).map(m => ({ ...m, name: `${m.name} · ${m.id.slice(0, 6)}` }));
      $('#owner-transfer-member').innerHTML = options(candidates, $('#owner-transfer-member').value);
      $('#btn-owner-transfer').disabled = !candidates.length;
      const rolesChanged = JSON.stringify(directory.roles) !== JSON.stringify(previous.roles);
      const membersChanged = JSON.stringify(directory.members) !== JSON.stringify(previous.members);
      if (rolesChanged || membersChanged) {
        const roleId = $('#permission-role-id').value, memberId = $('#permission-member-id').value;
        const draft = readAccess('new-channel-access');
        if (rolesChanged) {
          $('#permission-role-id').innerHTML = '<option value="">Criar cargo</option>' + options(directory.roles, roleId);
          fillRole();
        }
        $('#permission-member-id').innerHTML = options(directory.members.map(m => ({ ...m, name: `${m.name} · ${m.id.slice(0, 6)}` })), memberId);
        fillMember(); renderAccess('new-channel-access', draft);
        if (editingChannel) renderAccess('channel-access', readAccess('channel-access'));
      }
    }
    if (!hasPermission(state, 'manageChannels')) $('#modal-channel-settings').classList.add('hidden');
    refreshChannels(); onChange();
  });
  fillRole();
  return { refreshChannels, openChannelSettings, newAccess: () => hasPermission(state, 'manageChannels') && $('#new-channel-access-private').checked ? readAccess('new-channel-access') : undefined };
}
