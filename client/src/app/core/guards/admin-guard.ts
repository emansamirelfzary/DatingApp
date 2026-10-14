import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AccountService } from '../services/account-service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const accountService = inject(AccountService);

  if (accountService.isAdmin()) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};
