import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-login',
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-100 via-primary-50/30 to-slate-100 dark:from-slate-900 dark:via-primary-950/20 dark:to-slate-900">
      <div class="w-full max-w-md animate-slide-up">
        <div class="rounded-3xl bg-white dark:bg-slate-800/95 shadow-card dark:shadow-none border border-slate-200/80 dark:border-slate-700 overflow-hidden">
          <div class="px-8 pt-10 pb-2">
            <div class="flex justify-center mb-6">
              <div class="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/25">
                <span class="text-2xl font-bold font-display">T</span>
              </div>
            </div>
            <h1 class="text-2xl font-display font-semibold text-center text-slate-800 dark:text-slate-100">Task Manager</h1>
            <p class="text-center text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to manage your tasks</p>
          </div>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-8 pb-8 pt-4 space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                formControlName="email"
                class="focus-ring w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 px-4 py-2.5 placeholder-slate-400 transition shadow-sm"
                placeholder="you&#64;example.com"
              />
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="text-red-500 text-sm mt-1">Valid email required</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                formControlName="password"
                class="focus-ring w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 px-4 py-2.5 placeholder-slate-400 transition shadow-sm"
                placeholder="••••••••"
              />
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="text-red-500 text-sm mt-1">At least 6 characters</p>
              }
            </div>
            @if (error) {
              <div class="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 px-4 py-2.5">
                <p class="text-red-600 dark:text-red-400 text-sm">{{ error }}</p>
              </div>
            }
            <button
              type="submit"
              [disabled]="form.invalid || loading()"
              class="w-full rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/30 transition"
            >
              {{ loading() ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>
        </div>
        <p class="text-center text-slate-500 dark:text-slate-400 text-sm mt-5 px-2">
          Demo: owner&#64;acme.com / password123
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    this.error = '';
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.loading.set(false);
        this.error = err.error?.message || 'Login failed';
      },
      complete: () => this.loading.set(false),
    });
  }
}
