import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import {
  MetadataTargetType,
  MetadataAssignmentItemRequest
} from '../../../../Models/MetadataTargetType';

import { ServiceService } from '../../../Services/service-service.service';
import { CategoryService } from '../../../Services/CategoryService';
import { CategoryTypeService } from '../../../Services/categoryTypeService.service';
import { StructureService } from '../../../Services/structure-service.service';
import { PartService } from '../../../Services/part-service.service';
import { PartOptionService } from '../../../Services/part-option-service.service';

import { Category } from '../../../../Models/Category';
import { CategoryType } from '../../../../Models/CategoryType';
import { Structure } from '../../../../Models/Structure.Model';
import { Part } from '../../../../Models/Part.Models';
import { PartOption } from '../../../../Models/PartOption.Model';

@Component({
  selector: 'app-create-service',
  templateUrl: './create-service.component.html',
  styleUrls: ['./create-service.component.scss']
})
export class CreateServiceComponent implements OnInit {

  // ================= FORM =================
  serviceForm!: FormGroup;
  isSubmitting = false;

  // ================= LINKAGE =================
  activeLinkage: 'Structure' | 'Part' | 'PartOption' = 'Structure';

  categories: Category[] = [];
  categoryTypes: CategoryType[] = [];
  structures: Structure[] = [];
  parts: Part[] = [];
  partOptions: PartOption[] = [];

  // ================= FILE =================
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // ================= METADATA =================
  showMetadata = false;
  metadataPayload: MetadataAssignmentItemRequest[] = [];

  metadataTargetType = MetadataTargetType.Service;
  metadataTargetId = 0; // CREATE MODE ONLY

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private categoryService: CategoryService,
    private categoryTypeService: CategoryTypeService,
    private structureService: StructureService,
    private partService: PartService,
    private partOptionService: PartOptionService
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.buildForm();
    this.loadCategories();
  }

  // ================= FORM =================
  private buildForm(): void {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      series: [''],
      lockingPoint: [''],
      pointNumber: [''],
      baseCost: [0, [Validators.required, Validators.min(0)]],
      warrantyDuration: [0, [Validators.required, Validators.min(0)]],
      warrantyUnit: ['Months', Validators.required],
      deliveryDays: [0, [Validators.required, Validators.min(0)]],
      labors: [0, [Validators.min(0)]],
      categoryId: [null],
      categoryTypeId: [null],
      structureId: [null],
      partId: [null],
      partOptionId: [null]
    });
  }

  // ================= METADATA =================
  toggleMetadata(): void {
    this.showMetadata = !this.showMetadata;
  }

  onMetadataChange(items: MetadataAssignmentItemRequest[]): void {
    this.metadataPayload = items;
  }

  // ================= FILE =================
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;

    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result as string);
    reader.readAsDataURL(this.selectedFile);
  }

  // ================= LOADERS =================
  loadCategories(): void {
    this.categoryService.getAllCategories(true).subscribe(res => {
      if (res.success && res.data?.categories) {
        this.categories = res.data.categories;
      }
    });
  }

  onCategoryChange(e: Event): void {
    const id = Number((e.target as HTMLSelectElement).value);
    if (!id) return;

    this.categoryTypeService.getTypesByCategory(id).subscribe(res => {
      this.categoryTypes = res.data?.categoryTypes ?? [];
      this.structures = [];
      this.parts = [];
      this.partOptions = [];
    });
  }

  onCategoryTypeChange(e: Event): void {
    const id = Number((e.target as HTMLSelectElement).value);
    if (!id) return;

    this.structureService.getStructuresByType(id).subscribe(res => {
      this.structures = res.data?.structures ?? [];
      this.parts = [];
      this.partOptions = [];
    });
  }

  onStructureChange(e: Event): void {
    const id = Number((e.target as HTMLSelectElement).value);
    if (!id) return;

    this.partService.getPartsByStructure(id).subscribe(res => {
      this.parts = res.data?.parts ?? [];
      this.partOptions = [];
    });
  }

  onPartChange(e: Event): void {
    const id = Number((e.target as HTMLSelectElement).value);
    if (!id) return;

    this.partOptionService.getOptionsByPart(id).subscribe(res => {
      this.partOptions = res.data?.partOptions ?? [];
    });
  }

  // ================= LINKAGE =================
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

  // ================= SUBMIT =================
  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload = { ...this.serviceForm.value };

    // Enforce single linkage
    if (this.activeLinkage === 'Structure') {
      payload.partId = null;
      payload.partOptionId = null;
    } else if (this.activeLinkage === 'Part') {
      payload.structureId = null;
      payload.partOptionId = null;
    } else {
      payload.structureId = null;
      payload.partId = null;
    }

    const formData = new FormData();

    Object.keys(payload).forEach(key => {
      if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, payload[key]);
      }
    });

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    // ✅ METADATA (CORRECT FORM-DATA BINDING)
    this.metadataPayload.forEach((m, i) => {
      formData.append(
        `Metadata[${i}].MetadataAttributeId`,
        m.metadataAttributeId.toString()
      );

      if (m.valueIds?.length) {
        m.valueIds.forEach((v, j) => {
          formData.append(
            `Metadata[${i}].ValueIds[${j}]`,
            v.toString()
          );
        });
      }

      if (m.valueText !== null && m.valueText !== undefined) {
        formData.append(
          `Metadata[${i}].ValueText`,
          m.valueText
        );
      }
    });

    this.serviceService.CreateService(formData).subscribe({
      next: res => {
        this.isSubmitting = false;

        if (res.success) {
          alert('✅ Service created successfully');
          this.reset();
        } else {
          alert(res.message ?? 'Failed to create service');
        }
      },
      error: () => {
        this.isSubmitting = false;
        alert('Unexpected error');
      }
    });
  }

  private reset(): void {
    this.serviceForm.reset();
    this.selectedFile = null;
    this.previewUrl = null;
    this.metadataPayload = [];
    this.showMetadata = false;
    this.metadataTargetId = 0;
  }
}
