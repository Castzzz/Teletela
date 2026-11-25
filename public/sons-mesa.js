// Sons das atividades (21, apostas, poker). Saem pelo mesmo caminho do áudio da call,
// então ensurdecer cala tudo. O botão de som da mesa liga/desliga pra todas elas.
const CHAVE_SOM = 'teletela-mesa-sons';
const SONS = ['embaralhar', 'carta-1', 'carta-2', 'carta-3', 'virar', 'leque', 'ficha-1', 'ficha-2', 'fichas', 'pote', 'bater'];
const buffers = new Map();

export const somLigado = () => localStorage.getItem(CHAVE_SOM) !== '0';
export function ligarSom(ligado) { localStorage.setItem(CHAVE_SOM, ligado ? '1' : '0'); }

export function criarSons(appState, podeTocar = () => true) {
  function saidaDeAudio() {
    const mixer = appState.mixerManager;
    return mixer?.audioContext && mixer.masterDeafenGain ? [mixer.audioContext, mixer.masterDeafenGain] : [];
  }
  function carregar(ctx, nome) {
    if (!buffers.has(nome)) {
      buffers.set(nome, fetch('./mesa-sons/' + nome + '.ogg').then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).catch(() => null));
    }
    return buffers.get(nome);
  }
  function tocar(nome, atraso = 0, volume = .55) {
    if (!somLigado() || !podeTocar() || appState.myUser?.isDeafened) return;
    const [ctx, saida] = saidaDeAudio();
    if (!ctx) return;
    carregar(ctx, nome).then(buffer => {
      if (!buffer) return;
      const fonte = ctx.createBufferSource();
      const ganho = ctx.createGain();
      fonte.buffer = buffer;
      // Um tiquinho de variação pra carta seguida não soar como metralhadora.
      fonte.playbackRate.value = .94 + Math.random() * .12;
      ganho.gain.value = volume;
      fonte.connect(ganho).connect(saida);
      fonte.start(ctx.currentTime + atraso / 1000);
    });
  }
  // Sua vez: duas notas de sino, feitas na hora (sem arquivo). Toca mesmo com a mesa
  // fechada, porque o tempo está correndo; o botão de som da mesa e ensurdecer calam.
  tocar.vez = (atraso = 0) => {
    if (!somLigado() || appState.myUser?.isDeafened) return;
    const [ctx, saida] = saidaDeAudio();
    if (!ctx) return;
    const inicio = ctx.currentTime + atraso / 1000;
    for (const [i, nota] of [880, 1318.5].entries()) {
      const t = inicio + i * .13;
      const ganho = ctx.createGain();
      ganho.gain.setValueAtTime(0, t);
      ganho.gain.linearRampToValueAtTime(.16 - i * .03, t + .008);
      ganho.gain.exponentialRampToValueAtTime(.0001, t + .9);
      ganho.connect(saida);
      // Fundamental + um harmônico baixinho: soa como sino, não como bipe
      for (const [mult, vol] of [[1, 1], [2.76, .18]]) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = nota * mult;
        g.gain.value = vol;
        osc.connect(g).connect(ganho);
        osc.start(t);
        osc.stop(t + 1);
      }
    }
  };
  // Carregar no primeiro clique deixa o primeiro som sem atraso.
  tocar.precarregar = () => {
    const [ctx] = saidaDeAudio();
    if (ctx) for (const nome of SONS) carregar(ctx, nome);
  };
  return tocar;
}

export const somDeCarta = () => 'carta-' + (1 + Math.floor(Math.random() * 3));
export const somDeFicha = () => 'ficha-' + (1 + Math.floor(Math.random() * 2));
