import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';

import { adminGuard } from './admin-guard';
import { AccountService } from '../services/account-service';

describe('adminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => adminGuard(...guardParameters));

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  const configureWithAdmin = (isAdmin: boolean) => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
        {
          provide: AccountService,
          useValue: { isAdmin: signal(isAdmin) },
        },
      ],
    });
  };

  it('allows navigation for admins', () => {
    configureWithAdmin(true);
    expect(executeGuard(route, state)).toBe(true);
  });

  it('blocks navigation and redirects non-admins', () => {
    const router = { navigate: vi.fn().mockResolvedValue(true) };
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AccountService, useValue: { isAdmin: signal(false) } },
      ],
    });

    expect(executeGuard(route, state)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });
});
