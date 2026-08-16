import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AffectationService } from '../../../core/services/affectation.service';
import { ConcoursService } from '../../../core/services/concours.service';
import { ToastService } from '../../../core/services/toast.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { LoadingBlockComponent } from '../../../shared/components/loading-block/loading-block.component';
import { Affectation } from '../../../core/models/salle.model';
import { Concours } from '../../../core/models/concours.model';

@Component({
  selector: 'app-affectations-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, SpinnerComponent, LoadingBlockComponent],
  template: `
    <div class="max-w-4xl mx-auto">
      <a routerLink="/admin/repartition" class="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
        <lucide-icon name="arrow-left" [size]="14"></lucide-icon> Retour à la répartition
      </a>

      <div class="mt-4 flex items-center justify-between">
        <div>
          <h1 class="page-title">Répartition en salles</h1>
          @if (concours(); as c) {
            <p class="page-subtitle">{{ c.titre }}</p>
          }
        </div>
        <button (click)="repartir()" class="btn-primary" [disabled]="loadingAction()">
          @if (loadingAction()) { <app-spinner [size]="16" class="text-white"></app-spinner> } @else { <lucide-icon name="refresh-cw" [size]="16"></lucide-icon> }
          Répartir automatiquement
        </button>
      </div>

      @if (loading()) {
        <app-loading-block></app-loading-block>
      } @else {
        <div class="mt-8 space-y-3">
          @for (a of affectations(); track a.id) {
            <div class="card flex items-center justify-between">
              <div>
                <p class="font-semibold text-slate-900 dark:text-white">{{ a.candidature.candidat.prenom }} {{ a.candidature.candidat.nom }}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{{ a.candidature.candidat.username }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-slate-900 dark:text-white">{{ a.salle.nom }}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">Place n° {{ a.numeroPlace }}</p>
              </div>
            </div>
          } @empty {
            <div class="card text-center py-12">
              <p class="text-slate-500 dark:text-slate-400">Aucune répartition effectuée pour ce concours.</p>
              <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Assure-toi d'avoir créé des salles avant de répartir.</p>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AffectationsAdminComponent implements OnInit {
  concours = signal<Concours | null>(null);
  affectations = signal<Affectation[]>([]);
  loading = signal(true);
  loadingAction = signal(false);
  concoursId!: number;

  constructor(
    private route: ActivatedRoute,
    private affectationService: AffectationService,
    private concoursService: ConcoursService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.concoursId = Number(this.route.snapshot.paramMap.get('id'));
    this.concoursService.getById(this.concoursId).subscribe((c) => this.concours.set(c));
    this.charger();
  }

  charger() {
    this.affectationService.getByConcours(this.concoursId).subscribe((data) => {
      this.affectations.set(data);
      this.loading.set(false);
    });
  }

  repartir() {
    this.loadingAction.set(true);
    this.affectationService.repartir(this.concoursId).subscribe({
      next: (data) => {
        this.loadingAction.set(false);
        this.affectations.set(data);
        this.toast.success('Candidats répartis dans les salles');
      },
      error: () => this.loadingAction.set(false)
    });
  }
}
