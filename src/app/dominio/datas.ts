// Datas trafegam como texto 'aaaa-mm-dd'. Este formato pode ser comparado
// diretamente como string ('2001-05-10' < '2026-10-27').

const PADRAO_DATA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDataValida(texto: string): boolean {
  const partes = PADRAO_DATA_ISO.exec(texto);
  if (!partes) return false;

  const [, ano, mes, dia] = partes.map(Number);
  if (mes < 1 || mes > 12 || dia < 1) return false;

  // Dia 0 do mês seguinte é o último dia do mês informado.
  const ultimoDiaDoMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  return dia <= ultimoDiaDoMes;
}

// Apresentação: 'aaaa-mm-dd' → 'dd/mm/aaaa'.
export function formatarDataBr(data: string): string {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Data de hoje no fuso do navegador, sem passar por toISOString (que usa UTC).
export function dataDeHoje(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}
