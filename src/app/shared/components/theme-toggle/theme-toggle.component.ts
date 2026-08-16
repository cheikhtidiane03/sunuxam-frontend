import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button
      (click)="theme.toggle()"
      class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition"
      [title]="theme.isDark() ? 'Passer en mode clair' : 'Passer en mode sombre'"
    >
      <lucide-icon [name]="theme.isDark() ? 'sun' : 'moon'" [size]="18"></lucide-icon>
    </button>
  `
})
export class ThemeToggleComponent {
  constructor(public theme: ThemeService) {}
}
