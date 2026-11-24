import test from 'node:test';
import assert from 'node:assert/strict';
import { codecPorCapacidade, ordenarCodecs } from '../public/video-codec.js';

test('usa H.264 só quando o PC codifica pela placa e o VP8 não', () => {
  assert.equal(codecPorCapacidade(null, { supported: true, powerEfficient: true }, { supported: true, powerEfficient: false }), 'h264');
  assert.equal(codecPorCapacidade(null, { supported: true, powerEfficient: false }, { supported: true, powerEfficient: false }), 'vp8');
  assert.equal(codecPorCapacidade(null, { supported: true, powerEfficient: true }, { supported: true, powerEfficient: true }), 'vp8');
  assert.equal(codecPorCapacidade(null, null, null), 'vp8');
  assert.equal(codecPorCapacidade('h264', null, null), 'h264');
  assert.equal(codecPorCapacidade('vp8', { supported: true, powerEfficient: true }, null), 'vp8');
});

test('põe H.264 básico com packetization-mode=1 na frente e mantém o resto como reserva', () => {
  const codecs = [
    { mimeType: 'video/VP8' },
    { mimeType: 'video/rtx', sdpFmtpLine: 'apt=96' },
    { mimeType: 'video/H264', sdpFmtpLine: 'packetization-mode=0;profile-level-id=42e01f' },
    { mimeType: 'video/H264', sdpFmtpLine: 'packetization-mode=1;profile-level-id=4d001f' },
    { mimeType: 'video/H264', sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f' },
    { mimeType: 'video/AV1' }
  ];
  const ordem = ordenarCodecs(codecs, 'h264');
  assert.equal(ordem[0].sdpFmtpLine, 'level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f');
  assert.equal(ordem[1].sdpFmtpLine, 'packetization-mode=1;profile-level-id=4d001f');
  assert.equal(ordem[2].mimeType, 'video/VP8');
  assert.equal(ordem.length, codecs.length);
  assert.equal(ordenarCodecs(codecs, 'vp8'), codecs);
});
