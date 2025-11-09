import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RequestedService } from '../../../Models/service.Model';
import { ServiceService } from '../../../admin/Services/service-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-service-user-form',
  templateUrl: './service-user-form.component.html',
  styleUrl: './service-user-form.component.scss'
})
export class ServiceUserFormComponent {
requestedServices: RequestedService[] = [];
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private serviceRequestApi: ServiceService
  ) {}

  userForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\- ]+$/)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    preferredContactMethod: ['Email']
  });

  ngOnInit(): void {
    const state = history.state;
    this.requestedServices = state.requestedServices || [];
    if (!this.requestedServices.length) {
      this.router.navigate(['/FenetrationMaintainence/Home/service-explorer']);
    }
  }

  get f() {
    return this.userForm.controls;
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const formData = this.userForm.value;
    const payload = {
      user: formData,
      services: this.requestedServices.map(r => ({
        serviceId: r.service.id,
        baseCost: r.calculation.baseCost,
        calculatedTotal: r.calculation.total,
        description: r.service.description
      })),
      total: this.requestedServices.reduce(
        (sum, s) => sum + (s.calculation.total ?? 0),
        0
      ),
      notes: 'Public user service request submission'
    };

    this.serviceRequestApi.submitServiceRequest(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        alert('✅ Request submitted successfully!');
        this.router.navigate(['/FenetrationMaintainence/Home/success']);
      },
      error: (err) => {
        console.error('❌ Submission failed:', err);
        this.submitting = false;
        alert('An error occurred while submitting your request. Please try again later.');
      }
    });
  }

  cancel() {
    this.router.navigate(['/FenetrationMaintainence/Home/service-review'], {
      state: { requestedServices: this.requestedServices }
    });
  }
}
