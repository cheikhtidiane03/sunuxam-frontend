import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ConcoursService } from '../../../core/services/concours.service';
import { LoadingBlockComponent } from '../../../shared/components/loading-block/loading-block.component';
import { Concours } from '../../../core/models/concours.model';

@Component({
  selector: 'app-epreuves-selector',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, LoadingBlockComponent],
  template: `
    <div class="max-w-4xl mx-auto">
      <h1 class="page-title">Épreuves</h1>
      <p class="page-subtitle">Choisis un concours pour gérer ses épreuves.</p>

      @if (loading()) {
        <app-loading-block></app-loading-block>
      } @else {
        <div class="mt-8 grid gap-4 sm:grid-cols-2">
          @for (c of concours(); track c.id) {
            <a [routerLink]="['/admin/concours', c.id, 'epreuves']" class="card block hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white">{{ c.titre }}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ c.epreuves.length }} épreuve(s)</p>
                </div>
                <lucide-icon name="chevron-right" [size]="18" class="text-slate-400"></lucide-icon>
              </div>
            </a>
          } @empty {
            <p class="col-span-2 text-sm text-slate-500 dark:text-slate-400 text-center py-12">Aucun concours créé pour le moment.</p>
          }
        </div>
      }
    </div>
  `
})
export class EpreuvesSelectorComponent implements OnInit {
  concours = signal<Concours[]>([]);
  loading = signal(true);

  constructor(private concoursService: ConcoursService) {}

  ngOnInit() {
    this.concoursService.getAll().subscribe((data) => {
      this.concours.set(data);
      this.loading.set(false);
    });
  }
}
