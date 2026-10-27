import { Component, input } from '@angular/core';

import { DataBrPipe } from '../../compartilhado/data-br.pipe';
import { InscricaoDetalhada } from '../../dominio/inscricao';
import { ROTULO_CATEGORIA, ROTULO_DISTANCIA } from '../rotulos';

// Campos de uma inscrição, usados no card da lista e na tela de detalhes.
@Component({
  selector: 'app-ficha-inscricao',
  imports: [DataBrPipe],
  templateUrl: './ficha-inscricao.html',
})
export class FichaInscricao {
  readonly inscricao = input.required<InscricaoDetalhada>();

  protected readonly rotuloDistancia = ROTULO_DISTANCIA;
  protected readonly rotuloCategoria = ROTULO_CATEGORIA;
}
