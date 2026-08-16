import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ConcoursService } from '../../../core/services/concours.service';
import { CandidatureService } from '../../../core/services/candidature.service';
import { ToastService } from '../../../core/services/toast.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { Concours } from '../../../core/models/concours.model';
import { Candidature } from '../../../core/models/candidature.model';

interface PieceForm {
  type: string;
  label: string;
  icon: string;
  file: File | null;
}

@Component({
  selector: 'app-concours-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, SpinnerComponent],
  template: `
    @if (concours(); as c) {
      <div class="max-w-3xl mx-auto">
        <div class="card">
          <div class="flex items-start justify-between gap-4">
            <h1 class="page-title">{{ c.titre }}</h1>
            @if (c.resultatsPublies) {
              <span class="badge bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 whitespace-nowrap">Résultats publiés</span>
            } @else {
              <span class="badge bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 whitespace-nowrap">Ouvert</span>
            }
          </div>
          <p class="mt-3 text-slate-600 dark:text-slate-300">{{ c.description }}</p>

          <div class="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div class="rounded-xl bg-slate-50 dark:bg-slate-900 p-4">
              <p class="text-slate-500 dark:text-slate-400">Date limite de candidature</p>
              <p class="mt-1 font-semibold text-slate-900 dark:text-white">{{ c.dateLimiteCandidature | date:'dd MMMM yyyy' }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 dark:bg-slate-900 p-4">
              <p class="text-slate-500 dark:text-slate-400">Date de délibération</p>
              <p class="mt-1 font-semibold text-slate-900 dark:text-white">{{ c.dateDeliberation | date:'dd MMMM yyyy' }}</p>
            </div>
          </div>

          @if (c.epreuves.length > 0) {
            <div class="mt-6">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">Épreuves</h3>
              <div class="space-y-2">
                @for (e of c.epreuves; track e.id) {
                  <div class="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm">
                    <span class="font-medium text-slate-900 dark:text-white">{{ e.nom }}</span>
                    <span class="text-slate-500 dark:text-slate-400">Coef. {{ e.coefficient }} · {{ e.dureeMinutes }} min</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <div class="card mt-6">
          @if (mesCandidature(); as candidature) {
            <div class="flex items-center gap-3">
              <div class="h-11 w-11 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <lucide-icon name="circle-check" [size]="22"></lucide-icon>
              </div>
              <div>
                <p class="font-semibold text-slate-900 dark:text-white">Vous avez déjà postulé à ce concours</p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Statut : <span [ngClass]="statutClass(candidature.statut)" class="badge">{{ statutLabel(candidature.statut) }}</span></p>
              </div>
            </div>
          } @else {
            <h3 class="font-semibold text-slate-900 dark:text-white mb-4">Déposer ma candidature</h3>

            <div class="space-y-3">
              @for (piece of pieces; track piece.type; let i = $index) {
                <div>
                  <label class="label-field flex items-center gap-1.5">
                    <lucide-icon [name]="piece.icon" [size]="14"></lucide-icon> {{ piece.label }}
                  </label>
                  <input type="file" (change)="onFileSelected($event, i)" class="input-field cursor-pointer" />
                </div>
              }
            </div>

            <button (click)="deposer()" class="btn-primary mt-5 w-full" [disabled]="loading()">
              @if (loading()) { <app-spinner [size]="16" class="text-white"></app-spinner> }
              Envoyer ma candidature
            </button>
          }
        </div>
      </div>
    } @else {
      <div class="max-w-3xl mx-auto animate-pulse space-y-4">
        <div class="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
      </div>
    }
  `
})
export class ConcoursDetailComponent implements OnInit {
  concours = signal<Concours | null>(null);
  mesCandidature = signal<Candidature | null>(null);
  loading = signal(false);
  concoursId!: number;

  pieces: PieceForm[] = [
    { type: 'CV', label: 'CV', icon: 'file-text', file: null },
    { type: 'PHOTO', label: 'Photo', icon: 'circle-user-round', file: null },
    { type: 'DIPLOME', label: 'Diplôme', icon: 'graduation-cap', file: null }
  ];

  constructor(
    private route: ActivatedRoute,
    private concoursService: ConcoursService,
    private candidatureService: CandidatureService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.concoursId = Number(this.route.snapshot.paramMap.get('id'));
    this.concoursService.getById(this.concoursId).subscribe((data) => this.concours.set(data));

    this.candidatureService.mesCandidatures().subscribe((list) => {
      const found = list.find((c) => c.concours.id === this.concoursId);
      if (found) this.mesCandidature.set(found);
    });
  }

  onFileSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.pieces[index].file = input.files[0];
    }
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

  deposer() {
    const selected = this.pieces.filter((p) => p.file !== null);
    const fichiers = selected.map((p) => p.file as File);
    const types = selected.map((p) => p.type);

    this.loading.set(true);
    this.candidatureService.deposer(this.concoursId, fichiers, types).subscribe({
      next: (candidature) => {
        this.loading.set(false);
        this.toast.success('Candidature envoyée avec succès !');
        this.mesCandidature.set(candidature);
      },
      error: () => this.loading.set(false)
    });
  }
}
