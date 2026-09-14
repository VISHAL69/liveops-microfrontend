import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'liveops-root',
  standalone: true,
  imports: [RouterModule, ButtonModule, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);

  protected readonly appTitle = 'LiveOps';

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'pi pi-chart-line' },
    { label: 'Inventory', path: '/inventory', icon: 'pi pi-box' },
    { label: 'Orders', path: '/orders', icon: 'pi pi-shopping-cart' },
  ];

  protected readonly sidebarCollapsed = signal(false);
  protected readonly currentUrl = signal('');

  protected readonly pageTitle = computed(() => {
    const match = this.navItems.find((item) =>
      this.currentUrl().startsWith(item.path)
    );
    return match?.label ?? 'LiveOps';
  });

  constructor() {
    this.currentUrl.set(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));
  }

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }

  protected isActive(path: string): boolean {
    return this.currentUrl().startsWith(path);
  }
}
