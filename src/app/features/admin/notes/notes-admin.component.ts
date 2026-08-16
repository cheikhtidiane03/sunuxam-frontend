import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CandidatureService } from '../../../core/services/candidature.service';
import { ConcoursService } from '../../../core/services/concours.service';
import { EpreuveService } from '../../../core/services/epreuve.service';
import { NoteService } from '../../../core/services/note.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingBlockComponent } from '../../../shared/components/loading-block/loading-block.component';
import { Candidature } from '../../../core/models/candidature.model';
import { Concours, Epreuve } from '../../../core/models/concours.model';

@Component({
  selector: 'app-notes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, LoadingBlockComponent],
  template: `
    <div class="max-w-6xl mx-auto">
      <a routerLink="/admin/notes" class="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
        <lucide-icon name="arrow-left" [size]="14"></lucide-icon> Retour à la saisie des notes
      </a>

      <div class="mt-4">
        <h1 class="page-title">Saisie des notes</h1>
        @if (concours(); as c) {
          <p class="page-subtitle">{{ c.titre }}</p>
        }
      </div>

      @if (loading()) {
        <app-loading-block></app-loading-block>
      } @else if (epreuves().length === 0) {
        <div class="card mt-8 text-center py-12">
          <p class="text-slate-500 dark:text-slate-400">Aucune épreuve définie pour ce concours.</p>
          <a routerLink="/admin/epreuves" class="btn-secondary inline-flex mt-4">Ajouter des épreuves</a>
        </div>
      } @else if (candidatures().length === 0) {
        <div class="card mt-8 text-center py-12">
          <p class="text-slate-500 dark:text-slate-400">Aucune candidature déposée pour ce concours.</p>
        </div>
      } @else {
        <div class="card mt-6 overflow-x-auto">
          <table class="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th class="sticky left-0 bg-white dark:bg-slate-800 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                  Candidat
                </th>
                @for (e of epreuves(); track e.id) {
                  <th class="text-center text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 px-3 py-2 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                    {{ e.nom }}<br /><span class="normal-case font-normal">coef. {{ e.coefficient }}</span>
                  </th>
                }
                <th class="text-center text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                  Moyenne provisoire
                </th>
                <th class="text-center text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                  Moyenne officielle
                </th>
              </tr>
            </thead>
            <tbody>
              @for (c of candidatures(); track c.id) {
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td class="sticky left-0 bg-white dark:bg-slate-800 px-3 py-2.5 border-b border-slate-100 dark:border-slate-700/60 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {{ c.candidat.prenom }} {{ c.candidat.nom }}
                  </td>
                  @for (e of epreuves(); track e.id) {
                    <td class="px-2 py-2 border-b border-slate-100 dark:border-slate-700/60 text-center">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        class="input-field w-20 text-center mx-auto"
                        [ngModel]="getNote(c, e.id)"
                        (change)="saisirNote(c, e.id, $event)"
                        placeholder="—"
                      />
                    </td>
                  }
                  <td class="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700/60 text-center font-semibold text-primary-700 dark:text-primary-400">
                    {{ moyenneProvisoire(c) !== null ? (moyenneProvisoire(c) | number:'1.2-2') : '—' }}
                  </td>
                  <td class="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700/60 text-center font-semibold text-slate-900 dark:text-white">
                    {{ c.moyenneGenerale !== null ? (c.moyenneGenerale | number:'1.2-2') : '—' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-slate-400 dark:text-slate-500">
          La <strong>moyenne provisoire</strong> est calculée en direct à partir des notes déjà saisies (utile pour vérifier au fur et à mesure).
          La <strong>moyenne officielle</strong> et le statut Admis/Refusé ne sont figés qu'après avoir cliqué sur « Publier les résultats » depuis la page Concours.
        </p>
      }
    </div>
  `
})
export class NotesAdminComponent implements OnInit {
  concours = signal<Concours | null>(null);
  candidatures = signal<Candidature[]>([]);
  epreuves = signal<Epreuve[]>([]);
  loading = signal(true);
  concoursId!: number;

  constructor(
    private route: ActivatedRoute,
    private candidatureService: CandidatureService,
    private concoursService: ConcoursService,
    private epreuveService: EpreuveService,
    private noteService: NoteService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.concoursId = Number(this.route.snapshot.paramMap.get('id'));
    this.concoursService.getById(this.concoursId).subscribe((c) => this.concours.set(c));
    this.epreuveService.getByConcours(this.concoursId).subscribe((data) => this.epreuves.set(data));
    this.charger();
  }

  charger() {
    this.candidatureService.getByConcours(this.concoursId).subscribe((data) => {
      this.candidatures.set(data);
      this.loading.set(false);
    });
  }

  getNote(c: Candidature, epreuveId: number): number | null {
    const note = c.notes.find((n) => n.epreuve?.id === epreuveId);
    return note ? note.valeur : null;
  }

  // Calcul cote frontend, en direct, a partir des notes deja saisies (meme logique ponderee que le backend)
  moyenneProvisoire(c: Candidature): number | null {
    if (c.notes.length === 0) return null;

    let sommePonderee = 0;
    let sommeCoefficients = 0;

    for (const note of c.notes) {
      const coefficient = note.epreuve?.coefficient ?? 1;
      sommePonderee += note.valeur * coefficient;
      sommeCoefficients += coefficient;
    }

    return sommeCoefficients > 0 ? sommePonderee / sommeCoefficients : null;
  }

  saisirNote(c: Candidature, epreuveId: number, event: Event) {
    const valeur = Number((event.target as HTMLInputElement).value);
    if (isNaN(valeur)) return;

    this.noteService.saisir(c.id, epreuveId, valeur).subscribe(() => {
      this.toast.success('Note enregistrée');
      this.charger();
    });
  }
}