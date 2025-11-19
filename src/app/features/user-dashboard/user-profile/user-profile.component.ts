import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ProfileResponseDto } from '../Models/ProfileResponse.Model';
import { ProfileService } from '../Services/profile.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  loading = true;
  profile!: ProfileResponseDto;
  form!: FormGroup;

  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.profileService.getProfile().subscribe(res => {
      this.profile = res;
      this.form = this.fb.group({
        userName: [res.userName],
        firstName: [res.firstName],
        lastName: [res.lastName],
        phoneNumber: [res.phoneNumber],
        address: [res.address]
      });
      this.loading = false;
    });
  }

  save() {
    if (this.form.invalid) return;

    this.profileService.updateProfile(this.form.value).subscribe(res => {
      alert(res.message);
    });
  }
}
