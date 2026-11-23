// Uma atualização de presença pode reconstruir o índice durante a navegação.
export function canalComFoco(arvore) {
  const linha = document.activeElement;
  if (document.documentElement.dataset.visual !== 'terminal' || !linha?.matches('.channel-row') || !arvore.contains(linha)) return '';
  return linha.parentElement.dataset.channelId || linha.parentElement.dataset.textChannelId;
}

export function restaurarFocoDoCanal(arvore, id) {
  if (!id) return;
  const valor = CSS.escape(id);
  arvore.querySelector(`:is([data-channel-id="${valor}"], [data-text-channel-id="${valor}"]) > .channel-row`)?.focus({ preventScroll: true });
}

// Depois que a pessoa usa as teclas uma vez, o aviso da barra lateral sai do caminho.
const AVISO_VISTO = 'teletela-terminal-teclas-visto';
function marcarTeclasVistas() {
  try { localStorage.setItem(AVISO_VISTO, '1'); } catch {}
  document.getElementById('terminal-teclas')?.classList.add('visto');
}
export function esconderAvisoSeJaVisto() {
  let visto = false;
  try { visto = localStorage.getItem(AVISO_VISTO) === '1'; } catch {}
  if (visto) document.getElementById('terminal-teclas')?.classList.add('visto');
}

// ↑ ↓ Home End andam entre as linhas; serve pra barra lateral e pra lista do início.
export function configurarIndiceTerminal(indice, seletor = '.channel-row') {
  indice.addEventListener('keydown', evento => {
    if (document.documentElement.dataset.visual !== 'terminal' || !evento.target.matches(seletor)) return;
    if (evento.altKey || evento.ctrlKey || evento.metaKey || evento.shiftKey) return;
    const teclas = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!teclas.includes(evento.key)) return;
    const linhas = [...indice.querySelectorAll(seletor)].filter(linha => linha.getClientRects().length);
    const atual = linhas.indexOf(evento.target);
    const destinos = { ArrowDown: Math.min(linhas.length - 1, atual + 1), ArrowUp: Math.max(0, atual - 1), Home: 0, End: linhas.length - 1 };
    evento.preventDefault();
    linhas[destinos[evento.key]]?.focus();
    marcarTeclasVistas();
  });
}

// Teclas 1 a 9 entram no canal de voz com aquele número (o mesmo da lista do início).
// Não valem enquanto a pessoa digita ou com alguma janela aberta por cima.
export function configurarNumerosTerminal(entrar) {
  document.addEventListener('keydown', evento => {
    if (document.documentElement.dataset.visual !== 'terminal' || !/^[1-9]$/.test(evento.key)) return;
    if (evento.altKey || evento.ctrlKey || evento.metaKey || evento.repeat) return;
    const alvo = evento.target;
    if (alvo.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return;
    if (document.querySelector('.modal-backdrop:not(.hidden), dialog[open]')) return;
    if (entrar(Number(evento.key) - 1)) { evento.preventDefault(); marcarTeclasVistas(); }
  });
}
