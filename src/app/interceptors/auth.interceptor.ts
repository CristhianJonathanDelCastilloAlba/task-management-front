import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (req.url.includes('/auth/') && !req.url.includes('/auth/profile') && !req.url.includes('/auth/change-password')) {
        return next(req);
    }

    const token = localStorage.getItem('accessToken');
    let authReq = req;

    if (token) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                return handle401Error(authReq, next, authService, router);
            } else if (error.status === 403) {
                router.navigate(['/tasks']);
                return throwError(() => error);
            }
            return throwError(() => error);
        })
    );
};

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

function handle401Error(
    request: HttpRequest<unknown>,
    next: HttpHandlerFn,
    authService: AuthService,
    router: Router
): Observable<HttpEvent<unknown>> {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshToken().pipe(
            switchMap((response: any) => {
                isRefreshing = false;
                refreshTokenSubject.next(response.tokens.accessToken);

                const newRequest = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${response.tokens.accessToken}`
                    }
                });

                return next(newRequest);
            }),
            catchError((error) => {
                isRefreshing = false;
                authService.logout();
                router.navigate(['/login']);
                return throwError(() => error);
            })
        );
    } else {
        return refreshTokenSubject.pipe(
            filter(token => token != null),
            take(1),
            switchMap(token => {
                const newRequest = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`
                    }
                });
                return next(newRequest);
            })
        );
    }
}