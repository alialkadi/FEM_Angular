import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestedService } from '../../../Models/service.Model';
import { ServiceService } from '../../../admin/Services/service-service.service';
import { WishlistService } from '../../Services/wishlist.service';
import { SeoService } from '../../Services/seo.service';

@Component({
  selector: 'app-service-user-form',
  templateUrl: './service-user-form.component.html',
  styleUrl: './service-user-form.component.scss',
})
export class ServiceUserFormComponent implements OnInit {
  requestedServices: RequestedService[] = [];
  submitting = false;
  responseMessage = '';
  responseType: 'success' | 'error' | '' = '';
  showPhoneConfirm = false;
  pendingPayload: any = null;
  @ViewChild('phoneConfirmBox')
  phoneConfirmBox?: ElementRef;
  showSuccessPanel = false;
  submittedEmail = '';
  submittedPhone = '';
  submittedContactMethod = '';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private serviceRequestApi: ServiceService,
    private wishlist: WishlistService,
    private seo: SeoService,
  ) {}
  private scrollToPhoneConfirmBox() {
    setTimeout(() => {
      this.phoneConfirmBox?.nativeElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  }
  userForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    city: ['', Validators.required],

    phoneNumber: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[0-9+\- ]+$/),
        Validators.minLength(7),
      ],
    ],
    address: ['', [Validators.required, Validators.minLength(5)]],
    preferredContactMethod: ['Phone'],
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
    this.seo.update(
      'Submit Service Request | Fenestration Services',
      'Submit your window and door service request.',
      'noindex, nofollow',
    );
  }

  onSubmit(confirmPhoneOverwrite = false) {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.showPhoneConfirm = false;

    const payload = {
      user: this.userForm.value,

      confirmPhoneOverwrite,

      services: this.requestedServices.map((r) => ({
        serviceId: r.service.id,
        baseCost: r.calculation?.baseCost,
        calculatedTotal: r.calculation?.total,
        description: r.service.description,
        inputs: r.answers.map((a) => ({
          inputCode: a.inputCode,
          numericValue: a.numericValue ?? null,
          booleanValue: a.booleanValue,
          textValue: a.textValue,
          selectedValueCode: a.selectedValueCode ?? null,
        })),
        metadata: r.service.metadata ?? [],
      })),

      total: this.requestedServices.reduce(
        (sum, r) => sum + (r.calculation?.total ?? 0),
        0,
      ),

      notes: 'Public user service request submission',
    };

    this.pendingPayload = payload;

    this.serviceRequestApi.submitServiceRequest(payload).subscribe({
      next: (res) => {
        this.submitting = false;

        if (res?.success === false && res?.requiresPhoneConfirmation === true) {
          this.responseType = 'error';
          this.responseMessage =
            res?.message ||
            'This email already exists with another phone number.';

          this.showPhoneConfirm = true;
          this.scrollToPhoneConfirmBox();
          return;
        }

        this.responseType = 'success';
        this.responseMessage = '';

        this.submittedEmail = this.userForm.value.email ?? '';
        this.submittedPhone = this.userForm.value.phoneNumber ?? '';
        this.submittedContactMethod =
          this.userForm.value.preferredContactMethod ?? 'Phone';

        this.showSuccessPanel = true;

        this.requestedServices.forEach((r) => {
          this.wishlist.remove(r.service.id);
        });

        window.history.replaceState({}, document.title);
      },

      error: (err) => {
        console.error('❌ Submission failed:', err);

        this.submitting = false;
        this.responseType = 'error';
        this.responseMessage =
          err?.error?.message ||
          'An error occurred while submitting your request. Please try again.';
      },
    });
  }
  confirmPhoneOverwrite() {
    this.onSubmit(true);
  }
  goToLogin() {
    this.router.navigate(['/FenetrationMaintainence/Home/login']);
  }

  goHome() {
    this.router.navigate(['/FenetrationMaintainence/Home']);
  }
  cancelPhoneOverwrite() {
    this.showPhoneConfirm = false;
    this.responseType = 'error';
    this.responseMessage =
      'Please enter the phone number already connected to this email, or use another email address.';
  }
  cancel() {
    this.router.navigate(['/FenetrationMaintainence/Home/service-review'], {
      state: { requestedServices: this.requestedServices },
    });
  }
  get grandTotal(): number {
    return this.requestedServices.reduce(
      (sum, item) => sum + Number(item.calculation?.total ?? 0),
      0,
    );
  }
}
