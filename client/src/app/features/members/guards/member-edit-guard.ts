import { CanDeactivateFn } from '@angular/router';

interface CanDeactivateMemberProfile {
  canDeactivate(): boolean;
}

export const memberEditGuard: CanDeactivateFn<CanDeactivateMemberProfile> = (component) =>
  component.canDeactivate();
