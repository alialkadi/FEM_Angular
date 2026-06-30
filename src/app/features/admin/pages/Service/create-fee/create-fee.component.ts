import { Component } from '@angular/core';
import { ApiResponse } from '../../../../Models/ApiResponse';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ServiceMiniResponse } from '../../../../Models/FeeResponse.Model';
import { FeeService } from '../../../Services/fee.service';
import { ServiceService } from '../../../Services/service-service.service';
import { ToastService } from '../../../../../shared/Services/toast.service';
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

interface FeeHierarchyGroup {
  categoryId: number;
  categoryName: string;
  types: {
    categoryTypeId: number;
    categoryTypeName: string;
    structures: {
      structureId: number;
      structureName: string;
      parts: {
        partId: number;
        partName: string;
        options: {
          partOptionId: number;
          partOptionName: string;
          services: FeeServiceNode[];
        }[];
        services: FeeServiceNode[];
      }[];
      services: FeeServiceNode[];
    }[];
  }[];
}
@Component({
  selector: 'app-create-fee',
  templateUrl: './create-fee.component.html',
  styleUrl: './create-fee.component.scss',
})
export class CreateFeeComponent {
  feeForm!: FormGroup;
  isSubmitting = false;
  isGlobal = true;
  isVisible = true;
  serviceSearch = '';
  services: FeeServiceNode[] = [];
  filteredServices: FeeServiceNode[] = [];
  serviceHierarchy: FeeHierarchyGroup[] = [];
  selectedCategoryId: number | null = null;
  selectedTypeId: number | null = null;
  selectedStructureId: number | null = null;
  selectedPartId: number | null = null;
  selectedPartOptionId: number | null = null;

  categories: any[] = [];
  categoryTypes: any[] = [];
  structures: any[] = [];
  parts: any[] = [];
  partOptions: any[] = [];

  visibleServices: ServiceMiniResponse[] = [];
  constructor(
    private fb: FormBuilder,
    private feeService: FeeService,
    private serviceService: ServiceService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadServices();
  }

  get selectedServiceNames(): string[] {
    const ids = this.feeForm.value.serviceIds || [];
    return this.services.filter((s) => ids.includes(s.id)).map((s) => s.name);
  }

  initializeForm(): void {
    this.feeForm = this.fb.group({
      name: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      isGlobal: [true],
      isVisible: [false],
      description: [''],
      serviceIds: [[]],
    });
  }

  loadServices(): void {
    this.serviceService.getAllServices(true).subscribe({
      next: (res: ApiResponse<any>) => {
        console.log(res);
        if (res.success) {
          this.services = res.data.services ?? [];

          this.categories = this.getUnique(
            this.services,
            'categoryId',
            'categoryName',
          );
        } else {
          this.toast.show(res.message, 'error');
        }
      },
      error: (err) => {
        this.toast.show(
          err.error?.message ?? 'Failed to load services.',
          'error',
        );
      },
    });
  }
  getUnique(items: any[], idKey: string, nameKey: string): any[] {
    const map = new Map<number, any>();

    items.forEach((item) => {
      const id = item[idKey];
      const name = item[nameKey];

      if (id && !map.has(id)) {
        map.set(id, { id, name });
      }
    });

    return Array.from(map.values());
  }
  buildServiceHierarchy(services: FeeServiceNode[]): void {
    const categoriesMap = new Map<number, FeeHierarchyGroup>();

    services.forEach((service) => {
      const categoryId = service.categoryId ?? 0;
      const categoryName = service.categoryName || 'Uncategorized';

      const typeId = service.categoryTypeId ?? 0;
      const typeName = service.categoryTypeName || 'No Type';

      const structureId = service.structureId ?? 0;
      const structureName = service.structureName || 'No Structure';

      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, {
          categoryId,
          categoryName,
          types: [],
        });
      }

      const category = categoriesMap.get(categoryId)!;

      let type = category.types.find((t) => t.categoryTypeId === typeId);
      if (!type) {
        type = {
          categoryTypeId: typeId,
          categoryTypeName: typeName,
          structures: [],
        };
        category.types.push(type);
      }

      let structure = type.structures.find(
        (s) => s.structureId === structureId,
      );
      if (!structure) {
        structure = {
          structureId,
          structureName,
          parts: [],
          services: [],
        };
        type.structures.push(structure);
      }

      if (service.partOptionId) {
        let part = structure.parts.find((p) => p.partId === service.partId);

        if (!part) {
          part = {
            partId: service.partId ?? 0,
            partName: service.partName || 'No Part',
            options: [],
            services: [],
          };
          structure.parts.push(part);
        }

        let option = part.options.find(
          (o) => o.partOptionId === service.partOptionId,
        );

        if (!option) {
          option = {
            partOptionId: service.partOptionId,
            partOptionName: service.partOptionName || 'No Option',
            services: [],
          };
          part.options.push(option);
        }

        option.services.push(service);
      } else if (service.partId) {
        let part = structure.parts.find((p) => p.partId === service.partId);

        if (!part) {
          part = {
            partId: service.partId,
            partName: service.partName || 'No Part',
            options: [],
            services: [],
          };
          structure.parts.push(part);
        }

        part.services.push(service);
      } else {
        structure.services.push(service);
      }
    });

    this.serviceHierarchy = Array.from(categoriesMap.values());
  }
  toggleGlobal(): void {
    this.isGlobal = this.feeForm.value.isGlobal;
    if (this.isGlobal) {
      this.feeForm.patchValue({ serviceIds: [] });
    }
  }
  toggleVisible(): void {
    this.isVisible = this.feeForm.value.isVisible;
    if (this.isVisible) {
      this.feeForm.patchValue({ serviceIds: [] });
    }
  }

  filterServices(): void {
    const term = this.serviceSearch.toLowerCase().trim();

    this.filteredServices = this.services.filter((s) =>
      `${s.name} ${s.categoryName} ${s.categoryTypeName} ${s.structureName} ${s.partName} ${s.partOptionName}`
        .toLowerCase()
        .includes(term),
    );

    this.buildServiceHierarchy(this.filteredServices);
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
      error: (err) => {
        this.toast.show(err.error.message ?? 'Failed to create fee.', 'error');
        this.isSubmitting = false;
      },
    });
  }
  onCategoryChange(): void {
    this.selectedTypeId = null;
    this.selectedStructureId = null;
    this.selectedPartId = null;
    this.selectedPartOptionId = null;
    this.visibleServices = [];

    const filtered = this.services.filter(
      (s) => s.categoryId == this.selectedCategoryId,
    );

    this.categoryTypes = this.getUnique(
      filtered,
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
    this.visibleServices = [];

    const filtered = this.services.filter(
      (s) =>
        s.categoryId == this.selectedCategoryId &&
        s.categoryTypeId == this.selectedTypeId,
    );

    this.structures = this.getUnique(filtered, 'structureId', 'structureName');
    this.parts = [];
    this.partOptions = [];

    this.updateVisibleServices();
  }

  onStructureChange(): void {
    this.selectedPartId = null;
    this.selectedPartOptionId = null;
    this.visibleServices = [];

    const filtered = this.services.filter(
      (s) =>
        s.categoryId == this.selectedCategoryId &&
        s.categoryTypeId == this.selectedTypeId &&
        s.structureId == this.selectedStructureId,
    );

    this.parts = this.getUnique(filtered, 'partId', 'partName');
    this.partOptions = [];

    this.updateVisibleServices();
  }

  onPartChange(): void {
    this.selectedPartOptionId = null;
    this.visibleServices = [];

    const filtered = this.services.filter(
      (s) =>
        s.structureId == this.selectedStructureId &&
        s.partId == this.selectedPartId,
    );

    this.partOptions = this.getUnique(
      filtered,
      'partOptionId',
      'partOptionName',
    );

    this.updateVisibleServices();
  }

  onPartOptionChange(): void {
    this.updateVisibleServices();
  }
  updateVisibleServices(): void {
    this.visibleServices = this.services.filter((s) => {
      if (this.selectedCategoryId && s.categoryId != this.selectedCategoryId)
        return false;
      if (this.selectedTypeId && s.categoryTypeId != this.selectedTypeId)
        return false;
      if (this.selectedStructureId && s.structureId != this.selectedStructureId)
        return false;
      if (this.selectedPartId && s.partId != this.selectedPartId) return false;
      if (
        this.selectedPartOptionId &&
        s.partOptionId != this.selectedPartOptionId
      )
        return false;

      return true;
    });
  }
}
