// Comilança: slot de coleta de cada conta (solo), com a mesma carteira das mesas.
// O servidor sorteia a jogada inteira (giro pago + giros grátis) com o motor de
// public/comilanca-motor.js, acerta a carteira de uma vez e manda os eventos pro app animar.
import { randomInt } from 'node:crypto';
import { FichasStore } from './fichas-store.js';
import { criarMotor } from './public/comilanca-motor.js';

export const APOSTAS = [5, 10, 25, 50, 100];
export const INTERVALO = 250; // ms entre giros da mesma conta (o giro mais curto, no turbo, anima ~0,4 s)

const aleatorioSeguro = () => randomInt(2 ** 47) / 2 ** 47;

export function criarComilanca({ fichas = new FichasStore(), aoMudarFichas = () => {}, aleatorio = aleatorioSeguro, agora = Date.now } = {}) {
  const motor = criarMotor({ aleatorio });
  const ultimoGiro = new Map(); // chave -> quando girou

  function conectar(socket, user) {
    const chave = user.accountId ? user.accessId : null;
    socket.on('comilanca', (pedido, cb) => {
      if (typeof cb !== 'function') return;
      if (!chave) return cb({ erro: 'Entre na sua conta pra jogar.' });
      const carteira = () => fichas.resumo(chave, user.name);
      if (pedido?.acao === 'ver') return cb({ carteira: carteira() });
      if (pedido?.acao !== 'girar') return cb({ erro: 'Ação desconhecida.' });
      const aposta = pedido.aposta;
      if (!APOSTAS.includes(aposta)) return cb({ erro: 'Escolha a aposta.' });
      const t = agora();
      if (t - (ultimoGiro.get(chave) || 0) < INTERVALO) return cb({ erro: 'Calma, a turma ainda está comendo.' });
      if (fichas.pegar(chave, user.name).saldo < aposta) return cb({ erro: 'Você não tem coins pra essa aposta.', carteira: carteira() });
      ultimoGiro.set(chave, t);
      const jogada = motor.jogar(aposta);
      // Coins são inteiros: o total da jogada arredonda (as pedras mostram o valor quebrado).
      const premio = Math.round(jogada.total);
      fichas.mover(chave, premio - aposta);
      aoMudarFichas();
      cb({
        carteira: carteira(), premio,
        jogada: { base: { eventos: jogada.base.eventos }, bonus: jogada.bonus.map(r => ({ eventos: r.eventos })) },
      });
    });
  }
  return { conectar };
}
