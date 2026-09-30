import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core/primitives/di';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';


export const errorInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const router= inject(Router);
  return next(req).pipe(
    catchError((error) => {
      if (error) {
        switch (error.status) {
          case 400:
            if (error.error.errors) {
              const modelStateErrors= []
              for (const key in error.error.errors) {
                if (error.error.errors[key]) {
                  modelStateErrors.push(error.error.errors[key]);
                  console.log(error.error.errors[key]);
                }
              }
              throw modelStateErrors.flat();
            } else {
              console.log(error.error);
            }
            break;
          case 401:
            console.log('Unauthorized');
            break;
          case 404:
            router.navigateByUrl('/not-found');
            break;
          case 500:
            const navigationExtras= {state: {error: error.error}};
            router.navigateByUrl('/server-error', navigationExtras);
            break;
          default:
            console.log('An unexpected error occurred');
            break;
        }
      }
      throw error;
    }),
  );
};
