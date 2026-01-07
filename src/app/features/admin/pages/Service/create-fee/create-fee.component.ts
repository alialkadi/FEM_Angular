import { Component } from '@angular/core';
import { ApiResponse } from '../../../../Models/ApiResponse';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ServiceMiniResponse } from '../../../../Models/FeeResponse.Model';
import { FeeService } from '../../../Services/fee.service';
import { ServiceService } from '../../../Services/service-service.service';
import { ToastService } from '../../../../../shared/Services/toast.service';

@Component({
  selector: 'app-create-fee',
  templateUrl: './create-fee.component.html',
  styleUrl: './create-fee.component.scss'
})
export class CreateFeeComponent {

  feeForm!: FormGroup;
  isSubmitting = false;
  isGlobal = true;

  services: ServiceMiniResponse[] = [];
  filteredServices: ServiceMiniResponse[] = [];
  serviceSearch = '';

  constructor(
    private fb: FormBuilder,
    private feeService: FeeService,
    private serviceService: ServiceService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadServices();
  }

  get selectedServiceNames(): string[] {
    const ids = this.feeForm.value.serviceIds || [];
    return this.services
      .filter(s => ids.includes(s.id))
      .map(s => s.name);
  }

  initializeForm(): void {
    this.feeForm = this.fb.group({
      name: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      isGlobal: [true],
      description: [''],
      serviceIds: [[]],
    });
  }

  loadServices(): void {
    this.serviceService.getAllServices(true).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.success) {
          this.services = res.data.services ?? [];
          this.filteredServices = [...this.services];
          // this.toast.show(res.message, 'success');
        } else {
          this.toast.show(res.message, 'error');
        }
      },
      error: () => {
        this.toast.show('Failed to load services.', 'error');
      }
    });
  }

  toggleGlobal(): void {
    this.isGlobal = this.feeForm.value.isGlobal;
    if (this.isGlobal) {
      this.feeForm.patchValue({ serviceIds: [] });
    }
  }

  filterServices(): void {
    const term = this.serviceSearch.toLowerCase().trim();
    this.filteredServices = this.services.filter(s =>
      s.name.toLowerCase().includes(term)
    );
  }

  toggleServiceSelection(serviceId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentIds = [...this.feeForm.value.serviceIds];

    if (checkbox.checked) {
      if (!currentIds.includes(serviceId)) {
        currentIds.push(serviceId);
      }
    } else {
      const index = currentIds.indexOf(serviceId);
      if (index > -1) {
        currentIds.splice(index, 1);
      }
    }

    this.feeForm.patchValue({ serviceIds: currentIds });
  }

  onSubmit(): void {
    if (this.feeForm.invalid) return;

    this.isSubmitting = true;

    this.feeService.createFee(this.feeForm.value).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.show(res.message, 'success');
          this.feeForm.reset({ isGlobal: true });
        } else {
          this.toast.show(res.message, 'error');
        }
        this.isSubmitting = false;
      },
      error: () => {
        this.toast.show('Failed to create fee.', 'error');
        this.isSubmitting = false;
      }
    });
  }
}
