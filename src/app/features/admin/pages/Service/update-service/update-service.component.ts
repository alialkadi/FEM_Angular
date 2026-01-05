import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
import { ServiceResponse } from '../../../../Models/service.Model';

@Component({
  selector: 'app-update-service',
  templateUrl: './update-service.component.html',
  styleUrls: ['./update-service.component.scss']
})
export class UpdateServiceComponent implements OnInit {

  // ================= CORE =================
  serviceId!: number;
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
  metadataTargetId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private serviceService: ServiceService,
    private categoryService: CategoryService,
    private categoryTypeService: CategoryTypeService,
    private structureService: StructureService,
    private partService: PartService,
    private partOptionService: PartOptionService
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.serviceId = Number(this.route.snapshot.paramMap.get('id'));
    this.metadataTargetId = this.serviceId;

    this.buildForm();
    this.loadCategories();
    this.loadService();
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
       categoryId: [{ value: null, disabled: true }],
  categoryTypeId: [{ value: null, disabled: true }],
  structureId: [{ value: null, disabled: true }],
  partId: [{ value: null, disabled: true }],
  partOptionId: [{ value: null, disabled: true }],
    });
  }
  isReassignMode: boolean = false;
enableReassign(): void {
  if (!confirm(
    'Changing the service hierarchy may affect pricing, metadata, and availability.\n\nContinue?'
  )) {
    return;
  }

  this.isReassignMode = true;

  this.serviceForm.get('categoryId')?.enable();
  this.serviceForm.get('categoryTypeId')?.enable();
  this.serviceForm.get('structureId')?.enable();
  this.serviceForm.get('partId')?.enable();
  this.serviceForm.get('partOptionId')?.enable();
}

  // ================= LOAD DATA =================
  loadCategories(): void {
    this.categoryService.getAllCategories(true).subscribe(res => {
      if (res.success && res.data?.categories) {
        this.categories = res.data.categories;
      }
    });
  }

  private loadService(): void {
    this.serviceService.getServicesById(this.serviceId).subscribe(res => {
      if (!res.success || !res.data) return;

      const s: ServiceResponse = res.data;

      // -------- Detect linkage --------
      if (s.partOptionId) this.activeLinkage = 'PartOption';
      else if (s.partId) this.activeLinkage = 'Part';
      else this.activeLinkage = 'Structure';

      // -------- Patch form --------
      this.serviceForm.patchValue({
        name: s.name,
        description: s.description,
        baseCost: s.baseCost,
        warrantyDuration: s.warrantyDuration,
        warrantyUnit: s.warrantyUnit,
        deliveryDays: s.deliveryDays,
        labors: s.labors,
        structureId: s.structureId,
        partId: s.partId,
        partOptionId: s.partOptionId
      });

      // -------- Load cascading dropdowns --------
      if (s.structureId) {
        this.partService.getPartsByStructure(s.structureId).subscribe(res => {
          this.parts = res.data?.parts ?? [];
        });
      }

      if (s.partId) {
        this.partOptionService.getOptionsByPart(s.partId).subscribe(res => {
          this.partOptions = res.data?.partOptions ?? [];
        });
      }

      // -------- Metadata --------
      this.metadataPayload =
        s.metadata
          ?.filter(m => m.metadataAttributeId != null)
          .map(m => ({
            metadataAttributeId: m.metadataAttributeId!,
            valueIds: m.metadataAttributeValueId
              ? [m.metadataAttributeValueId]
              : [],
            valueText: m.valueText ?? undefined
          })) ?? [];
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
    if (!input.files?.length) return;

    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result as string);
    reader.readAsDataURL(this.selectedFile);
  }

  // ================= LOADERS (SAME AS CREATE) =================
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

    // -------- Metadata (replace-all) --------
    this.metadataPayload.forEach((m, i) => {
      formData.append(`Metadata[${i}].MetadataAttributeId`, m.metadataAttributeId.toString());

      m.valueIds?.forEach((v, j) => {
        formData.append(`Metadata[${i}].ValueIds[${j}]`, v.toString());
      });

      if (m.valueText) {
        formData.append(`Metadata[${i}].ValueText`, m.valueText);
      }
    });

    this.serviceService.updateService(this.serviceId, formData).subscribe({
      next: res => {
        this.isSubmitting = false;
        if (res.success) {
          alert('✅ Service updated successfully');
          this.router.navigate(['/admin/services']);
        } else {
          alert(res.message ?? 'Update failed');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.log(err)
        alert('Unexpected error');
      }
    });
  }
}
