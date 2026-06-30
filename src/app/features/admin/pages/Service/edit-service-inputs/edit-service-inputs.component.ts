import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ServiceService } from '../../../Services/service-service.service';
import { InputDefinitionService } from '../../../Services/input-definition.service';
import { InputValueService } from '../../../Services/input-value.service';
import { ToastService } from '../../../../../shared/Services/toast.service';

import {
  PricingInputBehavior,
  ServiceResponse,
  InputDefinitionDto,
} from '../../../../Models/service.Model';
import { PricingInputUI } from '../../../../Models/InputValueDto.model';
import { MetadataDataType } from '../../../../Models/MetadataTargetType';

interface PricingRateRowUI {
  amount: number;
  dependsOnInputValueId?: number;
  dependsOnInputDefinitionId?: number;
}

export interface PricingValueUI {
  id: number;
  value: string;
  displayName?: string;
  rates: PricingRateRowUI[];
}

type PricingInputEditUI = PricingInputUI & {
  dependsOnInputValueId?: number;
  dependsOnInputDefinitionId?: number;
  min?: number | null;
  max?: number | null;
};

interface PricingInputSaveRow {
  inputDefinitionId: number;
  inputValueId?: number | null;
  pricingBehavior: PricingInputBehavior;
  amount: number;
  isRequired: boolean;
  priority: number;
  dependsOnInputDefinitionId?: number | null;
  dependsOnInputValueId?: number | null;
  min?: number | null;
  max?: number | null;
}

interface PricingRulePreview {
  pricingBehavior: PricingInputBehavior;
  amount: number;
  priority: number;
  dependsOnInputValueId?: number;
  previewNumericValue?: number;
}

@Component({
  selector: 'app-edit-service-inputs',
  templateUrl: './edit-service-inputs.component.html',
  styleUrls: ['./edit-service-inputs.component.scss'],
})
export class EditServiceInputsComponent implements OnInit {
  serviceId!: number;
  serviceName: string | undefined = '';
  pricingMode: 'Static' | 'Dynamic' = 'Static';
  saving = false;

  pricingInputs: PricingInputEditUI[] = [];
  inputDefinitions: InputDefinitionDto[] = [];
  inputValuesMap: Record<number, PricingValueUI[]> = {};

  previewBaseCost = 0;

  PricingInputBehavior = PricingInputBehavior;
  MetadataDataType = MetadataDataType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceService: ServiceService,
    private inputDefinitionService: InputDefinitionService,
    private inputValueService: InputValueService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.serviceId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadInputDefinitions();
    this.loadService();
  }

  private loadService(): void {
    this.serviceService.getServicesById(this.serviceId).subscribe({
      next: (res) => {
        if (!res.success || !res.data) return;

        const service: ServiceResponse = res.data;
        this.serviceName = service.name;
        this.pricingMode = service.pricingMode === 1 ? 'Static' : 'Dynamic';

        if (this.pricingMode === 'Dynamic') {
          this.hydratePricingFromBackend(service.requiredInputs ?? []);
        } else {
          this.pricingInputs = [];
          this.inputValuesMap = {};
          this.previewBaseCost = 0;
        }
      },
      error: (err) => {
        this.toast.show(
          err.error?.message ?? 'Failed to load service',
          'error',
        );
      },
    });
  }

  private loadInputDefinitions(): void {
    this.inputDefinitionService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.inputDefinitions = res.data as InputDefinitionDto[];
        }
      },
      error: () => {
        this.toast.show('Failed to load pricing definitions', 'error');
      },
    });
  }

  private hydratePricingFromBackend(requiredInputs: any[]): void {
    this.pricingInputs = [];
    this.inputValuesMap = {};
    this.previewBaseCost = 0;

    const inputMap = new Map<number, PricingInputEditUI>();

    requiredInputs.forEach((rule: any) => {
      let input = inputMap.get(rule.inputDefinitionId);

      if (!input) {
        input = {
          inputDefinitionId: rule.inputDefinitionId,
          label: rule.label,
          code: rule.code,
          dataType: rule.dataType,
          pricingBehavior: rule.pricingBehavior,
          amount:
            rule.dataType !== MetadataDataType.Select ? (rule.amount ?? 0) : 0,
          isRequired: rule.isRequired,
          priority: rule.priority,
          previewNumericValue: undefined,
          previewSelectedValueId: undefined,
          dependsOnInputValueId:
            rule.dataType !== MetadataDataType.Select
              ? (rule.dependsOnInputValueId ?? undefined)
              : undefined,
          dependsOnInputDefinitionId:
            rule.dataType !== MetadataDataType.Select
              ? (rule.dependsOnInputDefinitionId ?? undefined)
              : undefined,
          min:
            rule.dataType === MetadataDataType.Number
              ? (rule.min ?? null)
              : null,
          max:
            rule.dataType === MetadataDataType.Number
              ? (rule.max ?? null)
              : null,
        };

        inputMap.set(rule.inputDefinitionId, input);
        this.pricingInputs.push(input);

        if (rule.dataType === MetadataDataType.Select) {
          this.inputValuesMap[rule.inputDefinitionId] = [];
        }
      }

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

        if (
          rule.pricingBehavior === PricingInputBehavior.None ||
          rule.pricingBehavior === PricingInputBehavior.Fixed ||
          rule.pricingBehavior === PricingInputBehavior.Rate
        ) {
          value.rates.push({
            amount:
              rule.pricingBehavior === PricingInputBehavior.None
                ? 0
                : (rule.amount ?? 0),
            dependsOnInputValueId: rule.dependsOnInputValueId ?? undefined,
            dependsOnInputDefinitionId:
              rule.dependsOnInputDefinitionId ?? undefined,
          });
        }
      }
    });

    this.pricingInputs
      .filter((input) => input.dataType === MetadataDataType.Select)
      .forEach((input) => this.loadInputValues(input.inputDefinitionId, true));

    this.reorderPriorities();
    this.cleanupOrphanDependencies();
    this.calculatePreview();
  }

  addInputFromSelect(value: string): void {
    if (!value) return;

    const definitionId = Number(value);
    const definition = this.inputDefinitions.find((d) => d.id === definitionId);
    if (!definition) return;

    this.addPricingInput(definition);
  }

  addPricingInput(def: InputDefinitionDto): void {
    const exists = this.pricingInputs.some(
      (p) => p.inputDefinitionId === def.id,
    );

    if (exists) {
      this.toast.show('This input is already added.', 'error');
      return;
    }

    const input: PricingInputEditUI = {
      inputDefinitionId: def.id,
      label: def.label,
      code: def.code,
      dataType: def.dataType,
      pricingBehavior: def.pricingBehavior,
      amount: 0,
      isRequired: true,
      priority: this.pricingInputs.length + 1,
      previewNumericValue: undefined,
      previewSelectedValueId: undefined,
      dependsOnInputValueId: undefined,
      dependsOnInputDefinitionId: undefined,
      min: def.dataType === MetadataDataType.Number ? null : null,
      max: def.dataType === MetadataDataType.Number ? null : null,
    };

    this.pricingInputs.push(input);

    if (def.dataType === MetadataDataType.Select) {
      this.loadInputValues(def.id);
    }

    this.reorderPriorities();
    this.calculatePreview();
  }

  private loadInputValues(
    definitionId: number,
    mergeExistingRates = false,
  ): void {
    const existingValues = this.inputValuesMap[definitionId] ?? [];

    if (existingValues.length > 0 && !mergeExistingRates) return;

    this.inputValueService.getByInputDefinition(definitionId).subscribe({
      next: (res) => {
        if (!(res.success && res.data)) return;

        const fetchedValues = (res.data as any[]).map(
          (value: any): PricingValueUI => {
            const existing = existingValues.find((x) => x.id === value.id);

            return {
              id: value.id,
              value: value.code ?? value.value,
              displayName: value.displayName,
              rates: existing?.rates?.length
                ? existing.rates
                : [
                    {
                      amount: 0,
                      dependsOnInputValueId: undefined,
                      dependsOnInputDefinitionId: undefined,
                    },
                  ],
            };
          },
        );

        const missingOldValues = existingValues.filter(
          (oldValue) =>
            !fetchedValues.some((newValue) => newValue.id === oldValue.id),
        );

        this.inputValuesMap[definitionId] = [
          ...fetchedValues,
          ...missingOldValues,
        ];
        this.cleanupOrphanDependencies();
        this.calculatePreview();
      },
      error: () => {
        this.toast.show('Failed to load input values', 'error');
      },
    });
  }

  addRateRow(value: PricingValueUI): void {
    value.rates.push({
      amount: 0,
      dependsOnInputValueId: undefined,
      dependsOnInputDefinitionId: undefined,
    });
  }

  removeRateRow(value: PricingValueUI, index: number): void {
    value.rates.splice(index, 1);

    if (value.rates.length === 0) {
      this.addRateRow(value);
    }

    this.calculatePreview();
  }

  removePricingInput(index: number): void {
    const removed = this.pricingInputs[index];
    if (!removed) return;

    this.pricingInputs.splice(index, 1);
    delete this.inputValuesMap[removed.inputDefinitionId];

    this.reorderPriorities();
    this.cleanupOrphanDependencies();
    this.calculatePreview();
  }

  private reorderPriorities(): void {
    this.pricingInputs.forEach((input, index) => {
      input.priority = index + 1;
    });
  }

  canShowInputDependency(input: PricingInputEditUI): boolean {
    if (input.pricingBehavior === PricingInputBehavior.Dimensional)
      return false;
    return this.getDependencyOptions(input).length > 0;
  }

  getDependencyOptions(currentInput: PricingInputEditUI): {
    parent: PricingInputEditUI;
    value: PricingValueUI;
  }[] {
    const options: { parent: PricingInputEditUI; value: PricingValueUI }[] = [];

    this.pricingInputs.forEach((parent) => {
      if (parent.inputDefinitionId === currentInput.inputDefinitionId) return;
      if (parent.dataType !== MetadataDataType.Select) return;

      const values = this.inputValuesMap[parent.inputDefinitionId] ?? [];
      values.forEach((value) => options.push({ parent, value }));
    });

    return options;
  }

  onDependencyValueChange(
    model: PricingRateRowUI | PricingInputEditUI,
    valueId?: number,
  ): void {
    const numericValueId = valueId ? Number(valueId) : undefined;

    model.dependsOnInputValueId = numericValueId;

    if (!numericValueId) {
      model.dependsOnInputDefinitionId = undefined;
      this.calculatePreview();
      return;
    }

    const parent = this.findParentByValue(numericValueId);
    model.dependsOnInputDefinitionId = parent?.inputDefinitionId;

    this.calculatePreview();
  }

  private findParentByValue(valueId?: number): PricingInputEditUI | undefined {
    if (!valueId) return undefined;

    return this.pricingInputs.find((input) =>
      (this.inputValuesMap[input.inputDefinitionId] ?? []).some(
        (value) => value.id === Number(valueId),
      ),
    );
  }

  private cleanupOrphanDependencies(): void {
    const allAvailableValueIds = new Set<number>();

    Object.values(this.inputValuesMap).forEach((values) => {
      values.forEach((value) => allAvailableValueIds.add(value.id));
    });

    this.pricingInputs.forEach((input) => {
      if (
        input.dependsOnInputValueId &&
        !allAvailableValueIds.has(input.dependsOnInputValueId)
      ) {
        input.dependsOnInputValueId = undefined;
        input.dependsOnInputDefinitionId = undefined;
      }
    });

    Object.values(this.inputValuesMap).forEach((values) => {
      values.forEach((value) => {
        value.rates.forEach((rate) => {
          if (
            rate.dependsOnInputValueId &&
            !allAvailableValueIds.has(rate.dependsOnInputValueId)
          ) {
            rate.dependsOnInputValueId = undefined;
            rate.dependsOnInputDefinitionId = undefined;
          }
        });
      });
    });
  }

  private validateNumericMinMax(): boolean {
    for (const input of this.pricingInputs) {
      if (input.dataType !== MetadataDataType.Number) {
        input.min = null;
        input.max = null;
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

  calculatePreview(): void {
    let dimension = 1;
    let rateSum = 0;
    let fixedCost = 0;
    let hasDimension = false;

    const selectedValues = this.pricingInputs
      .map((input) => input.previewSelectedValueId)
      .filter((id): id is number => !!id);

    const rules: PricingRulePreview[] = [];

    this.pricingInputs.forEach((input) => {
      const isSelect = input.dataType === MetadataDataType.Select;

      if (input.pricingBehavior === PricingInputBehavior.None) return;

      if (input.pricingBehavior === PricingInputBehavior.Dimensional) {
        rules.push({
          pricingBehavior: input.pricingBehavior,
          amount: 0,
          priority: input.priority,
          previewNumericValue: input.previewNumericValue,
        });
        return;
      }

      if (!isSelect) {
        rules.push({
          pricingBehavior: input.pricingBehavior,
          amount: input.amount ?? 0,
          priority: input.priority,
          dependsOnInputValueId: input.dependsOnInputValueId,
        });
        return;
      }

      const values = this.inputValuesMap[input.inputDefinitionId] ?? [];
      values.forEach((value) => {
        value.rates.forEach((rate) => {
          rules.push({
            pricingBehavior: input.pricingBehavior,
            amount: rate.amount ?? 0,
            priority: input.priority,
            dependsOnInputValueId: rate.dependsOnInputValueId,
          });
        });
      });
    });

    rules.sort((a, b) => a.priority - b.priority);

    for (const rule of rules) {
      if (
        rule.dependsOnInputValueId &&
        !selectedValues.includes(rule.dependsOnInputValueId)
      ) {
        continue;
      }

      switch (rule.pricingBehavior) {
        case PricingInputBehavior.Dimensional:
          if (rule.previewNumericValue == null || rule.previewNumericValue <= 0)
            continue;
          dimension *= rule.previewNumericValue;
          hasDimension = true;
          break;

        case PricingInputBehavior.Rate:
          if (rule.amount > 0) rateSum += rule.amount;
          break;

        case PricingInputBehavior.Fixed:
          if (rule.amount > 0) fixedCost += rule.amount;
          break;
      }
    }

    this.previewBaseCost =
      rateSum > 0 && hasDimension ? dimension * rateSum + fixedCost : fixedCost;
  }

  getPricingTypeLabel(
    input: Pick<PricingInputEditUI, 'pricingBehavior'>,
  ): string {
    switch (input.pricingBehavior) {
      case PricingInputBehavior.None:
        return 'None';
      case PricingInputBehavior.Fixed:
        return 'Fixed';
      case PricingInputBehavior.Rate:
        return 'Rate';
      case PricingInputBehavior.Dimensional:
        return 'Dimensional';
      default:
        return 'Unknown';
    }
  }

  getDataTypeLabel(dataType: MetadataDataType): string {
    switch (dataType) {
      case MetadataDataType.Select:
        return 'Select';
      case MetadataDataType.Number:
        return 'Number';
      case MetadataDataType.Text:
        return 'Text';
      case MetadataDataType.Boolean:
        return 'Boolean';
      default:
        return 'Unknown';
    }
  }

  buildPayload(): PricingInputSaveRow[] {
    const result: PricingInputSaveRow[] = [];

    this.pricingInputs.forEach((input) => {
      const isSelect = input.dataType === MetadataDataType.Select;
      const isText = input.dataType === MetadataDataType.Text;
      const isNumber = input.dataType === MetadataDataType.Number;
      const isBoolean = input.dataType === MetadataDataType.Boolean;
      const values = this.inputValuesMap[input.inputDefinitionId] ?? [];

      if (isText) {
        this.pushSingleInputRow(result, input, 0, null, null);
        return;
      }

      if (isNumber && input.pricingBehavior === PricingInputBehavior.None) {
        this.pushSingleInputRow(
          result,
          input,
          0,
          input.min ?? null,
          input.max ?? null,
        );
        return;
      }

      if (
        isNumber &&
        input.pricingBehavior === PricingInputBehavior.Dimensional
      ) {
        result.push({
          inputDefinitionId: input.inputDefinitionId,
          inputValueId: null,
          pricingBehavior: input.pricingBehavior,
          amount: 0,
          isRequired: input.isRequired,
          priority: input.priority,
          dependsOnInputDefinitionId: null,
          dependsOnInputValueId: null,
          min: input.min ?? null,
          max: input.max ?? null,
        });
        return;
      }

      if (
        (isNumber || isBoolean) &&
        (input.pricingBehavior === PricingInputBehavior.Fixed ||
          input.pricingBehavior === PricingInputBehavior.Rate ||
          input.pricingBehavior === PricingInputBehavior.None)
      ) {
        this.pushSingleInputRow(
          result,
          input,
          input.pricingBehavior === PricingInputBehavior.None
            ? 0
            : (input.amount ?? 0),
          isNumber ? (input.min ?? null) : null,
          isNumber ? (input.max ?? null) : null,
        );
        return;
      }

      if (
        isSelect &&
        (input.pricingBehavior === PricingInputBehavior.None ||
          input.pricingBehavior === PricingInputBehavior.Fixed ||
          input.pricingBehavior === PricingInputBehavior.Rate)
      ) {
        values.forEach((value) => {
          const rows = value.rates?.length
            ? value.rates
            : [{ amount: 0 } as PricingRateRowUI];

          rows.forEach((rate) => {
            if (rate.amount == null || rate.amount < 0) return;

            const parent = this.findParentByValue(rate.dependsOnInputValueId);

            result.push({
              inputDefinitionId: input.inputDefinitionId,
              inputValueId: value.id,
              pricingBehavior: input.pricingBehavior,
              amount:
                input.pricingBehavior === PricingInputBehavior.None
                  ? 0
                  : (rate.amount ?? 0),
              isRequired: input.isRequired,
              priority: input.priority,
              dependsOnInputDefinitionId:
                rate.dependsOnInputDefinitionId ??
                parent?.inputDefinitionId ??
                null,
              dependsOnInputValueId: rate.dependsOnInputValueId ?? null,
            });
          });
        });
      }
    });

    return result;
  }

  private pushSingleInputRow(
    result: PricingInputSaveRow[],
    input: PricingInputEditUI,
    amount: number,
    min: number | null,
    max: number | null,
  ): void {
    const parent = this.findParentByValue(input.dependsOnInputValueId);

    result.push({
      inputDefinitionId: input.inputDefinitionId,
      inputValueId: null,
      pricingBehavior: input.pricingBehavior,
      amount,
      isRequired: input.isRequired,
      priority: input.priority,
      dependsOnInputDefinitionId:
        input.dependsOnInputDefinitionId ?? parent?.inputDefinitionId ?? null,
      dependsOnInputValueId: input.dependsOnInputValueId ?? null,
      min,
      max,
    });
  }

  onSubmit(): void {
    if (this.pricingMode !== 'Dynamic') {
      this.toast.show(
        'This service is static. Inputs are not editable.',
        'error',
      );
      return;
    }

    if (!this.validateNumericMinMax()) return;

    const pricingInputs = this.buildPayload();

    this.saving = true;

    this.serviceService
      .updateServiceInputs(this.serviceId, { pricingInputs })
      .subscribe({
        next: (res) => {
          this.saving = false;

          if (res.success) {
            this.toast.show(
              res.message ?? 'Inputs updated successfully',
              'success',
            );
            this.router.navigate(['/admin/dashboard/Services']);
          } else {
            this.toast.show(res.message ?? 'Inputs update failed', 'error');
          }
        },
        error: (err) => {
          this.saving = false;
          this.toast.show(
            err.error?.message ?? 'Inputs update failed',
            'error',
          );
        },
      });
  }
}
