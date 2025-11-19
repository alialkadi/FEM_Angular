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
  this.loading = true;
  const request: LoginRequest = { email: this.email };

  this.auth.login(request).subscribe({
    next: (res) => {
      console.log(res);

      if (res.data.requiresOtp) {
        // Step 2: Show OTP input
        this.step = 2;
        this.error = '';
      } 
      else if (res.data.token) {
        // Direct login (no OTP required)
        localStorage.setItem('app_token', res.data.token);
        this.router.navigate(['/admin/dashboard']);
      } 
      else {
        this.error = 'Unexpected response';
      }

      this.loading = false;
    },
    error: (err) => {
      this.error = err.error?.errors?.[0] || 'Something went wrong';
      this.loading = false;
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
        const userRole = this.auth.getRole();
        if (userRole === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (userRole === 'user') {
          this.router.navigate(['/user']);
        }
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
