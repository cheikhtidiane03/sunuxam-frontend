# SunuXam — Frontend (Angular 18, standalone, Tailwind CSS)

Interface web pour l'application de gestion de concours SunuXam, connectée à l'API Spring Boot.

## Prérequis

- Node.js 20+ et npm
- Le backend Spring Boot démarré (voir `sunuxam-backend`)

## Installation

```bash
npm install
```

## Configuration de l'URL de l'API

Le backend tourne actuellement sur le port **8090** dans ton environnement. Vérifie/adapte cette valeur dans :

```
src/app/core/services/api-config.ts
```

```ts
export const API_BASE_URL = 'http://localhost:8090/api';
```

## Lancement

```bash
npm start
```

L'application démarre sur `http://localhost:4200`.

⚠️ Le backend doit autoriser les requêtes CORS depuis `http://localhost:4200` — c'est déjà configuré côté Spring Boot dans `WebSecurityConfig`.

## Structure du projet

```
src/app/
├── core/
│   ├── models/          # Interfaces TypeScript (miroir des entités backend)
│   ├── services/        # Appels HTTP vers l'API
│   ├── interceptors/     # Injection automatique du JWT + gestion des erreurs
│   └── guards/           # Protection des routes (auth, admin, candidat)
├── shared/
│   └── components/       # Composants réutilisables (notifications toast)
├── features/
│   ├── auth/              # Connexion, inscription
│   ├── candidat/          # Espace candidat (dashboard, concours, candidatures)
│   └── admin/              # Backoffice (concours, épreuves, candidatures, notes,
│                            #   résultats, salles, affectations, utilisateurs)
├── app.routes.ts          # Toutes les routes, avec lazy loading
├── app.config.ts          # Providers globaux (router, HttpClient, intercepteur)
└── app.component.ts       # Composant racine
```

## Fonctionnalités

### UI / UX
- **Mode sombre/clair** — bouton de bascule partout, préférence mémorisée (`localStorage`) et détection automatique du thème système au premier chargement
- **Icônes Lucide** (`lucide-angular`) à la place des emojis, cohérentes dans toute l'app
- **Graphiques Chart.js** (via `ng2-charts`) sur les tableaux de bord admin et candidat
- **Boîte de confirmation** custom (`ConfirmDialogService`) pour toute action destructrice (suppression, déconnexion, publication de résultats) — plus de `confirm()` natif du navigateur
- **Notifications toast** avec icônes, positionnées en haut à droite
- Sidebar + topbar sur les deux espaces (admin en thème sombre façon backoffice, candidat en thème clair)

### Espace Candidat (`/candidat`)
- Tableau de bord avec statistiques personnelles
- Liste des concours ouverts
- Dépôt de candidature avec upload de pièces (CV, photo, diplôme)
- Suivi de mes candidatures (statut en temps réel)
- Consultation des résultats et de la salle d'examen assignée

### Backoffice Admin (`/admin`)
- Tableau de bord global
- CRUD complet des concours
- Gestion des épreuves par concours
- Gestion des candidatures : changement de statut, saisie des notes par épreuve
- Publication des résultats en un clic (calcul automatique des moyennes)
- Gestion des salles d'examen
- Répartition automatique des candidats dans les salles
- Gestion des utilisateurs, création de nouveaux comptes admin

## Authentification

Le JWT est stocké dans le `localStorage` après connexion, puis injecté automatiquement dans chaque requête HTTP via `jwt.interceptor.ts`. En cas de réponse 401 (token expiré/invalide), l'utilisateur est automatiquement déconnecté et redirigé vers `/connexion`.

Les routes sont protégées par 3 guards :
- `authGuard` — connexion requise
- `adminGuard` — rôle ADMIN requis (protège tout `/admin/**`)
- `candidatGuard` — rôle CANDIDAT requis (protège tout `/candidat/**`)

## Build de production

```bash
npm run build
```

Les fichiers statiques sont générés dans `dist/sunuxam-frontend/`.
