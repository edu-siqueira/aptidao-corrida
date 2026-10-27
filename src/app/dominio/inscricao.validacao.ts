// Validação usada tanto no cadastro quanto na edição. Sem dependência do Angular.
import { isDataValida } from './datas';
import { DadosInscricao, Inscricao, InscricaoDetalhada } from './inscricao';
import {
  Distancia,
  ErroRegulamento,
  IDADE_MINIMA,
  IDADE_MINIMA_10KM,
  avaliarInscricao,
  normalizarEmail,
} from './inscricao.regras';

export type ErrosInscricao = Partial<Record<keyof Inscricao, string>>;

export type ResultadoValidacao =
  | { valida: true; inscricao: InscricaoDetalhada }
  | { valida: false; erros: ErrosInscricao };

export const NOME_TAMANHO_MINIMO = 3;
export const NOME_TAMANHO_MAXIMO = 100;

// Palavras de letras (com acentos) separadas por espaço, apóstrofo ou hífen.
const PADRAO_NOME = /^[\p{L}\p{M}]+(?:[ '’-]+[\p{L}\p{M}]+)*$/u;
const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MENSAGENS_REGULAMENTO: Record<ErroRegulamento, (idade: number) => string> = {
  IDADE_MINIMA: (idade) =>
    `A idade mínima é ${IDADE_MINIMA} anos na data da prova (idade na prova: ${idade}).`,
  DISTANCIA_NAO_PERMITIDA: (idade) =>
    `O percurso de 10 km é permitido somente a partir de ${IDADE_MINIMA_10KM} anos (idade na prova: ${idade}).`,
};

export function normalizarNome(nome: string): string {
  return nome.trim().replace(/\s+/g, ' ');
}

function ehDistancia(valor: string): valor is Distancia {
  return valor === 'KM_5' || valor === 'KM_10';
}

function validarNome(nome: string): string | null {
  if (!nome) return 'Informe o nome completo.';
  if (nome.length < NOME_TAMANHO_MINIMO || nome.length > NOME_TAMANHO_MAXIMO) {
    return `O nome deve ter entre ${NOME_TAMANHO_MINIMO} e ${NOME_TAMANHO_MAXIMO} caracteres.`;
  }
  if (!PADRAO_NOME.test(nome)) return 'Use apenas letras, espaços, apóstrofos e hífens.';
  return null;
}

function validarEmail(email: string): string | null {
  if (!email) return 'Informe o e-mail.';
  if (!PADRAO_EMAIL.test(email)) return 'Informe um e-mail válido.';
  return null;
}

function validarNascimento(nascimento: string, hoje: string): string | null {
  if (!nascimento) return 'Informe a data de nascimento.';
  if (!isDataValida(nascimento)) return 'Informe uma data válida.';
  if (nascimento >= hoje) return 'A data de nascimento deve ser anterior a hoje.';
  return null;
}

export function validarInscricao(
  dados: DadosInscricao,
  dataProva: string,
  hoje: string,
): ResultadoValidacao {
  const nomeCompleto = normalizarNome(dados.nomeCompleto);
  const email = normalizarEmail(dados.email);
  const nascimento = dados.nascimento.trim();
  const distancia = dados.distancia;

  const erros: ErrosInscricao = {};
  const erroNome = validarNome(nomeCompleto);
  const erroEmail = validarEmail(email);
  const erroNascimento = validarNascimento(nascimento, hoje);
  if (erroNome) erros.nomeCompleto = erroNome;
  if (erroEmail) erros.email = erroEmail;
  if (erroNascimento) erros.nascimento = erroNascimento;
  if (!ehDistancia(distancia)) erros.distancia = 'Escolha o percurso.';

  // O regulamento só é avaliado com nascimento e percurso válidos.
  if (erros.nascimento || !ehDistancia(distancia)) return { valida: false, erros };

  const avaliacao = avaliarInscricao(nascimento, distancia, dataProva);
  if (avaliacao.erro === 'IDADE_MINIMA') {
    erros.nascimento = MENSAGENS_REGULAMENTO.IDADE_MINIMA(avaliacao.idadeNaProva);
  } else if (avaliacao.erro === 'DISTANCIA_NAO_PERMITIDA') {
    erros.distancia = MENSAGENS_REGULAMENTO.DISTANCIA_NAO_PERMITIDA(avaliacao.idadeNaProva);
  }

  if (Object.keys(erros).length > 0 || !avaliacao.categoria) return { valida: false, erros };

  return {
    valida: true,
    inscricao: {
      nomeCompleto,
      email,
      nascimento,
      distancia,
      idadeNaProva: avaliacao.idadeNaProva,
      categoria: avaliacao.categoria,
    },
  };
}
