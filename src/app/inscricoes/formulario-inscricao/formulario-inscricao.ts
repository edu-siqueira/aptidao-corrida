import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { dataDeHoje } from '../../dominio/datas';
import { ErrosInscricao } from '../../dominio/inscricao.validacao';
import { InscricaoNaoEncontrada } from '../inscricao-nao-encontrada/inscricao-nao-encontrada';
import { InscricoesStore, ResultadoOperacao } from '../inscricoes.store';

// Atende /inscricoes/nova (sem e-mail) e /inscricoes/:email/editar (com e-mail).
// As regras ficam na store e no domínio; aqui só exibimos os erros devolvidos.
@Component({
  selector: 'app-formulario-inscricao',
  imports: [ReactiveFormsModule, RouterLink, InscricaoNaoEncontrada],
  templateUrl: './formulario-inscricao.html',
})
export class FormularioInscricao {
  private readonly store = inject(InscricoesStore);
  private readonly router = inject(Router);

  readonly email = input<string>();

  protected readonly modoEdicao = computed(() => this.email() !== undefined);
  protected readonly inscricaoEditada = computed(() => {
    const email = this.email();
    return email === undefined ? undefined : untracked(() => this.store.buscar(email));
  });
  protected readonly erros = signal<ErrosInscricao>({});
  protected readonly hoje = dataDeHoje();

  protected readonly formulario = inject(NonNullableFormBuilder).group({
    nomeCompleto: '',
    email: '',
    nascimento: '',
    distancia: '',
  });

  constructor() {
    // Preenche o formulário sempre que o e-mail da URL mudar.
    effect(() => {
      const inscricao = this.inscricaoEditada();
      if (!inscricao) return;

      this.formulario.setValue({
        nomeCompleto: inscricao.nomeCompleto,
        email: inscricao.email,
        nascimento: inscricao.nascimento,
        distancia: inscricao.distancia,
      });
      this.formulario.controls.email.disable();
    });
  }

  protected salvar(): void {
    const valores = this.formulario.getRawValue();
    const email = this.email();

    const resultado: ResultadoOperacao =
      email === undefined
        ? this.store.cadastrar(valores)
        : this.store.editar(email, {
            nomeCompleto: valores.nomeCompleto,
            nascimento: valores.nascimento,
            distancia: valores.distancia,
          });

    if (resultado.ok) {
      this.formulario.reset();
      this.erros.set({});
      this.router.navigate(['/inscricoes']);
    } else if (resultado.motivo === 'INVALIDA') {
      this.erros.set(resultado.erros);
    } else {
      // A inscrição foi cancelada enquanto o formulário estava aberto.
      this.router.navigate(['/inscricoes', email]);
    }
  }
}
