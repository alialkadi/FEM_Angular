import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../../../shared/Services/toast.service';
import { MetadataDataType } from '../../../Models/MetadataTargetType';
import {
  PricingInputBehavior,
  InputDefinitionDto,
} from '../../../Models/service.Model';
import { InputDefinitionService } from '../../Services/input-definition.service';
import { InputValueService } from '../../Services/input-value.service';

export interface UpdateInputDefinitionRequest {
  label: string;
  dataType: MetadataDataType;
  pricingBehavior: PricingInputBehavior;
  allowDecimal: boolean;
  min?: number | null;
  max?: number | null;
}
export interface UpdateInputValueRequest {
  displayName: string;
  sortOrder: number;
  isActive: boolean;
}
export interface AssociatedServiceValueDto {
  pricingId: number;
  inputValueId?: number | null;
  inputValueCode?: string | null;
  inputValueDisplayName?: string | null;
  pricingBehavior: PricingInputBehavior;
  isRequired: boolean;
  amount: number;
  priority: number;
  min?: number | null;
  max?: number | null;
  dependsOnInputDefinitionId?: number | null;
  dependsOnInputValueId?: number | null;
  dependsOnInputValueDisplayName?: string | null;
}

export interface AssociatedServiceDto {
  serviceId: number;
  serviceName: string;
  baseCost: number;

  structureId?: number | null;
  structureName?: string | null;

  partId?: number | null;
  partName?: string | null;

  partOptionId?: number | null;
  partOptionName?: string | null;

  values: AssociatedServiceValueDto[];
}
@Component({
  selector: 'app-input-definition',
  templateUrl: './input-definition.component.html',
  styleUrls: ['./input-definition.component.scss'],
})
export class InputDefinitionComponent implements OnInit {
  form!: FormGroup;
  editForm!: FormGroup;
  valueForm!: FormGroup;

  definitions: InputDefinitionDto[] = [];
  values: any[] = [];

  selectedDefinition: InputDefinitionDto | null = null;
  editingDefinition: InputDefinitionDto | null = null;

  loading = false;
  submitting = false;
  showValues = false;
  loadingValues = false;
  creatingValue = false;

  showEditModal = false;
  updating = false;

  MetadataDataType = MetadataDataType;
  PricingInputBehavior = PricingInputBehavior;

  dataTypeOptions = [
    { value: MetadataDataType.Text, label: 'Text' },
    { value: MetadataDataType.Number, label: 'Number' },
    { value: MetadataDataType.Boolean, label: 'Boolean' },
    { value: MetadataDataType.Select, label: 'Select' },
  ];

  pricingBehaviorOptions: { value: PricingInputBehavior; label: string }[] = [];
  editPricingBehaviorOptions: { value: PricingInputBehavior; label: string }[] =
    [];
  editValueForm!: FormGroup;
  showEditValueModal = false;
  editingValue: any | null = null;
  updatingValue = false;
  associatedServices: AssociatedServiceDto[] = [];
  selectedServicesDefinition: InputDefinitionDto | null = null;
  showAssociatedServices = false;
  loadingAssociatedServices = false;
  private buildEditValueForm(): void {
    this.editValueForm = this.fb.group({
      displayName: ['', Validators.required],
      sortOrder: [0, Validators.required],
      isActive: [true],
    });
  }
  constructor(
    private fb: FormBuilder,
    private service: InputDefinitionService,
    private inputValueService: InputValueService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.buildEditForm();
    this.buildValueForm();
    this.buildEditValueForm();
    this.loadDefinitions();

    this.form
      .get('dataType')!
      .valueChanges.subscribe((dt: MetadataDataType | null) => {
        this.applyCreateRules(dt);
      });

    this.editForm
      .get('dataType')!
      .valueChanges.subscribe((dt: MetadataDataType | null) => {
        this.applyEditRules(dt, false);
      });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      code: ['', Validators.required],
      label: ['', Validators.required],
      dataType: [null as MetadataDataType | null, Validators.required],
      pricingBehavior: [
        null as PricingInputBehavior | null,
        Validators.required,
      ],
      allowDecimal: [false],
      min: [null as number | null],
      max: [null as number | null],
    });
  }

  private buildEditForm(): void {
    this.editForm = this.fb.group({
      label: ['', Validators.required],

      // ✅ EXISTS IN EDIT FORM
      dataType: [null as MetadataDataType | null, Validators.required],
      pricingBehavior: [
        null as PricingInputBehavior | null,
        Validators.required,
      ],

      allowDecimal: [false],

      // ✅ EXISTS IN EDIT FORM
      min: [null as number | null],
      max: [null as number | null],
    });
  }

  private buildValueForm(): void {
    this.valueForm = this.fb.group({
      code: ['', Validators.required],
      displayName: ['', Validators.required],
      sortOrder: [0, Validators.required],
    });
  }

  private getPricingBehaviorsByDataType(
    dataType: MetadataDataType | null,
  ): { value: PricingInputBehavior; label: string }[] {
    switch (dataType) {
      case MetadataDataType.Number:
        return [
          { value: PricingInputBehavior.None, label: 'None' },
          { value: PricingInputBehavior.Dimensional, label: 'Dimensional' },
          { value: PricingInputBehavior.Rate, label: 'Rate' },
          { value: PricingInputBehavior.Fixed, label: 'Fixed' },
        ];

      case MetadataDataType.Select:
      case MetadataDataType.Boolean:
        return [
          { value: PricingInputBehavior.None, label: 'None' },
          { value: PricingInputBehavior.Rate, label: 'Rate' },
          { value: PricingInputBehavior.Fixed, label: 'Fixed' },
        ];

      case MetadataDataType.Text:
        return [{ value: PricingInputBehavior.None, label: 'None' }];

      default:
        return [];
    }
  }

  private applyCreateRules(dataType: MetadataDataType | null): void {
    this.pricingBehaviorOptions = this.getPricingBehaviorsByDataType(dataType);

    if (dataType !== MetadataDataType.Number) {
      this.form.patchValue(
        {
          allowDecimal: false,
          min: null,
          max: null,
        },
        { emitEvent: false },
      );
    }

    const current = this.form.get('pricingBehavior')!.value;
    const allowed = this.pricingBehaviorOptions.map((x) => x.value);

    if (!allowed.includes(current)) {
      this.form.patchValue(
        {
          pricingBehavior: this.pricingBehaviorOptions[0]?.value ?? null,
        },
        { emitEvent: false },
      );
    }
  }

  private applyEditRules(
    dataType: MetadataDataType | null,
    keepCurrentBehavior: boolean,
  ): void {
    this.editPricingBehaviorOptions =
      this.getPricingBehaviorsByDataType(dataType);

    if (dataType !== MetadataDataType.Number) {
      this.editForm.patchValue(
        {
          allowDecimal: false,
          min: null,
          max: null,
        },
        { emitEvent: false },
      );
    }

    const current = this.editForm.get('pricingBehavior')!.value;
    const allowed = this.editPricingBehaviorOptions.map((x) => x.value);

    if (!keepCurrentBehavior || !allowed.includes(current)) {
      this.editForm.patchValue(
        {
          pricingBehavior: this.editPricingBehaviorOptions[0]?.value ?? null,
        },
        { emitEvent: false },
      );
    }
  }

  loadDefinitions(): void {
    this.loading = true;

    this.service.getAll().subscribe({
      next: (res: { success: any; data: InputDefinitionDto[] }) => {
        this.loading = false;
        this.definitions = res.success && res.data ? res.data : [];
      },
      error: () => {
        this.loading = false;
        this.toast.show('Failed to load input definitions.', 'error');
      },
    });
  }
  getDataTypeLabel(value: MetadataDataType | null | undefined): string {
    const item = this.dataTypeOptions.find((x) => x.value === value);
    return item?.label ?? '-';
  }

  getPricingBehaviorLabel(
    value: PricingInputBehavior | null | undefined,
  ): string {
    const item = this.editPricingBehaviorOptions.find((x) => x.value === value);
    return item?.label ?? '-';
  }
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const isNumber = raw.dataType === MetadataDataType.Number;

    if (!this.validateMinMax(raw.min, raw.max)) return;

    const payload = {
      code: raw.code,
      label: raw.label,
      dataType: raw.dataType,
      pricingBehavior: raw.pricingBehavior,
      allowDecimal: isNumber ? !!raw.allowDecimal : false,
      min: isNumber ? (raw.min ?? null) : null,
      max: isNumber ? (raw.max ?? null) : null,
    };

    this.submitting = true;

    this.service.create(payload).subscribe({
      next: (res) => {
        this.submitting = false;

        if (res.success) {
          this.toast.show('Input created successfully.', 'success');
          this.form.reset({
            code: '',
            label: '',
            dataType: null,
            pricingBehavior: null,
            allowDecimal: false,
            min: null,
            max: null,
          });
          this.loadDefinitions();
        } else {
          this.toast.show(res.message ?? 'Create failed.', 'error');
        }
      },
      error: (err) => {
        this.submitting = false;
        this.toast.show(err.error?.message ?? 'Create failed.', 'error');
      },
    });
  }

  openEdit(definition: InputDefinitionDto): void {
    this.editingDefinition = definition;

    this.editPricingBehaviorOptions = this.getPricingBehaviorsByDataType(
      definition.dataType,
    );

    this.editForm.enable({ emitEvent: false });

    this.editForm.reset(
      {
        label: definition.label,
        dataType: definition.dataType,
        pricingBehavior: definition.pricingBehavior,
      },
      { emitEvent: false },
    );

    this.editForm.get('dataType')?.disable({ emitEvent: false });
    this.editForm.get('pricingBehavior')?.disable({ emitEvent: false });

    this.showEditModal = true;
  }

  closeEdit(): void {
    this.showEditModal = false;
    this.editingDefinition = null;
    this.editPricingBehaviorOptions = [];

    this.editForm.reset({
      label: '',
      dataType: null,
      pricingBehavior: null,
      allowDecimal: false,
      min: null,
      max: null,
    });
  }

  updateDefinition(): void {
    if (!this.editingDefinition) return;

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    // ✅ important: includes disabled controls
    const raw = this.editForm.getRawValue();

    const dataType = Number(raw.dataType) as MetadataDataType;
    const pricingBehavior = Number(raw.pricingBehavior) as PricingInputBehavior;
    const isNumber = dataType === MetadataDataType.Number;

    if (
      isNumber &&
      raw.min != null &&
      raw.max != null &&
      Number(raw.min) > Number(raw.max)
    ) {
      this.toast.show('Min value cannot be greater than Max value.', 'error');
      return;
    }

    const payload: UpdateInputDefinitionRequest = {
      label: raw.label!,
      dataType,
      pricingBehavior,
      allowDecimal: isNumber ? !!raw.allowDecimal : false,
      min: isNumber ? (raw.min ?? null) : null,
      max: isNumber ? (raw.max ?? null) : null,
    };

    this.updating = true;

    this.service.update(this.editingDefinition.id, payload).subscribe({
      next: (res) => {
        this.updating = false;

        if (res.success) {
          this.toast.show('Input definition updated successfully.', 'success');
          this.closeEdit();
          this.loadDefinitions();
        } else {
          this.toast.show(res.message ?? 'Update failed.', 'error');
        }
      },
      error: (err) => {
        this.updating = false;
        this.toast.show(err.error?.message ?? 'Update failed.', 'error');
      },
    });
  }

  private validateMinMax(min: number | null, max: number | null): boolean {
    if (min != null && max != null && Number(min) > Number(max)) {
      this.toast.show('Min value cannot be greater than Max value.', 'error');
      return false;
    }

    return true;
  }

  openValues(definition: InputDefinitionDto): void {
    this.selectedDefinition = definition;
    this.showValues = true;
    this.loadValues(definition.id);
  }

  closeValues(): void {
    this.showValues = false;
    this.selectedDefinition = null;
    this.values = [];
    this.valueForm.reset({
      code: '',
      displayName: '',
      sortOrder: 0,
    });
  }

  loadValues(inputDefinitionId: number): void {
    this.loadingValues = true;

    this.inputValueService.getByInputDefinition(inputDefinitionId).subscribe({
      next: (res) => {
        this.loadingValues = false;
        this.values = res.success && res.data ? res.data : [];
      },
      error: () => {
        this.loadingValues = false;
        this.toast.show('Failed to load values.', 'error');
      },
    });
  }

  createValue(): void {
    if (!this.selectedDefinition || this.valueForm.invalid) {
      this.valueForm.markAllAsTouched();
      return;
    }

    this.creatingValue = true;

    const raw = this.valueForm.getRawValue();

    const payload = {
      inputDefinitionId: this.selectedDefinition.id,
      code: raw.code,
      displayName: raw.displayName,
      sortOrder: raw.sortOrder,
    };

    this.inputValueService.create(payload).subscribe({
      next: (res) => {
        this.creatingValue = false;

        if (res.success) {
          this.toast.show('Value created successfully.', 'success');
          this.valueForm.reset({
            code: '',
            displayName: '',
            sortOrder: 0,
          });
          this.loadValues(this.selectedDefinition!.id);
        } else {
          this.toast.show(res.message ?? 'Create value failed.', 'error');
        }
      },
      error: (err) => {
        this.creatingValue = false;
        this.toast.show(err.error?.message ?? 'Create value failed.', 'error');
      },
    });
  }

  // toggleActive(value: any): void {
  //   this.inputValueService.toggleActive(value.id).subscribe({
  //     next: (res) => {
  //       if (res.success) {
  //         this.toast.show('Value updated.', 'success');
  //         this.loadValues(this.selectedDefinition!.id);
  //       } else {
  //         this.toast.show(res.message ?? 'Toggle failed.', 'error');
  //       }
  //     },
  //     error: () => {
  //       this.toast.show('Toggle failed.', 'error');
  //     },
  //   });
  // }

  deleteValue(value: any): void {
    if (!confirm('Delete this value?')) return;

    this.inputValueService.delete(value.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.show(res.message || 'Value deleted.', 'success');
          this.loadValues(this.selectedDefinition!.id);
        } else {
          this.toast.show(res.message ?? 'Delete failed.', 'error');
        }
      },
      error: (err) => {
        this.toast.show(err.error.message ?? 'Delete failed.', 'error');
      },
    });
  }

  delete(definition: InputDefinitionDto): void {
    if (!confirm('Delete this input definition?')) return;

    this.service.delete(definition.id).subscribe({
      next: (res) => {
        console.log(res);
        if (res.success) {
          this.toast.show(
            res.message ?? 'Input definition deleted.',
            'success',
          );
          this.loadDefinitions();
        } else {
          this.toast.show(res.message ?? 'Delete failed.', 'error');
        }
      },
      error: (err) => {
        console.log(err);
        this.toast.show(err.error.message ?? 'Delete failed.', 'error');
      },
    });
  }
  openEditValue(value: any): void {
    this.editingValue = value;

    this.editValueForm.reset({
      displayName: value.displayName ?? '',
      sortOrder: value.sortOrder ?? 0,
      isActive: value.isActive ?? true,
    });

    this.showEditValueModal = true;
  }

  closeEditValue(): void {
    this.showEditValueModal = false;
    this.editingValue = null;

    this.editValueForm.reset({
      displayName: '',
      sortOrder: 0,
      isActive: true,
    });
  }

  updateValue(): void {
    if (!this.editingValue) return;

    if (this.editValueForm.invalid) {
      this.editValueForm.markAllAsTouched();
      return;
    }

    const raw = this.editValueForm.getRawValue();

    const payload: UpdateInputValueRequest = {
      displayName: raw.displayName,
      sortOrder: Number(raw.sortOrder),
      isActive: !!raw.isActive,
    };

    this.updatingValue = true;

    this.inputValueService.update(this.editingValue.id, payload).subscribe({
      next: (res) => {
        this.updatingValue = false;
        console.log(res);
        if (res.success) {
          this.toast.show('Value updated successfully.', 'success');
          this.closeEditValue();

          if (this.selectedDefinition) {
            this.loadValues(this.selectedDefinition.id);
          }
        } else {
          this.toast.show(res.message ?? 'Update value failed.', 'error');
        }
      },
      error: (err) => {
        this.updatingValue = false;
        this.toast.show(err.error?.message ?? 'Update value failed.', 'error');
      },
    });
  }

  openAssociatedServices(definition: InputDefinitionDto): void {
    this.selectedServicesDefinition = definition;
    this.showAssociatedServices = true;
    this.loadingAssociatedServices = true;
    this.associatedServices = [];

    this.service.getAssociatedServices(definition.id).subscribe({
      next: (res) => {
        this.loadingAssociatedServices = false;
        this.associatedServices =
          res.isSuccessful && res.response ? res.response : [];
      },
      error: (err) => {
        this.loadingAssociatedServices = false;
        this.toast.show(
          err.error?.message ?? 'Failed to load associated services.',
          'error',
        );
      },
    });
  }

  closeAssociatedServices(): void {
    this.showAssociatedServices = false;
    this.selectedServicesDefinition = null;
    this.associatedServices = [];
  }
  getAssociatedLinkedTo(s: AssociatedServiceDto): string {
    if (s.partOptionName) return `Part Option: ${s.partOptionName}`;
    if (s.partName) return `Part: ${s.partName}`;
    if (s.structureName) return `Structure: ${s.structureName}`;

    return '-';
  }

  getPricingAmountLabel(v: AssociatedServiceValueDto): string {
    switch (v.pricingBehavior) {
      case PricingInputBehavior.Fixed:
        return `Fixed: ${v.amount}`;

      case PricingInputBehavior.Rate:
        return `Rate: ${v.amount}`;

      case PricingInputBehavior.Dimensional:
        return 'Dimensional';

      case PricingInputBehavior.None:
        return 'No pricing';

      default:
        return `${v.amount}`;
    }
  }

  getValueLabel(v: AssociatedServiceValueDto): string {
    return v.inputValueDisplayName || v.inputValueCode || 'Default input rule';
  }
}
