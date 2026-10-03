import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { InitService } from './core/services/init-service';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
import { errorInterceptorInterceptor } from './shared/interceptors/error-interceptor-interceptor';
import { jwtInterceptor } from './core/interceptors/jwt-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptorInterceptor, jwtInterceptor])),
  provideAppInitializer(async() => {
    const initService= inject(InitService);
    try {
      return lastValueFrom(initService.init());
    } finally {
      console.log('App initialization completed.');
    }
  })
  ]
};
