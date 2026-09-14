import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { appRoutes } from './app.routes';

/**
 * Providers here are only exercised when this MFE is served standalone
 * (e.g. `nx serve orders` directly at its own port for isolated development).
 * When loaded through the Shell host, the Shell's own providers
 * (HttpClient, PrimeNG, zoneless change detection) apply instead, since
 * only the exposed component class is federated - not this bootstrap.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: { darkModeSelector: '.app-dark',  cssLayer: false, },
      },
    }),
  ],
};
