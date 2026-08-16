import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed top-4 right-4 z-[110] flex flex-col gap-2 w-full max-w-sm">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="animate-[slideIn_0.2s_ease-out] rounded-xl px-4 py-3 shadow-lg ring-1 flex items-start gap-3 bg-white dark:bg-slate-800"
          [ngClass]="{
            'ring-emerald-200 dark:ring-emerald-500/30': toast.type === 'success',
            'ring-red-200 dark:ring-red-500/30': toast.type === 'error',
            'ring-blue-200 dark:ring-blue-500/30': toast.type === 'info'
          }"
        >
          <span
            [ngClass]="{
              'text-emerald-600 dark:text-emerald-400': toast.type === 'success',
              'text-red-600 dark:text-red-400': toast.type === 'error',
              'text-blue-600 dark:text-blue-400': toast.type === 'info'
            }"
          >
            <lucide-icon [name]="iconFor(toast.type)" [size]="20"></lucide-icon>
          </span>
          <span class="text-sm font-medium flex-1 text-slate-700 dark:text-slate-200">{{ toast.message }}</span>
          <button (click)="toastService.dismiss(toast.id)" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <lucide-icon name="x" [size]="16"></lucide-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}

  iconFor(type: string): string {
    return type === 'success' ? 'circle-check' : type === 'error' ? 'circle-x' : 'info';
  }
}
