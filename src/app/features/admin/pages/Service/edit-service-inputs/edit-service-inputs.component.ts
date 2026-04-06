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
  dependsOnValueId?: number;
  dependsOnInputDefinitionId?: number;
}

export interface PricingValueUI {
  id: number;
  value: string;
  displayName?: string;
  rates: PricingRateRowUI[];
}

interface PricingInputSaveRow {
  inputDefinitionId: number;
  inputValueId?: number | null;
  pricingBehavior: PricingInputBehavior;
  amount: number;
  isRequired: boolean;
  priority: number;
  dependsOnInputDefinitionId?: number | null;
  dependsOnInputValueId?: number | null;
}

interface PricingRulePreview {
  pricingBehavior: PricingInputBehavior;
  amount: number;
  priority: number;
  dependsOnValueId?: number;
  previewNumericValue?: number;
}

@Component({
  selector: 'app-edit-service-inputs',
  templateUrl: './edit-service-inputs.component.html',
  styleUrls: ['./edit-service-inputs.component.scss'],
})
export class EditServiceInputsComponent implements OnInit {
  serviceId!: number;
  serviceName? = '';
  pricingMode: 'Static' | 'Dynamic' = 'Static';
  saving = false;

  pricingInputs: PricingInputUI[] = [];
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

    const inputMap = new Map<number, PricingInputUI>();

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
            rule.pricingBehavior === PricingInputBehavior.Fixed ||
            rule.pricingBehavior === PricingInputBehavior.Dimensional
              ? (rule.amount ?? 0)
              : 0,
          isRequired: rule.isRequired,
          priority: rule.priority,
          previewNumericValue: undefined,
          previewSelectedValueId: undefined,
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

        value.rates.push({
          amount: rule.amount ?? 0,
          dependsOnValueId: rule.dependsOnInputValueId ?? undefined,
          dependsOnInputDefinitionId:
            rule.dependsOnInputDefinitionId ?? undefined,
        });
      }
    });

    // Always merge full value list for all Select inputs
    this.pricingInputs
      .filter((x) => x.dataType === MetadataDataType.Select)
      .forEach((x) => {
        this.loadInputValues(x.inputDefinitionId, true);
      });

    this.calculatePreview();
  }

  addPricingInput(def: InputDefinitionDto): void {
    const exists = this.pricingInputs.some(
      (p) => p.inputDefinitionId === def.id,
    );

    if (exists) {
      this.toast.show('This input is already added.', 'error');
      return;
    }

    const input: PricingInputUI = {
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
    };

    this.pricingInputs.push(input);

    if (def.dataType === MetadataDataType.Select) {
      this.loadInputValues(def.id);
    }

    this.reorderPriorities();
    this.calculatePreview();
  }

  addInputFromSelect(value: string): void {
    if (!value) return;

    const definitionId = Number(value);
    const def = this.inputDefinitions.find((d) => d.id === definitionId);

    if (!def) return;

    this.addPricingInput(def);
  }

  private loadInputValues(
    definitionId: number,
    mergeExistingRates = false,
  ): void {
    const existingValues = this.inputValuesMap[definitionId] ?? [];

    if (existingValues.length > 0 && !mergeExistingRates) {
      return;
    }

    this.inputValueService.getByInputDefinition(definitionId).subscribe({
      next: (res) => {
        if (!(res.success && res.data)) return;

        const fetchedValues = (res.data as any[]).map(
          (v: any): PricingValueUI => {
            const existing = existingValues.find((x) => x.id === v.id);

            return {
              id: v.id,
              value: v.code ?? v.value,
              displayName: v.displayName,
              rates: existing?.rates ?? [],
            };
          },
        );

        // keep saved values even if backend API no longer returned them
        const missingOldValues = existingValues.filter(
          (old) => !fetchedValues.some((f) => f.id === old.id),
        );

        this.inputValuesMap[definitionId] = [
          ...fetchedValues,
          ...missingOldValues,
        ];

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
      dependsOnValueId: undefined,
      dependsOnInputDefinitionId: undefined,
    });
  }

  removeRateRow(value: PricingValueUI, index: number): void {
    value.rates.splice(index, 1);
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

  private cleanupOrphanDependencies(): void {
    const allAvailableValueIds = new Set<number>();

    Object.values(this.inputValuesMap).forEach((values) => {
      values.forEach((v) => allAvailableValueIds.add(v.id));
    });

    Object.values(this.inputValuesMap).forEach((values) => {
      values.forEach((v) => {
        v.rates.forEach((rate) => {
          if (
            rate.dependsOnValueId &&
            !allAvailableValueIds.has(rate.dependsOnValueId)
          ) {
            rate.dependsOnValueId = undefined;
            rate.dependsOnInputDefinitionId = undefined;
          }
        });
      });
    });
  }

  onDependencyValueChange(rateRow: PricingRateRowUI, valueId: number): void {
    const numericValueId = valueId ? +valueId : undefined;

    rateRow.dependsOnValueId = numericValueId;

    if (!numericValueId) {
      rateRow.dependsOnInputDefinitionId = undefined;
      this.calculatePreview();
      return;
    }

    const parent = this.findParentByValue(numericValueId);
    rateRow.dependsOnInputDefinitionId = parent?.inputDefinitionId;

    this.calculatePreview();
  }

  private findParentByValue(valueId: number): PricingInputUI | undefined {
    return this.pricingInputs.find((p) =>
      this.inputValuesMap[p.inputDefinitionId]?.some((v) => v.id === valueId),
    );
  }

  shouldShowDependency(
    input: PricingInputUI,
    value: PricingValueUI,
    rateRow: PricingRateRowUI,
  ): boolean {
    if (input.pricingBehavior !== PricingInputBehavior.Rate) return false;
    if (!rateRow.amount || rateRow.amount <= 0) return false;

    return this.pricingInputs.some(
      (p) =>
        p.inputDefinitionId !== input.inputDefinitionId &&
        p.dataType === MetadataDataType.Select &&
        (this.inputValuesMap[p.inputDefinitionId]?.length ?? 0) > 0,
    );
  }

  getDependencyOptions(currentInput: PricingInputUI): {
    parent: PricingInputUI;
    value: PricingValueUI;
  }[] {
    const options: { parent: PricingInputUI; value: PricingValueUI }[] = [];

    this.pricingInputs.forEach((parent) => {
      if (parent.inputDefinitionId === currentInput.inputDefinitionId) return;
      if (parent.dataType !== MetadataDataType.Select) return;

      const values = this.inputValuesMap[parent.inputDefinitionId] || [];

      if (parent.previewSelectedValueId) {
        const matched = values.find(
          (v) => v.id === parent.previewSelectedValueId,
        );
        if (matched) {
          options.push({ parent, value: matched });
        }
        return;
      }

      values.forEach((v) => options.push({ parent, value: v }));
    });

    return options;
  }

  calculatePreview(): void {
    let dimension = 1;
    let rateSum = 0;
    let fixedCost = 0;
    let hasDimension = false;

    const selectedValues: number[] = [];

    this.pricingInputs.forEach((input) => {
      if (input.previewSelectedValueId) {
        selectedValues.push(input.previewSelectedValueId);
      }
    });

    const rules: PricingRulePreview[] = [];

    this.pricingInputs.forEach((input) => {
      if (input.pricingBehavior === PricingInputBehavior.Fixed) {
        if ((input.amount ?? 0) > 0) {
          rules.push({
            pricingBehavior: input.pricingBehavior,
            amount: input.amount ?? 0,
            priority: input.priority,
          });
        }
        return;
      }

      if (input.pricingBehavior === PricingInputBehavior.Dimensional) {
        rules.push({
          pricingBehavior: input.pricingBehavior,
          amount: input.amount ?? 0,
          priority: input.priority,
          previewNumericValue: input.previewNumericValue,
        });
        return;
      }

      if (input.pricingBehavior === PricingInputBehavior.Rate) {
        const values = this.inputValuesMap[input.inputDefinitionId] || [];

        values.forEach((v) => {
          v.rates.forEach((rateRow) => {
            if (!rateRow.amount || rateRow.amount <= 0) return;

            rules.push({
              pricingBehavior: input.pricingBehavior,
              amount: rateRow.amount,
              dependsOnValueId: rateRow.dependsOnValueId,
              priority: input.priority,
            });
          });
        });
      }
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
          if (
            rule.previewNumericValue == null ||
            rule.previewNumericValue <= 0
          ) {
            continue;
          }
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
      this.previewBaseCost = fixedCost;
      return;
    }

    this.previewBaseCost = dimension * rateSum + fixedCost;
  }

  getPricingTypeLabel(input: PricingInputUI): string {
    switch (input.pricingBehavior) {
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

  buildPayload(): PricingInputSaveRow[] {
    const result: PricingInputSaveRow[] = [];

    this.pricingInputs.forEach((input) => {
      if (input.pricingBehavior === PricingInputBehavior.Rate) {
        const values = this.inputValuesMap[input.inputDefinitionId] || [];

        values.forEach((v) => {
          v.rates.forEach((rate) => {
            if (!rate.amount || rate.amount <= 0) return;

            const parent =
              rate.dependsOnValueId != null
                ? this.findParentByValue(rate.dependsOnValueId)
                : null;

            result.push({
              inputDefinitionId: input.inputDefinitionId,
              inputValueId: v.id,
              pricingBehavior: input.pricingBehavior,
              amount: rate.amount,
              isRequired: input.isRequired,
              priority: input.priority,
              dependsOnInputDefinitionId:
                rate.dependsOnInputDefinitionId ??
                parent?.inputDefinitionId ??
                null,
              dependsOnInputValueId: rate.dependsOnValueId ?? null,
            });
          });
        });
      }

      if (input.pricingBehavior === PricingInputBehavior.Fixed) {
        if ((input.amount ?? 0) <= 0) return;

        result.push({
          inputDefinitionId: input.inputDefinitionId,
          inputValueId: null,
          pricingBehavior: input.pricingBehavior,
          amount: input.amount ?? 0,
          isRequired: input.isRequired,
          priority: input.priority,
          dependsOnInputDefinitionId: null,
          dependsOnInputValueId: null,
        });
      }

      if (input.pricingBehavior === PricingInputBehavior.Dimensional) {
        result.push({
          inputDefinitionId: input.inputDefinitionId,
          inputValueId: null,
          pricingBehavior: input.pricingBehavior,
          amount: input.amount ?? 0,
          isRequired: input.isRequired,
          priority: input.priority,
          dependsOnInputDefinitionId: null,
          dependsOnInputValueId: null,
        });
      }
    });

    return result;
  }

  onSubmit(): void {
    if (this.pricingMode !== 'Dynamic') {
      this.toast.show(
        'This service is static. Inputs are not editable.',
        'error',
      );
      return;
    }

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
