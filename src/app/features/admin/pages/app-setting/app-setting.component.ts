// src/app/admin/components/app-setting/app-setting.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppSettingResponse } from '../../../Models/app-setting.model';
import { AppSettingService } from '../../Services/app-setting.service';

@Component({
  selector: 'app-app-setting',
  templateUrl: './app-setting.component.html',
  styleUrls: ['./app-setting.component.scss']
})
export class AppSettingComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  saving = false;
  currentSetting: AppSettingResponse | null = null;
  message: string | null = null;

  constructor(private fb: FormBuilder, private appSettingService: AppSettingService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      rate: [0, [Validators.required, Validators.min(0)]],
      logistic: [0, [Validators.required, Validators.min(0)]]
    });

    this.loadSettings();
  }

  loadSettings() {
    this.loading = true;
    this.appSettingService.getSettings().subscribe({
      next: res => {
        this.loading = false;
        if (res.success && res.data) {
          this.currentSetting = res.data;
          this.form.patchValue({
            rate: res.data.rate,
            logistic: res.data.logistic
          });
        } else {
          this.message = res.message ?? 'No settings found.';
        }
      },
      error: () => {
        this.loading = false;
        this.message = 'Failed to load settings.';
      }
    });
  }

  saveSettings() {
    if (this.form.invalid) return;

    this.saving = true;
    const payload = this.form.value;

    const request$ = this.currentSetting
      ? this.appSettingService.updateSettings(payload)
      : this.appSettingService.createSettings(payload);

    request$.subscribe({
      next: res => {
        this.saving = false;
        if (res.success && res.data) {
          this.currentSetting = res.data;
          this.message = 'Settings saved successfully!';
        } else {
          this.message = res.message ?? 'Failed to save settings.';
        }
      },
      error: () => {
        this.saving = false;
        this.message = 'Unexpected error occurred.';
      }
    });
  }
}
