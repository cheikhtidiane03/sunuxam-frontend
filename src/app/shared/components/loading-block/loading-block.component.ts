import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-loading-block',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-20 text-slate-400 dark:text-slate-500">
      <app-spinner [size]="28"></app-spinner>
      <p class="text-sm">{{ label }}</p>
    </div>
  `
})
export class LoadingBlockComponent {
  @Input() label = 'Chargement...';
}
