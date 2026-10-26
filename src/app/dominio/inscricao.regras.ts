// Regulamento da corrida (Art. 4º e 6º). Sem dependência do Angular.
// Todas as datas chegam como texto 'aaaa-mm-dd' e são comparadas por partes,
// sem passar por Date, para evitar deslocamento de fuso horário.

export type Distancia = 'KM_5' | 'KM_10';
export type Categoria = 'JUVENIL' | 'ADULTO' | 'MASTER' | 'SENIOR';
export type ErroRegulamento = 'IDADE_MINIMA' | 'DISTANCIA_NAO_PERMITIDA';

export interface AvaliacaoInscricao {
  aceita: boolean;
  idadeNaProva: number;
  categoria: Categoria | null;
  erro: ErroRegulamento | null;
}

// Art. 6º, II
export const IDADE_MINIMA = 14;
// Art. 6º, III
export const IDADE_MINIMA_10KM = 18;

// Art. 4º, II: o e-mail identifica a inscrição.
export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Art. 6º, I: idade completa na data de referência.
export function calcularIdade(nascimento: string, referencia: string): number {
  const [anoNasc, mesNasc, diaNasc] = nascimento.split('-').map(Number);
  const [anoRef, mesRef, diaRef] = referencia.split('-').map(Number);

  const aniversarioAindaNaoChegou =
    mesRef < mesNasc || (mesRef === mesNasc && diaRef < diaNasc);

  return anoRef - anoNasc - (aniversarioAindaNaoChegou ? 1 : 0);
}

// Art. 6º, IV
export function categoriaPorIdade(idade: number): Categoria {
  if (idade >= 60) return 'SENIOR';
  if (idade >= 40) return 'MASTER';
  if (idade >= 18) return 'ADULTO';
  return 'JUVENIL';
}

// A idade mínima é verificada antes da restrição de percurso.
export function avaliarInscricao(
  nascimento: string,
  distancia: Distancia,
  dataProva: string,
): AvaliacaoInscricao {
  const idadeNaProva = calcularIdade(nascimento, dataProva);

  if (idadeNaProva < IDADE_MINIMA) {
    return { aceita: false, idadeNaProva, categoria: null, erro: 'IDADE_MINIMA' };
  }

  if (distancia === 'KM_10' && idadeNaProva < IDADE_MINIMA_10KM) {
    return { aceita: false, idadeNaProva, categoria: null, erro: 'DISTANCIA_NAO_PERMITIDA' };
  }

  return { aceita: true, idadeNaProva, categoria: categoriaPorIdade(idadeNaProva), erro: null };
}
