import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../shared/types/user';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Likes } from '../../features/members/services/likes';
import { getRolesFromToken } from '../../shared/utils/jwt';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http= inject (HttpClient);
  private likesService = inject (Likes)
  
  currentUser= signal <User | null> (null);

  // Roles are embedded in the JWT; derive them reactively from the token.
  roles = computed<string[]>(() => getRolesFromToken(this.currentUser()?.token));
  isAdmin = computed<boolean>(() => this.roles().includes('Admin'));

  baseUrl= environment.apiUrl;


 login(creds: { email: string; password: string }) {
  return this.http.post<User>(this.baseUrl + 'account/login', creds).pipe(
    tap((user: User) => {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUser.set(user);
      this.likesService.getLikeIds();
    })
  );
}

logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.likesService.clearLikesIds()
  }

  register(creds: { email: string; password: string; displayName: string; dateOfBirth: string; gender: string; city: string; country: string }) {
    return this.http.post<User>(this.baseUrl + 'account/register', creds).pipe(
      tap((user) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser.set(user);
        this.likesService.getLikeIds();
      }),
    );
  }
/*
  setCurrentUser(){
    const userString= localStorage.getItem('user');
    if (!userString) return;
    const user: User= JSON.parse(userString);
    this.currentUser.set(user);
  }*/
}
