import test from 'node:test';
import assert from 'node:assert/strict';
import { createPrivateCalls } from '../private-calls.js';

test('ligação reserva a dupla, vincula a mídia ao aparelho que atendeu e revoga ao remover amizade', () => {
  let accepted = true;
  const sockets = new Map(), revoked = [];
  const calls = createPrivateCalls({
    io: { sockets: { sockets } }, secret: 'teste-local', path: '/ws', limit: () => false,
    accounts: { resolveSessionMeta: id => ({ account: { id } }), friends: id => ({ friends: accepted && id === 'ana' ? [{ id: 'bia' }] : [] }) },
    revoke: id => revoked.push(id)
  });
  function device(id, account) {
    const handlers = new Map(), events = [];
    const s = { id, connected: true, data: { accountSession: { account: { id: account } }, user: { name: account } },
      handshake: { auth: { accountToken: account } }, on: (key, fn) => handlers.set(key, fn),
      emit: (key, value) => events.push([key, value]) };
    sockets.set(id, s); calls.setup(s);
    const send = (key, payload) => { let reply; handlers.get(key)(payload, value => { reply = value; }); return reply; };
    send('private-ready', {});
    return { send, events };
  }
  const ana = device('a', 'ana'), bia = device('b', 'bia'), tablet = device('t', 'bia'), outra = device('c', 'outra');
  assert.ok(ana.send('private-invite', { accountId: 'outra' }).error);
  const { id } = ana.send('private-invite', { accountId: 'bia' });
  assert.ok(id); assert.equal(calls.count, 1);
  for (const aparelho of [bia, tablet]) assert.equal(aparelho.events.at(-1)[0], 'private-ring');
  assert.equal(outra.events.length, 0);
  assert.equal(ana.send('private-token', { id, role: 'host' }).ok, false);
  bia.send('private-answer', { id });
  const host = ana.send('private-token', { id, role: 'host' });
  const viewer = bia.send('private-token', { id, role: 'viewer' });
  assert.ok(host.ok && viewer.ok); assert.equal(host.sala, viewer.sala);
  assert.notEqual(bia.send('private-token', { id, role: 'host' }).sala, host.sala);
  assert.equal(tablet.send('private-token', { id }).ok, false);
  assert.equal(outra.send('private-token', { id }).ok, false);
  accepted = false; calls.validate();
  assert.equal(calls.count, 0); assert.equal(revoked.length, 2);
  assert.equal(bia.send('private-token', { id }).ok, false);
});
