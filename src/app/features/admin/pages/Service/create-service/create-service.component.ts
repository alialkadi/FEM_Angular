import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CreateUpdateServiceRequest } from '../../../../Models/service.Model';
import { ServiceService } from '../../../Services/service-service.service';
import { StructureService } from '../../../Services/structure-service.service';
import { PartService } from '../../../Services/part-service.service';
import { PartOptionService } from '../../../Services/part-option-service.service';
import { CategoryService } from '../../../Services/CategoryService';
import { CategoryTypeService } from '../../../Services/categoryTypeService.service';
import { Category } from '../../../../Models/Category';
import { CategoryType } from '../../../../Models/CategoryType';
import { Structure } from '../../../../Models/Structure.Model';
import { Part } from '../../../../Models/Part.Models';
import { PartOption } from '../../../../Models/PartOption.Model';

@Component({
  selector: 'app-create-service',
  templateUrl: './create-service.component.html',
  styleUrls: ['./create-service.component.scss'] // ✅ fixed: should be styleUrls[]
})
export class CreateServiceComponent implements OnInit {

  serviceForm!: FormGroup;
  activeLinkage: 'Structure' | 'Part' | 'PartOption' = 'Structure';

  categories: Category[] = [];
  categoryTypes: CategoryType[] = [];
  structures: Structure[] = [];
  parts: Part[] = [];
  partOptions: PartOption[] = [];

  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private categoryService: CategoryService,
    private categoryTypeService: CategoryTypeService,
    private structureService: StructureService,
    private partService: PartService,
    private partOptionService: PartOptionService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.loadCategories(); // ✅ initial load
  }

  // --------------------------
  // FORM INITIALIZATION
  // --------------------------
  buildForm(): void {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      lockingPoint: [''],
      series: [''],
      pointNumber: [''],
      baseCost: [0, [Validators.required, Validators.min(0)]],
      warrantyDuration: [0, [Validators.required, Validators.min(0)]],
      warrantyUnit: ['Months', Validators.required],
      deliveryDays: [0, [Validators.required, Validators.min(0)]],
      labors: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null],
      categoryTypeId: [null],
      structureId: [null],
      partId: [null],
      partOptionId: [null]
    });
  }

  // --------------------------
  // HIERARCHICAL LOADERS
  // --------------------------

  loadCategories(): void {
    this.categoryService.getAllCategories(true).subscribe({
      next: (res) => {
        console.log(res)
        if (res.success && res.data?.categories) {
          this.categories = res.data.categories;
          console.log(res)
        }
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  onCategoryChange(event: Event): void {
    const categoryId = Number((event.target as HTMLSelectElement)?.value);
    if (!categoryId) return;

    this.categoryTypeService.getTypesByCategory(categoryId).subscribe({
      next: (res) => {
        console.log(res);
        if (res.success && res.data) {
          this.categoryTypes = res.data.categoryTypes;
          console.log(res.data);
          console.log(this.categoryTypes)
          this.structures = [];
        }
      },
      error: (err) => console.error('Error loading category types:', err)
    });
  }

  onCategoryTypeChange(event: Event): void {
    const typeId = Number((event.target as HTMLSelectElement)?.value);
    if (!typeId) return;

    this.structureService.getStructuresByType(typeId).subscribe({
      next: (res) => {
        console.log(res)
        if (res.success && res.data?.structures) {
          this.structures = res.data.structures;
        }
      },
      error: (err) => console.error('Error loading structures:', err)
    });
  }

  onStructureChange(event: Event): void {
    const structureId = Number((event.target as HTMLSelectElement)?.value);
    if (!structureId) return;

    this.partService.getPartsByStructure(structureId).subscribe({
      next: (res) => {
        console.log(res)
        if (res.success && res.data?.parts) {
          this.parts = res.data.parts;
        }
      },
      error: (err) => console.error('Error loading parts:', err)
    });
  }

  onPartChange(event: Event): void {
    const partId = Number((event.target as HTMLSelectElement)?.value);
    if (!partId) return;

    this.partOptionService.getOptionsByPart(partId).subscribe({
      next: (res) => {
        console.log(res)
        if (res.success && res.data?.partOptions) {
          this.partOptions = res.data.partOptions;
        }
      },
      error: (err) => console.error('Error loading part options:', err)
    });
  }

  // --------------------------
  // LINKAGE SWITCH
  // --------------------------
  setLinkage(link: 'Structure' | 'Part' | 'PartOption'): void {
    this.activeLinkage = link;
    this.serviceForm.patchValue({
      structureId: null,
      partId: null,
      partOptionId: null,
      categoryId: null,
      categoryTypeId: null
    });
  }

  // --------------------------
  // SUBMIT
  // --------------------------
  onSubmit(): void {
  if (this.serviceForm.valid) {
    this.serviceForm.markAllAsTouched();
    this.isSubmitting = true;

    // Extract form values
    const payload = { ...this.serviceForm.value };

    // Ensure correct linkage (Structure / Part / PartOption)
    if (this.activeLinkage === 'Structure') {
      payload.partId = null;
      payload.partOptionId = null;
    } else if (this.activeLinkage === 'Part') {
      payload.structureId = null;
      payload.partOptionId = null;
    } else if (this.activeLinkage === 'PartOption') {
      payload.structureId = null;
      payload.partId = null;
    }

    // Build FormData
    const formData = new FormData();

    // Append all normal fields
    Object.keys(payload).forEach(key => {
      const value = payload[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // Append the uploaded image
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    // Send request
    this.serviceService.CreateService(formData).subscribe({
      next: (res) => {
        console.log(res)
        this.isSubmitting = false;

        if (res.success) {
          alert('✅ Service created successfully!');
          this.serviceForm.reset();
          this.selectedFile = null;
          this.previewUrl = null;
        } else {
          alert('❌ Failed to create service: ' + (res.message ?? 'Unknown error'));
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error creating service:', err);
        alert('❌ Error creating service.');
      }
    });
  }
}


  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();

      reader.onload = () => {
        this.previewUrl = reader.result;
      };

      reader.readAsDataURL(this.selectedFile);
    }
  }

}
