import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken();
  const withAuth = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(withAuth).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || req.url.includes('/token/refresh/')) {
        return throwError(() => error);
      }
      const refresh$ = auth.refreshToken();
      if (!refresh$) {
        auth.logout();
        return throwError(() => error);
      }
      return refresh$.pipe(
        switchMap((nextAccess) => {
          const retry = req.clone({ setHeaders: { Authorization: `Bearer ${nextAccess}` } });
          return next(retry);
        }),
        catchError((refreshErr) => {
          auth.logout();
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
