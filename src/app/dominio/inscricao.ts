import { Categoria, Distancia } from './inscricao.regras';

// Os quatro campos digitados (Art. 4º, I). É o que vai para o localStorage.
export interface Inscricao {
  nomeCompleto: string;
  email: string;
  nascimento: string;
  distancia: Distancia;
}

// Inscrição com os campos calculados pelo sistema; nunca vêm do usuário.
export interface InscricaoDetalhada extends Inscricao {
  idadeNaProva: number;
  categoria: Categoria;
}

// Valores como chegam do formulário, ainda sem normalização nem validação.
export interface DadosInscricao {
  nomeCompleto: string;
  email: string;
  nascimento: string;
  distancia: string;
}
