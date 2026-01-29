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
  InputDefinitionDto,
  PricingInputBehavior,
} from '../../../../Models/service.Model';

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

  pricingInputs: PricingInputUI[] = [];

  inputDefinitions: any[] = [];
  inputValuesMap: Record<number, PricingValueUI[]> = {};

  previewBaseCost = 0;
  PricingInputBehavior = PricingInputBehavior;
  MetadataDataType = MetadataDataType;

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
      warrantyDuration: [0, [Validators.required, Validators.min(0)]],
      warrantyUnit: ['Months', Validators.required],
      deliveryDays: [0, [Validators.required, Validators.min(0)]],
      labors: [0, [Validators.min(0)]],
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

    Object.keys(payload).forEach((key) => {
      if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, payload[key]);
      }
    });

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }
    formData.append('PricingMode', this.pricingMode);

    // ✅ METADATA (CORRECT FORM-DATA BINDING)
    this.metadataPayload.forEach((m, i) => {
      formData.append(
        `Metadata[${i}].MetadataAttributeId`,
        m.metadataAttributeId.toString(),
      );

      if (m.valueIds?.length) {
        m.valueIds.forEach((v, j) => {
          formData.append(`Metadata[${i}].ValueIds[${j}]`, v.toString());
        });
      }

      if (m.valueText !== null && m.valueText !== undefined) {
        formData.append(
          `Metadata[${i}].ValueText`,
          m.valueText === '' ? ' ' : m.valueText,
        );
      }
    });
    if (this.pricingMode === 'Dynamic') {
      let index = 0;

      this.pricingInputs.forEach((input) => {
        // 🔵 RATE
        if (input.pricingBehavior === PricingInputBehavior.Rate) {
          const values = this.inputValuesMap[input.inputDefinitionId] || [];

          values.forEach((v) => {
            v.rates.forEach((rateRow) => {
              if (!rateRow.amount || rateRow.amount <= 0) return;

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
                rateRow.amount.toString(),
              );
              formData.append(
                `PricingInputs[${index}].IsRequired`,
                String(input.isRequired),
              );
              formData.append(
                `PricingInputs[${index}].Priority`,
                input.priority.toString(),
              );

              if (rateRow.dependsOnValueId) {
                const parent = this.findParentByValue(rateRow.dependsOnValueId);
                formData.append(
                  `PricingInputs[${index}].DependsOnInputDefinitionId`,
                  parent.inputDefinitionId.toString(),
                );
                formData.append(
                  `PricingInputs[${index}].DependsOnInputValueId`,
                  rateRow.dependsOnValueId.toString(),
                );
              }

              index++;
            });
          });
        }

        // 🟢 FIXED
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

        // 🟣 DIMENSIONAL
        if (input.pricingBehavior === PricingInputBehavior.Dimensional) {
          if (input.previewNumericValue == null) return;

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
            input.previewNumericValue.toString(),
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

    this.serviceService.CreateService(formData).subscribe({
      next: (res) => {
        console.log(formData);
        this.isSubmitting = false;
        console.log(formData);
        if (res.success) {
          this.toast.show(
            res.message ?? 'Service created successfully',
            'success',
          );
          this.reset();
        } else {
          this.toast.show(res.message ?? 'Failed to create service', 'error');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.show(
          err.error.message ?? 'Failed to create service',
          'error',
        );
      },
    });
  }
  private findParentByValue(valueId: number): PricingInputUI {
    return this.pricingInputs.find((p) =>
      this.inputValuesMap[p.inputDefinitionId]?.some((v) => v.id === valueId),
    )!;
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
    const input: PricingInputUI = {
      inputDefinitionId: def.id,
      label: def.label,
      code: def.code,
      dataType: def.dataType,
      pricingBehavior: def.pricingBehavior, // READ ONLY
      amount: 0,
      isRequired: true,
      priority: this.pricingInputs.length + 1,
    };

    this.pricingInputs.push(input);

    if (def.dataType === MetadataDataType.Select) {
      this.loadInputValues(def.id);
    }
  }

  onAddInputChange(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    if (!select || !select.value) return;

    const definitionId = Number(select.value);
    const def = this.inputDefinitions.find((d) => d.id === definitionId);
    if (!def) return;

    this.addPricingInput(def);
  }
  addRateRow(value: any): void {
    value.rates.push({
      dependsOnValueId: undefined,
      amount: 0,
    });
  }
  removeRateRow(value: any, index: number): void {
    value.rates.splice(index, 1);
    this.calculatePreview();
  }

  removePricingInput(index: number): void {
    this.pricingInputs.splice(index, 1);
    this.calculatePreview();
  }
  private loadInputValues(definitionId: number): void {
    if (this.inputValuesMap[definitionId]) return;

    this.inputValueService.getByInputDefinition(definitionId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.inputValuesMap[definitionId] = (
            res.data as PricingValueUI[]
          ).map((v: PricingValueUI) => ({
            ...v,
            rates: [],
          }));
        }
      },
    });
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
            dependsOnValueId: rateRow.dependsOnValueId,
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
}
interface PricingRulePreview {
  pricingBehavior: PricingInputBehavior;
  amount: number;
  priority: number;
  dependsOnValueId?: number;
  previewNumericValue?: number;
}
interface ValuePricingRuleUI {
  rate: number;
  dependsOnValueId?: number; // Pane.Double / Pane.Triple / undefined
}
interface PricingValueUI {
  id: number;
  value: string;
  displayName?: string;

  // UI-only
  rates: {
    dependsOnValueId?: number;
    amount: number;
  }[];
}
