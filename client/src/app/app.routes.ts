import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { authGuardGuard } from './core/guards/auth-guard-guard';
import { memberEditGuard } from './features/members/guards/member-edit-guard';
import { adminGuard } from './core/guards/admin-guard';

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
    path: 'likes',
    loadComponent: () => import('./features/members/components/liked-members/liked-members').then(m => m.LikedMembers),
    canActivate: [authGuardGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/members/components/current-member-profile/current-member-profile').then(m => m.CurrentMemberProfile),
    canActivate: [authGuardGuard],
  },
  {
    path: 'matches/:id',
    loadComponent: () => import('./features/members/components/member/member').then(m => m.Member),
    canActivate: [authGuardGuard],
    children: [
      {path: '', loadComponent: () => import('./features/members/components/member-profile/member-profile').then(m => m.MemberProfile)},
      {path: 'messages', loadComponent: () => import('./features/members/components/member-messages/member-messages').then(m => m.MemberMessages)},
      {path: 'edit', loadComponent: () => import('./features/members/components/member-edit/member-edit').then(m => m.MemberEdit), canDeactivate: [memberEditGuard]},
    ],
  },
  {path: 'matches/:id/photos', loadComponent: () => import('./features/members/components/member-photos/member-photos').then(m => m.MemberPhotos),canActivate: [authGuardGuard]
  },
  {
    path: 'messages',
    loadComponent: () => import('./features/messages/components/my-messages/my-messages').then(m => m.MyMessages),canActivate: [authGuardGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/components/admin-panel/admin-panel').then(m => m.AdminPanel),
    canActivate: [authGuardGuard, adminGuard]
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

  {path: 'server-error', loadComponent: () => import('./shared/components/errors/server-error/server-error').then(m => m.ServerError)},

  { path: '**', loadComponent: () => import('./shared/components/errors/not-found/not-found').then(m => m.NotFound) }
];
