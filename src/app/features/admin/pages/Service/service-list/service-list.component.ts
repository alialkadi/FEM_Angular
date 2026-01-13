import { Component, OnInit } from '@angular/core';
import { ApiResponse } from '../../../../Models/ApiResponse';
import { CreateServiceStep, ServiceResponse, ServiceStep } from '../../../../Models/service.Model';
import { ServiceService } from '../../../Services/service-service.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit {

  services: ServiceResponse[] = [];
  totalCount: number = 0;
  page: number = 1;
  pageSize: number = 10;
  searchTerm: string = '';
  isLoading: boolean = false;
  showStepsModal = false;
  selectedService: any = null;
  serviceSteps: ServiceStep[] = [];
  newStepOrder = 1;
  newStepDescription = '';

  constructor(private serviceService: ServiceService) { }

  ngOnInit(): void {
    this.loadServices();
      this.loadFilters();

  }

 
loadServices(): void {
  this.isLoading = true;

  this.serviceService.getAllServices(
    false,
    this.page,
    this.pageSize,
    this.selectedCategoryId,
    this.selectedCategoryTypeId,
    this.selectedStructureId,
    this.selectedPartId,
    this.selectedPartOptionId
  ).subscribe({
    next: (res: ApiResponse<any>) => {
      if (res.success) {
        this.services = res.data.services;
        this.allServices = res.data.services;
        this.totalCount = res.data.totalNumber;
        console.log(res)
        console.log(this.totalCount)
      }
      this.isLoading = false;
    },
    error: () => {
      this.isLoading = false;
    }
  });
}
  
  onDelete(id: number): void {
    if (confirm('Are you sure you want to delete this service?')) {
      this.serviceService.deleteService(id).subscribe(() => {
        this.loadServices();
      });
    }
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

  this.services = this.allServices.filter(s =>
    s.name?.toLowerCase().includes(term) ||
    s.description?.toLowerCase().includes(term) ||
    s.structureName?.toLowerCase().includes(term) ||
    s.partName?.toLowerCase().includes(term) ||
    s.partOptionName?.toLowerCase().includes(term)
  );
}
clearFilters(): void {
    this.selectedCategoryId =
    this.selectedCategoryTypeId =
    this.selectedStructureId =
    this.selectedPartId =
    this.selectedPartOptionId = undefined;

    this.categoryTypes = [];
    this.structures = [];
    this.parts = [];
    this.partOptions = [];

    this.page = 1;
    this.loadServices();
  }

// ===============================================
// Load Steps (Reusable Function)
// ===============================================
loadSteps(serviceId: number) {
  this.serviceService.getStepsByServiceId(serviceId).subscribe({
    next: (res) => {
      if (res.success && res.data?.serviceSteps) {
        this.serviceSteps = res.data.serviceSteps;
      } else {
        this.serviceSteps = [];
      }
    },
    error: (err) => {
      console.error('Error loading steps:', err);
      this.serviceSteps = [];
    }
  });
}

// ===============================================
// Open Steps Modal
// ===============================================
openStepsModal(service: any) {
  this.selectedService = service;
  this.showStepsModal = true;

  // Load steps for selected service
  this.loadSteps(service.id);
}

// ===============================================
// Close Modal
// ===============================================
closeStepsModal() {
  this.showStepsModal = false;
  this.selectedService = null;
  this.serviceSteps = [];
}

// ===============================================
// Reactive Form
// ===============================================
CreateStepForm: FormGroup = new FormGroup({
  description: new FormControl('', Validators.required),
  serviceId: new FormControl(0, Validators.required)
});

newStep: CreateServiceStep = { description: '', serviceId: 0 };

// ===============================================
// Add Step + Refresh Steps
// ===============================================
onAddStep(form: FormGroup) {
  if (!form.valid) {
    form.markAllAsTouched();
    return;
  }

  this.newStep = form.value;

  // Ensure serviceId is set correctly
  if (!this.newStep.serviceId && this.selectedService) {
    this.newStep.serviceId = this.selectedService.id;
  }

  this.serviceService.CreateStep(this.newStep).subscribe({
    next: (res) => {
      if (res.success) {
        console.log('✅ Step created:', res.data);

        // ✅ Reload the steps inside the modal immediately
        if (this.selectedService) {
          this.loadSteps(this.selectedService.id);
        }

        // Reset the form
        this.CreateStepForm.reset({
          description: '',
          serviceId: this.selectedService?.id || 0
        });
      } else {
        console.warn('Step creation failed:', res.message);
      }
    },
    error: (err) => {
      console.error('Error creating step:', err);
    }
  });
}

  deleteStep(id : number,serviceId : number) {
    if (confirm('Are you sure you want to delete this step?')) {
      this.serviceService.DeleteStep(id).subscribe(() => {
        
        this.loadSteps(serviceId);
      });
    }
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
    next: res => {
      if (res.success && Array.isArray(res.data)) {
        this.categories = res.data;
      } else {
        this.categories = [];
        console.error('Invalid filter response shape', res.data);
      }
    },
    error: () => console.error('Failed to load filters')
  });
}

onCategoryChange(event: Event) {
  this.selectedCategoryId = +(event.target as HTMLSelectElement).value || undefined;

  this.categoryTypes = [];
  this.structures = [];
  this.parts = [];
  this.partOptions = [];

  this.selectedCategoryTypeId =
  this.selectedStructureId =
  this.selectedPartId =
  this.selectedPartOptionId = undefined;

  const cat = this.categories.find(c => c.id === this.selectedCategoryId);
  this.categoryTypes = cat?.types ?? [];

  this.loadServices();
}

onCategoryTypeChange(event: Event) {
  this.selectedCategoryTypeId = +(event.target as HTMLSelectElement).value || undefined;

  this.structures = [];
  this.parts = [];
  this.partOptions = [];

  this.selectedStructureId =
  this.selectedPartId =
  this.selectedPartOptionId = undefined;

  const type = this.categoryTypes.find(t => t.id === this.selectedCategoryTypeId);
  this.structures = type?.structures ?? [];

  this.loadServices();
}

onStructureChange(event: Event) {
  this.selectedStructureId = +(event.target as HTMLSelectElement).value || undefined;

  this.parts = [];
  this.partOptions = [];

  this.selectedPartId =
  this.selectedPartOptionId = undefined;

  const s = this.structures.find(x => x.id === this.selectedStructureId);
  this.parts = s?.parts ?? [];

  this.loadServices();
}

onPartChange(event: Event) {
  this.selectedPartId = +(event.target as HTMLSelectElement).value || undefined;

  this.partOptions = [];
  this.selectedPartOptionId = undefined;

  const p = this.parts.find(x => x.id === this.selectedPartId);
  this.partOptions = p?.options ?? [];

  this.loadServices();
}

onPartOptionChange(event: Event) {
  this.selectedPartOptionId = +(event.target as HTMLSelectElement).value || undefined;
  this.loadServices();
}

}
