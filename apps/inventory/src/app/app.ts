import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeader } from '@liveops/ui';
import { InventoryProducts } from '@liveops/inventory-ui-products';

@Component({
  selector: 'liveops-inventory-root',
  standalone: true,
  imports: [PageHeader, InventoryProducts],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
