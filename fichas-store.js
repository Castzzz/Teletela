// Carteira de fichas virtuais de cada pessoa, compartilhada por todas as atividades.
// Fica em fichas.json no diretório de dados. Toda segunda-feira, à meia-noite de
// Brasília, cada carteira ganha mais FICHAS_SEMANAIS (soma no saldo, não reseta).
import fs from 'node:fs';
import path from 'node:path';

export const FICHAS_INICIAIS = 1000;
export const FICHAS_SEMANAIS = 1000;
export const VALORES_FICHA = [5, 10, 25, 50, 100];
export const MENOR_FICHA = VALORES_FICHA[0];
const BRASILIA = -3 * 3600e3; // sem horário de verão desde 2019

export function proximaSegunda(ms) {
  const local = new Date(ms + BRASILIA);
  const dias = (8 - local.getUTCDay()) % 7 || 7;
  return Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + dias) - BRASILIA;
}

// Última segunda à 00h de Brasília que já passou (ou é agora).
export function ultimaSegunda(ms) {
  const local = new Date(ms + BRASILIA);
  const dias = (local.getUTCDay() + 6) % 7;
  return Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - dias) - BRASILIA;
}
const SEMANA = 7 * 86400e3;

export class FichasStore {
  constructor(diretorio = '', agora = Date.now, contas = () => null) {
    this.contas = contas;
    this.agora = agora;
    this.arquivo = diretorio ? path.join(diretorio, 'fichas.json') : null;
    this.carteiras = new Map();
    if (!this.arquivo || !fs.existsSync(this.arquivo)) return;
    const dados = JSON.parse(fs.readFileSync(this.arquivo, 'utf8'));
    if (dados.version !== 1 || !dados.carteiras || typeof dados.carteiras !== 'object') throw new Error('Fichas inválidas. Restaure o backup.');
    for (const [chave, c] of Object.entries(dados.carteiras)) {
      if (!Number.isSafeInteger(c?.saldo) || c.saldo < 0) continue;
      // Carteira de antes do crédito semanal começa a contar desta semana.
      const semana = Number.isSafeInteger(c.semana) ? c.semana : ultimaSegunda(agora());
      this.carteiras.set(chave, { nome: String(c.nome || '').slice(0, 40), saldo: c.saldo, semana });
    }
  }

  // Soma FICHAS_SEMANAIS por segunda que passou desde o último crédito. Quem ficou
  // semanas sem abrir recebe todas, como se tivesse aberto toda segunda.
  creditar(c) {
    const atual = ultimaSegunda(this.agora());
    if (c.semana >= atual) return false;
    c.saldo += Math.round((atual - c.semana) / SEMANA) * FICHAS_SEMANAIS;
    c.semana = atual;
    return true;
  }

  creditarTodas(carteiras = this.carteirasDeContas()) {
    let mudou = false;
    for (const [, c] of carteiras) mudou = this.creditar(c) || mudou;
    if (mudou) this.salvar();
  }

  // Abre a carteira (cria com 1000 na primeira vez) e aplica o crédito da segunda.
  pegar(chave, nome) {
    let c = this.carteiras.get(chave);
    if (!c) {
      c = { nome: String(nome || '').slice(0, 40), saldo: FICHAS_INICIAIS, semana: ultimaSegunda(this.agora()) };
      this.carteiras.set(chave, c);
      this.salvar();
    }
    let mudou = this.creditar(c);
    if (nome && c.nome !== nome) { c.nome = String(nome).slice(0, 40); mudou = true; }
    if (mudou) this.salvar();
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
    return { saldo: c.saldo, voltaEm: proximaSegunda(this.agora()) };
  }

  // Só o dono do servidor chama: devolve a carteira pra FICHAS_INICIAIS.
  resetar(chave) {
    const c = this.carteiras.get(chave);
    const contas = this.contas();
    if (!c || (contas && !contas.has(chave))) return false;
    c.saldo = FICHAS_INICIAIS;
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

  resetarTodas() {
    const carteiras = this.carteirasDeContas();
    for (const [, c] of carteiras) c.saldo = FICHAS_INICIAIS;
    this.salvar();
    return carteiras.length;
  }

  carteirasDeContas() {
    const contas = this.contas();
    return [...this.carteiras].filter(([chave]) => !contas || contas.has(chave));
  }

  lista() {
    const carteiras = this.carteirasDeContas();
    this.creditarTodas(carteiras);
    return carteiras
      .map(([chave, c]) => ({ chave, nome: c.nome || 'Alguém', saldo: c.saldo, zerado: c.saldo < MENOR_FICHA }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  ranking(chave, limite = 20) {
    const carteiras = this.carteirasDeContas();
    this.creditarTodas(carteiras);
    const todos = carteiras
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
