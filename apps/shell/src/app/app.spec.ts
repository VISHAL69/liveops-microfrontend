import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import Aura from '@primeuix/themes/aura';
import { App } from './app';

describe('Shell App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
        MessageService,
      ],
    }).compileComponents();
  });

  it('should create the shell root component', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should expose the three main navigation items', () => {
    const fixture = TestBed.createComponent(App);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const navItems = (fixture.componentInstance as any).navItems as {
      path: string;
    }[];
    expect(navItems.map((item) => item.path)).toEqual([
      '/dashboard',
      '/inventory',
      '/orders',
    ]);
  });
});
