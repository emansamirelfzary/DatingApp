import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account-service';
import { inject } from '@angular/core/primitives/di';

export const authGuardGuard: CanActivateFn = () => {
  const router = inject(Router);


  const accountService = inject(AccountService);

  if (accountService.currentUser()){
    return true;
  }
  else {
   router.navigate(['/auth/login']);
   return false;
  }

};
