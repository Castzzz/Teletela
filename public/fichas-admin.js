import { confirmar } from './confirmar.js';

// Configurações → Servidor e cargos: o dono soma ou tira fichas de uma pessoa, ou recarrega todo mundo.
const numero = n => n.toLocaleString('pt-BR');

export function configurarFichasAdmin({ socket, appState, showToast }) {
  const bloco = document.querySelector('#fichas-admin');
  const select = document.querySelector('#fichas-admin-pessoa');
  const quanto = document.querySelector('#fichas-admin-quanto');
  const mais = document.querySelector('#fichas-admin-mais');
  const menos = document.querySelector('#fichas-admin-menos');
  const todos = document.querySelector('#fichas-admin-todos');
  const status = document.querySelector('#fichas-admin-status');
  if (!bloco) return { render() {}, carregar() {} };

  let lista_ = [], ocupado = false;
  const digitado = () => Math.floor(Number(quanto.value));
  function atualizarBotoes() {
    const ok = lista_.length > 0 && digitado() >= 1 && !ocupado;
    mais.disabled = menos.disabled = !ok;
  }
  quanto.addEventListener('input', atualizarBotoes);

  function preencher(lista) {
    const escolhida = select.value;
    select.replaceChildren(...lista.map(p => {
      const op = document.createElement('option');
      op.value = p.chave;
      op.textContent = p.nome + ' · ' + numero(p.saldo) + ' fichas' + (p.zerado ? ' (zerou)' : '');
      return op;
    }));
    if (lista.some(p => p.chave === escolhida)) select.value = escolhida;
    lista_ = lista;
    atualizarBotoes();
    todos.disabled = !lista.length;
    status.textContent = lista.length ? '' : 'Ninguém jogou valendo fichas ainda.';
  }

  function carregar() {
    if (!appState.isOwner) return;
    socket.timeout(5000).emit('fichas-admin-lista', {}, (erro, res) => {
      if (erro || !res?.success) { status.textContent = res?.error || 'A lista de fichas não respondeu.'; return; }
      preencher(res.lista);
    });
  }

  async function resetar(pedido, pergunta, aviso) {
    if (!await confirmar(pergunta, { confirmar: 'Recarregar' })) return;
    todos.disabled = true;
    socket.timeout(5000).emit('fichas-admin-resetar', pedido, (erro, res) => {
      if (erro || !res?.success) {
        showToast(res?.error || 'Não deu pra recarregar as fichas.', 'error');
        carregar();
        return;
      }
      preencher(res.lista);
      showToast(aviso(res.quantos), 'success');
    });
  }

  // Adicionar ou remover: sem confirmação, o toast mostra o saldo novo e dá pra desfazer
  // fazendo o contrário. Remover mais do que a pessoa tem zera a carteira.
  function ajustar(sinal) {
    const n = digitado();
    const nome = select.selectedOptions[0]?.textContent.split(' · ')[0];
    if (!select.value || !(n >= 1)) return;
    ocupado = true; atualizarBotoes();
    socket.timeout(5000).emit('fichas-admin-ajustar', { chave: select.value, quanto: sinal * n }, (erro, res) => {
      ocupado = false;
      if (erro || !res?.success) {
        showToast(res?.error || 'Não deu pra mudar as fichas.', 'error');
        carregar();
        return;
      }
      preencher(res.lista);
      showToast((sinal > 0 ? `+${numero(n)} pra ${nome}` : `−${numero(n)} de ${nome}`) + `. Agora tem ${numero(res.saldo)} fichas.`, 'success');
    });
  }
  mais.addEventListener('click', () => ajustar(1));
  menos.addEventListener('click', () => ajustar(-1));
  quanto.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); if (!mais.disabled) ajustar(1); } });

  todos.addEventListener('click', () => {
    resetar({ todos: true }, 'Recarregar as fichas de TODO MUNDO pra 1.000? O ranking recomeça do zero.',
      n => `Fichas recarregadas pra ${n} ${n === 1 ? 'pessoa' : 'pessoas'}.`);
  });

  return {
    // Só o dono vê o bloco; a lista é buscada quando ele aparece.
    render() {
      const visivel = Boolean(appState.isOwner);
      const estava = !bloco.classList.contains('hidden');
      bloco.classList.toggle('hidden', !visivel);
      if (visivel && !estava) carregar();
    },
    carregar
  };
}
