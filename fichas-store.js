// Carteira de fichas virtuais de cada pessoa, compartilhada por todas as atividades.
// Fica em fichas.json no diretório de dados. Não tem mais crédito toda segunda: os coins
// novos vêm do Seu cassino (cassino.js).
import fs from 'node:fs';
import path from 'node:path';

// Saldo de uma carteira nova. O servidor passa 5.000 (o começo de temporada do Seu
// cassino, em `inicial`); os testes antigos das mesas contam a partir de 1.000.
export const FICHAS_INICIAIS = 1000;
export const VALORES_FICHA = [5, 10, 25, 50, 100];
export const MENOR_FICHA = VALORES_FICHA[0];

export class FichasStore {
  constructor(diretorio = '', agora = Date.now, contas = () => null, { inicial = FICHAS_INICIAIS } = {}) {
    this.contas = contas;
    this.inicial = inicial;
    this.agora = agora;
    this.arquivo = diretorio ? path.join(diretorio, 'fichas.json') : null;
    this.carteiras = new Map();
    if (!this.arquivo || !fs.existsSync(this.arquivo)) return;
    const dados = JSON.parse(fs.readFileSync(this.arquivo, 'utf8'));
    if (dados.version !== 1 || !dados.carteiras || typeof dados.carteiras !== 'object') throw new Error('Fichas inválidas. Restaure o backup.');
    for (const [chave, c] of Object.entries(dados.carteiras)) {
      if (!Number.isSafeInteger(c?.saldo) || c.saldo < 0) continue;
      this.carteiras.set(chave, { nome: String(c.nome || '').slice(0, 40), saldo: c.saldo });
    }
  }

  // Abre a carteira (cria com o saldo inicial na primeira vez).
  pegar(chave, nome) {
    let c = this.carteiras.get(chave);
    if (!c) {
      c = { nome: String(nome || '').slice(0, 40), saldo: this.inicial };
      this.carteiras.set(chave, c);
      this.salvar();
    }
    if (nome && c.nome !== nome) { c.nome = String(nome).slice(0, 40); this.salvar(); }
    return c;
  }

  mover(chave, quanto) {
    const c = this.carteiras.get(chave);
    if (!c || !quanto) return;
    c.saldo = Math.max(0, c.saldo + quanto);
    this.salvar();
  }

  resumo(chave, nome) {
    const c = this.pegar(chave, nome);
    return { saldo: c.saldo };
  }

  // Só o dono do servidor chama: devolve a carteira pro saldo inicial.
  resetar(chave) {
    const c = this.carteiras.get(chave);
    const contas = this.contas();
    if (!c || (contas && !contas.has(chave))) return false;
    c.saldo = this.inicial;
    this.salvar();
    return true;
  }

  // Só o dono do servidor chama: soma ou tira fichas de uma carteira (nunca fica negativa).
  // Devolve o saldo novo, ou null se a carteira não existe ou não é de conta.
  ajustar(chave, quanto) {
    const c = this.carteiras.get(chave);
    const contas = this.contas();
    if (!c || (contas && !contas.has(chave)) || !Number.isSafeInteger(quanto)) return null;
    c.saldo = Math.max(0, c.saldo + quanto);
    this.salvar();
    return c.saldo;
  }

  resetarTodas(valor = this.inicial) {
    const carteiras = this.carteirasDeContas();
    for (const [, c] of carteiras) c.saldo = valor;
    this.salvar();
    return carteiras.length;
  }

  // Primeira temporada: ninguém perde coins, só sobe quem tem menos que o valor.
  garantirMinimo(valor) {
    let quantas = 0;
    for (const [, c] of this.carteirasDeContas()) if (c.saldo < valor) { c.saldo = valor; quantas++; }
    if (quantas) this.salvar();
    return quantas;
  }

  carteirasDeContas() {
    const contas = this.contas();
    return [...this.carteiras].filter(([chave]) => !contas || contas.has(chave));
  }

  lista() {
    return this.carteirasDeContas()
      .map(([chave, c]) => ({ chave, nome: c.nome || 'Alguém', saldo: c.saldo, zerado: c.saldo < MENOR_FICHA }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  ranking(chave, limite = 20) {
    const todos = this.carteirasDeContas()
      .map(([k, c]) => ({ nome: c.nome || 'Alguém', saldo: c.saldo, voce: k === chave, zerado: c.saldo < MENOR_FICHA }))
      .sort((a, b) => b.saldo - a.saldo || a.nome.localeCompare(b.nome, 'pt-BR'));
    todos.forEach((p, i) => { p.posicao = i + 1; });
    const lista = todos.slice(0, limite);
    const minha = todos.find(p => p.voce);
    if (minha && minha.posicao > limite) lista.push(minha);
    return lista;
  }

  salvar() {
    if (!this.arquivo) return;
    const dados = { version: 1, carteiras: Object.fromEntries(this.carteiras) };
    const temporario = this.arquivo + '.tmp';
    fs.writeFileSync(temporario, JSON.stringify(dados), { mode: 0o600 });
    fs.renameSync(temporario, this.arquivo);
  }
}
