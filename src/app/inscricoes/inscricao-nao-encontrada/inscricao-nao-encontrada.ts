import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inscricao-nao-encontrada',
  imports: [RouterLink],
  templateUrl: './inscricao-nao-encontrada.html',
})
export class InscricaoNaoEncontrada {
  readonly email = input.required<string>();
}
