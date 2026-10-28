import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { InscricoesStore } from './inscricoes/inscricoes.store';

const EMAIL_COM_MAIS = 'ana+corrida@email.com';

describe('rotas', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
    TestBed.inject(InscricoesStore).cadastrar({
      nomeCompleto: 'Ana Souza',
      email: EMAIL_COM_MAIS,
      nascimento: '1990-05-20',
      distancia: 'KM_10',
    });
    router = TestBed.inject(Router);
    harness = await RouterTestingHarness.create();
  });

  function texto(): string {
    return harness.routeNativeElement?.textContent ?? '';
  }

  it('redireciona / para /inscricoes', async () => {
    await harness.navigateByUrl('/');
    expect(router.url).toBe('/inscricoes');
    expect(texto()).toContain('Ana Souza');
  });

  it('abre /inscricoes/nova como modal sobre a lista', async () => {
    await harness.navigateByUrl('/inscricoes/nova');
    expect(document.querySelector('.dialogo-formulario #nomeCompleto')).not.toBeNull();
    expect(texto()).toContain('Ana Souza');
  });

  it('fecha o modal e volta para a lista após cadastrar', async () => {
    await harness.navigateByUrl('/inscricoes/nova');
    const campo = (seletor: string) => document.querySelector<HTMLInputElement>(seletor)!;
    for (const [seletor, valor] of [
      ['#nomeCompleto', 'Bruno Lima'],
      ['#email', 'bruno@email.com'],
      ['#nascimento', '1985-01-10'],
    ]) {
      campo(seletor).value = valor;
      campo(seletor).dispatchEvent(new Event('input'));
    }
    campo('input[value="KM_5"]').click();
    document.querySelector<HTMLFormElement>('.dialogo-formulario form')!
      .dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(router.url).toBe('/inscricoes');
    expect(document.querySelector('.dialogo-formulario')).toBeNull();
    expect(texto()).toContain('Bruno Lima');
  });

  it('abre os detalhes com + e @ digitados direto na URL', async () => {
    await harness.navigateByUrl(`/inscricoes/${EMAIL_COM_MAIS}`);
    expect(texto()).toContain('Ana Souza');
    expect(texto()).toContain(EMAIL_COM_MAIS);
  });

  it('abre os detalhes com o + codificado, como o routerLink gera', async () => {
    await router.navigate(['/inscricoes', EMAIL_COM_MAIS]);
    harness.detectChanges();
    expect(router.url).toBe('/inscricoes/ana%2Bcorrida@email.com');
    expect(texto()).toContain('Ana Souza');
  });

  it('abre a edição em modal com os dados preenchidos e o e-mail bloqueado', async () => {
    await harness.navigateByUrl(`/inscricoes/${EMAIL_COM_MAIS}/editar`);
    const nome = document.querySelector<HTMLInputElement>('.dialogo-formulario #nomeCompleto');
    const email = document.querySelector<HTMLInputElement>('.dialogo-formulario #email');

    expect(nome?.value).toBe('Ana Souza');
    expect(email?.value).toBe(EMAIL_COM_MAIS);
    expect(email?.disabled).toBe(true);
  });

  it('informa inscrição não encontrada nos detalhes e na edição', async () => {
    await harness.navigateByUrl('/inscricoes/ninguem@email.com');
    expect(texto()).toContain('Inscrição não encontrada');

    await harness.navigateByUrl('/inscricoes/ninguem@email.com/editar');
    expect(document.querySelector('.dialogo-formulario')?.textContent).toContain(
      'Inscrição não encontrada',
    );
  });

  it('mostra página não encontrada para caminhos desconhecidos', async () => {
    await harness.navigateByUrl('/qualquer/caminho');
    expect(texto()).toContain('Página não encontrada');
  });
});
