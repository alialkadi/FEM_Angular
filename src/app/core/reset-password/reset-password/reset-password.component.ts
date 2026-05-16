import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Auth/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  newPassword = '';
  confirmPassword = '';
  loading = false;
  error = '';
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  submit() {
    const otp = sessionStorage.getItem('resetOtp');

    if (!otp) {
      this.router.navigate(['/forgot-password']);
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService
      .changeForgottenPassword({
        otp,
        newPassword: this.newPassword,
        confirmPassword: this.confirmPassword,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;

          if (res.success) {
            sessionStorage.removeItem('resetOtp');
            sessionStorage.removeItem('resetEmail');
            this.router.navigate(['/login']);
          } else {
            this.error = res.message;
          }
        },
        error: () => {
          this.loading = false;
          this.error = 'Password reset failed.';
        },
      });
  }
}
