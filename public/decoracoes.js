// Domingo de Páscoa no calendário gregoriano (algoritmo de Meeus/Jones/Butcher).
function domingoDePascoa(ano) {
  const ciclo = ano % 19;
  const seculo = Math.floor(ano / 100);
  const resto = ano % 100;
  const ajuste = Math.floor((seculo - Math.floor((seculo + 8) / 25) + 1) / 3);
  const lua = (19 * ciclo + seculo - Math.floor(seculo / 4) - ajuste + 15) % 30;
  const semana = (32 + 2 * (seculo % 4) + 2 * Math.floor(resto / 4) - lua - resto % 4) % 7;
  const correcao = Math.floor((ciclo + 11 * lua + 22 * semana) / 451);
  const indice = lua + semana - 7 * correcao + 114;
  return Date.UTC(ano, Math.floor(indice / 31) - 1, indice % 31 + 1);
}

export function festaDoDia(data) {
  const mes = data.getMonth(), dia = data.getDate(), ano = data.getFullYear();
  if ((mes === 11 && dia >= 29) || (mes === 0 && dia <= 5)) return 'ano-novo';
  if (mes === 11) return 'natal';
  if (mes === 9 && dia >= 25) return 'halloween';
  // Dias civis do aparelho. O cálculo em UTC evita diferenças pelo horário de verão.
  const atePascoa = (domingoDePascoa(ano) - Date.UTC(ano, mes, dia)) / 86400000;
  if (atePascoa >= 47 && atePascoa <= 51) return 'carnaval';
  if (atePascoa >= 0 && atePascoa <= 6) return 'pascoa';
  return '';
}
