import { Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ApiResponse } from "../../../../Models/ApiResponse";
import { CreateWorkerModel, CreateWorkerResponse } from "../../../../Models/create-worker.model";
import { GeneralResponse } from "../../../../Models/general-response.model";
import { CreateWorkerService } from "../../../Services/create-worker.service";


@Component({
  selector: 'app-create-worker',
  templateUrl: './create-worker.component.html',
  styleUrl: './create-worker.component.scss'
})
export class CreateWorkerComponent {
form!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private workerService: CreateWorkerService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      dailyCapacity: ['', [Validators.required, Validators.min(1)]]
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CreateWorkerModel = this.form.value;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.workerService.createWorker(payload as any).subscribe({
      next: (res: ApiResponse<GeneralResponse<CreateWorkerResponse>>) => {
        this.loading = false;

        if (res.success && res.data.isSuccessful) {
          this.successMessage = `Worker ${res.data.response.fullName} created successfully!`;
          this.form.reset();
        } else {
          this.errorMessage = res.data.errors?.join(', ') || 'Failed to create worker.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Something went wrong. Please try again later.';
      }
    });
  }

  get f() { return this.form.controls; }
}
