import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastService } from '../../../../../shared/Services/toast.service';
import {
  AdminCustomerDto,
  CreateCustomerDto,
  UpdateCustomerDto,
} from '../../../../Models/AdminCustomerDto.model';
import { AdminCustomerService } from '../../../Services/admin-customer.service';

@Component({
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.scss',
})
export class CustomersListComponent {
  customers: AdminCustomerDto[] = [];
  filteredCustomers: AdminCustomerDto[] = [];

  selectedCustomer: AdminCustomerDto | null = null;

  customerForm!: FormGroup;

  loading = false;
  saving = false;
  searchTerm = '';

  modalMode: 'create' | 'edit' = 'create';
  showFormModal = false;
  showDetailsModal = false;

  constructor(
    private fb: FormBuilder,
    private customerService: AdminCustomerService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCustomers();
  }

  initForm(): void {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(30)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      city: ['', [Validators.required, Validators.maxLength(30)]],
      address: ['', Validators.required],
    });
  }

  loadCustomers(): void {
    this.loading = true;

    this.customerService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.customers = res.data || [];
          this.filteredCustomers = [...this.customers];
        } else {
          this.toast.show(res.message || 'Failed to load customers', 'error');
        }

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.show(
          err?.error?.message || 'Failed to load customers',
          'error',
        );
      },
    });
  }

  applySearch(): void {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredCustomers = [...this.customers];
      return;
    }

    this.filteredCustomers = this.customers.filter((c) =>
      [c.fullName, c.email, c.phoneNumber]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedCustomer = null;

    this.customerForm.reset();
    this.customerForm.get('email')?.enable();
    this.customerForm
      .get('password')
      ?.setValidators([Validators.required, Validators.minLength(6)]);
    this.customerForm.get('password')?.updateValueAndValidity();

    this.showFormModal = true;
  }

  openEditModal(customer: AdminCustomerDto): void {
    this.modalMode = 'edit';
    this.selectedCustomer = customer;
    console.log(customer);
    const names = this.splitFullName(customer.fullName);

    this.customerForm.patchValue({
      firstName: names.firstName,
      lastName: names.lastName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      password: '',
      address: customer.address,
      city: customer.city,
    });

    this.customerForm.get('email')?.disable();
    this.customerForm.get('password')?.clearValidators();
    this.customerForm.get('password')?.updateValueAndValidity();

    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.saving = false;
  }

  submitForm(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    if (this.modalMode === 'create') {
      this.createCustomer();
    } else {
      this.updateCustomer();
    }
  }

  createCustomer(): void {
    const raw = this.customerForm.getRawValue();

    const payload: CreateCustomerDto = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      address: raw.address,
      city: raw.city,
      phoneNumber: raw.phoneNumber,
      password: raw.password,
    };

    this.customerService.create(payload).subscribe({
      next: (res) => {
        this.saving = false;

        if (res.success) {
          this.toast.show(
            res.message || 'Customer created successfully',
            'success',
          );
          this.closeFormModal();
          this.loadCustomers();
        } else {
          this.toast.show(res.message || 'Failed to create customer', 'error');
        }
      },
      error: (err) => {
        this.saving = false;
        this.toast.show(
          err?.error?.message || 'Failed to create customer',
          'error',
        );
      },
    });
  }

  updateCustomer(): void {
    if (!this.selectedCustomer) return;

    const raw = this.customerForm.getRawValue();

    const payload: UpdateCustomerDto = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      city: raw.city,
      address: raw.address,
      phoneNumber: raw.phoneNumber,
    };

    this.customerService.update(this.selectedCustomer.id, payload).subscribe({
      next: (res) => {
        this.saving = false;

        if (res.success) {
          this.toast.show(
            res.message || 'Customer updated successfully',
            'success',
          );
          this.closeFormModal();
          this.loadCustomers();
        } else {
          this.toast.show(res.message || 'Failed to update customer', 'error');
        }
      },
      error: (err) => {
        this.saving = false;
        this.toast.show(
          err?.error?.message || 'Failed to update customer',
          'error',
        );
      },
    });
  }

  openDetails(customer: AdminCustomerDto): void {
    this.selectedCustomer = customer;
    console.log(customer);
    this.showDetailsModal = true;
  }

  closeDetails(): void {
    this.showDetailsModal = false;
    this.selectedCustomer = null;
  }

  getTotalSpent(customer: AdminCustomerDto): number {
    return customer.requests?.reduce((sum, r) => sum + r.totalCost, 0) || 0;
  }

  getRequestCount(customer: AdminCustomerDto): number {
    return customer.requests?.length || 0;
  }

  private splitFullName(fullName: string): {
    firstName: string;
    lastName: string;
  } {
    const parts = (fullName || '').trim().split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
    };
  }
}
