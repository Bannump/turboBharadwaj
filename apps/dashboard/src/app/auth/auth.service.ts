import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

const API = '/api';
const TOKEN_KEY = 'task_mgmt_token';
const USER_KEY = 'task_mgmt_user';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  organizationId: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private token = signal<string | null>(this.getStoredToken());
  private user = signal<AuthUser | null>(this.getStoredUser());

  currentUser = computed(() => this.user());
  isLoggedIn = computed(() => !!this.token());

  private getStoredToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  }

  private getStoredUser(): AuthUser | null {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return this.token();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API}/auth/login`, { email, password }).pipe(
      tap((res) => {
        this.token.set(res.access_token);
        this.user.set(res.user);
        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      })
    );
  }

  logout(): void {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/login']);
  }
}

