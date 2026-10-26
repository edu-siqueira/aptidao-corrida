import { avaliarInscricao, calcularIdade, normalizarEmail } from './inscricao.regras';

const PROVA = '2027-03-14';

describe('normalizarEmail', () => {
  it('remove espaços nas pontas e converte para minúsculas', () => {
    expect(normalizarEmail('  Ana.Souza@Email.COM ')).toBe('ana.souza@email.com');
  });

  it('não altera pontos nem o sinal +', () => {
    expect(normalizarEmail('joao.silva+corrida@gmail.com')).toBe('joao.silva+corrida@gmail.com');
  });
});

describe('calcularIdade', () => {
  it('conta o aniversário no próprio dia da referência', () => {
    expect(calcularIdade('2009-03-14', PROVA)).toBe(18);
  });

  it('não conta o aniversário no dia seguinte à referência', () => {
    expect(calcularIdade('2009-03-15', PROVA)).toBe(17);
  });

  it('conta o aniversário que já passou no ano', () => {
    expect(calcularIdade('2009-03-13', PROVA)).toBe(18);
  });

  it('não usa apenas a diferença entre os anos', () => {
    expect(calcularIdade('1987-12-31', PROVA)).toBe(39);
  });

  it('nascido em 29/02 completa a idade em 01/03 em ano não bissexto', () => {
    expect(calcularIdade('2008-02-29', '2027-02-28')).toBe(18);
    expect(calcularIdade('2012-02-29', '2027-02-28')).toBe(14);
    expect(calcularIdade('2012-02-29', '2027-03-01')).toBe(15);
  });
});

describe('avaliarInscricao', () => {
  describe('idade mínima (14 anos)', () => {
    it('recusa quem completa 14 anos um dia depois da prova', () => {
      expect(avaliarInscricao('2013-03-15', 'KM_5', PROVA)).toEqual({
        aceita: false,
        idadeNaProva: 13,
        categoria: null,
        erro: 'IDADE_MINIMA',
      });
    });

    it('aceita quem completa 14 anos no dia da prova', () => {
      expect(avaliarInscricao('2013-03-14', 'KM_5', PROVA)).toEqual({
        aceita: true,
        idadeNaProva: 14,
        categoria: 'JUVENIL',
        erro: null,
      });
    });

    it('tem precedência sobre a restrição dos 10 km', () => {
      const avaliacao = avaliarInscricao('2015-01-01', 'KM_10', PROVA);
      expect(avaliacao.erro).toBe('IDADE_MINIMA');
      expect(avaliacao.categoria).toBeNull();
    });
  });

  describe('10 km somente a partir de 18 anos', () => {
    it('recusa 17 anos nos 10 km', () => {
      expect(avaliarInscricao('2009-03-15', 'KM_10', PROVA)).toEqual({
        aceita: false,
        idadeNaProva: 17,
        categoria: null,
        erro: 'DISTANCIA_NAO_PERMITIDA',
      });
    });

    it('aceita 17 anos nos 5 km como JUVENIL', () => {
      expect(avaliarInscricao('2009-03-15', 'KM_5', PROVA).categoria).toBe('JUVENIL');
    });

    it('aceita quem completa 18 anos no dia da prova nos 10 km como ADULTO', () => {
      expect(avaliarInscricao('2009-03-14', 'KM_10', PROVA)).toEqual({
        aceita: true,
        idadeNaProva: 18,
        categoria: 'ADULTO',
        erro: null,
      });
    });
  });

  describe('categorias', () => {
    it.each([
      ['1987-03-15', 39, 'ADULTO'],
      ['1987-03-14', 40, 'MASTER'],
      ['1967-03-15', 59, 'MASTER'],
      ['1967-03-14', 60, 'SENIOR'],
      ['1940-01-01', 87, 'SENIOR'],
    ])('nascido em %s tem %i anos e é %s', (nascimento, idade, categoria) => {
      const avaliacao = avaliarInscricao(nascimento, 'KM_10', PROVA);
      expect(avaliacao.idadeNaProva).toBe(idade);
      expect(avaliacao.categoria).toBe(categoria);
    });
  });
});
