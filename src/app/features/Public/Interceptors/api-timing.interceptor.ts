import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ApiTimingInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const started = performance.now();

    return next.handle(req).pipe(
      tap({
        complete: () => {
          const elapsed = Math.round(performance.now() - started);
          console.log(
            `[API TIME] ${req.method} ${req.urlWithParams} => ${elapsed}ms`,
          );
        },
        error: () => {
          const elapsed = Math.round(performance.now() - started);
          console.error(
            `[API ERROR TIME] ${req.method} ${req.urlWithParams} => ${elapsed}ms`,
          );
        },
      }),
    );
  }
}
