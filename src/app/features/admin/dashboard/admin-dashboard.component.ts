import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ConcoursService } from '../../../core/services/concours.service';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { SalleService } from '../../../core/services/salle.service';
import { Concours } from '../../../core/models/concours.model';
import { LoadingBlockComponent } from '../../../shared/components/loading-block/loading-block.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, NgChartsModule, LoadingBlockComponent],
  template: `
    <div class="max-w-6xl mx-auto">
      <h1 class="page-title">Tableau de bord</h1>
      <p class="page-subtitle">Vue d'ensemble de la plateforme SunuXam.</p>

      <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div class="card flex items-center gap-4">
          <div class="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <lucide-icon name="clipboard-list" [size]="22"></lucide-icon>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Concours</p>
            <p class="text-xl font-bold text-slate-900 dark:text-white">{{ concours().length }}</p>
          </div>
        </div>
        <div class="card flex items-center gap-4">
          <div class="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <lucide-icon name="users" [size]="22"></lucide-icon>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Utilisateurs</p>
            <p class="text-xl font-bold text-slate-900 dark:text-white">{{ nbUtilisateurs() }}</p>
          </div>
        </div>
        <div class="card flex items-center gap-4">
          <div class="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <lucide-icon name="door-open" [size]="22"></lucide-icon>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Salles disponibles</p>
            <p class="text-xl font-bold text-slate-900 dark:text-white">{{ nbSalles() }}</p>
          </div>
        </div>
      </div>

      @if (concours().length > 0) {
        <div class="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div class="card">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">Concours par statut</h3>
            <div class="h-56">
              <canvas baseChart [data]="doughnutData()" [type]="'doughnut'" [options]="doughnutOptions"></canvas>
            </div>
          </div>
          <div class="card">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">Épreuves par concours</h3>
            <div class="h-56">
              <canvas baseChart [data]="barData()" [type]="'bar'" [options]="barOptions"></canvas>
            </div>
          </div>
        </div>
      }

      <div class="mt-10 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Concours récents</h2>
        <a routerLink="/admin/concours" class="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700">Gérer les concours →</a>
      </div>

      <div class="mt-4 space-y-3">
        @if (loading()) {
          <app-loading-block></app-loading-block>
        } @else {
          @for (c of concours().slice(0, 5); track c.id) {
            <div class="card flex items-center justify-between">
              <div>
                <p class="font-semibold text-slate-900 dark:text-white">{{ c.titre }}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{{ c.epreuves.length }} épreuve(s)</p>
              </div>
              <div class="flex items-center gap-2">
                @if (c.resultatsPublies) {
                  <span class="badge bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    <lucide-icon name="circle-check" [size]="13"></lucide-icon> Résultats publiés
                  </span>
                } @else {
                  <span class="badge bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">En cours</span>
                }
                <a [routerLink]="['/admin/concours', c.id, 'candidatures']" class="btn-secondary text-xs px-3 py-1.5">Gérer</a>
              </div>
            </div>
          } @empty {
            <p class="text-sm text-slate-500 dark:text-slate-400">Aucun concours créé pour le moment.</p>
          }
        }
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  concours = signal<Concours[]>([]);
  nbUtilisateurs = signal(0);
  nbSalles = signal(0);
  loading = signal(true);

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  doughnutData = computed<ChartData<'doughnut'>>(() => {
    const publies = this.concours().filter((c) => c.resultatsPublies).length;
    const enCours = this.concours().length - publies;
    return {
      labels: ['En cours', 'Résultats publiés'],
      datasets: [{ data: [enCours, publies], backgroundColor: ['#3b82f6', '#10b981'] }]
    };
  });

  barData = computed<ChartData<'bar'>>(() => ({
    labels: this.concours().map((c) => c.titre.length > 15 ? c.titre.slice(0, 15) + '…' : c.titre),
    datasets: [{ label: 'Épreuves', data: this.concours().map((c) => c.epreuves.length), backgroundColor: '#2563eb', borderRadius: 6 }]
  }));

  constructor(
    private concoursService: ConcoursService,
    private utilisateurService: UtilisateurService,
    private salleService: SalleService
  ) {}

  ngOnInit() {
    this.concoursService.getAll().subscribe((data) => {
      this.concours.set(data);
      this.loading.set(false);
    });
    this.utilisateurService.getAll().subscribe((data) => this.nbUtilisateurs.set(data.length));
    this.salleService.getAll().subscribe((data) => this.nbSalles.set(data.length));
  }
}
