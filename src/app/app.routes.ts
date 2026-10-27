import { Routes } from '@angular/router';

import { DetalhesInscricao } from './inscricoes/detalhes-inscricao/detalhes-inscricao';
import { FormularioInscricao } from './inscricoes/formulario-inscricao/formulario-inscricao';
import { ListaInscricoes } from './inscricoes/lista-inscricoes/lista-inscricoes';
import { PaginaNaoEncontrada } from './pagina-nao-encontrada/pagina-nao-encontrada';

// 'nova' vem antes de ':email' para não ser tratada como um e-mail.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inscricoes' },
  { path: 'inscricoes', component: ListaInscricoes, title: 'Inscrições' },
  { path: 'inscricoes/nova', component: FormularioInscricao, title: 'Nova inscrição' },
  { path: 'inscricoes/:email', component: DetalhesInscricao, title: 'Detalhes da inscrição' },
  { path: 'inscricoes/:email/editar', component: FormularioInscricao, title: 'Editar inscrição' },
  { path: '**', component: PaginaNaoEncontrada, title: 'Página não encontrada' },
];
