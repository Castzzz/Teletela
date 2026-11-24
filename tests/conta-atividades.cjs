// Registra uma conta pela interface para testar as mesas que valem fichas.
module.exports = async function registrar(win, nome, { click, js, until }) {
  await click(win, '#btn-open-settings');
  await click(win, '[data-settings-tab=conta]');
  await click(win, '[data-account-mode=register]');
  await js(win, `document.querySelector('#account-user').value=${JSON.stringify(nome.toLowerCase() + '_teste')};
    document.querySelector('#account-password').value=document.querySelector('#account-confirm').value='senha-dos-testes';
    document.querySelector('#account-form').requestSubmit();void 0`);
  await until(win, "!document.querySelector('#account-recovery-result').classList.contains('hidden')");
  const carregada = new Promise(resolve => win.webContents.once('did-finish-load', resolve));
  await click(win, '#account-continue');
  await carregada;
  await until(win, 'Boolean(window.appState?.myId && document.querySelector("#channel-geral"))');
  await js(win, "document.querySelectorAll('.modal-backdrop').forEach(el=>el.classList.add('hidden'));void 0");
};
