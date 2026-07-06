import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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
import { ToastService } from '../../../../../shared/Services/toast.service';
import { InputDefinitionService } from '../../../Services/input-definition.service';
import { InputValueService } from '../../../Services/input-value.service';
import { PricingInputUI } from '../../../../Models/InputValueDto.model';
import {
  CalculationRuleFactorConditionUI,
  CalculationRuleFactorUI,
  CalculationRuleUI,
  DecisionRuleUI,
  InputDefinitionDto,
  PricingInputBehavior,
  ServiceCalculationRuleType,
  ServiceDecisionRuleType,
} from '../../../../Models/service.Model';

type PricingInputViewModel = PricingInputUI & {
  selectedInputValueId?: number | null;
};

@Component({
  selector: 'app-create-service',
  templateUrl: './create-service.component.html',
  styleUrls: ['./create-service.component.scss'],
})
export class CreateServiceComponent implements OnInit {
  [x: string]: any;
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
  // ================= PRICING =================
  pricingMode: 'Static' | 'Dynamic' = 'Static';

  pricingInputs: PricingInputViewModel[] = [];

  inputDefinitions: any[] = [];
  // All backend values for each select input. Used only by the add-value dropdown.
  availableInputValuesMap: Record<number, PricingValueUI[]> = {};

  // Only values the admin explicitly added to this service.
  inputValuesMap: Record<number, PricingValueUI[]> = {};

  previewBaseCost = 0;
  PricingInputBehavior = PricingInputBehavior;
  MetadataDataType = MetadataDataType;
  // ================= CALCULATION / DECISION RULES =================
  calculationRules: CalculationRuleUI[] = [];
  decisionRules: DecisionRuleUI[] = [];

  ServiceCalculationRuleType = ServiceCalculationRuleType;
  ServiceDecisionRuleType = ServiceDecisionRuleType;
  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private categoryService: CategoryService,
    private categoryTypeService: CategoryTypeService,
    private structureService: StructureService,
    private partService: PartService,
    private partOptionService: PartOptionService,
    private inputDefinitionService: InputDefinitionService,
    private inputValueService: InputValueService,
    private toast: ToastService,
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.buildForm();
    this.loadCategories();
    this.loadInputDefinitions();
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
      baseRate: [0, [Validators.required, Validators.min(0)]],
      materialWarrantyDuration: [0, [Validators.required, Validators.min(0)]],
      materialWarrantyUnit: ['Years', Validators.required],
      workmanshipWarrantyDuration: [
        0,
        [Validators.required, Validators.min(0)],
      ],
      workmanshipWarrantyUnit: ['Years', Validators.required],
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

  // ================= METADATA =================
  toggleMetadata(): void {
    this.showMetadata = !this.showMetadata;
  }

  onMetadataChange(items: MetadataAssignmentItemRequest[]): void {
    this.metadataPayload = items;
    console.log(this.metadataPayload);
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
    this.categoryService.getAllCategories(true).subscribe({
      next: (res) => {
        if (res.success && res.data?.categories) {
          this.categories = res.data.categories;
        }
      },
      error: (err) => {
        console.log(err);
        this.toast.show(
          err.error.message ?? 'Error loading categories',
          'error',
        );
      },
    });
  }

  onCategoryChange(e: Event): void {
    const id = Number((e.target as HTMLSelectElement).value);
    if (!id) return;

    this.categoryTypeService.getTypesByCategory(id).subscribe({
      next: (res) => {
        if (res.success && res.data?.categoryTypes) {
          this.categoryTypes = res.data.categoryTypes;
          this.structures = [];
          this.parts = [];
          this.partOptions = [];
        }
      },
      error: (err) => {
        this.toast.show(
          err.error.message ?? 'Error loading category types',
          'error',
        );
      },
    });
  }

  onCategoryTypeChange(e: Event): void {
    const id = Number((e.target as HTMLSelectElement).value);
    if (!id) return;

    this.structureService.getStructuresByType(id).subscribe({
      next: (res) => {
        if (res.success && res.data?.structures) {
          this.structures = res.data.structures;
          this.parts = [];
          this.partOptions = [];
        }
      },
      error: (err) => {
        console.log(err);
        this.toast.show(
          err.error.message ?? 'Error loading structures',
          'error',
        );
      },
    });
  }

  onStructureChange(e: Event): void {
    const id = Number((e.target as HTMLSelectElement).value);
    if (!id) return;

    this.partService.getPartsByStructure(id).subscribe({
      next: (res) => {
        if (res.success && res.data?.parts) {
          this.parts = res.data.parts;
          this.partOptions = [];
        }
      },
      error: (err) => {
        this.toast.show(err.error.message ?? 'Error loading parts', 'error');
      },
    });
  }

  onPartChange(e: Event): void {
    const id = Number((e.target as HTMLSelectElement).value);
    if (!id) return;

    this.partOptionService.getOptionsByPart(id).subscribe({
      next: (res) => {
        if (res.success && res.data?.partOptions) {
          this.partOptions = res.data.partOptions;
        }
      },
      error: (err) => {
        this.toast.show(
          err.error.message ?? 'Error loading part options',
          'error',
        );
      },
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
      categoryTypeId: null,
    });
  }

  // ================= SUBMIT =================
  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    if (!this.validateNumericMinMax()) {
      this.isSubmitting = false;
      return;
    }
    if (!this.validateCalculationRules()) {
      this.isSubmitting = false;
      return;
    }
    const formValue = this.serviceForm.getRawValue();
    const formData = new FormData();

    // =========================
    // BASIC SERVICE DATA
    // =========================
    formData.append('Name', formValue.name ?? '');
    formData.append('Description', formValue.description ?? '');
    formData.append('Series', formValue.series ?? '');
    formData.append('LockingPoint', formValue.lockingPoint ?? '');
    formData.append('PointNumber', formValue.pointNumber ?? '');
    formData.append('Labors', String(formValue.labors ?? 0));
    formData.append('ApplyGlobalFees', String(!!formValue.applyGlobalFees));
    formData.append('ApplyLogistics', String(!!formValue.applyLogistics));
    formData.append(
      'MaterialWarrantyDuration',
      String(formValue.materialWarrantyDuration ?? 0),
    );

    formData.append(
      'MaterialWarrantyUnit',
      formValue.materialWarrantyUnit ?? 'Years',
    );

    formData.append(
      'WorkmanshipWarrantyDuration',
      String(formValue.workmanshipWarrantyDuration ?? 0),
    );

    formData.append(
      'WorkmanshipWarrantyUnit',
      formValue.workmanshipWarrantyUnit ?? 'Years',
    );
    formData.append('DeliveryDays', String(formValue.deliveryDays ?? 0));

    // =========================
    // LINKAGE
    // =========================
    if (this.activeLinkage === 'Structure' && formValue.structureId) {
      formData.append('StructureId', String(formValue.structureId));
    }

    if (this.activeLinkage === 'Part' && formValue.partId) {
      formData.append('PartId', String(formValue.partId));
    }

    if (this.activeLinkage === 'PartOption' && formValue.partOptionId) {
      formData.append('PartOptionId', String(formValue.partOptionId));
    }

    // =========================
    // PRICING MODE
    // =========================
    formData.append('PricingMode', this.pricingMode);

    if (this.pricingMode === 'Static') {
      formData.append('BaseCost', formValue.baseCost);
    } else {
      formData.append('BaseCost', '0');

      formData.append('BaseRate', String(formValue.baseRate ?? 0));
    }

    // =========================
    // FILE
    // =========================
    if (this.selectedFile) {
      formData.append('File', this.selectedFile);
    }

    // =========================
    // DYNAMIC PRICING INPUTS
    // =========================
    if (this.pricingMode === 'Dynamic') {
      let index = 0;

      for (const input of this.pricingInputs) {
        const isSelect = input.dataType === this.MetadataDataType.Select;
        const isText = input.dataType === this.MetadataDataType.Text;
        const isNumber = input.dataType === this.MetadataDataType.Number;
        const isBoolean = input.dataType === this.MetadataDataType.Boolean;

        const behavior = input.pricingBehavior;
        const values = this.inputValuesMap[input.inputDefinitionId] || [];

        // TEXT / NUMBER NONE / BOOLEAN NONE
        if (
          (isText || isNumber || isBoolean) &&
          behavior === this.PricingInputBehavior.None
        ) {
          const payload: any = {
            inputDefinitionId: input.inputDefinitionId,
            pricingBehavior: behavior,
            amount: 0,
            isRequired: !!input.isRequired,
            priority: input.priority ?? 0,
            min: isNumber ? (input.min ?? null) : null,
            max: isNumber ? (input.max ?? null) : null,
          };

          this.applyDependencyToPayload(payload, input.dependsOnInputValueId);
          this.appendPricingInput(formData, index, payload);
          index++;
          continue;
        }

        // NUMBER DIMENSIONAL - NO DEPENDENCY
        if (isNumber && behavior === this.PricingInputBehavior.Dimensional) {
          this.appendPricingInput(formData, index, {
            inputDefinitionId: input.inputDefinitionId,
            pricingBehavior: behavior,
            amount: 0,
            isRequired: !!input.isRequired,
            priority: input.priority ?? 0,
            min: input.min ?? null,
            max: input.max ?? null,
          });

          index++;
          continue;
        }

        // NUMBER / BOOLEAN FIXED OR RATE
        if (
          (isNumber || isBoolean) &&
          (behavior === this.PricingInputBehavior.Fixed ||
            behavior === this.PricingInputBehavior.Rate)
        ) {
          const payload: any = {
            inputDefinitionId: input.inputDefinitionId,
            pricingBehavior: behavior,
            amount: Number(input.amount ?? 0),
            isRequired: !!input.isRequired,
            priority: input.priority ?? 0,
            min: isNumber ? (input.min ?? null) : null,
            max: isNumber ? (input.max ?? null) : null,
          };

          this.applyDependencyToPayload(payload, input.dependsOnInputValueId);
          this.appendPricingInput(formData, index, payload);
          index++;
          continue;
        }

        // SELECT + NONE / FIXED / RATE
        if (isSelect && behavior !== this.PricingInputBehavior.Dimensional) {
          for (const v of values) {
            const rows = Array.isArray(v.rates) ? v.rates : [];

            for (const row of rows) {
              const payload: any = {
                inputDefinitionId: input.inputDefinitionId,
                inputValueId: v.id,
                pricingBehavior: behavior,
                amount:
                  behavior === this.PricingInputBehavior.None
                    ? 0
                    : Number(row.amount ?? 0),
                isRequired: !!input.isRequired,
                priority: input.priority ?? 0,
              };

              this.applyDependencyToPayload(payload, row.dependsOnInputValueId);

              this.appendPricingInput(formData, index, payload);
              index++;
            }
          }

          continue;
        }
      }
    }
    if (this.pricingMode === 'Dynamic') {
      this.appendCalculationRules(formData);
      this.appendDecisionRules(formData);
    }
    // =========================
    // SEND
    // =========================
    this.serviceService.CreateService(formData).subscribe({
      next: (res) => {
        this.isSubmitting = false;

        if (res.success) {
          // adjust to your current success handling
          this.toast?.show?.(res.message || 'Service created successfully.');
          this.serviceForm.reset();
          this.pricingInputs = [];
          this.availableInputValuesMap = {};
          this.inputValuesMap = {};
          this.previewUrl = null;
          this.selectedFile = null;
          this.calculationRules = [];
          this.decisionRules = [];
          this.pricingMode = 'Static';
        } else {
          this.toast?.show?.(res.message || 'Failed to create service.');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast?.show?.(err?.error?.message || 'Failed to create service.');
        console.error(err);
      },
    });
  }

  private appendPricingInput(
    formData: FormData,
    index: number,
    item: {
      inputDefinitionId: number;
      inputValueId?: number;
      pricingBehavior: number;
      amount: number;
      isRequired: boolean;
      priority: number;
      dependsOnInputDefinitionId?: number;
      dependsOnInputValueId?: number;
      min?: number | null;
      max?: number | null;
    },
  ): void {
    formData.append(
      `PricingInputs[${index}].InputDefinitionId`,
      String(item.inputDefinitionId),
    );

    if (item.inputValueId != null) {
      formData.append(
        `PricingInputs[${index}].InputValueId`,
        String(item.inputValueId),
      );
    }

    formData.append(
      `PricingInputs[${index}].PricingBehavior`,
      String(item.pricingBehavior),
    );

    formData.append(`PricingInputs[${index}].Amount`, String(item.amount));

    formData.append(
      `PricingInputs[${index}].IsRequired`,
      String(item.isRequired),
    );

    formData.append(`PricingInputs[${index}].Priority`, String(item.priority));
    if (item.min != null) {
      formData.append(`PricingInputs[${index}].Min`, String(item.min));
    }

    if (item.max != null) {
      formData.append(`PricingInputs[${index}].Max`, String(item.max));
    }
    if (item.dependsOnInputDefinitionId != null) {
      formData.append(
        `PricingInputs[${index}].DependsOnInputDefinitionId`,
        String(item.dependsOnInputDefinitionId),
      );
    }

    if (item.dependsOnInputValueId != null) {
      formData.append(
        `PricingInputs[${index}].DependsOnInputValueId`,
        String(item.dependsOnInputValueId),
      );
    }
  }
  // onSubmit(): void {
  //   if (this.serviceForm.invalid) {
  //     this.serviceForm.markAllAsTouched();
  //     return;
  //   }

  //   this.isSubmitting = true;
  //   const payload = { ...this.serviceForm.value };

  //   // Enforce single linkage
  //   if (this.activeLinkage === 'Structure') {
  //     payload.partId = null;
  //     payload.partOptionId = null;
  //   } else if (this.activeLinkage === 'Part') {
  //     payload.structureId = null;
  //     payload.partOptionId = null;
  //   } else {
  //     payload.structureId = null;
  //     payload.partId = null;
  //   }

  //   const formData = new FormData();

  //   Object.keys(payload).forEach((key) => {
  //     if (payload[key] !== null && payload[key] !== undefined) {
  //       formData.append(key, payload[key]);
  //     }
  //   });

  //   if (this.selectedFile) {
  //     formData.append('file', this.selectedFile);
  //   }
  //   formData.append('PricingMode', this.pricingMode);

  //   // ✅ METADATA (CORRECT FORM-DATA BINDING)
  //   this.metadataPayload.forEach((m, i) => {
  //     formData.append(
  //       `Metadata[${i}].MetadataAttributeId`,
  //       m.metadataAttributeId.toString(),
  //     );

  //     if (m.valueIds?.length) {
  //       m.valueIds.forEach((v, j) => {
  //         formData.append(`Metadata[${i}].ValueIds[${j}]`, v.toString());
  //       });
  //     }

  //     if (m.valueText !== null && m.valueText !== undefined) {
  //       formData.append(
  //         `Metadata[${i}].ValueText`,
  //         m.valueText === '' ? ' ' : m.valueText,
  //       );
  //     }
  //   });
  //   if (this.pricingMode === 'Dynamic') {
  //     let index = 0;

  //     this.pricingInputs.forEach((input) => {
  //       const isSelect = input.dataType === MetadataDataType.Select;
  //       const values = this.inputValuesMap[input.inputDefinitionId] || [];

  //       // 1) DIMENSIONAL: save rule only, no preview/test value
  //       if (input.pricingBehavior === PricingInputBehavior.Dimensional) {
  //         formData.append(
  //           `PricingInputs[${index}].InputDefinitionId`,
  //           input.inputDefinitionId.toString(),
  //         );
  //         formData.append(
  //           `PricingInputs[${index}].PricingBehavior`,
  //           input.pricingBehavior.toString(),
  //         );
  //         formData.append(`PricingInputs[${index}].Amount`, '0');
  //         formData.append(
  //           `PricingInputs[${index}].IsRequired`,
  //           String(input.isRequired),
  //         );
  //         formData.append(
  //           `PricingInputs[${index}].Priority`,
  //           input.priority.toString(),
  //         );
  //         index++;
  //         return;
  //       }

  //       // 2) SELECT + RATE / FIXED
  //       if (isSelect) {
  //         values.forEach((v) => {
  //           v.rates.forEach((row) => {
  //             if (row.amount == null || row.amount <= 0) return;

  //             formData.append(
  //               `PricingInputs[${index}].InputDefinitionId`,
  //               input.inputDefinitionId.toString(),
  //             );
  //             formData.append(
  //               `PricingInputs[${index}].InputValueId`,
  //               v.id.toString(),
  //             );
  //             formData.append(
  //               `PricingInputs[${index}].PricingBehavior`,
  //               input.pricingBehavior.toString(),
  //             );
  //             formData.append(
  //               `PricingInputs[${index}].Amount`,
  //               row.amount.toString(),
  //             );
  //             formData.append(
  //               `PricingInputs[${index}].IsRequired`,
  //               String(input.isRequired),
  //             );
  //             formData.append(
  //               `PricingInputs[${index}].Priority`,
  //               input.priority.toString(),
  //             );

  //             if (
  //               input.pricingBehavior === PricingInputBehavior.Rate &&
  //               row.dependsOnValueId
  //             ) {
  //               const parent = this.findParentByValue(row.dependsOnValueId);
  //               formData.append(
  //                 `PricingInputs[${index}].DependsOnInputDefinitionId`,
  //                 parent.inputDefinitionId.toString(),
  //               );
  //               formData.append(
  //                 `PricingInputs[${index}].DependsOnInputValueId`,
  //                 row.dependsOnValueId.toString(),
  //               );
  //             }

  //             index++;
  //           });
  //         });

  //         return;
  //       }

  //       // 3) NON-SELECT + RATE / FIXED
  //       if (
  //         input.pricingBehavior === PricingInputBehavior.Rate ||
  //         input.pricingBehavior === PricingInputBehavior.None ||
  //         input.pricingBehavior === PricingInputBehavior.Fixed
  //       ) {
  //         if (input.amount == null || input.amount <= 0) return;

  //         formData.append(
  //           `PricingInputs[${index}].InputDefinitionId`,
  //           input.inputDefinitionId.toString(),
  //         );
  //         formData.append(
  //           `PricingInputs[${index}].PricingBehavior`,
  //           input.pricingBehavior.toString(),
  //         );
  //         formData.append(
  //           `PricingInputs[${index}].Amount`,
  //           input.amount.toString(),
  //         );
  //         formData.append(
  //           `PricingInputs[${index}].IsRequired`,
  //           String(input.isRequired),
  //         );
  //         formData.append(
  //           `PricingInputs[${index}].Priority`,
  //           input.priority.toString(),
  //         );
  //         index++;
  //       }
  //     });
  //   }

  //   this.serviceService.CreateService(formData).subscribe({
  //     next: (res) => {
  //       console.log(formData);
  //       this.isSubmitting = false;
  //       console.log(formData);
  //       if (res.success) {
  //         this.toast.show(
  //           res.message ?? 'Service created successfully',
  //           'success',
  //         );
  //         this.reset();
  //       } else {
  //         this.toast.show(res.message ?? 'Failed to create service', 'error');
  //       }
  //     },
  //     error: (err) => {
  //       this.isSubmitting = false;
  //       this.toast.show(
  //         err.error.message ?? 'Failed to create service',
  //         'error',
  //       );
  //     },
  //   });
  // }

  // private findParentByValue(valueId: number): PricingInputUI {
  //   return this.pricingInputs.find((p) =>
  //     this.inputValuesMap[p.inputDefinitionId]?.some((v) => v.id === valueId),
  //   )!;
  // }
  private findParentByValue(valueId?: number): PricingInputUI | undefined {
    if (!valueId) return undefined;

    return this.pricingInputs.find((input) =>
      (this.inputValuesMap[input.inputDefinitionId] ?? []).some(
        (value) => value.id === Number(valueId),
      ),
    );
  }
  private applyDependencyToPayload(
    payload: any,
    dependsOnValueId?: number,
  ): void {
    if (!dependsOnValueId) return;

    const parent = this.findParentByValue(dependsOnValueId);

    if (!parent) return;

    payload.dependsOnInputDefinitionId = parent.inputDefinitionId;
    payload.dependsOnInputValueId = dependsOnValueId;
  }
  private reset(): void {
    this.serviceForm.reset();
    this.selectedFile = null;
    this.previewUrl = null;
    this.metadataPayload = [];
    this.showMetadata = false;
    this.metadataTargetId = 0;
  }

  ///////////////////////////////////////

  private loadInputDefinitions(): void {
    this.inputDefinitionService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.inputDefinitions = res.data;
        }
      },
      error: () => {
        this.toast.show('Failed to load pricing inputs', 'error');
      },
    });
  }
  addPricingInput(def: InputDefinitionDto): void {
    if (this.pricingInputs.some((x) => x.inputDefinitionId === def.id)) {
      this.toast.show('This input is already added.', 'error');
      return;
    }

    const input: PricingInputViewModel = {
      inputDefinitionId: def.id,
      label: def.label,
      code: def.code,
      dataType: def.dataType,
      pricingBehavior: def.pricingBehavior,
      amount: 0,
      isRequired: true,
      priority: this.pricingInputs.length + 1,
      min: def.dataType === MetadataDataType.Number ? null : undefined,
      max: def.dataType === MetadataDataType.Number ? null : undefined,
    };

    if (def.dataType === MetadataDataType.Select) {
      input.selectedInputValueId = null;
    }

    this.pricingInputs.push(input);

    if (def.dataType === MetadataDataType.Select) {
      this.inputValuesMap[def.id] = this.inputValuesMap[def.id] ?? [];
      this.loadInputValues(def.id, def.pricingBehavior);
    }
  }
  private validateNumericMinMax(): boolean {
    for (const input of this.pricingInputs) {
      if (input.dataType !== this.MetadataDataType.Number) {
        input.min = undefined;
        input.max = undefined;
        continue;
      }

      if (
        input.min != null &&
        input.max != null &&
        Number(input.min) > Number(input.max)
      ) {
        this.toast.show(
          `Minimum value cannot be greater than maximum value for "${input.label}".`,
          'error',
        );
        return false;
      }
    }

    return true;
  }
  onAddInputChange(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    if (!select || !select.value) return;

    const definitionId = Number(select.value);
    const def = this.inputDefinitions.find((d) => d.id === definitionId);
    if (!def) return;

    this.addPricingInput(def);
  }
  addRateRow(value: PricingValueUI): void {
    value.rates.push({
      dependsOnInputDefinitionId: undefined,
      dependsOnInputValueId: undefined,
      amount: 0,
    });
  }
  removeRateRow(value: PricingValueUI, index: number): void {
    value.rates.splice(index, 1);
    this.calculatePreview();
  }

  removePricingInput(index: number): void {
    const removed = this.pricingInputs[index];

    if (removed) {
      const removedValueIds = (
        this.inputValuesMap[removed.inputDefinitionId] ?? []
      ).map((x) => x.id);

      delete this.inputValuesMap[removed.inputDefinitionId];
      this.cleanupDependencyReferences(removedValueIds);
    }

    this.pricingInputs.splice(index, 1);

    this.pricingInputs.forEach((input, i) => {
      input.priority = i + 1;
    });

    this.calculatePreview();
  }
  private loadInputValues(
    definitionId: number,
    behavior: PricingInputBehavior,
  ): void {
    if (this.availableInputValuesMap[definitionId]) return;

    this.inputValueService.getByInputDefinition(definitionId).subscribe({
      next: (res) => {
        const raw = Array.isArray(res.data)
          ? res.data
          : (res.data?.values ?? res.data?.inputValues ?? []);

        this.availableInputValuesMap[definitionId] = raw.map(
          (v: PricingValueUI) => this.createPricingValueRow(v),
        );

        // Keep selected values empty until the admin adds values manually.
        this.inputValuesMap[definitionId] =
          this.inputValuesMap[definitionId] ?? [];
      },
      error: () => {
        this.toast.show('Failed to load input values', 'error');
      },
    });
  }

  private createPricingValueRow(value: PricingValueUI): PricingValueUI {
    return {
      ...value,
      amount: 0,
      dependsOnValueId: undefined,
      rates: [
        {
          dependsOnInputDefinitionId: undefined,
          dependsOnInputValueId: undefined,
          amount: 0,
        },
      ],
    };
  }

  getSelectedValuesForInput(input: PricingInputViewModel): PricingValueUI[] {
    return this.inputValuesMap[input.inputDefinitionId] ?? [];
  }

  getAvailableValuesToAdd(input: PricingInputViewModel): PricingValueUI[] {
    const availableValues =
      this.availableInputValuesMap[input.inputDefinitionId] ?? [];

    const selectedValueIds = new Set(
      this.getSelectedValuesForInput(input).map((x) => x.id),
    );

    return availableValues.filter((value) => !selectedValueIds.has(value.id));
  }

  addSelectedValueToInput(input: PricingInputViewModel): void {
    const selectedValueId = Number(input.selectedInputValueId);

    if (!selectedValueId) return;

    const value = (
      this.availableInputValuesMap[input.inputDefinitionId] ?? []
    ).find((x) => x.id === selectedValueId);

    if (!value) {
      this.toast.show('Selected value was not found.', 'error');
      return;
    }

    const selectedValues = (this.inputValuesMap[input.inputDefinitionId] =
      this.inputValuesMap[input.inputDefinitionId] ?? []);

    if (selectedValues.some((x) => x.id === selectedValueId)) {
      input.selectedInputValueId = null;
      return;
    }

    selectedValues.push(this.createPricingValueRow(value));
    input.selectedInputValueId = null;

    this.calculatePreview();
  }

  removeSelectedInputValue(
    input: PricingInputViewModel,
    valueIndex: number,
  ): void {
    const selectedValues = this.inputValuesMap[input.inputDefinitionId] ?? [];
    const removed = selectedValues[valueIndex];

    selectedValues.splice(valueIndex, 1);

    if (removed) {
      this.cleanupDependencyReferences([removed.id]);
    }

    this.calculatePreview();
  }

  onInputDependencyChange(
    model: any,
    valueId: number | null | undefined,
  ): void {
    if (!valueId) {
      model.dependsOnInputDefinitionId = undefined;
      model.dependsOnInputValueId = undefined;
      return;
    }

    const parent = this.findParentByValue(valueId);

    model.dependsOnInputDefinitionId = parent?.inputDefinitionId;
    model.dependsOnInputValueId = valueId;
  }

  private cleanupDependencyReferences(removedValueIds: number[]): void {
    if (!removedValueIds.length) return;

    const removedSet = new Set(removedValueIds.map((x) => Number(x)));

    for (const input of this.pricingInputs) {
      if (
        input.dependsOnInputValueId != null &&
        removedSet.has(Number(input.dependsOnInputValueId))
      ) {
        input.dependsOnInputDefinitionId = undefined;
        input.dependsOnInputValueId = undefined;
      }

      for (const value of this.inputValuesMap[input.inputDefinitionId] ?? []) {
        for (const rate of value.rates ?? []) {
          if (
            rate.dependsOnInputValueId != null &&
            removedSet.has(Number(rate.dependsOnInputValueId))
          ) {
            rate.dependsOnInputDefinitionId = undefined;
            rate.dependsOnInputValueId = undefined;
          }
        }
      }
    }

    for (const rule of this.calculationRules) {
      for (const factor of rule.factors ?? []) {
        if (
          factor.dependsOnInputValueId != null &&
          removedSet.has(Number(factor.dependsOnInputValueId))
        ) {
          factor.dependsOnInputDefinitionId = null;
          factor.dependsOnInputValueId = null;
        }

        for (const condition of factor.conditions ?? []) {
          if (
            condition.inputValueId != null &&
            removedSet.has(Number(condition.inputValueId))
          ) {
            condition.inputValueId = null;
          }
        }
      }
    }
  }

  calculatePreview(): void {
    let dimension = 1;
    let rateSum = 0;
    let fixedCost = 0;
    let hasDimension = false;

    // Simulated selected values (preview only)
    const selectedValues: number[] = [];

    this.pricingInputs.forEach((input) => {
      if (input.previewSelectedValueId) {
        selectedValues.push(input.previewSelectedValueId);
      }
    });

    // ✅ STRONGLY TYPED
    const rules: PricingRulePreview[] = [];

    this.pricingInputs.forEach((input) => {
      const values = this.inputValuesMap[input.inputDefinitionId] || [];

      values.forEach((v) => {
        v.rates.forEach((rateRow) => {
          rules.push({
            pricingBehavior: input.pricingBehavior,
            amount: rateRow.amount,
            dependsOnValueId: rateRow.dependsOnInputValueId,
            priority: input.priority,
            previewNumericValue: input.previewNumericValue,
          });
        });
      });
    });

    rules.sort((a, b) => a.priority - b.priority);

    for (const rule of rules) {
      if (
        rule.dependsOnValueId &&
        !selectedValues.includes(rule.dependsOnValueId)
      ) {
        continue;
      }

      switch (rule.pricingBehavior) {
        case PricingInputBehavior.Dimensional:
          if (rule.previewNumericValue == null) return;
          dimension *= rule.previewNumericValue;
          hasDimension = true;
          break;

        case PricingInputBehavior.Rate:
          rateSum += rule.amount;
          break;

        case PricingInputBehavior.Fixed:
          fixedCost += rule.amount;
          break;
      }
    }

    if (rateSum > 0 && !hasDimension) {
      this.previewBaseCost = 0;
      return;
    }

    this.previewBaseCost = dimension * rateSum + fixedCost;
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
  addInputFromSelect(value: string): void {
    if (!value) return;

    const definitionId = Number(value);
    const def = this.inputDefinitions.find((d) => d.id === definitionId);
    if (!def) return;

    this.addPricingInput(def);
  }

  onDependencyValueChange(rule: PricingInputUI, valueId: number): void {
    const parentRule = this.pricingInputs.find((r) =>
      this.inputValuesMap[r.inputDefinitionId]?.some((v) => v.id === +valueId),
    );

    if (!parentRule) {
      rule.dependsOnInputDefinitionId = undefined;
      rule.dependsOnInputValueId = undefined;
      return;
    }

    rule.dependsOnInputDefinitionId = parentRule.inputDefinitionId;
    rule.dependsOnInputValueId = +valueId;
  }
  shouldShowDependency(input: PricingInputUI, value: any): boolean {
    // Must have a rate
    if (value._rate == null || value._rate === 0) return false;

    // Only Rate inputs support dependency
    if (input.pricingBehavior !== PricingInputBehavior.Rate) return false;

    // Must have at least one other Select input with values
    return this.pricingInputs.some(
      (p) =>
        p.inputDefinitionId !== input.inputDefinitionId &&
        p.dataType === MetadataDataType.Select &&
        (this.inputValuesMap[p.inputDefinitionId]?.length ?? 0) > 0,
    );
  }
  canShowInputDependency(input: PricingInputUI): boolean {
    if (input.pricingBehavior === PricingInputBehavior.Dimensional) {
      return false;
    }

    return this.getDependencyOptions(input).length > 0;
  }
  getDependencyOptions(
    currentInput: PricingInputUI,
  ): PricingDependencyOption[] {
    const options: PricingDependencyOption[] = [];

    for (const parent of this.pricingInputs) {
      if (parent.inputDefinitionId === currentInput.inputDefinitionId) continue;
      if (parent.dataType !== MetadataDataType.Select) continue;

      const values = this.inputValuesMap[parent.inputDefinitionId] ?? [];

      for (const value of values) {
        options.push({ parent, value });
      }
    }

    return options;
  }

  // ================= CALCULATION RULE HELPERS =================
  getNumberPricingInputs(): PricingInputUI[] {
    return this.pricingInputs.filter(
      (x) => x.dataType === this.MetadataDataType.Number,
    );
  }

  getSelectPricingInputs(): PricingInputUI[] {
    return this.pricingInputs.filter(
      (x) => x.dataType === this.MetadataDataType.Select,
    );
  }

  getValuesForInputDefinition(
    inputDefinitionId: number | null | undefined,
  ): PricingValueUI[] {
    if (!inputDefinitionId) return [];
    return this.inputValuesMap[inputDefinitionId] ?? [];
  }

  addCalculationRule(): void {
    const numberInputs = this.getNumberPricingInputs();

    if (numberInputs.length < 2) {
      this.toast.show(
        'At least two number inputs are required before adding a calculation rule.',
        'error',
      );
      return;
    }

    this.calculationRules.push({
      ruleName: 'Estimated Weight',
      outputCode: 'estimated_weight_kg',
      outputLabel: 'Estimated Weight',
      unitLabel: 'kg',

      ruleType: ServiceCalculationRuleType.MultiplyTwoNumbersBySelectedFactor,

      firstNumberInputDefinitionId: numberInputs[0].inputDefinitionId,
      secondNumberInputDefinitionId: numberInputs[1].inputDefinitionId,

      displayToUser: true,
      displayToAdmin: true,

      factors: [],
    });
  }

  removeCalculationRule(index: number): void {
    const removed = this.calculationRules[index];
    this.calculationRules.splice(index, 1);

    if (removed?.outputCode) {
      this.decisionRules = this.decisionRules.filter(
        (x) => x.sourceOutputCode !== removed.outputCode,
      );
    }
  }

  addCalculationFactorRow(rule: CalculationRuleUI): void {
    const sortOrder = rule.factors.length + 1;

    rule.factors.push({
      factor: null,
      sortOrder,
      dependsOnInputDefinitionId: null,
      dependsOnInputValueId: null,
      conditions: [
        {
          inputDefinitionId: null,
          inputValueId: null,
        },
      ],
    });
  }
  canShowFactorDependency(factor: CalculationRuleFactorUI): boolean {
    return this.getFactorDependencyOptions(factor).length > 0;
  }

  removeCalculationFactorRow(
    rule: CalculationRuleUI,
    factorIndex: number,
  ): void {
    rule.factors.splice(factorIndex, 1);

    rule.factors.forEach((factor, index) => {
      factor.sortOrder = index + 1;
    });
  }

  getFactorDependencyOptions(
    factor: CalculationRuleFactorUI,
  ): PricingDependencyOption[] {
    const options: PricingDependencyOption[] = [];

    const usedConditionInputIds = new Set(
      (factor.conditions ?? [])
        .map((x) => x.inputDefinitionId)
        .filter((x): x is number => x != null),
    );

    const usedConditionValueIds = new Set(
      (factor.conditions ?? [])
        .map((x) => x.inputValueId)
        .filter((x): x is number => x != null),
    );

    for (const parent of this.pricingInputs) {
      if (parent.dataType !== MetadataDataType.Select) continue;

      const values = this.inputValuesMap[parent.inputDefinitionId] ?? [];

      for (const value of values) {
        const isCurrent =
          Number(factor.dependsOnInputValueId) === Number(value.id);

        const alreadyUsedInCondition =
          usedConditionInputIds.has(Number(parent.inputDefinitionId)) ||
          usedConditionValueIds.has(Number(value.id));

        if (!isCurrent && alreadyUsedInCondition) continue;

        options.push({ parent, value });
      }
    }

    return options;
  }

  onFactorDependencyChange(
    factor: CalculationRuleFactorUI,
    valueId: number | null,
  ): void {
    if (!valueId) {
      factor.dependsOnInputDefinitionId = null;
      factor.dependsOnInputValueId = null;
      return;
    }

    const parent = this.findParentByValue(valueId);

    factor.dependsOnInputDefinitionId = parent?.inputDefinitionId ?? null;
    factor.dependsOnInputValueId = valueId;

    this.clearConflictingFactorConditions(factor);
  }

  getAvailableFactorConditionInputs(
    factor: CalculationRuleFactorUI,
    currentCondition: CalculationRuleFactorConditionUI,
  ): PricingInputUI[] {
    const blockedInputIds = new Set<number>();

    if (
      factor.dependsOnInputDefinitionId != null &&
      Number(factor.dependsOnInputDefinitionId) !==
        Number(currentCondition.inputDefinitionId)
    ) {
      blockedInputIds.add(Number(factor.dependsOnInputDefinitionId));
    }

    for (const condition of factor.conditions ?? []) {
      if (condition === currentCondition) continue;

      if (condition.inputDefinitionId != null) {
        blockedInputIds.add(Number(condition.inputDefinitionId));
      }
    }

    return this.getSelectPricingInputs().filter((input) => {
      const inputId = Number(input.inputDefinitionId);

      return (
        inputId === Number(currentCondition.inputDefinitionId) ||
        !blockedInputIds.has(inputId)
      );
    });
  }

  getAvailableFactorConditionValues(
    factor: CalculationRuleFactorUI,
    currentCondition: CalculationRuleFactorConditionUI,
  ): PricingValueUI[] {
    if (!currentCondition.inputDefinitionId) return [];

    const blockedValueIds = new Set<number>();

    if (
      factor.dependsOnInputValueId != null &&
      Number(factor.dependsOnInputValueId) !==
        Number(currentCondition.inputValueId)
    ) {
      blockedValueIds.add(Number(factor.dependsOnInputValueId));
    }

    for (const condition of factor.conditions ?? []) {
      if (condition === currentCondition) continue;

      if (condition.inputValueId != null) {
        blockedValueIds.add(Number(condition.inputValueId));
      }
    }

    return this.getValuesForInputDefinition(
      currentCondition.inputDefinitionId,
    ).filter((value) => {
      const valueId = Number(value.id);

      return (
        valueId === Number(currentCondition.inputValueId) ||
        !blockedValueIds.has(valueId)
      );
    });
  }

  addFactorCondition(factor: CalculationRuleFactorUI): void {
    const newCondition: CalculationRuleFactorConditionUI = {
      inputDefinitionId: null,
      inputValueId: null,
    };

    if (!this.getAvailableFactorConditionInputs(factor, newCondition).length) {
      this.toast.show(
        'No more available select inputs for this factor row.',
        'error',
      );
      return;
    }

    factor.conditions.push(newCondition);
  }

  removeFactorCondition(
    factor: CalculationRuleFactorUI,
    conditionIndex: number,
  ): void {
    factor.conditions.splice(conditionIndex, 1);
  }

  onFactorConditionInputChange(
    factor: CalculationRuleFactorUI,
    condition: CalculationRuleFactorConditionUI,
  ): void {
    condition.inputValueId = null;
    this.clearConflictingFactorConditions(factor);
  }

  onFactorConditionValueChange(
    factor: CalculationRuleFactorUI,
    condition: CalculationRuleFactorConditionUI,
    valueId: number | null,
  ): void {
    condition.inputValueId = valueId;
    this.clearConflictingFactorConditions(factor);
  }

  private clearConflictingFactorConditions(
    factor: CalculationRuleFactorUI,
  ): void {
    const usedInputIds = new Set<number>();
    const usedValueIds = new Set<number>();

    if (factor.dependsOnInputDefinitionId != null) {
      usedInputIds.add(Number(factor.dependsOnInputDefinitionId));
    }

    if (factor.dependsOnInputValueId != null) {
      usedValueIds.add(Number(factor.dependsOnInputValueId));
    }

    for (const condition of factor.conditions ?? []) {
      const inputId =
        condition.inputDefinitionId != null
          ? Number(condition.inputDefinitionId)
          : null;

      const valueId =
        condition.inputValueId != null ? Number(condition.inputValueId) : null;

      const hasConflict =
        (inputId != null && usedInputIds.has(inputId)) ||
        (valueId != null && usedValueIds.has(valueId));

      if (hasConflict) {
        condition.inputDefinitionId = null;
        condition.inputValueId = null;
        continue;
      }

      if (inputId != null) usedInputIds.add(inputId);
      if (valueId != null) usedValueIds.add(valueId);
    }
  }

  addDecisionRule(): void {
    if (!this.calculationRules.length) {
      this.toast.show(
        'Add at least one calculation rule before adding a decision rule.',
        'error',
      );
      return;
    }

    const numberInputs = this.getNumberPricingInputs();

    const firstCalculationRule = this.calculationRules[0];

    this.decisionRules.push({
      ruleName: 'Labour Decision',
      outputCode: 'labour_count',
      outputLabel: 'Labour Count',

      ruleType: ServiceDecisionRuleType.CalculatedValueRange,

      sourceOutputCode: firstCalculationRule.outputCode,

      maxCalculatedValue: null,

      firstNumberInputDefinitionId: numberInputs[0]?.inputDefinitionId ?? null,
      maxFirstNumberValue: null,

      secondNumberInputDefinitionId: numberInputs[1]?.inputDefinitionId ?? null,
      maxSecondNumberValue: null,

      successValue: null,
      failureValue: null,

      displayToUser: true,
      displayToAdmin: true,

      ranges: [
        {
          minValue: 0,
          maxValue: 10,
          resultValue: 1,
          sortOrder: 1,
        },
      ],
    });
  }
  addDecisionRange(rule: DecisionRuleUI): void {
    const sortOrder = rule.ranges.length + 1;

    rule.ranges.push({
      minValue: null,
      maxValue: null,
      resultValue: null,
      sortOrder,
    });
  }

  removeDecisionRange(rule: DecisionRuleUI, index: number): void {
    rule.ranges.splice(index, 1);

    rule.ranges.forEach((range, i) => {
      range.sortOrder = i + 1;
    });
  }

  onDecisionRuleTypeChange(rule: DecisionRuleUI): void {
    if (rule.ruleType === ServiceDecisionRuleType.CalculatedValueRange) {
      rule.maxCalculatedValue = null;
      rule.maxFirstNumberValue = null;
      rule.maxSecondNumberValue = null;
      rule.successValue = null;
      rule.failureValue = null;

      if (!rule.ranges.length) {
        this.addDecisionRange(rule);
      }
    }

    if (
      rule.ruleType ===
      ServiceDecisionRuleType.CalculatedValueAndTwoNumberLimits
    ) {
      rule.ranges = [];

      rule.maxCalculatedValue = 15;
      rule.maxFirstNumberValue = 36;
      rule.maxSecondNumberValue = 36;
      rule.successValue = 1;
      rule.failureValue = 2;
    }
  }
  removeDecisionRule(index: number): void {
    this.decisionRules.splice(index, 1);
  }

  private validateCalculationRules(): boolean {
    if (this.pricingMode !== 'Dynamic') {
      this.calculationRules = [];
      this.decisionRules = [];
      return true;
    }

    for (const rule of this.calculationRules) {
      if (!rule.ruleName?.trim()) {
        this.toast.show('Calculation rule name is required.', 'error');
        return false;
      }

      if (!rule.outputCode?.trim()) {
        this.toast.show('Calculation rule output code is required.', 'error');
        return false;
      }

      if (!rule.outputLabel?.trim()) {
        this.toast.show('Calculation rule output label is required.', 'error');
        return false;
      }

      if (
        !rule.firstNumberInputDefinitionId ||
        !rule.secondNumberInputDefinitionId
      ) {
        this.toast.show(
          'Calculation rule number inputs are required.',
          'error',
        );
        return false;
      }

      if (
        rule.firstNumberInputDefinitionId === rule.secondNumberInputDefinitionId
      ) {
        this.toast.show(
          'Calculation rule must use two different number inputs.',
          'error',
        );
        return false;
      }

      if (!rule.factors.length) {
        this.toast.show(
          'Calculation rule requires at least one factor row.',
          'error',
        );
        return false;
      }

      for (const factor of rule.factors) {
        if (factor.factor == null || Number(factor.factor) <= 0) {
          this.toast.show(
            'Each factor row must have a valid factor value.',
            'error',
          );
          return false;
        }

        if (!factor.conditions.length) {
          this.toast.show(
            'Each factor row must have at least one condition.',
            'error',
          );
          return false;
        }
      }
    }

    for (const rule of this.decisionRules) {
      if (!rule.ruleName?.trim()) {
        this.toast.show('Decision rule name is required.', 'error');
        return false;
      }

      if (!rule.outputCode?.trim()) {
        this.toast.show('Decision rule output code is required.', 'error');
        return false;
      }

      if (!rule.outputLabel?.trim()) {
        this.toast.show('Decision rule output label is required.', 'error');
        return false;
      }

      if (!rule.sourceOutputCode) {
        this.toast.show('Decision rule source output is required.', 'error');
        return false;
      }

      if (rule.ruleType === ServiceDecisionRuleType.CalculatedValueRange) {
        if (!rule.ranges.length) {
          this.toast.show(
            'Decision range rule requires at least one range.',
            'error',
          );
          return false;
        }

        const orderedRanges = [...rule.ranges].sort(
          (a, b) => Number(a.minValue) - Number(b.minValue),
        );

        for (const range of orderedRanges) {
          if (
            range.minValue == null ||
            range.maxValue == null ||
            range.resultValue == null
          ) {
            this.toast.show(
              'Each range must have From, To, and Result values.',
              'error',
            );
            return false;
          }

          if (Number(range.minValue) > Number(range.maxValue)) {
            this.toast.show(
              'Range From cannot be greater than Range To.',
              'error',
            );
            return false;
          }

          if (Number(range.resultValue) <= 0) {
            this.toast.show(
              'Range result value must be greater than zero.',
              'error',
            );
            return false;
          }
        }

        for (let i = 1; i < orderedRanges.length; i++) {
          const previous = orderedRanges[i - 1];
          const current = orderedRanges[i];

          if (Number(current.minValue) <= Number(previous.maxValue)) {
            this.toast.show('Decision ranges cannot overlap.', 'error');
            return false;
          }
        }
      }

      if (
        rule.ruleType ===
        ServiceDecisionRuleType.CalculatedValueAndTwoNumberLimits
      ) {
        if (
          rule.maxCalculatedValue == null ||
          !rule.firstNumberInputDefinitionId ||
          rule.maxFirstNumberValue == null ||
          !rule.secondNumberInputDefinitionId ||
          rule.maxSecondNumberValue == null
        ) {
          this.toast.show('Decision rule input limits are required.', 'error');
          return false;
        }

        if (rule.successValue == null || rule.failureValue == null) {
          this.toast.show(
            'Decision rule success/failure values are required.',
            'error',
          );
          return false;
        }
      }
    }

    return true;
  }

  private appendCalculationRules(formData: FormData): void {
    this.calculationRules.forEach((rule, i) => {
      formData.append(`CalculationRules[${i}].RuleName`, rule.ruleName.trim());

      formData.append(
        `CalculationRules[${i}].OutputCode`,
        rule.outputCode.trim().toLowerCase(),
      );

      formData.append(
        `CalculationRules[${i}].OutputLabel`,
        rule.outputLabel.trim(),
      );

      if (rule.unitLabel) {
        formData.append(`CalculationRules[${i}].UnitLabel`, rule.unitLabel);
      }

      formData.append(`CalculationRules[${i}].RuleType`, String(rule.ruleType));

      formData.append(
        `CalculationRules[${i}].FirstNumberInputDefinitionId`,
        String(rule.firstNumberInputDefinitionId),
      );

      formData.append(
        `CalculationRules[${i}].SecondNumberInputDefinitionId`,
        String(rule.secondNumberInputDefinitionId),
      );

      formData.append(
        `CalculationRules[${i}].DisplayToUser`,
        String(rule.displayToUser),
      );

      formData.append(
        `CalculationRules[${i}].DisplayToAdmin`,
        String(rule.displayToAdmin),
      );

      rule.factors.forEach((factor, fi) => {
        formData.append(
          `CalculationRules[${i}].Factors[${fi}].Factor`,
          String(factor.factor),
        );

        formData.append(
          `CalculationRules[${i}].Factors[${fi}].SortOrder`,
          String(factor.sortOrder),
        );
        if (factor.dependsOnInputDefinitionId != null) {
          formData.append(
            `CalculationRules[${i}].Factors[${fi}].DependsOnInputDefinitionId`,
            String(factor.dependsOnInputDefinitionId),
          );
        }

        if (factor.dependsOnInputValueId != null) {
          formData.append(
            `CalculationRules[${i}].Factors[${fi}].DependsOnInputValueId`,
            String(factor.dependsOnInputValueId),
          );
        }
        factor.conditions.forEach((condition, ci) => {
          formData.append(
            `CalculationRules[${i}].Factors[${fi}].Conditions[${ci}].InputDefinitionId`,
            String(condition.inputDefinitionId),
          );

          formData.append(
            `CalculationRules[${i}].Factors[${fi}].Conditions[${ci}].InputValueId`,
            String(condition.inputValueId),
          );
        });
      });
    });
  }
  private appendDecisionRules(formData: FormData): void {
    this.decisionRules.forEach((rule, i) => {
      formData.append(`DecisionRules[${i}].RuleName`, rule.ruleName.trim());

      formData.append(
        `DecisionRules[${i}].OutputCode`,
        rule.outputCode.trim().toLowerCase(),
      );

      formData.append(
        `DecisionRules[${i}].OutputLabel`,
        rule.outputLabel.trim(),
      );

      formData.append(`DecisionRules[${i}].RuleType`, String(rule.ruleType));

      formData.append(
        `DecisionRules[${i}].SourceOutputCode`,
        String(rule.sourceOutputCode).trim().toLowerCase(),
      );

      formData.append(
        `DecisionRules[${i}].DisplayToUser`,
        String(rule.displayToUser),
      );

      formData.append(
        `DecisionRules[${i}].DisplayToAdmin`,
        String(rule.displayToAdmin),
      );

      if (
        rule.ruleType ===
        ServiceDecisionRuleType.CalculatedValueAndTwoNumberLimits
      ) {
        formData.append(
          `DecisionRules[${i}].MaxCalculatedValue`,
          String(rule.maxCalculatedValue),
        );

        formData.append(
          `DecisionRules[${i}].FirstNumberInputDefinitionId`,
          String(rule.firstNumberInputDefinitionId),
        );

        formData.append(
          `DecisionRules[${i}].MaxFirstNumberValue`,
          String(rule.maxFirstNumberValue),
        );

        formData.append(
          `DecisionRules[${i}].SecondNumberInputDefinitionId`,
          String(rule.secondNumberInputDefinitionId),
        );

        formData.append(
          `DecisionRules[${i}].MaxSecondNumberValue`,
          String(rule.maxSecondNumberValue),
        );

        formData.append(
          `DecisionRules[${i}].SuccessValue`,
          String(rule.successValue),
        );

        formData.append(
          `DecisionRules[${i}].FailureValue`,
          String(rule.failureValue),
        );
      }

      if (rule.ruleType === ServiceDecisionRuleType.CalculatedValueRange) {
        formData.append(`DecisionRules[${i}].MaxCalculatedValue`, '0');
        formData.append(
          `DecisionRules[${i}].FirstNumberInputDefinitionId`,
          '0',
        );
        formData.append(`DecisionRules[${i}].MaxFirstNumberValue`, '0');
        formData.append(
          `DecisionRules[${i}].SecondNumberInputDefinitionId`,
          '0',
        );
        formData.append(`DecisionRules[${i}].MaxSecondNumberValue`, '0');
        formData.append(`DecisionRules[${i}].SuccessValue`, '0');
        formData.append(`DecisionRules[${i}].FailureValue`, '0');

        rule.ranges.forEach((range, ri) => {
          formData.append(
            `DecisionRules[${i}].Ranges[${ri}].MinValue`,
            String(range.minValue),
          );

          formData.append(
            `DecisionRules[${i}].Ranges[${ri}].MaxValue`,
            String(range.maxValue),
          );

          formData.append(
            `DecisionRules[${i}].Ranges[${ri}].ResultValue`,
            String(range.resultValue),
          );

          formData.append(
            `DecisionRules[${i}].Ranges[${ri}].SortOrder`,
            String(range.sortOrder),
          );
        });
      }
    });
  }
}
interface PricingDependencyOption {
  parent: PricingInputUI;
  value: PricingValueUI;
}

interface PricingRulePreview {
  pricingBehavior: PricingInputBehavior;
  amount: number;
  priority: number;
  dependsOnValueId?: number;
  previewNumericValue?: number;
}

interface PricingValueRateUI {
  amount: number;
  dependsOnInputDefinitionId?: number;
  dependsOnInputValueId?: number;
}

export interface PricingValueUI {
  id: number;
  value: string;
  displayName?: string;

  amount?: number;
  dependsOnValueId?: number;

  rates: PricingValueRateUI[];
}
