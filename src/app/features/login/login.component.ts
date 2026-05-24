import { ToastService } from './../../shared/Services/toast.service';
import { Component } from '@angular/core';
import { AuthService } from '../../core/Auth/auth.service';
import { Router } from '@angular/router';
import { LoginRequest } from './Models/LoginRequest';
import { LoginResponse } from './Models/LoginResponse';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';
  loading: boolean = false;
  showPassword = false;
  constructor(
    private auth: AuthService,
    private router: Router,
    private toastService: ToastService,
  ) {}

  login() {
  this.loading = true;
  this.error = '';

  const request: LoginRequest = {
    email: this.email,
    password: this.password,
  };

  this.auth.login(request).subscribe({
    next: (res) => {
      if (res.data?.isSuccessful && res.data?.token) {
        localStorage.setItem('app_token', res.data.token);

        const userRole = this.auth.getRole();

        if (userRole === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (userRole === 'Worker') {
          this.router.navigate(['/technician/dashboard']);
        } else {
          this.router.navigate(['/user']);
        }
      } else {
        this.error = res.errors?.[0] || 'Login failed';
      }

      this.loading = false;
    },

    error: (err) => {
      this.loading = false;

      const backendError = err?.error;

      if (backendError?.errors) {
        const messages: string[] = [];

        Object.keys(backendError.errors).forEach((field) => {
          messages.push(...backendError.errors[field]);
        });

        this.error = messages.join(' | ');
        return;
      }

      this.error =
        backendError?.message ||
        backendError?.title ||
        'Something went wrong';
    },
  });
}
}
