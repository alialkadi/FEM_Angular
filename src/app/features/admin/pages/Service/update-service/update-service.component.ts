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
import { ToastService } from '../../../../../shared/Services/toast.service';

@Component({
  selector: 'app-update-service',
  templateUrl: './update-service.component.html',
  styleUrls: ['./update-service.component.scss']
})
export class UpdateServiceComponent implements OnInit {

  serviceId!: number;
  serviceForm!: FormGroup;
  isSubmitting = false;

  activeLinkage: 'Structure' | 'Part' | 'PartOption' = 'Structure';

  categories: Category[] = [];
  categoryTypes: CategoryType[] = [];
  structures: Structure[] = [];
  parts: Part[] = [];
  partOptions: PartOption[] = [];

  selectedFile: File | null = null;
  previewUrl: string | null = null;

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
    private partOptionService: PartOptionService,
    private toast: ToastService
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
      baseCost: [0, [Validators.required, Validators.min(0)]],
      warrantyDuration: [0, [Validators.required, Validators.min(0)]],
      warrantyUnit: ['Months', Validators.required],
      deliveryDays: [0, [Validators.required, Validators.min(0)]],
      labors: [0, Validators.min(0)],

      categoryId: [{ value: null, disabled: true }],
      categoryTypeId: [{ value: null, disabled: true }],
      structureId: [{ value: null, disabled: true }],
      partId: [{ value: null, disabled: true }],
      partOptionId: [{ value: null, disabled: true }]
    });
  }

  // ================= LOAD SERVICE =================
  private loadService(): void {
    this.serviceService.getServicesById(this.serviceId).subscribe({
      next: res => {
        if (!res.success || !res.data) return;

        const s: ServiceResponse = res.data;

        if (s.partOptionId) this.activeLinkage = 'PartOption';
        else if (s.partId) this.activeLinkage = 'Part';
        else this.activeLinkage = 'Structure';

        this.serviceForm.patchValue({
          name: s.name,
          description: s.description,
          baseCost: s.baseCost,
          warrantyDuration: s.warrantyDuration,
          warrantyUnit: s.warrantyUnit,
          deliveryDays: s.deliveryDays,
          labors: s.labors
        });

        this.restoreHierarchy(s);

        this.metadataPayload =
          s.metadata?.map(m => ({
            metadataAttributeId: m.metadataAttributeId!,
            valueIds: m.metadataAttributeValueId ? [m.metadataAttributeValueId] : [],
            valueText: m.valueText ?? undefined
          })) ?? [];
      },
      error: err => {
        this.toast.show(err.error?.message ?? 'Error loading service', 'error');
      }
    });
  }

  // ================= RESTORE HIERARCHY =================
  private restoreHierarchy(s: ServiceResponse): void {
    if (!s.structureId) return;

    this.structureService.getById(s.structureId).subscribe(structRes => {
      const structure = structRes.data;
      if (!structure) return;

      this.categoryTypeService.getById(structure.typeId!).subscribe(typeRes => {
        const type = typeRes.data;
        if (!type) return;

        this.categoryService.getById(type.categoryId!).subscribe(catRes => {
          const category = catRes.data;
          if (!category) return;

          this.categoryTypeService.getTypesByCategory(category.id).subscribe(ct => {
            this.categoryTypes = ct.data?.categoryTypes ?? [];

            this.structureService.getStructuresByType(type.id).subscribe(st => {
              this.structures = st.data?.structures ?? [];

              this.serviceForm.patchValue({
                categoryId: category.id,
                categoryTypeId: type.id,
                structureId: structure.id
              });

              if (s.partId) {
                this.partService.getPartsByStructure(structure.id).subscribe(p => {
                  this.parts = p.data?.parts ?? [];
                  this.serviceForm.patchValue({ partId: s.partId });

                  if (s.partOptionId) {
                    this.partOptionService.getOptionsByPart(s.partId!).subscribe(o => {
                      this.partOptions = o.data?.partOptions ?? [];
                      this.serviceForm.patchValue({ partOptionId: s.partOptionId });
                    });
                  }
                });
              }
            });
          });
        });
      });
    });
  }

  // ================= LOADERS =================
  loadCategories(): void {
    this.categoryService.getAllCategories(true).subscribe(res => {
      this.categories = res.data?.categories ?? [];
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
    reader.onload = () => this.previewUrl = reader.result as string;
    reader.readAsDataURL(this.selectedFile);
  }

  // ================= SUBMIT =================
  onSubmit(): void {
    if (this.serviceForm.invalid) return;

    this.isSubmitting = true;

    // 🔥 CRITICAL: getRawValue to include disabled hierarchy
    const payload = this.serviceForm.getRawValue();

    const formData = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        formData.append(k, v as any);
      }
    });

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.metadataPayload.forEach((m, i) => {
      formData.append(`Metadata[${i}].MetadataAttributeId`, m.metadataAttributeId.toString());
      m.valueIds?.forEach((v, j) =>
        formData.append(`Metadata[${i}].ValueIds[${j}]`, v.toString())
      );
      if (m.valueText) {
        formData.append(`Metadata[${i}].ValueText`, m.valueText);
      }
    });

    this.serviceService.updateService(this.serviceId, formData).subscribe({
      next: res => {
        this.isSubmitting = false;
        if (res.success) {
          this.toast.show('Service updated successfully', 'success');
          this.router.navigate(['/admin/dashboard/Services']);
        } else {
          this.toast.show(res.message ?? 'Update failed', 'error');
        }
      },
      error: err => {
        this.isSubmitting = false;
        this.toast.show(err.error?.message ?? 'Update failed', 'error');
      }
    });
  }
}
