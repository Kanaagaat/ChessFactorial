import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs';

const API_BASE = 'http://localhost:8000';

interface TokenResponse {
  access: string;
  refresh: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register(payload: { username: string; email: string; password: string; city?: string }) {
    return this.http.post<TokenResponse>(`${API_BASE}/api/auth/register/`, payload).pipe(
      tap((tokens) => this.setTokens(tokens.access, tokens.refresh))
    );
  }

  login(payload: { username: string; password: string }) {
    return this.http.post<TokenResponse>(`${API_BASE}/api/auth/token/login/`, payload).pipe(
      tap((tokens) => this.setTokens(tokens.access, tokens.refresh))
    );
  }

  refreshToken() {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) return null;
    return this.http
      .post<{ access: string }>(`${API_BASE}/api/auth/token/refresh/`, { refresh })
      .pipe(
        tap((res) => localStorage.setItem('access', res.access)),
        map((res) => res.access)
      );
  }

  me() {
    return this.http.get(`${API_BASE}/api/auth/me/`);
  }

  setTokens(access: string, refresh: string) {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    this.router.navigateByUrl('/auth');
  }

  accessToken() {
    return localStorage.getItem('access');
  }

  isAuthenticated() {
    return Boolean(this.accessToken());
  }
}
