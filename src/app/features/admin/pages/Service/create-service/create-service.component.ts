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
import { PricingInputBehavior } from '../../../../Models/service.Model';

@Component({
  selector: 'app-create-service',
  templateUrl: './create-service.component.html',
  styleUrls: ['./create-service.component.scss'],
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
  // ================= PRICING =================
  pricingMode: 'Static' | 'Dynamic' = 'Static';

  pricingInputs: PricingInputUI[] = [];

  inputDefinitions: any[] = [];
  inputValuesMap: Record<number, any[]> = {};

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
      this.pricingInputs.forEach((p, i) => {
        formData.append(
          `PricingInputs[${i}].InputDefinitionId`,
          p.inputDefinitionId.toString(),
        );
        formData.append(
          `PricingInputs[${i}].PricingBehavior`,
          p.pricingBehavior.toString(),
        );
        formData.append(`PricingInputs[${i}].Amount`, p.amount.toString());
        formData.append(`PricingInputs[${i}].IsRequired`, String(p.isRequired));
        formData.append(`PricingInputs[${i}].Priority`, p.priority.toString());

        if (p.inputValueId) {
          formData.append(
            `PricingInputs[${i}].InputValueId`,
            p.inputValueId.toString(),
          );
        }

        if (p.dependsOnInputValueId) {
          formData.append(
            `PricingInputs[${i}].DependsOnInputValueId`,
            p.dependsOnInputValueId.toString(),
          );
        }
      });
    }

    this.serviceService.CreateService(formData).subscribe({
      next: (res) => {
        this.isSubmitting = false;

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
  addPricingInput(def: any): void {
    const input: PricingInputUI = {
      inputDefinitionId: def.id,
      inputCode: def.code,
      label: def.label,
      dataType: def.dataType,
      pricingBehavior: def.pricingBehavior,
      amount: 0,
      isRequired: false,
      priority: this.pricingInputs.length + 1,
    };

    this.pricingInputs.push(input);

    if (def.dataType === MetadataDataType.Select) {
      this.loadInputValues(def.id);
    }

    this.calculatePreview();
  }
  onAddInputChange(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    if (!select || !select.value) return;

    const definitionId = Number(select.value);
    const def = this.inputDefinitions.find((d) => d.id === definitionId);
    if (!def) return;

    this.addPricingInput(def);
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
          this.inputValuesMap[definitionId] = res.data;
        }
      },
    });
  }
  calculatePreview(): void {
    let dimension = 1;
    let rateSum = 0;
    let fixedCost = 0;
    let hasDimension = false;

    // build selected value map
    const selectedValues: Record<number, string> = {};
    this.pricingInputs.forEach((p) => {
      if (p.previewSelectedValueCode) {
        selectedValues[p.inputDefinitionId] = p.previewSelectedValueCode;
      }
    });

    const ordered = [...this.pricingInputs].sort(
      (a, b) => a.priority - b.priority,
    );

    for (const rule of ordered) {
      // dependency check
      if (rule.dependsOnInputValueId) {
        const parentDefId = this.inputValuesMap[rule.inputDefinitionId]?.find(
          (v) => v.id === rule.dependsOnInputValueId,
        )?.inputDefinitionId;

        if (!parentDefId) continue;

        if (selectedValues[parentDefId] !== rule.previewSelectedValueCode) {
          continue;
        }
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
}
