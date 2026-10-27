import { Categoria, Distancia } from '../dominio/inscricao.regras';

export const ROTULO_DISTANCIA: Record<Distancia, string> = {
  KM_5: '5 km',
  KM_10: '10 km',
};

export const ROTULO_CATEGORIA: Record<Categoria, string> = {
  JUVENIL: 'Juvenil',
  ADULTO: 'Adulto',
  MASTER: 'Master',
  SENIOR: 'Sênior',
};
