import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiResponse } from '../../../../Models/ApiResponse';
import {
  CreateWorkerModel,
  CreateWorkerResponse,
} from '../../../../Models/create-worker.model';
import { GeneralResponse } from '../../../../Models/general-response.model';
import { CreateWorkerService } from '../../../Services/create-worker.service';

@Component({
  selector: 'app-create-worker',
  templateUrl: './create-worker.component.html',
  styleUrl: './create-worker.component.scss',
})
export class CreateWorkerComponent {
  form!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private workerService: CreateWorkerService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      province: ['', Validators.required],
      specialty: ['', Validators.required],
      employmentNumber: ['', Validators.required],
      city: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      // dailyCapacity: ['', [Validators.required, Validators.min(1)]],
    });
  }

  submit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    if (this.form.invalid) {
      console.log(this.form);
      this.form.markAllAsTouched();
      this.errorMessage = 'something is bad';
      return;
    }
    console.log('starting creating');
    const payload: CreateWorkerModel = this.form.value;

    this.workerService.createWorker(payload as any).subscribe({
      next: (res) => {
        this.loading = false;
        console.log(res);
        if (res.success && res.data) {
          this.successMessage = `Worker ${res.data.fullName} created successfully!`;
          this.form.reset();
        } else {
          this.errorMessage = res.message ?? 'Failed to create worker.';
        }
      },
      error: (err) => {
        this.loading = false;
        console.log(err);
        this.errorMessage = 'Something went wrong. Please try again later.';
      },
    });
  }

  get f() {
    return this.form.controls;
  }
}
