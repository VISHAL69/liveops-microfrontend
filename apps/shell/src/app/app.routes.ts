import { Route } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () =>
      loadRemoteModule('dashboard', './Component').then((m) => m.App),
  },
  {
    path: 'inventory',
    loadComponent: () =>
      loadRemoteModule('inventory', './Component').then((m) => m.App),
  },
  {
    path: 'orders',
    loadComponent: () =>
      loadRemoteModule('orders', './Component').then((m) => m.App),
  },
  { path: '**', redirectTo: 'dashboard' },
];
