import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CandidatureService } from '../../../core/services/candidature.service';
import { Candidature } from '../../../core/models/candidature.model';
import { LoadingBlockComponent } from '../../../shared/components/loading-block/loading-block.component';

@Component({
  selector: 'app-mes-candidatures',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, LoadingBlockComponent],
  template: `
    <div class="max-w-4xl mx-auto">
      <h1 class="page-title">Mes candidatures</h1>
      <p class="page-subtitle">Suivez l'état de vos candidatures et consultez vos résultats.</p>

      @if (loading()) {
        <app-loading-block></app-loading-block>
      } @else {
        <div class="mt-8 space-y-4">
          @for (c of candidatures(); track c.id) {
            <a [routerLink]="['/candidat/candidature', c.id]" class="card block hover:shadow-md transition flex items-center justify-between gap-4">
              <div>
                <h3 class="font-semibold text-slate-900 dark:text-white">{{ c.concours.titre }}</h3>
                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Déposée le {{ c.dateDepot | date:'dd/MM/yyyy' }}</p>
              </div>
              <span [ngClass]="statutClass(c.statut)" class="badge whitespace-nowrap">{{ statutLabel(c.statut) }}</span>
            </a>
          } @empty {
            <div class="card text-center py-12">
              <p class="text-slate-500 dark:text-slate-400">Vous n'avez encore déposé aucune candidature.</p>
              <a routerLink="/candidat/concours" class="btn-primary inline-flex mt-4">Voir les concours ouverts</a>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class MesCandidaturesComponent implements OnInit {
  candidatures = signal<Candidature[]>([]);
  loading = signal(true);

  constructor(private candidatureService: CandidatureService) {}

  ngOnInit() {
    this.candidatureService.mesCandidatures().subscribe((data) => {
      this.candidatures.set(data);
      this.loading.set(false);
    });
  }

  statutLabel(statut: string): string {
    const labels: Record<string, string> = {
      EN_ATTENTE: 'En attente',
      DOSSIER_COMPLET: 'Dossier complet',
      EN_ATTENTE_DELIBERATION: 'En attente de délibération',
      ADMIS: 'Admis',
      REFUSE: 'Refusé'
    };
    return labels[statut] ?? statut;
  }

  statutClass(statut: string): string {
    const classes: Record<string, string> = {
      EN_ATTENTE: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
      DOSSIER_COMPLET: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
      EN_ATTENTE_DELIBERATION: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
      ADMIS: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      REFUSE: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'
    };
    return classes[statut] ?? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
  }
}
