// Escolhe o codec da transmissão. H.264 só quando o PC informa codificação pela placa de
// vídeo (NVENC, QuickSync, AMF); sem isso o H.264 roda no processador e não ganha do VP8.
// Para teste: localStorage 'teletela-codec-video' = 'h264' ou 'vp8' força um deles.
const CHAVE = 'teletela-codec-video';
let escolha = null;

export function codecPorCapacidade(forcado, h264, vp8) {
  if (forcado === 'h264' || forcado === 'vp8') return forcado;
  return h264?.supported && h264.powerEfficient && !vp8?.powerEfficient ? 'h264' : 'vp8';
}

export function escolherCodecVideo() {
  if (escolha) return escolha;
  escolha = (async () => {
    let forcado = null;
    try { forcado = localStorage.getItem(CHAVE); } catch { /* armazenamento indisponível */ }
    if (forcado === 'h264' || forcado === 'vp8') return forcado;
    const consulta = contentType => navigator.mediaCapabilities?.encodingInfo?.({
      type: 'webrtc', video: { contentType, width: 1920, height: 1080, bitrate: 5500000, framerate: 60 }
    }).catch(() => null);
    const [h264, vp8] = await Promise.all([consulta('video/H264'), consulta('video/VP8')]);
    return codecPorCapacidade(null, h264, vp8);
  })().catch(() => 'vp8');
  return escolha;
}

// H.264 de perfil básico com packetization-mode=1 primeiro: é o que os codificadores de
// placa geram e o que o SFU aceita. Os outros codecs continuam como reserva.
export function ordenarCodecs(codecs, codec) {
  if (codec !== 'h264') return codecs;
  const nota = c => {
    if (!/^video\/H264$/i.test(c.mimeType)) return /^video\/VP8$/i.test(c.mimeType) ? 2 : 3;
    const fmtp = c.sdpFmtpLine || '';
    if (!/packetization-mode=1/.test(fmtp)) return 3;
    return /profile-level-id=42e0/i.test(fmtp) ? 0 : 1;
  };
  return codecs.map((c, i) => [nota(c), i, c]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(x => x[2]);
}

export async function preferirCodecVideo(pc) {
  const codec = await escolherCodecVideo();
  // O Chromium valida a lista contra os codecs de recepção, não os de envio.
  if (codec !== 'h264' || typeof RTCRtpReceiver === 'undefined' || !RTCRtpReceiver.getCapabilities) return codec;
  const codecs = ordenarCodecs(RTCRtpReceiver.getCapabilities('video')?.codecs || [], codec);
  for (const transceiver of pc.getTransceivers()) {
    if (transceiver.sender?.track?.kind !== 'video' || !transceiver.setCodecPreferences) continue;
    try { transceiver.setCodecPreferences(codecs); } catch (error) { console.warn('[WebRTC] Preferência de codec recusada.', error); }
  }
  return codec;
}
