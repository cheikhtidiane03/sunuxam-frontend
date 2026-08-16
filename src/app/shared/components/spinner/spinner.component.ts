import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
      [ngStyle]="{ width: size + 'px', height: size + 'px' }"
    ></span>
  `
})
export class SpinnerComponent {
  @Input() size = 16;
}
