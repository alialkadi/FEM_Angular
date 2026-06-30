import { Router } from '@angular/router';
import { AuthService } from './../../Auth/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-forgetr-password',
  templateUrl: './forgetr-password.component.html',
  styleUrl: './forgetr-password.component.scss',
})
export class ForgetrPasswordComponent {
  email = '';
  loading = false;
  error = '';
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}
  submit() {
    if (!this.email) {
      this.error = 'Email is required';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: (res) => {
        this.loading = false;
        console.log(res);
        if (res.success) {
          sessionStorage.setItem('resetEmail', this.email);
          this.router.navigate(['/FenetrationMaintainence/Home/verify-otp']);
        } else {
          this.error = res.message;
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Something went wrong. Please try again.';
      },
    });
  }
}
