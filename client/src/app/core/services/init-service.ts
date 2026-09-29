import { inject, Injectable } from '@angular/core';
import { AccountService } from './account-service';
import { User } from '../../shared/types/user';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private accountService= inject(AccountService);

  init() {
    const userString= localStorage.getItem('user');
        if (!userString) return of(null);
        const user: User= JSON.parse(userString);
        this.accountService.currentUser.set(user);
        return  of(null)
}
}
