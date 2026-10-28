import { Routes } from '@angular/router';

import { DetalhesInscricao } from './inscricoes/detalhes-inscricao/detalhes-inscricao';
import { ListaInscricoes } from './inscricoes/lista-inscricoes/lista-inscricoes';
import { ModalFormularioInscricao } from './inscricoes/modal-formulario-inscricao/modal-formulario-inscricao';
import { PaginaNaoEncontrada } from './pagina-nao-encontrada/pagina-nao-encontrada';

// Cadastro e edição são filhos da lista: o modal abre por cima dela, com URL própria.
// 'nova' vem antes de ':email/editar' para não ser tratada como um e-mail.
// /inscricoes/:email não casa com nenhum filho (que exigem 'nova' ou '/editar'),
// então o router segue para a rota de detalhes logo abaixo.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inscricoes' },
  {
    path: 'inscricoes',
    component: ListaInscricoes,
    title: 'Inscrições',
    children: [
      { path: 'nova', component: ModalFormularioInscricao, title: 'Nova inscrição' },
      { path: ':email/editar', component: ModalFormularioInscricao, title: 'Editar inscrição' },
    ],
  },
  { path: 'inscricoes/:email', component: DetalhesInscricao, title: 'Detalhes da inscrição' },
  { path: '**', component: PaginaNaoEncontrada, title: 'Página não encontrada' },
];
