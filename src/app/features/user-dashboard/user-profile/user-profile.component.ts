import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileResponseDto } from '../Models/ProfileResponse.Model';
import { ProfileService } from '../Services/profile.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  loading = true;
  saving = false;

  profile!: ProfileResponseDto;
  form!: FormGroup;

  successMessage = '';
  errorMessage = '';

  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.profile = res;

        this.form = this.fb.group({
          firstName: [res.firstName, Validators.required],
          lastName: [res.lastName, Validators.required],
          phoneNumber: [res.phoneNumber, Validators.required],
          address: [res.address]
        });

        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load profile information.';
        this.loading = false;
      }
    });
  }

  save(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    this.profileService.updateProfile(this.form.value).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Profile updated successfully.';
        this.saving = false;
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message ||
          err?.error?.errors?.[0] ||
          'Failed to update profile.';
        this.saving = false;
      }
    });
  }
}