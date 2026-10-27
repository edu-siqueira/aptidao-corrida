import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { InscricaoDetalhada } from '../../dominio/inscricao';
import { FichaInscricao } from '../ficha-inscricao/ficha-inscricao';
import { InscricoesStore } from '../inscricoes.store';

@Component({
  selector: 'app-lista-inscricoes',
  imports: [RouterLink, FichaInscricao],
  templateUrl: './lista-inscricoes.html',
})
export class ListaInscricoes {
  protected readonly store = inject(InscricoesStore);

  protected cancelar(inscricao: InscricaoDetalhada): void {
    if (confirm(`Cancelar a inscrição de ${inscricao.nomeCompleto}?`)) {
      this.store.cancelar(inscricao.email);
    }
  }
}
