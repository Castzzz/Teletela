// Confirmação no visual do app, no lugar do window.confirm (que abre a janela cinza do sistema).
let dialogo;

export function confirmar(texto, { confirmar: rotulo = 'Confirmar', cancelar = 'Voltar', perigo = false } = {}) {
  if (!dialogo) {
    dialogo = document.createElement('dialog');
    dialogo.className = 'aposta-dialogo confirmar-dialogo';
    dialogo.innerHTML = '<form method="dialog"><p class="confirmar-texto"></p><div class="aposta-form-botoes">'
      + '<button type="submit" value="nao" class="btn-secondary"></button><button type="submit" value="sim"></button></div></form>';
    document.body.append(dialogo);
  }
  const [nao, sim] = dialogo.querySelectorAll('button');
  dialogo.querySelector('.confirmar-texto').textContent = texto;
  nao.textContent = cancelar;
  sim.textContent = rotulo;
  sim.className = perigo ? 'btn-primary btn-danger' : 'btn-primary';
  dialogo.returnValue = 'nao';
  dialogo.showModal();
  sim.focus();
  return new Promise(resolve => dialogo.addEventListener('close', () => resolve(dialogo.returnValue === 'sim'), { once: true }));
}
