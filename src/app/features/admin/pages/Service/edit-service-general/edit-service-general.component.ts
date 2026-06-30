import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
  selector: 'app-edit-service-general',
  templateUrl: './edit-service-general.component.html',
  styleUrls: ['./edit-service-general.component.scss'],
})
export class EditServiceGeneralComponent implements OnInit {
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
  existingImageUrl: string | null = null;

  pricingMode: 'Static' | 'Dynamic' = 'Static';

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
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.serviceId = Number(this.route.snapshot.paramMap.get('id'));
    this.buildForm();
    this.loadCategories();
    this.loadService();
    this.serviceForm.get('categoryId')?.disable();
    this.serviceForm.get('categoryTypeId')?.disable();
    this.serviceForm.get('structureId')?.disable();
    this.serviceForm.get('partId')?.disable();
    this.serviceForm.get('partOptionId')?.disable();
  }

  private buildForm(): void {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      baseCost: [0, [Validators.min(0)]],
      baseRate: [0, [Validators.min(0)]],
      materialWarrantyDuration: [0, [Validators.required, Validators.min(0)]],
      materialWarrantyUnit: ['Months', Validators.required],
      workmanshipWarrantyDuration: [
        0,
        [Validators.required, Validators.min(0)],
      ],
      workmanshipWarrantyUnit: ['Months', Validators.required],
      deliveryDays: [0, [Validators.required, Validators.min(0)]],
      labors: [0, [Validators.min(0)]],
      applyGlobalFees: [true],
      applyLogistics: [true],
      categoryId: [null],
      categoryTypeId: [null],
      structureId: [null],
      partId: [null],
      partOptionId: [null],
    });
  }
  getSelectedCategoryName(): string | null {
    const id = this.serviceForm?.get('categoryId')?.value;
    return this.categories.find((x) => x.id == id)?.name ?? null;
  }

  getSelectedCategoryTypeName(): string | null {
    const id = this.serviceForm?.get('categoryTypeId')?.value;
    return this.categoryTypes.find((x) => x.id == id)?.name ?? null;
  }

  getSelectedStructureName(): string | null {
    const id = this.serviceForm?.get('structureId')?.value;
    return this.structures.find((x) => x.id == id)?.name ?? null;
  }

  getSelectedPartName(): string | null {
    const id = this.serviceForm?.get('partId')?.value;
    return this.parts.find((x) => x.id == id)?.name ?? null;
  }

  getSelectedPartOptionName(): string | null {
    const id = this.serviceForm?.get('partOptionId')?.value;
    return this.partOptions.find((x) => x.id == id)?.name ?? null;
  }
  loadCategories(): void {
    this.categoryService.getAllCategories(true).subscribe({
      next: (res) => {
        this.categories = res.data?.categories ?? [];
      },
    });
  }

  private loadService(): void {
    this.serviceService.getServicesById(this.serviceId).subscribe({
      next: (res) => {
        if (!res.success || !res.data) return;

        const s: ServiceResponse = res.data;

        this.pricingMode = s.pricingMode === 1 ? 'Static' : 'Dynamic';
        this.existingImageUrl = (s as any).fileUrl ?? null;
        console.log(res);
        this.serviceForm.patchValue({
          name: s.name,
          description: s.description,
          baseCost: s.baseCost,
          baseRate: s.baseRate,
          workmanshipWarrantyUnit: s.workmanshipWarrantyUnit,
          workmanshipWarrantyDuration: s.workmanshipWarrantyDuration,
          materialWarrantyUnit: s.materialWarrantyUnit,
          materialWarrantyDuration: s.materialWarrantyDuration,
          deliveryDays: s.deliveryDays,
          labors: s.labors,
          applyGlobalFees: s.applyGlobalFees,
          applyLogistics: s.applyLogistics,
        });

        this.restoreHierarchy(s);
      },
      error: (err) => {
        this.toast.show(err.error?.message ?? 'Error loading service', 'error');
      },
    });
  }

  private restoreHierarchy(s: ServiceResponse): void {
    if (s.partOptionId) this.activeLinkage = 'PartOption';
    else if (s.partId) this.activeLinkage = 'Part';
    else this.activeLinkage = 'Structure';

    if (!s.structureId) return;

    this.structureService.getById(s.structureId).subscribe((structRes) => {
      const structure = structRes.data;
      if (!structure) return;

      this.categoryTypeService
        .getById(structure.typeId!)
        .subscribe((typeRes) => {
          const type = typeRes.data;
          if (!type) return;

          this.categoryService.getById(type.categoryId!).subscribe((catRes) => {
            const category = catRes.data;
            if (!category) return;

            this.categoryTypeService
              .getTypesByCategory(category.id)
              .subscribe((ctRes) => {
                this.categoryTypes = ctRes.data?.categoryTypes ?? [];

                this.structureService
                  .getStructuresByType(type.id)
                  .subscribe((stRes) => {
                    this.structures = stRes.data?.structures ?? [];

                    this.serviceForm.patchValue({
                      categoryId: category.id,
                      categoryTypeId: type.id,
                      structureId: structure.id,
                    });

                    if (s.partId) {
                      this.partService
                        .getPartsByStructure(structure.id)
                        .subscribe((pRes) => {
                          this.parts = pRes.data?.parts ?? [];
                          this.serviceForm.patchValue({ partId: s.partId });

                          if (s.partOptionId) {
                            this.partOptionService
                              .getOptionsByPart(s.partId!)
                              .subscribe((oRes) => {
                                this.partOptions = oRes.data?.partOptions ?? [];
                                this.serviceForm.patchValue({
                                  partOptionId: s.partOptionId,
                                });
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

  onCategoryChange(e: Event): void {
    const id = Number((e.target as HTMLSelectElement).value);
    if (!id) return;

    this.categoryTypeService.getTypesByCategory(id).subscribe({
      next: (res) => {
        this.categoryTypes = res.data?.categoryTypes ?? [];
        this.structures = [];
        this.parts = [];
        this.partOptions = [];

        this.serviceForm.patchValue({
          categoryTypeId: null,
          structureId: null,
          partId: null,
          partOptionId: null,
        });
      },
    });
  }

  onCategoryTypeChange(e: Event): void {
    const id = Number((e.target as HTMLSelectElement).value);
    if (!id) return;

    this.structureService.getStructuresByType(id).subscribe({
      next: (res) => {
        this.structures = res.data?.structures ?? [];
        this.parts = [];
        this.partOptions = [];

        this.serviceForm.patchValue({
          structureId: null,
          partId: null,
          partOptionId: null,
        });
      },
    });
  }

  onStructureChange(e: Event): void {
    const id = Number((e.target as HTMLSelectElement).value);
    if (!id) return;

    this.partService.getPartsByStructure(id).subscribe({
      next: (res) => {
        this.parts = res.data?.parts ?? [];
        this.partOptions = [];
        this.serviceForm.patchValue({
          partId: null,
          partOptionId: null,
        });
      },
    });
  }

  onPartChange(e: Event): void {
    const id = Number((e.target as HTMLSelectElement).value);
    if (!id) return;

    this.partOptionService.getOptionsByPart(id).subscribe({
      next: (res) => {
        this.partOptions = res.data?.partOptions ?? [];
        this.serviceForm.patchValue({
          partOptionId: null,
        });
      },
    });
  }

  setLinkage(link: 'Structure' | 'Part' | 'PartOption'): void {
    this.activeLinkage = link;

    this.serviceForm.patchValue({
      structureId: null,
      partId: null,
      partOptionId: null,
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result as string);
    reader.readAsDataURL(this.selectedFile);
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload = { ...this.serviceForm.getRawValue() };
    const formData = new FormData();

    // Only one linkage must be sent
    if (this.activeLinkage === 'Structure') {
      payload.structureId = payload.structureId || null;
      payload.partId = null;
      payload.partOptionId = null;
    } else if (this.activeLinkage === 'Part') {
      payload.structureId = null;
      payload.partId = payload.partId || null;
      payload.partOptionId = null;
    } else if (this.activeLinkage === 'PartOption') {
      payload.structureId = null;
      payload.partId = null;
      payload.partOptionId = payload.partOptionId || null;
    }

    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    formData.append('PricingMode', this.pricingMode);

    if (this.selectedFile) {
      formData.append('File', this.selectedFile);
    }
    console.log('Form', formData);
    this.serviceService
      .updateServiceGeneral(this.serviceId, formData)
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;

          if (res.success) {
            this.toast.show(
              res.message ?? 'Service updated successfully',
              'success',
            );
            this.router.navigate(['/admin/dashboard/Services']);
          } else {
            this.toast.show(res.message ?? 'Update failed', 'error');
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toast.show(err.error?.message ?? 'Update failed', 'error');
        },
      });
  }
}
