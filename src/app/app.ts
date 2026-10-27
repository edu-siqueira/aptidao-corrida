import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { DataBrPipe } from './compartilhado/data-br.pipe';
import { EVENTO } from './dominio/evento';
import { InscricoesStore } from './inscricoes/inscricoes.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, DataBrPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly store = inject(InscricoesStore);
  protected readonly evento = EVENTO;
}
