import { Component, OnInit } from '@angular/core';
import { ApiResponse } from '../../../../Models/ApiResponse';
import {
  CreateServiceStep,
  ServiceResponse,
  ServiceStep,
  UpdateServiceStep,
} from '../../../../Models/service.Model';
import { ServiceService } from '../../../Services/service-service.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmDialogComponent } from '../../../../../shared/Dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss'],
})
export class ServiceListComponent implements OnInit {
  services: ServiceResponse[] = [];
  totalCount: number = 0;
  page: number = 1;
  pageSize: number = 50;
  searchTerm: string = '';
  isLoading: boolean = false;
  showStepsModal = false;
  selectedService: any = null;
  serviceSteps: ServiceStep[] = [];
  newStepOrder = 1;
  newStepDescription = '';
  publicBaseUrl = window.location.origin; // or environment.frontUrl if you have
  advertiseSortOrderInput: Record<number, number> = {};
  copySuccessMessage: string | null = null;
  editingStepId: any;

  constructor(
    private serviceService: ServiceService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadServices();
    this.loadFilters();
  }

  loadServices(): void {
    this.isLoading = true;

    this.serviceService
      .getAllServices(
        false,
        this.page,
        this.pageSize,
        this.selectedCategoryId,
        this.selectedCategoryTypeId,
        this.selectedStructureId,
        this.selectedPartId,
        this.selectedPartOptionId,
      )
      .subscribe({
        next: (res: ApiResponse<any>) => {
          if (res.success) {
            this.services = res.data.services;
            this.allServices = res.data.services;
            this.totalCount = res.data.totalNumber;
            console.log(res);
            console.log(this.totalCount);
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  onDelete(id: number, name?: string): void {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: `Are you sure you want to delete "${name ?? 'this service'}"?`,
      },
    });

    confirmRef.afterClosed().subscribe((result) => {
      if (result) {
        this.serviceService.deleteService(id).subscribe(() => {
          this.loadServices();
        });
      }
    });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadServices();
  }

  allServices: ServiceResponse[] = [];

  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.services = [...this.allServices];
      return;
    }

    this.services = this.allServices.filter(
      (s) =>
        s.name?.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term) ||
        s.categoryName?.toLowerCase().includes(term) ||
        s.categoryTypeName?.toLowerCase().includes(term) ||
        s.structureName?.toLowerCase().includes(term) ||
        s.partName?.toLowerCase().includes(term) ||
        s.partOptionName?.toLowerCase().includes(term),
    );
  }
  clearFilters(): void {
    this.selectedCategoryId =
      this.selectedCategoryTypeId =
      this.selectedStructureId =
      this.selectedPartId =
      this.selectedPartOptionId =
        undefined;

    this.categoryTypes = [];
    this.structures = [];
    this.parts = [];
    this.partOptions = [];

    this.page = 1;
    this.loadServices();
  }

  // =========================
  // STEPS MANAGEMENT
  // =========================
  CreateStepForm: FormGroup = new FormGroup({
    description: new FormControl('', Validators.required),
    serviceId: new FormControl(0, Validators.required),
  });

  EditStepForm: FormGroup = new FormGroup({
    id: new FormControl(0, Validators.required),
    serviceId: new FormControl(0, Validators.required),
    description: new FormControl('', Validators.required),
  });

  newStep: CreateServiceStep = {
    description: '',
    serviceId: 0,
  };

  updatedStep: UpdateServiceStep = {
    id: 0,
    description: '',
    serviceId: 0,
  };

  loadSteps(serviceId: number): void {
    this.serviceService.getStepsByServiceId(serviceId).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.success && res.data?.serviceSteps) {
          this.serviceSteps = res.data.serviceSteps;
        } else {
          this.serviceSteps = [];
        }
      },
      error: (err) => {
        console.error('Error loading steps:', err);
        this.serviceSteps = [];
      },
    });
  }

  openStepsModal(service: ServiceResponse): void {
    this.selectedService = service;
    this.showStepsModal = true;

    this.CreateStepForm.patchValue({
      serviceId: service.id || 0,
      description: '',
    });

    this.editingStepId = null;
    this.loadSteps(service.id!);
  }

  closeStepsModal(): void {
    this.showStepsModal = false;
    this.selectedService = null;
    this.serviceSteps = [];
    this.editingStepId = null;

    this.CreateStepForm.reset({
      description: '',
      serviceId: 0,
    });

    this.EditStepForm.reset({
      id: 0,
      serviceId: 0,
      description: '',
    });
  }

  onAddStep(form: FormGroup): void {
    if (!form.valid) {
      form.markAllAsTouched();
      return;
    }

    this.newStep = form.value;

    if (!this.newStep.serviceId && this.selectedService?.id) {
      this.newStep.serviceId = this.selectedService.id;
    }

    this.serviceService.CreateStep(this.newStep).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.success) {
          if (this.selectedService?.id) {
            this.loadSteps(this.selectedService.id);
          }

          this.CreateStepForm.reset({
            description: '',
            serviceId: this.selectedService?.id || 0,
          });
        }
      },
      error: (err) => {
        console.error('Error creating step:', err);
      },
    });
  }

  startEditStep(step: ServiceStep): void {
    this.editingStepId = step.id || null;

    this.EditStepForm.patchValue({
      id: step.id || 0,
      serviceId: step.serviceId || this.selectedService?.id || 0,
      description: step.description || '',
    });
  }

  cancelEditStep(): void {
    this.editingStepId = null;
    this.EditStepForm.reset({
      id: 0,
      serviceId: 0,
      description: '',
    });
  }

  onUpdateStep(): void {
    if (!this.EditStepForm.valid) {
      this.EditStepForm.markAllAsTouched();
      return;
    }

    this.updatedStep = this.EditStepForm.value;

    this.serviceService.updateStep(this.updatedStep).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.success) {
          this.editingStepId = null;

          if (this.selectedService?.id) {
            this.loadSteps(this.selectedService.id);
          }

          this.EditStepForm.reset({
            id: 0,
            serviceId: 0,
            description: '',
          });
        }
      },
      error: (err) => {
        console.error('Error updating step:', err);
      },
    });
  }

  deleteStep(id?: number, serviceId?: number): void {
    if (!id || !serviceId) return;

    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: 'Are you sure you want to delete this step?',
      },
    });

    confirmRef.afterClosed().subscribe((result) => {
      if (result) {
        this.serviceService.DeleteStep(id).subscribe({
          next: () => this.loadSteps(serviceId),
          error: (err) => console.error('Error deleting step:', err),
        });
      }
    });
  }

  //////////////    Filters /////////////////////////

  // ================= FILTER DATA =================
  categories: any[] = [];
  categoryTypes: any[] = [];
  structures: any[] = [];
  parts: any[] = [];
  partOptions: any[] = [];

  // ================= FILTER STATE =================
  selectedCategoryId?: number;
  selectedCategoryTypeId?: number;
  selectedStructureId?: number;
  selectedPartId?: number;
  selectedPartOptionId?: number;

  loadFilters(): void {
    this.serviceService.getServiceFilterHierarchy().subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.categories = res.data;
        } else {
          this.categories = [];
          console.error('Invalid filter response shape', res.data);
        }
      },
      error: () => console.error('Failed to load filters'),
    });
  }

  onCategoryChange(event: Event) {
    this.selectedCategoryId =
      +(event.target as HTMLSelectElement).value || undefined;

    this.categoryTypes = [];
    this.structures = [];
    this.parts = [];
    this.partOptions = [];

    this.selectedCategoryTypeId =
      this.selectedStructureId =
      this.selectedPartId =
      this.selectedPartOptionId =
        undefined;

    const cat = this.categories.find((c) => c.id === this.selectedCategoryId);
    this.categoryTypes = cat?.types ?? [];

    this.loadServices();
  }

  onCategoryTypeChange(event: Event) {
    this.selectedCategoryTypeId =
      +(event.target as HTMLSelectElement).value || undefined;

    this.structures = [];
    this.parts = [];
    this.partOptions = [];

    this.selectedStructureId =
      this.selectedPartId =
      this.selectedPartOptionId =
        undefined;

    const type = this.categoryTypes.find(
      (t) => t.id === this.selectedCategoryTypeId,
    );
    this.structures = type?.structures ?? [];

    this.loadServices();
  }

  onStructureChange(event: Event) {
    this.selectedStructureId =
      +(event.target as HTMLSelectElement).value || undefined;

    this.parts = [];
    this.partOptions = [];

    this.selectedPartId = this.selectedPartOptionId = undefined;

    const s = this.structures.find((x) => x.id === this.selectedStructureId);
    this.parts = s?.parts ?? [];

    this.loadServices();
  }

  onPartChange(event: Event) {
    this.selectedPartId =
      +(event.target as HTMLSelectElement).value || undefined;

    this.partOptions = [];
    this.selectedPartOptionId = undefined;

    const p = this.parts.find((x) => x.id === this.selectedPartId);
    this.partOptions = p?.options ?? [];

    this.loadServices();
  }

  onPartOptionChange(event: Event) {
    this.selectedPartOptionId =
      +(event.target as HTMLSelectElement).value || undefined;
    this.loadServices();
  }

  // build the url for the user
  getAdvertiseUrl(service: ServiceResponse): string {
    const slug = service.advertiseSlug;
    return `${this.publicBaseUrl}/FenetrationMaintainence/Home/s/${slug}`;
  }

  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      this.copySuccessMessage = '✅ Link copied!';
      console.log(text);
      setTimeout(() => (this.copySuccessMessage = null), 2000);
    } catch {
      this.copySuccessMessage = '❌ Copy failed (browser blocked).';
      setTimeout(() => (this.copySuccessMessage = null), 2500);
    }
  }
  onAdvertise(service: ServiceResponse) {
    if (!service.id) return;

    const sortOrder = this.advertiseSortOrderInput[service.id];

    this.serviceService.advertiseService(service.id, sortOrder).subscribe({
      next: (res) => {
        if (res.success) {
          // backend returns slug
          service.isAdvertised = true;
          service.advertiseSlug = res.data;

          // set local sort order if provided
          if (sortOrder !== undefined) {
            service.advertiseSortOrder = sortOrder;
          }

          const url = this.getAdvertiseUrl(service);
          this.copyToClipboard(url);
        }
      },
      error: (err) => console.error(err),
    });
  }

  onUnAdvertise(service: ServiceResponse) {
    if (!service.id) return;

    this.serviceService.unAdvertiseService(service.id).subscribe({
      next: (res) => {
        if (res.success) {
          service.isAdvertised = false;
          service.advertiseSlug = null;
          service.advertiseSortOrder = null;
        }
      },
      error: (err) => console.error(err),
    });
  }

  onCopyLink(service: ServiceResponse) {
    if (!service.isAdvertised || !service.advertiseSlug) return;
    this.copyToClipboard(this.getAdvertiseUrl(service));
  }

  // ---------------------------------------------------------
  // UPDATE SERVICE BREAKDOWN
  // ---------------------------------------------------------
  menuState = {
    open: false,
    top: 0,
    left: 0,
    serviceId: null as number | null,
    service: null as ServiceResponse | null,
  };

  toggleMenu(event: MouseEvent, service: ServiceResponse): void {
    event.stopPropagation();

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    const menuWidth = 190;
    const menuHeight = 220;
    const gap = 8;

    let left = rect.right - menuWidth;
    let top = rect.bottom + gap;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 8) {
      left = 8;
    }

    if (left + menuWidth > viewportWidth - 8) {
      left = viewportWidth - menuWidth - 8;
    }

    if (top + menuHeight > viewportHeight - 8) {
      top = rect.top - menuHeight - gap;
    }

    if (top < 8) {
      top = 8;
    }

    if (this.menuState.open && this.menuState.serviceId === service.id) {
      this.closeMenu();
      return;
    }

    this.menuState = {
      open: true,
      top,
      left,
      serviceId: service.id ?? null,
      service,
    };
  }

  closeMenu(): void {
    this.menuState = {
      open: false,
      top: 0,
      left: 0,
      serviceId: null,
      service: null,
    };
  }

  onMenuSteps(): void {
    if (this.menuState.service) {
      this.openStepsModal(this.menuState.service);
    }
    this.closeMenu();
  }

  onMenuDelete(): void {
    if (this.menuState.serviceId != null) {
      this.onDelete(this.menuState.serviceId, this.menuState.service?.name);
    }
    this.closeMenu();
  }
}
