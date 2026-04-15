import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

export interface User {
    id: string;
    name: string;
    last_name?: string;
    email: string;
    phone?: string;
    position?: string;
    role: 'user' | 'admin';
    is_active: boolean;
    created_at: string;
    last_login?: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    last_name?: string;
    email: string;
    phone?: string;
    position?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

    currentUser$ = this.currentUserSubject.asObservable();
    isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage() {
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('currentUser');

        if (token && this.isTokenValid(token) && user) {
            try {
                this.currentUserSubject.next(JSON.parse(user));
                this.isAuthenticatedSubject.next(true);
            } catch (e) {
                this.clearAuthData();
            }
        } else {
            this.clearAuthData();
        }
    }

    register(userData: RegisterData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData);
    }

    login(credentials: LoginCredentials): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
            .pipe(
                tap(response => {
                    this.setAuthData(response);
                })
            );
    }

  logout() {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers }).pipe(
      tap(() => {
        this.clearAuthData();
      })
    );
  }    refreshToken(): Observable<{ tokens: { accessToken: string; refreshToken: string } }> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            return throwError(() => new Error('No refresh token available'));
        }

        return this.http.post<{ tokens: { accessToken: string; refreshToken: string } }>(
            `${this.apiUrl}/auth/refresh-token`,
            { refreshToken }
        ).pipe(
            tap(response => {
                this.setTokens(response.tokens);
            })
        );
    }

    getProfile(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/auth/profile`);
    }

    updateProfile(userData: Partial<User>): Observable<{ message: string; user: User }> {
        return this.http.put<{ message: string; user: User }>(
            `${this.apiUrl}/auth/profile`,
            userData
        ).pipe(
            tap(response => {
                this.currentUserSubject.next(response.user);
                localStorage.setItem('currentUser', JSON.stringify(response.user));
            })
        );
    }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/auth/change-password`,
      { currentPassword, newPassword }
    );
  }

  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/auth/request-password-reset`,
      { email }
    );
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/auth/reset-password`,
      { token, newPassword }
    );
  }    isTokenValid(token: string): boolean {
        try {
            const decoded: any = jwtDecode(token);
            return decoded.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    isLoggedIn(): boolean {
        const token = this.getAccessToken();
        return !!token && this.isTokenValid(token);
    }

    getAuthHeaders() {
        const token = this.getAccessToken();
        return {
            'Authorization': `Bearer ${token}`
        };
    }

    isAdmin(): boolean {
        const user = this.currentUserSubject.value;
        return user?.role === 'admin';
    }

    private setAuthData(response: AuthResponse) {
        this.setTokens(response.tokens);
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
    }

    private setTokens(tokens: { accessToken: string; refreshToken: string }) {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
    }

    private getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    private getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    private clearAuthData() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
    }
}