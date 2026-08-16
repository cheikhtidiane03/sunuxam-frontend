import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ConcoursService } from '../../../core/services/concours.service';
import { ResultatService } from '../../../core/services/resultat.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { LoadingBlockComponent } from '../../../shared/components/loading-block/loading-block.component';
import { Concours } from '../../../core/models/concours.model';

@Component({
  selector: 'app-concours-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, LoadingBlockComponent],
  template: `
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="page-title">Gestion des concours</h1>
          <p class="page-subtitle">Créez et gérez les concours de recrutement.</p>
        </div>
        <button (click)="ouvrirCreation()" class="btn-primary">
          <lucide-icon name="plus" [size]="16"></lucide-icon> Nouveau concours
        </button>
      </div>

      @if (loading()) {
        <app-loading-block></app-loading-block>
      } @else {
        <div class="mt-8 space-y-4">
          @for (c of concours(); track c.id) {
            <div class="card">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-slate-900 dark:text-white">{{ c.titre }}</h3>
                    @if (c.resultatsPublies) {
                      <span class="badge bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Résultats publiés</span>
                    }
                  </div>
                  <p class="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{{ c.description }}</p>
                  <p class="mt-2 text-xs text-slate-400 dark:text-slate-500">
                    Limite : {{ c.dateLimiteCandidature | date:'dd/MM/yyyy' }} · Délibération : {{ c.dateDeliberation | date:'dd/MM/yyyy' }}
                  </p>
                </div>
              </div>

              <div class="mt-4 flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                <button (click)="publierResultats(c)" [disabled]="c.resultatsPublies" class="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">
                  <lucide-icon name="send" [size]="14"></lucide-icon> Publier les résultats
                </button>
                <button (click)="ouvrirEdition(c)" class="btn-secondary text-xs px-3 py-1.5">
                  <lucide-icon name="pencil" [size]="14"></lucide-icon> Modifier
                </button>
                <button (click)="supprimer(c)" class="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 text-red-600 dark:text-red-400 hover:text-red-700 font-semibold">
                  <lucide-icon name="trash-2" [size]="14"></lucide-icon> Supprimer
                </button>
              </div>
            </div>
          } @empty {
            <p class="text-sm text-slate-500 dark:text-slate-400 text-center py-12">Aucun concours pour le moment.</p>
          }
        </div>
      }
    </div>

    @if (modalOuvert()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
        <div class="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ editionId() ? 'Modifier le concours' : 'Nouveau concours' }}</h2>

          <div class="mt-5 space-y-4">
            <div>
              <label class="label-field">Titre</label>
              <input class="input-field" type="text" [(ngModel)]="form.titre" name="titre" />
            </div>
            <div>
              <label class="label-field">Description</label>
              <textarea class="input-field" rows="3" [(ngModel)]="form.description" name="description"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-field">Date limite candidature</label>
                <input class="input-field" type="date" [(ngModel)]="form.dateLimiteCandidature" name="dateLimite" />
              </div>
              <div>
                <label class="label-field">Date de délibération</label>
                <input class="input-field" type="date" [(ngModel)]="form.dateDeliberation" name="dateDeliberation" />
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button (click)="fermerModal()" class="btn-secondary">Annuler</button>
            <button (click)="enregistrer()" class="btn-primary">Enregistrer</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConcoursAdminComponent implements OnInit {
  concours = signal<Concours[]>([]);
  loading = signal(true);
  modalOuvert = signal(false);
  editionId = signal<number | null>(null);

  form: Partial<Concours> = { titre: '', description: '', dateLimiteCandidature: '', dateDeliberation: '' };

  constructor(
    private concoursService: ConcoursService,
    private resultatService: ResultatService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.concoursService.getAll().subscribe((data) => {
      this.concours.set(data);
      this.loading.set(false);
    });
  }

  ouvrirCreation() {
    this.editionId.set(null);
    this.form = { titre: '', description: '', dateLimiteCandidature: '', dateDeliberation: '' };
    this.modalOuvert.set(true);
  }

  ouvrirEdition(c: Concours) {
    this.editionId.set(c.id);
    this.form = {
      titre: c.titre,
      description: c.description,
      dateLimiteCandidature: c.dateLimiteCandidature,
      dateDeliberation: c.dateDeliberation
    };
    this.modalOuvert.set(true);
  }

  fermerModal() {
    this.modalOuvert.set(false);
  }

  enregistrer() {
    const id = this.editionId();
    const action = id
      ? this.concoursService.update(id, this.form)
      : this.concoursService.creer(this.form);

    action.subscribe(() => {
      this.toast.success(id ? 'Concours mis à jour' : 'Concours créé');
      this.modalOuvert.set(false);
      this.charger();
    });
  }

  async supprimer(c: Concours) {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Supprimer ce concours ?',
      message: `"${c.titre}" sera définitivement supprimé, ainsi que ses épreuves et candidatures. Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true
    });
    if (!confirmed) return;
    this.concoursService.delete(c.id).subscribe(() => {
      this.toast.success('Concours supprimé');
      this.charger();
    });
  }

  async publierResultats(c: Concours) {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Publier les résultats ?',
      message: `Les candidats de "${c.titre}" pourront voir leur statut Admis/Refusé. Cette action est irréversible.`,
      confirmLabel: 'Publier'
    });
    if (!confirmed) return;
    this.resultatService.publier(c.id).subscribe(() => {
      this.toast.success('Résultats publiés avec succès');
      this.charger();
    });
  }
}
