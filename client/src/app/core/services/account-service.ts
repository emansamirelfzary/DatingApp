import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../shared/types/user';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Likes } from '../../features/members/services/likes';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http= inject (HttpClient);
  private likesService = inject (Likes)
  
  currentUser= signal <User | null> (null);

  baseUrl= environment.apiUrl;

 login(creds: { email: string; password: string }) {
  return this.http.post<User>(this.baseUrl + 'account/login', creds).pipe(
    tap((user: User) => {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUser.set(user);
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
