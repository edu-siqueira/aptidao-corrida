import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { InscricaoDetalhada } from '../../dominio/inscricao';
import { FichaInscricao } from '../ficha-inscricao/ficha-inscricao';
import { InscricoesStore } from '../inscricoes.store';

import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-lista-inscricoes',
  imports: [RouterLink, RouterOutlet, FichaInscricao, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './lista-inscricoes.html',
  styleUrl: './lista-inscricoes.css',
})
export class ListaInscricoes {
  protected readonly store = inject(InscricoesStore);
  private readonly confirmation = inject(ConfirmationService);

  protected cancelar(inscricao: InscricaoDetalhada): void {
    this.confirmation.confirm({
      header: 'Cancelar inscrição',
      message: `Tem certeza que deseja cancelar a inscrição de ${inscricao.nomeCompleto}?`,
      acceptButtonProps: { label: 'Sim, cancelar', severity: 'danger' },
      rejectButtonProps: { label: 'Manter inscrição', severity: 'secondary', outlined: true },
      accept: () => this.store.cancelar(inscricao.email),
    });
  }
}
