import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { FeeService } from '../../../features/admin/Services/fee.service';
import { ServiceService } from '../../../features/admin/Services/service-service.service';
import { FeeResponse } from '../../../features/Models/FeeResponse.Model';

interface FeeServiceNode {
  id: number;
  name: string;
  baseCost?: number;

  categoryId?: number;
  categoryName?: string;

  categoryTypeId?: number;
  categoryTypeName?: string;

  structureId?: number;
  structureName?: string;

  partId?: number;
  partName?: string;

  partOptionId?: number;
  partOptionName?: string;
}

interface HierarchyOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-edit-fee-dialog',
  templateUrl: './edit-fee-dialog.component.html',
  styleUrl: './edit-fee-dialog.component.scss',
})
export class EditFeeDialogComponent implements OnInit {
  editForm!: FormGroup;

  loading = false;
  loadingServices = false;

  mode: 'name' | 'services' | 'full' = 'full';
  title = 'Edit Fee';

  services: FeeServiceNode[] = [];
  visibleServices: FeeServiceNode[] = [];

  categories: HierarchyOption[] = [];
  categoryTypes: HierarchyOption[] = [];
  structures: HierarchyOption[] = [];
  parts: HierarchyOption[] = [];
  partOptions: HierarchyOption[] = [];

  selectedCategoryId: number | null = null;
  selectedTypeId: number | null = null;
  selectedStructureId: number | null = null;
  selectedPartId: number | null = null;
  selectedPartOptionId: number | null = null;

  serviceSearch = '';

  constructor(
    private fb: FormBuilder,
    private feeService: FeeService,
    private serviceService: ServiceService,
    private dialogRef: MatDialogRef<EditFeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fee: FeeResponse;
      mode: 'name' | 'services' | 'full';
    },
  ) {}

  ngOnInit(): void {
    this.mode = this.data.mode;
    this.title = this.getTitleByMode(this.mode);

    this.initializeForm();
    this.configureMode();

    if (this.mode !== 'name') {
      this.loadServices();
    }

    this.editForm
      .get('isGlobal')
      ?.valueChanges.subscribe((isGlobal: boolean) => {
        if (isGlobal) {
          this.editForm.get('serviceIds')?.setValue([]);
          this.resetServiceFilters();
        }
      });
  }

  private initializeForm(): void {
    const assignedServiceIds =
      this.data.fee.services?.map((service) => service.id) ?? [];

    this.editForm = this.fb.group({
      name: [
        this.data.fee.name,
        [Validators.required, Validators.minLength(2)],
      ],
      amount: [this.data.fee.amount, [Validators.required, Validators.min(0)]],
      description: [this.data.fee.description ?? ''],
      isGlobal: [this.data.fee.isGlobal],
      isVisible: [this.data.fee.isVisible === true],
      serviceIds: [assignedServiceIds],
    });
  }

  private configureMode(): void {
    if (this.mode === 'name') {
      this.disableFields([
        'amount',
        'description',
        'isGlobal',
        'isVisible',
        'serviceIds',
      ]);

      return;
    }

    if (this.mode === 'services') {
      /*
       * Keep isGlobal enabled so a global fee can be changed
       * into a service-specific fee and vice versa.
       */
      this.disableFields(['name', 'amount', 'description', 'isVisible']);
    }
  }

  loadServices(): void {
    this.loadingServices = true;

    // Uses the same service request as CreateFeeComponent.
    this.serviceService.getAllServices(true).subscribe({
      next: (res) => {
        this.services = (res.data?.services ?? []) as FeeServiceNode[];

        this.categories = this.getUnique(
          this.services,
          'categoryId',
          'categoryName',
        );

        /*
         * Existing assignments remain in editForm.serviceIds.
         * Loading and filtering services does not overwrite them.
         */
        this.loadingServices = false;
      },
      error: () => {
        this.services = [];
        this.visibleServices = [];
        this.loadingServices = false;
      },
    });
  }

  getUnique(
    items: FeeServiceNode[],
    idKey: keyof FeeServiceNode,
    nameKey: keyof FeeServiceNode,
  ): HierarchyOption[] {
    const options = new Map<number, HierarchyOption>();

    items.forEach((item) => {
      const rawId = item[idKey];
      const rawName = item[nameKey];

      if (
        rawId === null ||
        rawId === undefined ||
        rawName === null ||
        rawName === undefined
      ) {
        return;
      }

      const id = Number(rawId);
      const name = String(rawName).trim();

      if (!Number.isNaN(id) && name && !options.has(id)) {
        options.set(id, { id, name });
      }
    });

    return Array.from(options.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  onCategoryChange(): void {
    this.selectedTypeId = null;
    this.selectedStructureId = null;
    this.selectedPartId = null;
    this.selectedPartOptionId = null;

    const matchingServices = this.services.filter(
      (service) => service.categoryId == this.selectedCategoryId,
    );

    this.categoryTypes = this.getUnique(
      matchingServices,
      'categoryTypeId',
      'categoryTypeName',
    );

    this.structures = [];
    this.parts = [];
    this.partOptions = [];

    this.updateVisibleServices();
  }

  onTypeChange(): void {
    this.selectedStructureId = null;
    this.selectedPartId = null;
    this.selectedPartOptionId = null;

    const matchingServices = this.services.filter(
      (service) =>
        service.categoryId == this.selectedCategoryId &&
        service.categoryTypeId == this.selectedTypeId,
    );

    this.structures = this.getUnique(
      matchingServices,
      'structureId',
      'structureName',
    );

    this.parts = [];
    this.partOptions = [];

    this.updateVisibleServices();
  }

  onStructureChange(): void {
    this.selectedPartId = null;
    this.selectedPartOptionId = null;

    const matchingServices = this.services.filter(
      (service) =>
        service.categoryId == this.selectedCategoryId &&
        service.categoryTypeId == this.selectedTypeId &&
        service.structureId == this.selectedStructureId,
    );

    this.parts = this.getUnique(matchingServices, 'partId', 'partName');

    this.partOptions = [];

    this.updateVisibleServices();
  }

  onPartChange(): void {
    this.selectedPartOptionId = null;

    const matchingServices = this.services.filter(
      (service) =>
        service.categoryId == this.selectedCategoryId &&
        service.categoryTypeId == this.selectedTypeId &&
        service.structureId == this.selectedStructureId &&
        service.partId == this.selectedPartId,
    );

    this.partOptions = this.getUnique(
      matchingServices,
      'partOptionId',
      'partOptionName',
    );

    this.updateVisibleServices();
  }

  onPartOptionChange(): void {
    this.updateVisibleServices();
  }

  updateVisibleServices(): void {
    const searchTerm = this.serviceSearch.trim().toLowerCase();

    this.visibleServices = this.services.filter((service) => {
      if (
        this.selectedCategoryId !== null &&
        service.categoryId != this.selectedCategoryId
      ) {
        return false;
      }

      if (
        this.selectedTypeId !== null &&
        service.categoryTypeId != this.selectedTypeId
      ) {
        return false;
      }

      if (
        this.selectedStructureId !== null &&
        service.structureId != this.selectedStructureId
      ) {
        return false;
      }

      if (
        this.selectedPartId !== null &&
        service.partId != this.selectedPartId
      ) {
        return false;
      }

      if (
        this.selectedPartOptionId !== null &&
        service.partOptionId != this.selectedPartOptionId
      ) {
        return false;
      }

      if (searchTerm) {
        const searchableText = [
          service.name,
          service.categoryName,
          service.categoryTypeName,
          service.structureName,
          service.partName,
          service.partOptionName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }

  onServiceToggle(serviceId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentIds = [
      ...(this.editForm.get('serviceIds')?.value ?? []),
    ] as number[];

    if (checkbox.checked) {
      if (!currentIds.includes(serviceId)) {
        currentIds.push(serviceId);
      }
    } else {
      const index = currentIds.indexOf(serviceId);

      if (index !== -1) {
        currentIds.splice(index, 1);
      }
    }

    this.editForm.get('serviceIds')?.setValue(currentIds);
    this.editForm.get('serviceIds')?.markAsDirty();
  }

  isServiceSelected(serviceId: number): boolean {
    const selectedIds =
      (this.editForm.get('serviceIds')?.value as number[]) ?? [];

    return selectedIds.includes(serviceId);
  }

  get selectedServiceCount(): number {
    return (this.editForm.get('serviceIds')?.value as number[])?.length ?? 0;
  }

  get selectedServices(): FeeServiceNode[] {
    const selectedIds =
      (this.editForm.get('serviceIds')?.value as number[]) ?? [];

    return this.services.filter((service) => selectedIds.includes(service.id));
  }

  removeSelectedService(serviceId: number): void {
    const selectedIds = [
      ...((this.editForm.get('serviceIds')?.value as number[]) ?? []),
    ];

    this.editForm
      .get('serviceIds')
      ?.setValue(selectedIds.filter((id) => id !== serviceId));

    this.editForm.get('serviceIds')?.markAsDirty();
  }

  clearSelectedServices(): void {
    this.editForm.get('serviceIds')?.setValue([]);
    this.editForm.get('serviceIds')?.markAsDirty();
  }

  resetServiceFilters(): void {
    this.selectedCategoryId = null;
    this.selectedTypeId = null;
    this.selectedStructureId = null;
    this.selectedPartId = null;
    this.selectedPartOptionId = null;

    this.serviceSearch = '';

    this.categoryTypes = [];
    this.structures = [];
    this.parts = [];
    this.partOptions = [];
    this.visibleServices = [];
  }

  getServicePath(service: FeeServiceNode): string {
    return [
      service.categoryName,
      service.categoryTypeName,
      service.structureName,
      service.partName,
      service.partOptionName,
    ]
      .filter(Boolean)
      .join(' > ');
  }

  trackByServiceId(index: number, service: FeeServiceNode): number {
    return service.id;
  }

  getTitleByMode(mode: 'name' | 'services' | 'full'): string {
    switch (mode) {
      case 'name':
        return 'Rename Fee';

      case 'services':
        return 'Reassign Services';

      default:
        return 'Edit Fee Details';
    }
  }

  disableFields(fields: string[]): void {
    fields.forEach((field) => {
      this.editForm.get(field)?.disable();
    });
  }

  submit(): void {
    if (this.editForm.invalid || this.loading) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const form = this.editForm.getRawValue();

    const selectedServiceIds = [...new Set<number>(form.serviceIds ?? [])];

    const dto = {
      name: form.name,
      amount: form.amount,
      description: form.description,
      isGlobal: form.isGlobal === true,
      isVisible: form.isVisible === true,
      serviceIds: form.isGlobal === true ? [] : selectedServiceIds,
    };

    this.feeService.updateFee(this.data.fee.id, dto).subscribe({
      next: (res) => {
        this.loading = false;
        this.dialogRef.close(res.data);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
