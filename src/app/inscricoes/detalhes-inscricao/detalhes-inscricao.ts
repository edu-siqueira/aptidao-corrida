import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { FichaInscricao } from '../ficha-inscricao/ficha-inscricao';
import { InscricaoNaoEncontrada } from '../inscricao-nao-encontrada/inscricao-nao-encontrada';
import { InscricoesStore } from '../inscricoes.store';

@Component({
  selector: 'app-detalhes-inscricao',
  imports: [RouterLink, FichaInscricao, InscricaoNaoEncontrada],
  templateUrl: './detalhes-inscricao.html',
})
export class DetalhesInscricao {
  private readonly store = inject(InscricoesStore);
  private readonly router = inject(Router);

  // Vem do parâmetro :email da rota (withComponentInputBinding).
  readonly email = input.required<string>();

  protected readonly inscricao = computed(() => this.store.buscar(this.email()));

  protected cancelar(): void {
    const inscricao = this.inscricao();
    if (inscricao && confirm(`Cancelar a inscrição de ${inscricao.nomeCompleto}?`)) {
      this.store.cancelar(inscricao.email);
      this.router.navigate(['/inscricoes']);
    }
  }
}
