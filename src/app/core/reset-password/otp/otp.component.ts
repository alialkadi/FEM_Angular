import { Component } from '@angular/core';
import { AuthService } from '../../Auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.scss',
})
export class OtpComponent {
  otp = '';
  loading = false;
  error = '';
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  submit() {
    if (!this.otp) {
      this.error = 'OTP is required';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.verifyOtp({ otp: this.otp }).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.success) {
          sessionStorage.setItem('resetOtp', this.otp);
          this.router.navigate([
            '/FenetrationMaintainence/Home/reset-password',
          ]);
        } else {
          this.error = res.message;
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Invalid or expired OTP.';
      },
    });
  }
}
