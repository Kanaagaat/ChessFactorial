import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="auth panel">
      <h1>{{ isLogin ? 'Welcome back' : 'Create account' }}</h1>
      <form (ngSubmit)="submit()" #form="ngForm">
        <input *ngIf="!isLogin" [(ngModel)]="username" name="username" placeholder="Username" required />
        <input *ngIf="!isLogin" [(ngModel)]="city" name="city" placeholder="City (optional)" />
        <input [(ngModel)]="emailOrUsername" name="emailOrUsername" [placeholder]="isLogin ? 'Username' : 'Email'" required />
        <input [(ngModel)]="password" name="password" type="password" placeholder="Password" required />
        <button [disabled]="loading">{{ loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register') }}</button>
      </form>
      <p class="error" *ngIf="error">{{ error }}</p>
      <a (click)="isLogin = !isLogin">{{ isLogin ? 'Need an account?' : 'Already have one?' }}</a>
    </section>
  `,
  styles: [`
    .auth{ max-width:420px; margin:40px auto; padding:20px; }
    form{ display:grid; gap:12px; margin-top:12px; }
    input,button{ border-radius:10px; border:1px solid var(--border); background:transparent; color:var(--text-primary); padding:10px; }
    button{ background:var(--primary); color:#052e24; border:none; font-weight:700; cursor:pointer; }
    .error{ color:#fb923c; }
    a{ color:var(--text-secondary); cursor:pointer; margin-top:10px; display:inline-block; }
  `]
})
export class AuthPageComponent {
  isLogin = true;
  username = '';
  city = '';
  emailOrUsername = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  submit() {
    this.loading = true;
    this.error = '';
    const req$ = this.isLogin
      ? this.auth.login({ username: this.emailOrUsername, password: this.password })
      : this.auth.register({
          username: this.username,
          email: this.emailOrUsername,
          password: this.password,
          city: this.city
        });
    req$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/play');
      },
      error: () => {
        this.loading = false;
        this.error = 'Authentication failed.';
      }
    });
  }
}
