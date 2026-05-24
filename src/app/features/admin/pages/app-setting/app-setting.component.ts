// src/app/admin/components/app-setting/app-setting.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppSettingResponse } from '../../../Models/app-setting.model';
import { AppSettingService } from '../../Services/app-setting.service';

@Component({
  selector: 'app-app-setting',
  templateUrl: './app-setting.component.html',
  styleUrls: ['./app-setting.component.scss'],
})
export class AppSettingComponent implements OnInit {
  form!: FormGroup;
  consultationForm!: FormGroup;

  loading = false;
  saving = false;
  savingConsultation = false;

  currentSetting: AppSettingResponse | null = null;
  message: string | null = null;
  consultationMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private appSettingService: AppSettingService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      rate: [0, [Validators.required, Validators.min(0)]],
      logistic: [0, [Validators.required, Validators.min(0)]],
    });

    this.consultationForm = this.fb.group({
      consultationPrice: [0, [Validators.required, Validators.min(0)]],
    });

    this.loadSettings();
  }
  private syncSettingsView(data: AppSettingResponse): void {
    this.currentSetting = data;

    this.form.patchValue({
      rate: data.rate,
      logistic: data.logistic,
    });

    this.consultationForm.patchValue({
      consultationPrice: data.consultationPrice ?? 0,
    });
  }
  loadSettings() {
    this.loading = true;
    this.message = null;
    this.consultationMessage = null;

    this.appSettingService.getSettings().subscribe({
      next: (res) => {
        this.loading = false;
        this.message = res.message;

        if (res.success && res.data) {
          this.currentSetting = res.data;
          this.syncSettingsView(res.data);
          console.log(res);
          this.form.patchValue({
            rate: res.data.rate,
            logistic: res.data.logistic,
          });

          this.consultationForm.patchValue({
            consultationPrice: res.data.consultationPrice ?? 0,
          });
        }
      },
      error: () => {
        this.loading = false;
        this.message = 'Failed to load settings.';
      },
    });
  }

  saveSettings() {
    if (this.form.invalid) return;

    this.saving = true;
    this.message = null;

    const payload = this.form.value;

    const request$ = this.currentSetting
      ? this.appSettingService.updateSettings(payload)
      : this.appSettingService.createSettings(payload);

    request$.subscribe({
      next: (res) => {
        this.saving = false;
        this.message = res.message;

        if (res.success && res.data) {
          this.currentSetting = res.data;
          this.syncSettingsView(res.data);
        }
      },
      error: () => {
        this.saving = false;
        this.message = 'Unexpected error occurred.';
      },
    });
  }

  saveConsultationPrice() {
    if (this.consultationForm.invalid) return;

    this.savingConsultation = true;
    this.consultationMessage = null;

    const payload = this.consultationForm.value;

    this.appSettingService.updateConsultationPrice(payload).subscribe({
      next: (res) => {
        this.savingConsultation = false;
        this.consultationMessage = res.message;

        if (res.success && res.data) {
          this.currentSetting = res.data;
          this.syncSettingsView(res.data);
          this.consultationForm.patchValue({
            consultationPrice: res.data.consultationPrice,
          });
        }
      },
      error: () => {
        this.savingConsultation = false;
        this.consultationMessage = 'Failed to update consultation price.';
      },
    });
  }
}
