import { TestBed } from '@angular/core/testing';

import { DadosInscricao } from '../dominio/inscricao';
import { CHAVE_ARMAZENAMENTO, InscricoesStore } from './inscricoes.store';

function dados(alteracoes: Partial<DadosInscricao> = {}): DadosInscricao {
  return {
    nomeCompleto: 'Ana Souza',
    email: 'ana.souza@email.com',
    nascimento: '1990-05-20',
    distancia: 'KM_10',
    ...alteracoes,
  };
}

// Cria uma store nova, como se a página tivesse sido recarregada.
function criarStore(): InscricoesStore {
  TestBed.resetTestingModule();
  return TestBed.inject(InscricoesStore);
}

function salvos(): unknown {
  return JSON.parse(localStorage.getItem(CHAVE_ARMAZENAMENTO) ?? 'null');
}

describe('InscricoesStore', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('começa com a lista vazia e o resumo zerado', () => {
    const store = criarStore();
    expect(store.inscricoes()).toEqual([]);
    expect(store.resumo()).toEqual({ total: 0, km5: 0, km10: 0 });
    expect(store.aviso()).toBeNull();
  });

  describe('cadastrar', () => {
    it('acrescenta ao fim, calcula idade e categoria e atualiza o resumo', () => {
      const store = criarStore();
      store.cadastrar(dados());
      store.cadastrar(dados({ email: 'bruno@email.com', distancia: 'KM_5' }));

      expect(store.inscricoes().map((i) => i.email)).toEqual(['ana.souza@email.com', 'bruno@email.com']);
      expect(store.inscricoes()[0]).toMatchObject({ idadeNaProva: 36, categoria: 'ADULTO' });
      expect(store.resumo()).toEqual({ total: 2, km5: 1, km10: 1 });
    });

    it('recusa e-mail repetido mesmo com caixa e espaços diferentes', () => {
      const store = criarStore();
      store.cadastrar(dados());

      const resultado = store.cadastrar(dados({ email: '  Ana.Souza@Email.COM ' }));

      expect(resultado).toEqual({
        ok: false,
        motivo: 'INVALIDA',
        erros: { email: 'Já existe uma inscrição com este e-mail.' },
      });
      expect(store.resumo().total).toBe(1);
    });

    it('recusa dados inválidos sem alterar a lista', () => {
      const store = criarStore();
      const resultado = store.cadastrar(dados({ nascimento: '2013-03-15' }));

      expect(resultado.ok).toBe(false);
      expect(store.inscricoes()).toEqual([]);
    });

    it('persiste apenas os quatro campos digitados', () => {
      const store = criarStore();
      store.cadastrar(dados({ nomeCompleto: '  Ana   Souza ' }));

      expect(salvos()).toEqual([
        { nomeCompleto: 'Ana Souza', email: 'ana.souza@email.com', nascimento: '1990-05-20', distancia: 'KM_10' },
      ]);
    });
  });

  describe('editar', () => {
    it('conserva posição e total, recalcula derivados e move o percurso', () => {
      const store = criarStore();
      store.cadastrar(dados());
      store.cadastrar(dados({ email: 'bruno@email.com' }));

      const resultado = store.editar('ANA.SOUZA@email.com', {
        nomeCompleto: 'Ana Souza Lima',
        nascimento: '2010-01-01',
        distancia: 'KM_5',
      });

      expect(resultado.ok).toBe(true);
      expect(store.inscricoes()[0]).toEqual({
        nomeCompleto: 'Ana Souza Lima',
        email: 'ana.souza@email.com',
        nascimento: '2010-01-01',
        distancia: 'KM_5',
        idadeNaProva: 17,
        categoria: 'JUVENIL',
      });
      expect(store.inscricoes()[1].email).toBe('bruno@email.com');
      expect(store.resumo()).toEqual({ total: 2, km5: 1, km10: 1 });
      expect(criarStore().inscricoes()[0].nomeCompleto).toBe('Ana Souza Lima');
    });

    it('recusada, preserva dados, totais e armazenamento', () => {
      const store = criarStore();
      store.cadastrar(dados());
      const antes = store.inscricoes();
      const salvoAntes = salvos();

      const resultado = store.editar('ana.souza@email.com', {
        nomeCompleto: 'Ana Souza',
        nascimento: '2010-01-01',
        distancia: 'KM_10',
      });

      expect(resultado.ok).toBe(false);
      expect(store.inscricoes()).toEqual(antes);
      expect(store.resumo()).toEqual({ total: 1, km5: 0, km10: 1 });
      expect(salvos()).toEqual(salvoAntes);
    });

    it('não cria inscrição quando o e-mail não existe', () => {
      const store = criarStore();
      const resultado = store.editar('ninguem@email.com', {
        nomeCompleto: 'Ninguém',
        nascimento: '1990-01-01',
        distancia: 'KM_5',
      });

      expect(resultado).toEqual({ ok: false, motivo: 'NAO_ENCONTRADA' });
      expect(store.inscricoes()).toEqual([]);
    });
  });

  describe('cancelar', () => {
    it('remove pelo e-mail, mantém os demais e libera o recadastro', () => {
      const store = criarStore();
      store.cadastrar(dados());
      store.cadastrar(dados({ email: 'bruno@email.com', distancia: 'KM_5' }));

      expect(store.cancelar(' Ana.Souza@Email.com')).toBe(true);
      expect(store.inscricoes().map((i) => i.email)).toEqual(['bruno@email.com']);
      expect(store.resumo()).toEqual({ total: 1, km5: 1, km10: 0 });
      expect(store.cadastrar(dados()).ok).toBe(true);
    });

    it('persiste ao recarregar', () => {
      const store = criarStore();
      store.cadastrar(dados());
      store.cancelar('ana.souza@email.com');

      expect(criarStore().inscricoes()).toEqual([]);
    });

    it('de alguém ausente não altera os demais', () => {
      const store = criarStore();
      store.cadastrar(dados());

      expect(store.cancelar('ninguem@email.com')).toBe(false);
      expect(store.resumo().total).toBe(1);
    });
  });

  describe('armazenamento', () => {
    it('com JSON corrompido começa vazia e avisa', () => {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, '{isso não é json');
      const store = criarStore();

      expect(store.inscricoes()).toEqual([]);
      expect(store.aviso()).toContain('corrompidos');
    });

    it('ignora registros inválidos ou repetidos e recalcula derivados', () => {
      localStorage.setItem(
        CHAVE_ARMAZENAMENTO,
        JSON.stringify([
          { ...dados(), idadeNaProva: 99, categoria: 'SENIOR' },
          dados({ email: 'ANA.SOUZA@email.com' }),
          dados({ email: 'crianca@email.com', nascimento: '2015-01-01' }),
          'lixo',
        ]),
      );
      const store = criarStore();

      expect(store.inscricoes()).toHaveLength(1);
      expect(store.inscricoes()[0]).toMatchObject({ idadeNaProva: 36, categoria: 'ADULTO' });
      expect(store.aviso()).toContain('ignoradas');
    });

    it('continua funcionando e avisa quando não consegue salvar', () => {
      const store = criarStore();
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(store.cadastrar(dados()).ok).toBe(true);
      expect(store.inscricoes()).toHaveLength(1);
      expect(store.aviso()).toContain('Não foi possível salvar');
    });
  });
});
