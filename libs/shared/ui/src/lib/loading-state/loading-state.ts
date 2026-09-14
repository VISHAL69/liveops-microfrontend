import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'lib-loading-state',
  standalone: true,
  imports: [SkeletonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loading-state">
      @for (row of rows(); track row) {
        <p-skeleton height="2.5rem" styleClass="loading-state__row" />
      }
    </div>
  `,
  styles: [
    `
      .loading-state {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem 0;
      }
    `,
  ],
})
export class LoadingState {
  rowCount = input<number>(4);
  rows = computed(() => Array.from({ length: this.rowCount() }, (_, i) => i));
}
