import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ROLES } from './roles';

/** Requires a signed-in user; otherwise starts sign-in and returns to the requested URL. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) {
    return true;
  }
  auth.signIn(state.url);
  return false;
};

/** Requires any of `roles`; otherwise sends the user to the landing page. */
export function roleGuard(...roles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    return roles.some((role) => auth.hasRole(role)) ? true : inject(Router).createUrlTree(['/']);
  };
}

export const adminGuard: CanActivateFn = roleGuard(ROLES.admin);
