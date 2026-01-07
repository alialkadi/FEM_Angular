import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiResponse } from '../../../../Models/ApiResponse';
import {
  CreateServiceStep,
  ServiceResponse,
  ServiceStep
} from '../../../../Models/service.Model';
import { ServiceService } from '../../../Services/service-service.service';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit {

  /* ================= DATA ================= */
  allServices: ServiceResponse[] = [];
  services: ServiceResponse[] = [];

  isLoading = false;
  searchTerm = '';

  page = 1;
  pageSize = 10;
  totalCount = 0;

  /* ================= FILTER OPTIONS ================= */
  categories: { id: number; name: string }[] = [];
  types: { id: number; name: string }[] = [];
  structures: { id: number; name: string }[] = [];
  parts: { id: number; name: string }[] = [];
  options: { id: number; name: string }[] = [];

  /* ================= FILTER STATE ================= */
  selectedCategoryId: number | null = null;
  selectedTypeId: number | null = null;
  selectedStructureId: number | null = null;
  selectedPartId: number | null = null;
  selectedOptionId: number | null = null;

  /* ================= STEPS MODAL ================= */
  showStepsModal = false;
  selectedService: ServiceResponse | null = null;
  serviceSteps: ServiceStep[] = [];

  /* ================= STEP FORM ================= */
  CreateStepForm = new FormGroup({
    description: new FormControl('', Validators.required),
    serviceId: new FormControl(0, Validators.required)
  });

  constructor(private serviceService: ServiceService) {}

  /* ================= INIT ================= */
  ngOnInit(): void {
    this.loadServices();
  }

  /* ================= LOAD SERVICES ================= */
  loadServices(): void {
    this.isLoading = true;

    this.serviceService.getAllServices(false, this.page, this.pageSize).subscribe({
      next: (res: ApiResponse<any>) => {
        if (!res.success) {
          this.isLoading = false;
          return;
        }

        this.allServices = res.data.services;
        this.services = [...this.allServices];
        this.totalCount = res.data.totalCount;
        console.log(res)
        this.buildCategories(); // 🔥 initial hierarchy root
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  /* ================= BUILD ROOT FILTER ================= */
  private buildCategories(): void {
    const map = new Map<number, string>();

    this.allServices.forEach(s => {
      if (s.categoryId && s.categoryName) {
        map.set(s.categoryId, s.categoryName);
      }
    });

    this.categories = [...map.entries()].map(([id, name]) => ({ id, name }));
  }

  /* ================= CATEGORY → TYPES ================= */
  onCategoryChange(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;

    this.resetBelow('category');

    if (!categoryId) {
      this.applyFilters();
      return;
    }

    const map = new Map<number, string>();

    this.allServices
      .filter(s => s.categoryId === categoryId)
      .forEach(s => {
        if (s.categoryTypeId && s.categoryTypeName) {
          map.set(s.categoryTypeId, s.categoryTypeName);
        }
      });

    this.types = [...map.entries()].map(([id, name]) => ({ id, name }));
    this.applyFilters();
  }

  /* ================= TYPE → STRUCTURES ================= */
  onTypeChange(typeId: number | null): void {
    this.selectedTypeId = typeId;

    this.resetBelow('type');

    if (!typeId) {
      this.applyFilters();
      return;
    }

    const map = new Map<number, string>();

    this.allServices
      .filter(s => s.categoryTypeId === typeId)
      .forEach(s => {
        if (s.structureId && s.structureName) {
          map.set(s.structureId, s.structureName);
        }
      });

    this.structures = [...map.entries()].map(([id, name]) => ({ id, name }));
    this.applyFilters();
  }

  /* ================= STRUCTURE → PARTS ================= */
  onStructureChange(structureId: number | null): void {
    this.selectedStructureId = structureId;

    this.resetBelow('structure');

    if (!structureId) {
      this.applyFilters();
      return;
    }

    const map = new Map<number, string>();

    this.allServices
      .filter(s => s.structureId === structureId)
      .forEach(s => {
        if (s.partId && s.partName) {
          map.set(s.partId, s.partName);
        }
      });

    this.parts = [...map.entries()].map(([id, name]) => ({ id, name }));
    this.applyFilters();
  }

  /* ================= PART → OPTIONS ================= */
  onPartChange(partId: number | null): void {
    this.selectedPartId = partId;

    this.resetBelow('part');

    if (!partId) {
      this.applyFilters();
      return;
    }

    const map = new Map<number, string>();

    this.allServices
      .filter(s => s.partId === partId)
      .forEach(s => {
        if (s.partOptionId && s.partOptionName) {
          map.set(s.partOptionId, s.partOptionName);
        }
      });

    this.options = [...map.entries()].map(([id, name]) => ({ id, name }));
    this.applyFilters();
  }

  /* ================= OPTION ================= */
  onOptionChange(optionId: number | null): void {
    this.selectedOptionId = optionId;
    this.applyFilters();
  }

  /* ================= FILTER CORE ================= */
  applyFilters(): void {
    this.services = this.allServices.filter(s => {
      if (this.selectedCategoryId && s.categoryId !== this.selectedCategoryId) return false;
      if (this.selectedTypeId && s.categoryTypeId !== this.selectedTypeId) return false;
      if (this.selectedStructureId && s.structureId !== this.selectedStructureId) return false;
      if (this.selectedPartId && s.partId !== this.selectedPartId) return false;
      if (this.selectedOptionId && s.partOptionId !== this.selectedOptionId) return false;
      if (this.searchTerm && !s.name?.toLowerCase().includes(this.searchTerm.toLowerCase())) return false;
      return true;
    });
  }

  /* ================= RESET HELPERS ================= */
  private resetBelow(level: 'category' | 'type' | 'structure' | 'part'): void {
    if (level === 'category') {
      this.selectedTypeId = null;
      this.selectedStructureId = null;
      this.selectedPartId = null;
      this.selectedOptionId = null;
      this.types = [];
      this.structures = [];
      this.parts = [];
      this.options = [];
    }

    if (level === 'type') {
      this.selectedStructureId = null;
      this.selectedPartId = null;
      this.selectedOptionId = null;
      this.structures = [];
      this.parts = [];
      this.options = [];
    }

    if (level === 'structure') {
      this.selectedPartId = null;
      this.selectedOptionId = null;
      this.parts = [];
      this.options = [];
    }

    if (level === 'part') {
      this.selectedOptionId = null;
      this.options = [];
    }
  }

  /* ================= SEARCH ================= */
  onSearch(): void {
    this.applyFilters();
  }

  /* ================= PAGINATION ================= */
  onPageChange(page: number): void {
    this.page = page;
    this.loadServices();
  }

  /* ================= DELETE SERVICE ================= */
  onDelete(id: number): void {
    if (!confirm('Are you sure you want to delete this service?')) return;
    this.serviceService.deleteService(id).subscribe(() => this.loadServices());
  }

  /* ================= STEPS ================= */
  openStepsModal(service: ServiceResponse): void {
    this.selectedService = service;
    this.showStepsModal = true;
    this.CreateStepForm.patchValue({ serviceId: service.id });
    this.loadSteps(service.id!);
  }

  closeStepsModal(): void {
    this.showStepsModal = false;
    this.selectedService = null;
    this.serviceSteps = [];
  }

  loadSteps(serviceId: number): void {
    this.serviceService.getStepsByServiceId(serviceId).subscribe(res => {
      this.serviceSteps = res.success ? res.data?.serviceSteps || [] : [];
    });
  }

  onAddStep(form: FormGroup): void {
    if (form.invalid || !this.selectedService) return;

    const payload: CreateServiceStep = {
      description: form.value.description!,
      serviceId: this.selectedService.id!
    };

    this.serviceService.CreateStep(payload).subscribe(res => {
      if (res.success) {
        this.loadSteps(this.selectedService!.id!);
        form.reset({ description: '', serviceId: this.selectedService!.id });
      }
    });
  }

  deleteStep(stepId: number, serviceId: number): void {
    if (!confirm('Delete this step?')) return;
    this.serviceService.DeleteStep(stepId).subscribe(() => this.loadSteps(serviceId));
  }
}
