// Convites duram 30 s. Cada conta participa em um único aparelho após o aceite.
import { effectivePresence } from './public/presence.js';
import { randomUUID, randomBytes, createHmac } from 'node:crypto';

export function createPrivateCalls({ io, accounts, secret, path, revoke, limit }) {
  const byAccount = new Map();
  const identity = s => s.connected && !s.data.accountEnding && s.data.accountSession &&
    accounts.resolveSessionMeta(s.handshake.auth?.accountToken)?.account.id;
  const friends = (a, b) => accounts.friends(a).friends.some(person => person.id === b);
  const available = s => s.data.privateVoice && !s.data.user.channelId &&
    !s.data.user.serverMuted && !s.data.user.serverDeafened;
  function finish(call, reason) {
    clearTimeout(call.timer);
    for (const id of call.accounts) byAccount.delete(id);
    for (const s of [call.caller, ...call.targets]) s.emit('private-ended', { id: call.id, reason });
    if (call.peer) call.media.forEach(revokeId => revoke(revokeId));
  }
  function validate() {
    for (const call of new Set(byAccount.values())) {
      if (!friends(...call.accounts) || !identity(call.caller) || !available(call.caller) ||
          (call.peer && (!identity(call.peer) || !available(call.peer))))
        finish(call, 'Ligação encerrada.');
    }
  }
  function setup(s) {
    s.on('private-ready', (_, ack) => {
      s.data.privateVoice = Boolean(secret && identity(s));
      if (typeof ack === 'function') ack(s.data.privateVoice);
    });
    s.on('private-invite', (data, ack) => {
      if (typeof ack !== 'function') return;
      const me = identity(s), other = data?.accountId;
      const fail = error => ack({ error });
      if (!secret || !me || !available(s)) return fail('Saia do canal de voz para ligar.');
      if (limit('private-invite:' + me, 8)) return fail('Espere um pouco antes de ligar de novo.');
      if (typeof other !== 'string' || !friends(me, other)) return fail('A ligação exige uma amizade aceita.');
      if (byAccount.has(me)) return fail('Já existe uma ligação em andamento.');
      const targets = [...io.sockets.sockets.values()].filter(client => identity(client) === other && available(client)
        && effectivePresence(client.data.user) !== 'offline');
      if (!targets.length || byAccount.has(other)) return fail('Seu amigo está indisponível para ligações.');
      const call = { id: randomUUID(), accounts: [me, other], caller: s, targets, peer: null };
      call.accounts.forEach(id => byAccount.set(id, call));
      call.timer = setTimeout(() => finish(call, 'Ninguém atendeu.'), 30000).unref();
      ack({ id: call.id });
      targets.forEach(target => target.emit('private-ring', { id: call.id, name: s.data.user.name }));
    });
    s.on('private-answer', data => {
      const call = byAccount.get(identity(s));
      if (!call || call.id !== data?.id || call.peer || !call.targets.includes(s)) return;
      if (!available(s) || !identity(call.caller) || !friends(...call.accounts)) return finish(call, 'Ligação indisponível.');
      clearTimeout(call.timer);
      call.peer = s;
      call.media = [randomBytes(16).toString('hex'), randomBytes(16).toString('hex')];
      for (const target of call.targets) if (target !== s) target.emit('private-ended', { id: call.id });
      call.targets = [s];
      for (const [client, other] of [[s, call.caller], [call.caller, s]]) client.emit('private-active', { id: call.id, peer: other.id });
    });
    s.on('private-end', data => {
      const call = byAccount.get(identity(s));
      if (call && data?.id === call.id && (s === call.caller || call.targets.includes(s)))
        finish(call, call.peer ? 'Ligação encerrada.' : s === call.caller ? 'Ligação cancelada.' : 'Ligação recusada.');
    });
    s.on('private-token', (data, ack) => {
      if (typeof ack !== 'function') return;
      const call = byAccount.get(identity(s));
      if (!call?.peer || data?.id !== call.id || ![call.peer, call.caller].includes(s) ||
          !available(s) || !friends(...call.accounts)) return ack({ ok: false });
      const index = Number(s === call.peer);
      const role = data.role === 'host' ? 'host' : 'viewer';
      const sala = 'priv-' + call.id + '-' + (role === 'host' ? index : 1 - index);
      const exp = String(Math.floor(Date.now() / 1000) + 60), media = call.media[index];
      const signature = createHmac('sha256', secret).update([sala, role, exp, media].join('|')).digest('hex');
      ack({ ok: true, path, sala, role, exp, token: media + '.' + signature });
    });
    s.on('disconnect', () => {
      const call = byAccount.get(s.data.accountSession?.account.id);
      if (!call) return;
      if (s === call.caller || s === call.peer) return finish(call, 'A conexão caiu.');
      call.targets = call.targets.filter(target => target !== s);
      if (!call.targets.length) finish(call, 'Seu amigo desconectou.');
    });
  }
  return { setup, validate, busy: s => byAccount.has(identity(s)), get count() { return byAccount.size / 2; } };
}
