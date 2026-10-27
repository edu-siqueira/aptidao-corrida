import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('mostra o evento, a data da prova e o resumo zerado', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(texto).toContain('5ª Corrida Solidária da Vila Esperança');
    expect(texto).toContain('14/03/2027');
    expect(texto).toMatch(/Total\s*0/);
  });
});
