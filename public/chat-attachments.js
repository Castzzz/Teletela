// Prepara a imagem pro chat: foto parada é reduzida (lado maior até 1920 px, WebP);
// GIF vai como está pra continuar animado. Máximo 15 MB.
const MAX_CHAT_IMAGE_BYTES = 15 * 1024 * 1024;
const CHAT_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

async function prepareChatImage(file) {
  if (!CHAT_IMAGE_TYPES.includes(file.type)) throw new Error('Só dá pra mandar PNG, JPG, WebP ou GIF.');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Não consegui abrir essa imagem.'));
      el.src = url;
    });
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (file.type === 'image/gif') {
      if (file.size > MAX_CHAT_IMAGE_BYTES) throw new Error('GIF grande demais (máximo 15 MB).');
      return { data: await file.arrayBuffer(), mime: file.type, width, height };
    }
    const scale = Math.min(1, 1920 / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
    // Ficou maior que o original (print pequeno, PNG simples)? Manda o original
    const useOriginal = !blob || (scale === 1 && file.size <= blob.size);
    const out = useOriginal ? file : blob;
    if (out.size > MAX_CHAT_IMAGE_BYTES) throw new Error('Imagem grande demais (máximo 15 MB).');
    return {
      data: await out.arrayBuffer(),
      mime: useOriginal ? file.type : 'image/webp',
      width: useOriginal ? width : canvas.width,
      height: useOriginal ? height : canvas.height
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}


export async function attachmentPayload(file) {
  if (!file.size) throw new Error('Escolha um arquivo que não esteja vazio.');
  if (!CHAT_IMAGE_TYPES.includes(file.type)) {
    if (file.size > MAX_ATTACHMENT_BYTES) throw new Error('Arquivo grande demais (máximo 20 MB).');
    return { data: await file.arrayBuffer(), mime: file.type, name: file.name };
  }
  const image = await prepareChatImage(file);
  const name = image.mime === file.type ? file.name : file.name.replace(/\.[^.]*$/, '') + '.webp';
  return { ...image, name };
}

// O arquivo só sai do aparelho quando o formulário é enviado.
export function attachmentDraft({ picker, input, preview, dropZone, destination, report }) {
  let file = null, source = '', target = null;
  function clear() {
    if (source) URL.revokeObjectURL(source);
    source = ''; file = target = null;
    preview.replaceChildren(); preview.hidden = true;
  }
  function stage(next) {
    if (!next || input.disabled || !destination()) return;
    if (!next.size || (!CHAT_IMAGE_TYPES.includes(next.type) && next.size > MAX_ATTACHMENT_BYTES)) {
      report(!next.size ? 'Esse arquivo está vazio.' : 'Arquivo grande demais (máximo 20 MB).');
      return;
    }
    clear(); file = next; target = destination();
    if (CHAT_IMAGE_TYPES.includes(file.type) || ['video/mp4', 'video/webm'].includes(file.type)) {
      const media = document.createElement(file.type.startsWith('image/') ? 'img' : 'video');
      source = URL.createObjectURL(file); media.src = source;
      if (media.tagName === 'IMG') media.alt = 'Prévia da imagem';
      else { media.muted = true; media.preload = 'metadata'; }
      preview.append(media);
    }
    const label = document.createElement('span'), remove = document.createElement('button');
    label.textContent = file.name || 'Arquivo';
    remove.type = 'button'; remove.className = 'btn-secondary'; remove.textContent = 'Remover';
    remove.setAttribute('aria-label', 'Remover anexo do rascunho');
    remove.onclick = () => { clear(); input.focus(); };
    preview.append(label, remove); preview.hidden = false; input.focus();
  }
  picker.addEventListener('change', () => { stage(picker.files[0]); picker.value = ''; });
  input.addEventListener('paste', event => {
    const next = event.clipboardData?.files[0];
    if (next) { event.preventDefault(); stage(next); }
  });
  dropZone.addEventListener('dragover', event => {
    if (event.dataTransfer?.types.includes('Files')) { event.preventDefault(); dropZone.classList.add('drag-over'); }
  });
  dropZone.addEventListener('dragleave', event => { if (!dropZone.contains(event.relatedTarget)) dropZone.classList.remove('drag-over'); });
  dropZone.addEventListener('drop', event => {
    dropZone.classList.remove('drag-over');
    const next = event.dataTransfer?.files[0];
    if (next) { event.preventDefault(); stage(next); }
  });
  return { clear, sync() { if (file && target !== destination()) clear(); }, get file() { return file; } };
}
