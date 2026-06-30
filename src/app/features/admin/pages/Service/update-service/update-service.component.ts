import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  MetadataTargetType,
  MetadataAssignmentItemRequest,
  MetadataDataType,
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
import {
  PricingInputBehavior,
  ServiceResponse,
} from '../../../../Models/service.Model';
import { ToastService } from '../../../../../shared/Services/toast.service';
import { PricingInputUI } from '../../../../Models/InputValueDto.model';
import { PricingValueUI } from '../create-service/create-service.component';

@Component({
  selector: 'app-update-service',
  templateUrl: './update-service.component.html',
  styleUrls: ['./update-service.component.scss'],
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
  requiredInputs: any[] = [];
  pricingMode: 'Static' | 'Dynamic' = 'Static';

  pricingInputs: PricingInputUI[] = [];
  inputValuesMap: Record<number, PricingValueUI[]> = {};

  PricingInputBehavior = PricingInputBehavior;
  MetadataDataType = MetadataDataType;

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
      partOptionId: [{ value: null, disabled: true }],
    });
  }

  // ================= LOAD SERVICE =================
  private loadService(): void {
    this.serviceService.getServicesById(this.serviceId).subscribe({
      next: (res) => {
        if (!res.success || !res.data) return;

        const s: ServiceResponse = res.data;
        this.pricingMode = s.pricingMode === 1 ? 'Static' : 'Dynamic';

        this.serviceForm.patchValue({
          name: s.name,
          description: s.description,

          pricingMode: s.pricingMode,
          baseCost: s.baseCost,
          baseRate: s.baseRate,

          materialWarrantyDuration: s.materialWarrantyDuration,
          materialWarrantyUnit: s.materialWarrantyUnit,
          workmanshipwarrantyDuration: s.workmanshipWarrantyDuration,
          workmanshipWarrantyUnit: s.workmanshipWarrantyUnit,
          deliveryDays: s.deliveryDays,
          labors: s.labors,

          applyGlobalFees: s.applyGlobalFees,
          applyLogistics: s.applyLogistics,
        });

        // 🔹 ADD THIS
        this.requiredInputs = s.requiredInputs ?? [];
        this.hydratePricingFromBackend(this.requiredInputs);

        this.restoreHierarchy(s);

        this.metadataPayload =
          s.metadata?.map((m) => ({
            metadataAttributeId: m.metadataAttributeId!,
            valueIds: m.metadataAttributeValueId
              ? [m.metadataAttributeValueId]
              : [],
            valueText: m.valueText ?? undefined,
          })) ?? [];

        console.log(this.serviceForm);
      },
      error: (err) => {
        this.toast.show(err.error?.message ?? 'Error loading service', 'error');
      },
    });
  }

  // ================= RESTORE HIERARCHY =================
  private restoreHierarchy(s: ServiceResponse): void {
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
              .subscribe((ct) => {
                this.categoryTypes = ct.data?.categoryTypes ?? [];

                this.structureService
                  .getStructuresByType(type.id)
                  .subscribe((st) => {
                    this.structures = st.data?.structures ?? [];

                    this.serviceForm.patchValue({
                      categoryId: category.id,
                      categoryTypeId: type.id,
                      structureId: structure.id,
                    });

                    if (s.partId) {
                      this.partService
                        .getPartsByStructure(structure.id)
                        .subscribe((p) => {
                          this.parts = p.data?.parts ?? [];
                          this.serviceForm.patchValue({ partId: s.partId });

                          if (s.partOptionId) {
                            this.partOptionService
                              .getOptionsByPart(s.partId!)
                              .subscribe((o) => {
                                this.partOptions = o.data?.partOptions ?? [];
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

  // ================= LOADERS =================
  loadCategories(): void {
    this.categoryService.getAllCategories(true).subscribe((res) => {
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
    reader.onload = () => (this.previewUrl = reader.result as string);
    reader.readAsDataURL(this.selectedFile);
  }

  // ================= SUBMIT =================
  onSubmit(): void {
    if (this.serviceForm.invalid) return;

    this.isSubmitting = true;

    // 🔥 CRITICAL: getRawValue to include disabled hierarchy
    const payload = this.serviceForm.getRawValue();
    console.log(payload);
    const formData = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        formData.append(k, v as any);
      }
    });
    formData.append('PricingMode', this.pricingMode);

    if (this.pricingMode === 'Dynamic') {
      let index = 0;

      this.pricingInputs.forEach((input) => {
        // RATE
        if (input.pricingBehavior === PricingInputBehavior.Rate) {
          const values = this.inputValuesMap[input.inputDefinitionId] || [];

          values.forEach((v) => {
            v.rates.forEach((rate) => {
              if (!rate.amount || rate.amount <= 0) return;

              formData.append(
                `PricingInputs[${index}].InputDefinitionId`,
                input.inputDefinitionId.toString(),
              );
              formData.append(
                `PricingInputs[${index}].InputValueId`,
                v.id.toString(),
              );
              formData.append(
                `PricingInputs[${index}].PricingBehavior`,
                input.pricingBehavior.toString(),
              );
              formData.append(
                `PricingInputs[${index}].Amount`,
                rate.amount.toString(),
              );
              formData.append(
                `PricingInputs[${index}].IsRequired`,
                String(input.isRequired),
              );
              formData.append(
                `PricingInputs[${index}].Priority`,
                input.priority.toString(),
              );

              if (
                rate.dependsOnInputValueId !== undefined &&
                rate.dependsOnInputValueId !== null
              ) {
                formData.append(
                  `PricingInputs[${index}].DependsOnInputValueId`,
                  rate.dependsOnInputValueId.toString(),
                );
              } else {
                // 🔥 Explicitly clear dependency
                formData.append(
                  `PricingInputs[${index}].DependsOnInputValueId`,
                  '',
                );
              }

              index++;
            });
          });
        }

        // FIXED
        if (input.pricingBehavior === PricingInputBehavior.Fixed) {
          if (!input.amount || input.amount <= 0) return;

          formData.append(
            `PricingInputs[${index}].InputDefinitionId`,
            input.inputDefinitionId.toString(),
          );
          formData.append(
            `PricingInputs[${index}].PricingBehavior`,
            input.pricingBehavior.toString(),
          );
          formData.append(
            `PricingInputs[${index}].Amount`,
            input.amount.toString(),
          );
          formData.append(
            `PricingInputs[${index}].IsRequired`,
            String(input.isRequired),
          );
          formData.append(
            `PricingInputs[${index}].Priority`,
            input.priority.toString(),
          );

          index++;
        }

        // DIMENSIONAL
        if (input.pricingBehavior === PricingInputBehavior.Dimensional) {
          formData.append(
            `PricingInputs[${index}].InputDefinitionId`,
            input.inputDefinitionId.toString(),
          );
          formData.append(
            `PricingInputs[${index}].PricingBehavior`,
            input.pricingBehavior.toString(),
          );
          formData.append(
            `PricingInputs[${index}].Amount`,
            input.amount.toString(),
          );
          formData.append(
            `PricingInputs[${index}].IsRequired`,
            String(input.isRequired),
          );
          formData.append(
            `PricingInputs[${index}].Priority`,
            input.priority.toString(),
          );

          index++;
        }
      });
    }

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.metadataPayload.forEach((m, i) => {
      formData.append(
        `Metadata[${i}].MetadataAttributeId`,
        m.metadataAttributeId.toString(),
      );
      m.valueIds?.forEach((v, j) =>
        formData.append(`Metadata[${i}].ValueIds[${j}]`, v.toString()),
      );
      if (m.valueText) {
        formData.append(`Metadata[${i}].ValueText`, m.valueText);
      }
    });

    this.serviceService.updateService(this.serviceId, formData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toast.show('Service updated successfully', 'success');
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

  private hydratePricingFromBackend(requiredInputs: any[]): void {
    this.pricingInputs = [];
    this.inputValuesMap = {};

    const inputMap = new Map<number, PricingInputUI>();

    requiredInputs.forEach((rule) => {
      // 1️⃣ Create / reuse PricingInputUI (same as Create)
      let input = inputMap.get(rule.inputDefinitionId);

      if (!input) {
        input = {
          inputDefinitionId: rule.inputDefinitionId,
          label: rule.label,
          code: rule.code,
          dataType: rule.dataType,
          pricingBehavior: rule.pricingBehavior,
          amount: 0,
          isRequired: rule.isRequired,
          priority: rule.priority,
        };

        inputMap.set(rule.inputDefinitionId, input);
        this.pricingInputs.push(input);
      }

      // 2️⃣ Handle Select inputs (values + rates)
      if (rule.inputValueId) {
        if (!this.inputValuesMap[rule.inputDefinitionId]) {
          this.inputValuesMap[rule.inputDefinitionId] = [];
        }

        let value = this.inputValuesMap[rule.inputDefinitionId].find(
          (v) => v.id === rule.inputValueId,
        );

        if (!value) {
          value = {
            id: rule.inputValueId,
            value: rule.inputValueCode,
            displayName: rule.inputValueLabel,
            rates: [],
          };

          this.inputValuesMap[rule.inputDefinitionId].push(value);
        }

        value.rates.push({
          amount: rule.amount,
          dependsOnInputValueId: rule.dependsOnInputValueId,
        });
      }

      // 3️⃣ Fixed / Dimensional (no value)
      if (!rule.inputValueId) {
        input.amount = rule.amount;
      }
    });
  }

  getDependencyOptions(currentInput: PricingInputUI): {
    parent: PricingInputUI;
    value: any;
  }[] {
    const options: { parent: PricingInputUI; value: any }[] = [];

    this.pricingInputs.forEach((parent) => {
      // Cannot depend on itself
      if (parent.inputDefinitionId === currentInput.inputDefinitionId) return;

      // Only Select inputs
      if (parent.dataType !== MetadataDataType.Select) return;

      const values = this.inputValuesMap[parent.inputDefinitionId] || [];

      // 🔑 If admin selected a preview value → only show that value
      if (parent.previewSelectedValueId) {
        const matched = values.find(
          (v) => v.id === parent.previewSelectedValueId,
        );
        if (matched) {
          options.push({ parent, value: matched });
        }
        return;
      }

      // Otherwise show all values
      values.forEach((v) => options.push({ parent, value: v }));
    });

    return options;
  }
  getPricingTypeLabel(rule: PricingInputUI): string {
    switch (rule.pricingBehavior) {
      case PricingInputBehavior.Rate:
        return 'Rate';
      case PricingInputBehavior.Fixed:
        return 'Fixed';
      case PricingInputBehavior.Dimensional:
        return 'Dimensional';
      default:
        return '';
    }
  }
}
