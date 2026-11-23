window.temasTeletela = { escuro: 'Escuro', preto: 'Preto', claro: 'Claro' };
// Compartilhado com a janela de entrada, que também abre via file://.
window.aplicarVisual = function (preferencia, pagina = document) {
  // Violeta, Roda e Aconchego viraram o visual padrão: perfis salvos com eles caem no Clássico.
  const visual = preferencia === 'terminal' ? 'terminal' : 'classico';
  pagina.documentElement.dataset.visual = visual;
  for (const elemento of pagina.querySelectorAll('[data-somente-terminal]')) elemento.hidden = visual !== 'terminal';
  for (const folha of pagina.querySelectorAll('link[data-visual-css]')) {
    const ativa = folha.dataset.visualCss === visual || (folha.dataset.visualCss === 'alternativo' && visual !== 'classico');
    folha.media = ativa ? 'all' : 'not all';
  }
};
