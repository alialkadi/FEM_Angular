import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FeeService } from '../../../features/admin/Services/fee.service';
import { ServiceService } from '../../../features/admin/Services/service-service.service';
import { FeeResponse } from '../../../features/Models/FeeResponse.Model';

@Component({
  selector: 'app-edit-fee-dialog',
  templateUrl: './edit-fee-dialog.component.html',
  styleUrl: './edit-fee-dialog.component.scss'
})
export class EditFeeDialogComponent {
  editForm!: FormGroup;
  availableServices: any[] = [];
  loading = false;
  mode: 'name' | 'services' | 'full' = 'full';
  title = 'Edit Fee';

  constructor(
    private fb: FormBuilder,
    private feeService: FeeService,
    private serviceService: ServiceService,
    private dialogRef: MatDialogRef<EditFeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { fee: FeeResponse; mode: 'name' | 'services' | 'full' }
  ) {}

  ngOnInit(): void {
    this.mode = this.data.mode;
    this.title = this.getTitleByMode(this.mode);

    this.editForm = this.fb.group({
      name: [this.data.fee.name, [Validators.required, Validators.minLength(2)]],
      amount: [this.data.fee.amount, [Validators.required, Validators.min(0)]],
      description: [this.data.fee.description],
      isGlobal: [this.data.fee.isGlobal],
      serviceIds: [this.data.fee.services.map(s => s.id)]
    });

    if (this.mode === 'name') {
      this.disableFields(['amount', 'description', 'isGlobal', 'serviceIds']);
    } else if (this.mode === 'services') {
      this.disableFields(['name', 'amount', 'description', 'isGlobal']);
    }

    if (this.mode !== 'name') {
      this.loadServices();
    }

    // handle global toggle changes
    this.editForm.get('isGlobal')?.valueChanges.subscribe(isGlobal => {
      const serviceIdsControl = this.editForm.get('serviceIds');
      if (isGlobal) {
        serviceIdsControl?.disable();
        serviceIdsControl?.setValue([]);
      } else {
        serviceIdsControl?.enable();
      }
    });
  }
onServiceToggle(serviceId: number, event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;
  const serviceIds = this.editForm.get('serviceIds')?.value || [];

  if (checked && !serviceIds.includes(serviceId)) {
    serviceIds.push(serviceId);
  } else if (!checked) {
    const index = serviceIds.indexOf(serviceId);
    if (index > -1) serviceIds.splice(index, 1);
  }

  this.editForm.get('serviceIds')?.setValue(serviceIds);
}


  getTitleByMode(mode: string): string {
    return mode === 'name'
      ? 'Rename Fee'
      : mode === 'services'
      ? 'Reassign Services'
      : 'Edit Fee Details';
  }

  disableFields(fields: string[]): void {
    fields.forEach(f => this.editForm.get(f)?.disable());
  }

  loadServices(): void {
    this.serviceService.getAllServices().subscribe({
      next: res => {
        this.availableServices = res.data.services || [];
        const selectedIds = this.data.fee.services.map(s => s.id);
        this.editForm.get('serviceIds')?.setValue(selectedIds);
      },
      error: () => (this.availableServices = [])
    });
  }

  submit(): void {
    if (this.editForm.invalid) return;
    this.loading = true;
    const dto = this.editForm.getRawValue();

    this.feeService.updateFee(this.data.fee.id, dto).subscribe({
      next: res => {
        this.loading = false;
        this.dialogRef.close(res);
      },
      error: () => (this.loading = false)
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
