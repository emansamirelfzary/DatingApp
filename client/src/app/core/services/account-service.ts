import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../shared/types/user';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http= inject (HttpClient);
  currentUser= signal <User | null> (null);

  baseUrl= environment.apiUrl;

 login(creds: any) {
  return this.http.post<User>(this.baseUrl + '/login', creds).pipe(
    tap((user: User) => {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUser.set(user);
    })
  );
}

logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  register (creds: any) {
    return this.http.post(this.baseUrl + '/register', creds);
  }
/*
  setCurrentUser(){
    const userString= localStorage.getItem('user');
    if (!userString) return;
    const user: User= JSON.parse(userString);
    this.currentUser.set(user);
  }*/
}
