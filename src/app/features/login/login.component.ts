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
  step = 1;
  email = '';
  otp = '';
  error = '';
  constructor(private auth: AuthService, private router: Router) {}
  loading: boolean = false;

requestOtp() {
  this.loading = true;   // ✅ start loading
  const request: LoginRequest = { email: this.email };

  this.auth.login(request).subscribe({
    next: (res) => {
      // if (res.data.requiresOtp) {
      //   this.step = 2;
      // } else {
      //   this.error = 'Unexpected response';
      // }
       localStorage.setItem('app_token', res.data.token);
        this.router.navigate(['/admin/dashboard']);
      this.loading = false; // ✅ stop loading
    },
    error: (err) => {
      this.error = err.error?.errors?.[0] || 'Something went wrong';
      this.loading = false; // ✅ stop loading even on error
    }
  });
}

verifyOtp() {
  this.loading = true;   // ✅ start loading
  const request: LoginRequest = { email: this.email, otp: this.otp };

  this.auth.login(request).subscribe({
    next: (res) => {
      if (res.data.isSuccessful && res.data.token) {
        localStorage.setItem('app_token', res.data.token);
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.error = res.Errors?.[0] || 'Login failed';
      }
      this.loading = false; // ✅ stop loading
    },
    error: (err) => {
      this.error = err.error?.errors?.[0] || 'Something went wrong';
      this.loading = false; // ✅ stop loading even on error
    }
  });
}

}
