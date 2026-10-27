import { DadosInscricao } from './inscricao';
import { normalizarNome, validarInscricao } from './inscricao.validacao';

const PROVA = '2027-03-14';
const HOJE = '2026-10-27';

function dados(alteracoes: Partial<DadosInscricao> = {}): DadosInscricao {
  return {
    nomeCompleto: 'Ana Souza',
    email: 'ana.souza@email.com',
    nascimento: '1990-05-20',
    distancia: 'KM_10',
    ...alteracoes,
  };
}

function erros(alteracoes: Partial<DadosInscricao>) {
  const resultado = validarInscricao(dados(alteracoes), PROVA, HOJE);
  return resultado.valida ? {} : resultado.erros;
}

describe('normalizarNome', () => {
  it('remove espaços nas pontas e reduz espaços internos repetidos', () => {
    expect(normalizarNome('  Ana   Maria  Souza ')).toBe('Ana Maria Souza');
  });
});

describe('validarInscricao', () => {
  it('aceita dados válidos e devolve os campos normalizados e calculados', () => {
    const resultado = validarInscricao(
      dados({ nomeCompleto: '  Ana   Souza ', email: ' Ana.Souza@Email.COM ' }),
      PROVA,
      HOJE,
    );

    expect(resultado).toEqual({
      valida: true,
      inscricao: {
        nomeCompleto: 'Ana Souza',
        email: 'ana.souza@email.com',
        nascimento: '1990-05-20',
        distancia: 'KM_10',
        idadeNaProva: 36,
        categoria: 'ADULTO',
      },
    });
  });

  describe('nome', () => {
    it('é obrigatório', () => {
      expect(erros({ nomeCompleto: '   ' }).nomeCompleto).toBe('Informe o nome completo.');
    });

    it('conta o tamanho depois de normalizar', () => {
      expect(erros({ nomeCompleto: '  Ab   ' }).nomeCompleto).toContain('entre 3 e 100');
      expect(erros({ nomeCompleto: ' A    b ' }).nomeCompleto).toBeUndefined();
      expect(erros({ nomeCompleto: 'a'.repeat(100) }).nomeCompleto).toBeUndefined();
      expect(erros({ nomeCompleto: 'a'.repeat(101) }).nomeCompleto).toContain('entre 3 e 100');
    });

    it('aceita acentos, apóstrofos e hífens', () => {
      expect(erros({ nomeCompleto: "João D'Ávila Sant’Anna-Lima" }).nomeCompleto).toBeUndefined();
    });

    it('recusa números e símbolos', () => {
      expect(erros({ nomeCompleto: 'Ana 2' }).nomeCompleto).toBeDefined();
      expect(erros({ nomeCompleto: 'Ana @Souza' }).nomeCompleto).toBeDefined();
    });
  });

  describe('e-mail', () => {
    it('é obrigatório', () => {
      expect(erros({ email: '  ' }).email).toBe('Informe o e-mail.');
    });

    it('precisa ter formato válido', () => {
      expect(erros({ email: 'ana.souza' }).email).toBe('Informe um e-mail válido.');
      expect(erros({ email: 'ana@email' }).email).toBe('Informe um e-mail válido.');
    });

    it('aceita o sinal +', () => {
      expect(erros({ email: 'ana+corrida@email.com' }).email).toBeUndefined();
    });
  });

  describe('nascimento', () => {
    it('é obrigatório', () => {
      expect(erros({ nascimento: '' }).nascimento).toBe('Informe a data de nascimento.');
    });

    it('precisa ser uma data existente', () => {
      expect(erros({ nascimento: '2001-02-30' }).nascimento).toBe('Informe uma data válida.');
      expect(erros({ nascimento: '2001-13-01' }).nascimento).toBe('Informe uma data válida.');
    });

    it('precisa ser anterior a hoje', () => {
      expect(erros({ nascimento: HOJE }).nascimento).toContain('anterior a hoje');
    });
  });

  it('exige o percurso', () => {
    expect(erros({ distancia: '' }).distancia).toBe('Escolha o percurso.');
    expect(erros({ distancia: 'KM_42' }).distancia).toBe('Escolha o percurso.');
  });

  describe('regulamento', () => {
    it('mostra a idade mínima no campo de nascimento', () => {
      expect(erros({ nascimento: '2013-03-15', distancia: 'KM_10' })).toEqual({
        nascimento: 'A idade mínima é 14 anos na data da prova (idade na prova: 13).',
      });
    });

    it('mostra a restrição dos 10 km no campo de percurso', () => {
      expect(erros({ nascimento: '2009-03-15', distancia: 'KM_10' })).toEqual({
        distancia: 'O percurso de 10 km é permitido somente a partir de 18 anos (idade na prova: 17).',
      });
    });
  });
});
