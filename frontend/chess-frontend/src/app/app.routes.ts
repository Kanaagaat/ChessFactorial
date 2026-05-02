import { Routes } from '@angular/router';
import { AuthPageComponent } from './pages/auth-page.component';
import { PlayPageComponent } from './pages/play-page.component';
import { HistoryPageComponent } from './pages/history-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'play' },
  { path: 'auth', component: AuthPageComponent },
  { path: 'play', component: PlayPageComponent },
  { path: 'history', component: HistoryPageComponent }
];
