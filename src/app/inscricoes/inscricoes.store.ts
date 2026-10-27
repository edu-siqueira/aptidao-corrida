import { Injectable, computed, signal } from '@angular/core';

import { dataDeHoje } from '../dominio/datas';
import { EVENTO } from '../dominio/evento';
import { DadosInscricao, Inscricao, InscricaoDetalhada } from '../dominio/inscricao';
import { normalizarEmail } from '../dominio/inscricao.regras';
import { ErrosInscricao, validarInscricao } from '../dominio/inscricao.validacao';

export const CHAVE_ARMAZENAMENTO = 'corrida.inscricoes.v1';

export type ResultadoOperacao =
  | { ok: true; inscricao: InscricaoDetalhada }
  | { ok: false; motivo: 'INVALIDA'; erros: ErrosInscricao }
  | { ok: false; motivo: 'NAO_ENCONTRADA' };

export type AlteracoesInscricao = Omit<DadosInscricao, 'email'>;

const AVISO_DADOS_CORROMPIDOS =
  'Os dados salvos estavam corrompidos e foram ignorados. A lista começou vazia.';
const AVISO_INSCRICOES_IGNORADAS =
  'Algumas inscrições salvas eram inválidas ou repetidas e foram ignoradas.';
const AVISO_LEITURA_INDISPONIVEL =
  'Não foi possível ler o armazenamento do navegador. A lista começou vazia.';
const AVISO_FALHA_AO_SALVAR =
  'Não foi possível salvar no navegador. As alterações valem só até recarregar a página.';

@Injectable({ providedIn: 'root' })
export class InscricoesStore {
  private readonly lista = signal<InscricaoDetalhada[]>([]);
  private readonly avisoAtual = signal<string | null>(null);

  readonly inscricoes = this.lista.asReadonly();
  readonly aviso = this.avisoAtual.asReadonly();

  // Derivado da lista: nunca fica dessincronizado.
  readonly resumo = computed(() => {
    const lista = this.lista();
    const km5 = lista.filter((inscricao) => inscricao.distancia === 'KM_5').length;
    return { total: lista.length, km5, km10: lista.length - km5 };
  });

  constructor() {
    this.carregar();
  }

  buscar(email: string): InscricaoDetalhada | undefined {
    const chave = normalizarEmail(email);
    return this.lista().find((inscricao) => inscricao.email === chave);
  }

  cadastrar(dados: DadosInscricao): ResultadoOperacao {
    const resultado = validarInscricao(dados, EVENTO.dataProva, dataDeHoje());
    if (!resultado.valida) return { ok: false, motivo: 'INVALIDA', erros: resultado.erros };

    const nova = resultado.inscricao;
    if (this.buscar(nova.email)) {
      return {
        ok: false,
        motivo: 'INVALIDA',
        erros: { email: 'Já existe uma inscrição com este e-mail.' },
      };
    }

    this.lista.update((lista) => [...lista, nova]);
    this.salvar();
    return { ok: true, inscricao: nova };
  }

  // O e-mail é imutável: a edição sempre usa o e-mail já cadastrado.
  editar(email: string, alteracoes: AlteracoesInscricao): ResultadoOperacao {
    const atual = this.buscar(email);
    if (!atual) return { ok: false, motivo: 'NAO_ENCONTRADA' };

    const resultado = validarInscricao(
      { ...alteracoes, email: atual.email },
      EVENTO.dataProva,
      dataDeHoje(),
    );
    if (!resultado.valida) return { ok: false, motivo: 'INVALIDA', erros: resultado.erros };

    const editada = resultado.inscricao;
    this.lista.update((lista) =>
      lista.map((inscricao) => (inscricao.email === atual.email ? editada : inscricao)),
    );
    this.salvar();
    return { ok: true, inscricao: editada };
  }

  cancelar(email: string): boolean {
    const chave = normalizarEmail(email);
    if (!this.buscar(chave)) return false;

    this.lista.update((lista) => lista.filter((inscricao) => inscricao.email !== chave));
    this.salvar();
    return true;
  }

  private carregar(): void {
    let conteudo: string | null;
    try {
      conteudo = localStorage.getItem(CHAVE_ARMAZENAMENTO);
    } catch {
      this.avisoAtual.set(AVISO_LEITURA_INDISPONIVEL);
      return;
    }
    if (conteudo === null) return;

    let salvos: unknown;
    try {
      salvos = JSON.parse(conteudo);
    } catch {
      this.avisoAtual.set(AVISO_DADOS_CORROMPIDOS);
      return;
    }
    if (!Array.isArray(salvos)) {
      this.avisoAtual.set(AVISO_DADOS_CORROMPIDOS);
      return;
    }

    // Revalida tudo: o localStorage pode ter sido alterado fora do sistema.
    // Idade e categoria são recalculadas aqui, nunca lidas do armazenamento.
    const validas: InscricaoDetalhada[] = [];
    for (const item of salvos) {
      const resultado = validarInscricao(comoDadosInscricao(item), EVENTO.dataProva, dataDeHoje());
      const repetida =
        resultado.valida && validas.some((inscricao) => inscricao.email === resultado.inscricao.email);
      if (resultado.valida && !repetida) validas.push(resultado.inscricao);
    }

    if (validas.length < salvos.length) this.avisoAtual.set(AVISO_INSCRICOES_IGNORADAS);
    this.lista.set(validas);
  }

  private salvar(): void {
    const paraSalvar: Inscricao[] = this.lista().map(
      ({ nomeCompleto, email, nascimento, distancia }) => ({ nomeCompleto, email, nascimento, distancia }),
    );
    try {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(paraSalvar));
    } catch {
      this.avisoAtual.set(AVISO_FALHA_AO_SALVAR);
    }
  }
}

function comoDadosInscricao(item: unknown): DadosInscricao {
  const registro = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>;
  const texto = (valor: unknown) => (typeof valor === 'string' ? valor : '');
  return {
    nomeCompleto: texto(registro['nomeCompleto']),
    email: texto(registro['email']),
    nascimento: texto(registro['nascimento']),
    distancia: texto(registro['distancia']),
  };
}
