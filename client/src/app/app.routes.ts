import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { authGuardGuard } from './core/guards/auth-guard-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: Home
  },
  {
    path: 'matches',
    loadComponent: () => import('./features/members/components/members/members').then(m => m.Members),canActivate: [authGuardGuard]
  },
  {
    path: 'matches/:id',
    loadComponent: () => import('./features/members/components/member-profile/member-profile').then(m => m.MemberProfile),canActivate: [authGuardGuard]
  },
  {
    path: 'messages',
    loadComponent: () => import('./features/messages/components/messages/messages').then(m => m.Messages),canActivate: [authGuardGuard]
  },

  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
  },
  {path: 'not-found', loadComponent: () => import('./shared/components/errors/not-found/not-found').then(m => m.NotFound)},

  { path: '**', loadComponent: () => import('./shared/components/errors/not-found/not-found').then(m => m.NotFound) }
];
