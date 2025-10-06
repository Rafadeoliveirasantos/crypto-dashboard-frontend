import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
  },
  {
    path: 'coin-detail',
    loadChildren: () => import('./coin-detail/coin-detail.module').then(m => m.CoinDetailModule),
  },
  {
    path: 'alerts',
    loadChildren: () => import('./alerts/alerts.module').then(m => m.AlertsModule),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];