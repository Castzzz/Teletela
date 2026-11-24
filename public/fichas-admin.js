import { confirmar } from './confirmar.js';

// Configurações → Servidor e cargos: o dono recarrega as fichas de uma pessoa ou de todo mundo.
const numero = n => n.toLocaleString('pt-BR');

export function configurarFichasAdmin({ socket, appState, showToast }) {
  const bloco = document.querySelector('#fichas-admin');
  const select = document.querySelector('#fichas-admin-pessoa');
  const uma = document.querySelector('#fichas-admin-uma');
  const todos = document.querySelector('#fichas-admin-todos');
  const status = document.querySelector('#fichas-admin-status');
  if (!bloco) return { render() {}, carregar() {} };

  function preencher(lista) {
    const escolhida = select.value;
    select.replaceChildren(...lista.map(p => {
      const op = document.createElement('option');
      op.value = p.chave;
      op.textContent = p.nome + ' · ' + numero(p.saldo) + ' fichas' + (p.zerado ? ' (zerou)' : '');
      return op;
    }));
    if (lista.some(p => p.chave === escolhida)) select.value = escolhida;
    uma.disabled = !lista.length;
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
    uma.disabled = todos.disabled = true;
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

  uma.addEventListener('click', () => {
    const nome = select.selectedOptions[0]?.textContent.split(' · ')[0];
    if (!select.value) return;
    resetar({ chave: select.value }, `Recarregar as fichas de ${nome} pra 1.000?`, () => `${nome} voltou a ter 1.000 fichas.`);
  });
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
