import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestedService } from '../../../Models/service.Model';
import { ServiceService } from '../../../admin/Services/service-service.service';
import { WishlistService } from '../../Services/wishlist.service';

@Component({
  selector: 'app-service-user-form',
  templateUrl: './service-user-form.component.html',
  styleUrl: './service-user-form.component.scss',
})
export class ServiceUserFormComponent implements OnInit {
  requestedServices: RequestedService[] = [];
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private serviceRequestApi: ServiceService,
    private wishlist: WishlistService,
  ) {}

  userForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [
      '',
      [Validators.required, Validators.pattern(/^[0-9+\- ]+$/)],
    ],
    address: ['', [Validators.required, Validators.minLength(5)]],
    preferredContactMethod: ['Email'],
  });

  // ✅ REQUIRED FOR TEMPLATE ACCESS
  get f() {
    return this.userForm.controls;
  }

  ngOnInit(): void {
    const state = history.state;

    this.requestedServices = state.requestedServices || [];

    if (!this.requestedServices.length) {
      this.router.navigate(['/FenetrationMaintainence/Home/service-explorer']);
    }
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const payload = {
      user: this.userForm.value,

      services: this.requestedServices.map((r) => ({
        serviceId: r.service.id,
        baseCost: r.calculation?.baseCost,
        calculatedTotal: r.calculation?.total,
        description: r.service.description,

        // ✅ FIXED
        metadata: r.service.metadata ?? [],
      })),

      total: this.requestedServices.reduce(
        (sum, r) => sum + (r.calculation?.total ?? 0),
        0,
      ),

      notes: 'Public user service request submission',
    };

    console.log('🚀 FINAL REQUEST PAYLOAD', payload);

    this.serviceRequestApi.submitServiceRequest(payload).subscribe({
      next: (_) => {
        this.submitting = false;
        this.wishlist.clear();
        alert('✅ Request submitted successfully!');
        this.router.navigate(['/FenetrationMaintainence/Home/success']);
      },
      error: (err) => {
        console.error('❌ Submission failed:', err);
        this.submitting = false;
        alert('An error occurred while submitting your request.');
      },
    });
  }

  cancel() {
    this.router.navigate(['/FenetrationMaintainence/Home/service-review'], {
      state: { requestedServices: this.requestedServices },
    });
  }
}
