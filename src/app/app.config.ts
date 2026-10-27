import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Material from "@primeuix/themes/material"

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Parâmetros da rota (:email) chegam como input() nos componentes.
    provideRouter(routes, withComponentInputBinding()),
    providePrimeNG({
      theme: {
        preset: Material,
        // Sem isso o tema segue o modo escuro do sistema e escurece os controles nativos
        // (radios, calendário), destoando do resto da aplicação, que é só clara.
        options: { darkModeSelector: false },
      },
    }),
  ],
};
