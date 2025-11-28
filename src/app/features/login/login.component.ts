import { Component } from '@angular/core';
import { AuthService } from '../../core/Auth/auth.service';
import { Router } from '@angular/router';
import { LoginRequest } from './Models/LoginRequest';
import { LoginResponse } from './Models/LoginResponse';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  email: string = '';
  phoneNumber: string = '';
  error: string = '';
  loading: boolean = false;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.loading = true;

    const request: LoginRequest = {
      email: this.email,
      phoneNumber: this.phoneNumber
    };

    this.auth.login(request).subscribe({
      next: (res) => {
        console.log(res);

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
        this.error = err.error?.errors?.[0] || 'Something went wrong';
        this.loading = false;
      }
    });
  }
}
