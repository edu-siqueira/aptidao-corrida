import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { DialogModule } from 'primeng/dialog';

import { FormularioInscricao } from '../formulario-inscricao/formulario-inscricao';

// Rota filha de /inscricoes (nova e :email/editar): a lista continua visível atrás do modal.
// O modal existe enquanto a rota estiver ativa; sair dela o fecha.
@Component({
  selector: 'app-modal-formulario-inscricao',
  imports: [DialogModule, FormularioInscricao],
  templateUrl: './modal-formulario-inscricao.html',
  // O Esc do próprio PrimeNG não disparava aqui (ele depende da pilha de z-index),
  // então o atalho é tratado pelo componente.
  host: { '(document:keydown.escape)': 'fechar()' },
})
export class ModalFormularioInscricao {
  private readonly router = inject(Router);

  // Vem do parâmetro :email da rota de edição; ausente no cadastro.
  readonly email = input<string>();

  protected readonly titulo = computed(() =>
    this.email() === undefined ? 'Nova inscrição' : 'Editar inscrição',
  );

  // Fechar pelo X ou pelo Esc volta para a lista.
  protected fechar(): void {
    this.router.navigate(['/inscricoes']);
  }
}
