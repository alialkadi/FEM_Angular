import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ServiceService } from '../../../Services/service-service.service';
import { InputDefinitionService } from '../../../Services/input-definition.service';
import { InputValueService } from '../../../Services/input-value.service';
import { ToastService } from '../../../../../shared/Services/toast.service';

import {
  CalculationRuleFactorConditionUI,
  CalculationRuleFactorUI,
  CalculationRuleUI,
  DecisionRuleUI,
  InputDefinitionDto,
  PricingInputBehavior,
  ServiceCalculationRuleType,
  ServiceDecisionRuleType,
  ServiceResponse,
} from '../../../../Models/service.Model';

import { PricingInputUI } from '../../../../Models/InputValueDto.model';
import { MetadataDataType } from '../../../../Models/MetadataTargetType';

interface PricingRateRowUI {
  amount: number;
  dependsOnInputDefinitionId?: number | null;
  dependsOnInputValueId?: number | null;
}

export interface PricingValueUI {
  id: number;
  value: string;
  code?: string;
  displayName?: string;
  rates: PricingRateRowUI[];
}

type PricingInputEditUI = Omit<
  PricingInputUI,
  | 'selectedInputValueId'
  | 'dependsOnInputDefinitionId'
  | 'dependsOnInputValueId'
  | 'min'
  | 'max'
> & {
  selectedInputValueId?: number | null;
  dependsOnInputDefinitionId?: number | null;
  dependsOnInputValueId?: number | null;
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

interface UpdateServiceInputsPayload {
  pricingInputs: PricingInputSaveRow[];
  calculationRules: CalculationRuleUI[];
  decisionRules: DecisionRuleUI[];
}

interface PricingDependencyOption {
  parent: PricingInputEditUI;
  value: PricingValueUI;
}

interface PricingRulePreview {
  pricingBehavior: PricingInputBehavior;
  amount: number;
  priority: number;
  dependsOnInputValueId?: number | null;
  previewNumericValue?: number | null;
}

@Component({
  selector: 'app-edit-service-inputs',
  templateUrl: './edit-service-inputs.component.html',
  styleUrls: ['./edit-service-inputs.component.scss'],
})
export class EditServiceInputsComponent implements OnInit {
  serviceId!: number;
  serviceName = '';
  pricingMode: 'Static' | 'Dynamic' = 'Static';
  saving = false;

  pricingInputs: PricingInputEditUI[] = [];
  inputDefinitions: InputDefinitionDto[] = [];

  // Selected values only. This is what is submitted.
  inputValuesMap: Record<number, PricingValueUI[]> = {};

  // All available values for dropdowns. This is not submitted directly.
  availableInputValuesMap: Record<number, PricingValueUI[]> = {};

  calculationRules: CalculationRuleUI[] = [];
  decisionRules: DecisionRuleUI[] = [];

  previewBaseCost = 0;

  PricingInputBehavior = PricingInputBehavior;
  MetadataDataType = MetadataDataType;
  ServiceCalculationRuleType = ServiceCalculationRuleType;
  ServiceDecisionRuleType = ServiceDecisionRuleType;

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

  private loadInputDefinitions(): void {
    this.inputDefinitionService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.inputDefinitions = Array.isArray(res.data)
            ? (res.data as InputDefinitionDto[])
            : ((res.data as any).items ??
              (res.data as any).inputDefinitions ??
              []);
        }
      },
      error: () => {
        this.toast.show('Failed to load pricing definitions', 'error');
      },
    });
  }

  private loadService(): void {
    this.serviceService.getServicesById(this.serviceId).subscribe({
      next: (res) => {
        if (!res.success || !res.data) return;

        const service: ServiceResponse | any = res.data;
        this.serviceName = service.name ?? service.serviceName ?? '';
        this.pricingMode = this.resolvePricingMode(service.pricingMode);

        if (this.pricingMode === 'Static') {
          this.resetDynamicState();
          return;
        }

        const pricingRows =
          service.requiredInputs ??
          service.pricingInputs ??
          service.serviceInputPricings ??
          [];

        this.hydratePricingFromBackend(pricingRows);
        this.hydrateCalculationRulesFromBackend(service);
        this.hydrateDecisionRulesFromBackend(service);
        this.cleanupInvalidRuleReferences();
      },
      error: (err) => {
        this.toast.show(
          err.error?.message ?? 'Failed to load service',
          'error',
        );
      },
    });
  }

  private resolvePricingMode(value: any): 'Static' | 'Dynamic' {
    if (value === 'Dynamic' || value === 2) return 'Dynamic';
    if (value === 'Static' || value === 1) return 'Static';
    return 'Static';
  }

  private resetDynamicState(): void {
    this.pricingInputs = [];
    this.inputValuesMap = {};
    this.availableInputValuesMap = {};
    this.calculationRules = [];
    this.decisionRules = [];
    this.previewBaseCost = 0;
  }

  private hydratePricingFromBackend(requiredInputs: any[]): void {
    this.pricingInputs = [];
    this.inputValuesMap = {};
    this.availableInputValuesMap = {};
    this.previewBaseCost = 0;

    const inputMap = new Map<number, PricingInputEditUI>();

    requiredInputs.forEach((row: any) => {
      const inputDefinitionId = Number(row.inputDefinitionId);
      if (!inputDefinitionId) return;

      let input = inputMap.get(inputDefinitionId);

      if (!input) {
        input = {
          inputDefinitionId,
          label: row.label ?? row.inputLabel ?? row.inputDefinitionLabel ?? '',
          code: row.code ?? row.inputCode ?? row.inputDefinitionCode ?? '',
          dataType: Number(row.dataType),
          pricingBehavior: Number(row.pricingBehavior),
          amount:
            Number(row.dataType) !== MetadataDataType.Select
              ? Number(row.amount ?? 0)
              : 0,
          isRequired: Boolean(row.isRequired),
          priority: Number(row.priority ?? this.pricingInputs.length + 1),
          previewNumericValue: undefined,
          previewSelectedValueId: undefined,
          selectedInputValueId: null,
          dependsOnInputValueId:
            Number(row.dataType) !== MetadataDataType.Select
              ? this.toNullableNumber(row.dependsOnInputValueId)
              : null,
          dependsOnInputDefinitionId:
            Number(row.dataType) !== MetadataDataType.Select
              ? this.toNullableNumber(row.dependsOnInputDefinitionId)
              : null,
          min:
            Number(row.dataType) === MetadataDataType.Number
              ? this.toNullableNumber(row.min)
              : null,
          max:
            Number(row.dataType) === MetadataDataType.Number
              ? this.toNullableNumber(row.max)
              : null,
        } as PricingInputEditUI;

        inputMap.set(inputDefinitionId, input);
        this.pricingInputs.push(input);

        if (input.dataType === MetadataDataType.Select) {
          this.inputValuesMap[inputDefinitionId] = [];
        }
      }

      const inputValueId = this.toNullableNumber(row.inputValueId);

      if (inputValueId) {
        const selectedValues = (this.inputValuesMap[inputDefinitionId] =
          this.inputValuesMap[inputDefinitionId] ?? []);

        let value = selectedValues.find((x) => Number(x.id) === inputValueId);

        if (!value) {
          value = this.createPricingValueRow({
            id: inputValueId,
            value:
              row.inputValueCode ??
              row.inputValueValue ??
              row.value ??
              String(inputValueId),
            displayName:
              row.inputValueLabel ??
              row.inputValueDisplayName ??
              row.displayName,
            rates: [],
          });

          value.rates = [];
          selectedValues.push(value);
        }

        value.rates.push({
          amount:
            input.pricingBehavior === PricingInputBehavior.None
              ? 0
              : Number(row.amount ?? 0),
          dependsOnInputValueId: this.toNullableNumber(
            row.dependsOnInputValueId,
          ),
          dependsOnInputDefinitionId: this.toNullableNumber(
            row.dependsOnInputDefinitionId,
          ),
        });
      }
    });

    this.pricingInputs
      .filter((input) => input.dataType === MetadataDataType.Select)
      .forEach((input) => this.loadInputValues(input.inputDefinitionId));

    this.reorderPriorities();
    this.cleanupOrphanDependencies();
    this.calculatePreview();
  }

  private hydrateCalculationRulesFromBackend(service: any): void {
    const rules =
      service.calculationRules ??
      service.serviceCalculationRules ??
      service.calculatedOutputRules ??
      [];

    this.calculationRules = (rules as any[]).map((rule: any) => ({
      ruleName: rule.ruleName ?? '',
      outputCode: rule.outputCode ?? '',
      outputLabel: rule.outputLabel ?? '',
      unitLabel: rule.unitLabel ?? '',
      ruleType:
        Number(rule.ruleType) ||
        ServiceCalculationRuleType.MultiplyTwoNumbersBySelectedFactor,
      firstNumberInputDefinitionId: this.toNullableNumber(
        rule.firstNumberInputDefinitionId,
      ),
      secondNumberInputDefinitionId: this.toNullableNumber(
        rule.secondNumberInputDefinitionId,
      ),
      displayToUser: rule.displayToUser ?? true,
      displayToAdmin: rule.displayToAdmin ?? true,
      factors: (
        (rule.factors ?? rule.serviceCalculationRuleFactors ?? []) as any[]
      ).map((factor: any, index: number) => ({
        factor: this.toNullableNumber(factor.factor),
        sortOrder: Number(factor.sortOrder ?? index + 1),
        dependsOnInputDefinitionId: this.toNullableNumber(
          factor.dependsOnInputDefinitionId,
        ),
        dependsOnInputValueId: this.toNullableNumber(
          factor.dependsOnInputValueId,
        ),
        conditions: (
          factor.conditions ??
          factor.serviceCalculationRuleFactorConditions ??
          []
        ).map((condition: any) => ({
          inputDefinitionId: this.toNullableNumber(condition.inputDefinitionId),
          inputValueId: this.toNullableNumber(condition.inputValueId),
        })),
      })),
    })) as CalculationRuleUI[];
  }

  private hydrateDecisionRulesFromBackend(service: any): void {
    const rules =
      service.decisionRules ??
      service.serviceDecisionRules ??
      service.labourRules ??
      [];

    this.decisionRules = (rules as any[]).map((rule: any) => ({
      ruleName: rule.ruleName ?? '',
      outputCode: rule.outputCode ?? '',
      outputLabel: rule.outputLabel ?? '',
      ruleType:
        Number(rule.ruleType) ||
        ServiceDecisionRuleType.CalculatedValueAndTwoNumberLimits,
      sourceOutputCode:
        rule.sourceOutputCode ??
        rule.sourceCalculationRuleOutputCode ??
        rule.sourceCalculationRule?.outputCode ??
        '',
      maxCalculatedValue: this.toNullableNumber(rule.maxCalculatedValue),
      firstNumberInputDefinitionId: this.toNullableNumber(
        rule.firstNumberInputDefinitionId,
      ),
      maxFirstNumberValue: this.toNullableNumber(rule.maxFirstNumberValue),
      secondNumberInputDefinitionId: this.toNullableNumber(
        rule.secondNumberInputDefinitionId,
      ),
      maxSecondNumberValue: this.toNullableNumber(rule.maxSecondNumberValue),
      successValue: this.toNullableNumber(rule.successValue),
      failureValue: this.toNullableNumber(rule.failureValue),
      displayToUser: rule.displayToUser ?? true,
      displayToAdmin: rule.displayToAdmin ?? true,
      ranges: (
        (rule.ranges ?? rule.serviceDecisionRuleRanges ?? []) as any[]
      ).map((range: any, index: number) => ({
        minValue: this.toNullableNumber(range.minValue),
        maxValue: this.toNullableNumber(range.maxValue),
        resultValue: this.toNullableNumber(range.resultValue),
        sortOrder: Number(range.sortOrder ?? index + 1),
      })),
    })) as DecisionRuleUI[];
  }

  private toNullableNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }

  addInputFromSelect(value: string): void {
    if (!value) return;

    const definitionId = Number(value);
    const definition = this.inputDefinitions.find(
      (d) => Number(d.id) === definitionId,
    );
    if (!definition) return;

    this.addPricingInput(definition);
  }

  addPricingInput(def: InputDefinitionDto): void {
    const exists = this.pricingInputs.some(
      (p) => Number(p.inputDefinitionId) === Number(def.id),
    );

    if (exists) {
      this.toast.show('This input is already added.', 'error');
      return;
    }

    const input: PricingInputEditUI = {
      inputDefinitionId: Number(def.id),
      label: def.label,
      code: def.code,
      dataType: Number(def.dataType),
      pricingBehavior: Number(def.pricingBehavior),
      amount: 0,
      isRequired: true,
      priority: this.pricingInputs.length + 1,
      previewNumericValue: undefined,
      previewSelectedValueId: undefined,
      selectedInputValueId: null,
      dependsOnInputDefinitionId: null,
      dependsOnInputValueId: null,
      min: Number(def.dataType) === MetadataDataType.Number ? null : null,
      max: Number(def.dataType) === MetadataDataType.Number ? null : null,
    } as PricingInputEditUI;

    this.pricingInputs.push(input);

    if (input.dataType === MetadataDataType.Select) {
      this.inputValuesMap[input.inputDefinitionId] = [];
      this.loadInputValues(input.inputDefinitionId);
    }

    this.reorderPriorities();
    this.calculatePreview();
  }

  private loadInputValues(definitionId: number): void {
    if (this.availableInputValuesMap[definitionId]) return;

    this.inputValueService.getByInputDefinition(definitionId).subscribe({
      next: (res) => {
        if (!(res.success && res.data)) return;

        const raw = Array.isArray(res.data)
          ? res.data
          : ((res.data as any).values ??
            (res.data as any).inputValues ??
            (res.data as any).items ??
            []);

        this.availableInputValuesMap[definitionId] = raw.map((value: any) =>
          this.createPricingValueRow(value),
        );

        this.inputValuesMap[definitionId] =
          this.inputValuesMap[definitionId] ?? [];

        // Keep old selected values visible even if they are missing from the current value endpoint.
        const availableIds = new Set(
          this.availableInputValuesMap[definitionId].map((x) => Number(x.id)),
        );

        const missingSelectedValues = this.inputValuesMap[definitionId].filter(
          (selected) => !availableIds.has(Number(selected.id)),
        );

        this.availableInputValuesMap[definitionId] = [
          ...this.availableInputValuesMap[definitionId],
          ...missingSelectedValues,
        ];

        this.cleanupOrphanDependencies();
        this.cleanupInvalidRuleReferences();
        this.calculatePreview();
      },
      error: () => {
        this.toast.show('Failed to load input values', 'error');
      },
    });
  }

  private createPricingValueRow(value: any): PricingValueUI {
    return {
      id: Number(value.id),
      value: value.value ?? value.code ?? String(value.id),
      code: value.code ?? value.value ?? String(value.id),
      displayName:
        value.displayName ?? value.label ?? value.name ?? value.value,
      rates: value.rates?.length
        ? value.rates
        : [
            {
              amount: 0,
              dependsOnInputDefinitionId: null,
              dependsOnInputValueId: null,
            },
          ],
    };
  }

  getSelectedValuesForInput(input: PricingInputEditUI): PricingValueUI[] {
    return this.inputValuesMap[input.inputDefinitionId] ?? [];
  }

  getAvailableValuesToAdd(input: PricingInputEditUI): PricingValueUI[] {
    const availableValues =
      this.availableInputValuesMap[input.inputDefinitionId] ?? [];
    const selectedValueIds = new Set(
      this.getSelectedValuesForInput(input).map((x) => Number(x.id)),
    );

    return availableValues.filter(
      (value) => !selectedValueIds.has(Number(value.id)),
    );
  }

  addSelectedValueToInput(input: PricingInputEditUI): void {
    const selectedValueId = Number(input.selectedInputValueId);
    if (!selectedValueId) return;

    const value = (
      this.availableInputValuesMap[input.inputDefinitionId] ?? []
    ).find((x) => Number(x.id) === selectedValueId);

    if (!value) {
      this.toast.show('Selected value was not found.', 'error');
      return;
    }

    const selectedValues = (this.inputValuesMap[input.inputDefinitionId] =
      this.inputValuesMap[input.inputDefinitionId] ?? []);

    if (selectedValues.some((x) => Number(x.id) === selectedValueId)) {
      input.selectedInputValueId = null;
      return;
    }

    selectedValues.push(this.createPricingValueRow(value));
    input.selectedInputValueId = null;
    this.calculatePreview();
  }

  removeSelectedInputValue(
    input: PricingInputEditUI,
    valueIndex: number,
  ): void {
    const selectedValues = this.inputValuesMap[input.inputDefinitionId] ?? [];
    const removed = selectedValues[valueIndex];

    selectedValues.splice(valueIndex, 1);

    if (removed) {
      this.cleanupDependencyReferences([Number(removed.id)]);
      this.cleanupInvalidRuleReferences();
    }

    this.calculatePreview();
  }

  addRateRow(value: PricingValueUI): void {
    value.rates.push({
      amount: 0,
      dependsOnInputDefinitionId: null,
      dependsOnInputValueId: null,
    });
  }

  removeRateRow(value: PricingValueUI, index: number): void {
    value.rates.splice(index, 1);

    if (!value.rates.length) {
      this.addRateRow(value);
    }

    this.calculatePreview();
  }

  removePricingInput(index: number): void {
    const removed = this.pricingInputs[index];
    if (!removed) return;

    const removedValueIds = (
      this.inputValuesMap[removed.inputDefinitionId] ?? []
    ).map((x) => Number(x.id));

    this.pricingInputs.splice(index, 1);
    delete this.inputValuesMap[removed.inputDefinitionId];
    delete this.availableInputValuesMap[removed.inputDefinitionId];

    this.cleanupDependencyReferences(removedValueIds);
    this.cleanupRulesByRemovedInput(removed.inputDefinitionId);
    this.reorderPriorities();
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

  getDependencyOptions(
    currentInput: PricingInputEditUI,
  ): PricingDependencyOption[] {
    const options: PricingDependencyOption[] = [];

    this.pricingInputs.forEach((parent) => {
      if (
        Number(parent.inputDefinitionId) ===
        Number(currentInput.inputDefinitionId)
      )
        return;
      if (parent.dataType !== MetadataDataType.Select) return;

      const values = this.inputValuesMap[parent.inputDefinitionId] ?? [];
      values.forEach((value) => options.push({ parent, value }));
    });

    return options;
  }

  onInputDependencyChange(
    model: PricingRateRowUI | PricingInputEditUI,
    valueId: number | null | undefined,
  ): void {
    if (!valueId) {
      model.dependsOnInputDefinitionId = null;
      model.dependsOnInputValueId = null;
      this.calculatePreview();
      return;
    }

    const parent = this.findParentByValue(Number(valueId));
    model.dependsOnInputDefinitionId = parent?.inputDefinitionId ?? null;
    model.dependsOnInputValueId = Number(valueId);
    this.calculatePreview();
  }

  private findParentByValue(
    valueId?: number | null,
  ): PricingInputEditUI | undefined {
    if (!valueId) return undefined;

    return this.pricingInputs.find((input) =>
      (this.inputValuesMap[input.inputDefinitionId] ?? []).some(
        (value) => Number(value.id) === Number(valueId),
      ),
    );
  }

  private cleanupDependencyReferences(removedValueIds: number[]): void {
    if (!removedValueIds.length) return;

    const removedSet = new Set(removedValueIds.map((x) => Number(x)));

    for (const input of this.pricingInputs) {
      if (
        input.dependsOnInputValueId != null &&
        removedSet.has(Number(input.dependsOnInputValueId))
      ) {
        input.dependsOnInputDefinitionId = null;
        input.dependsOnInputValueId = null;
      }

      for (const value of this.inputValuesMap[input.inputDefinitionId] ?? []) {
        for (const rate of value.rates ?? []) {
          if (
            rate.dependsOnInputValueId != null &&
            removedSet.has(Number(rate.dependsOnInputValueId))
          ) {
            rate.dependsOnInputDefinitionId = null;
            rate.dependsOnInputValueId = null;
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

  private cleanupOrphanDependencies(): void {
    const allSelectedValueIds = new Set<number>();

    Object.values(this.inputValuesMap).forEach((values) => {
      values.forEach((value) => allSelectedValueIds.add(Number(value.id)));
    });

    this.pricingInputs.forEach((input) => {
      if (
        input.dependsOnInputValueId &&
        !allSelectedValueIds.has(Number(input.dependsOnInputValueId))
      ) {
        input.dependsOnInputDefinitionId = null;
        input.dependsOnInputValueId = null;
      }
    });

    Object.values(this.inputValuesMap).forEach((values) => {
      values.forEach((value) => {
        value.rates.forEach((rate) => {
          if (
            rate.dependsOnInputValueId &&
            !allSelectedValueIds.has(Number(rate.dependsOnInputValueId))
          ) {
            rate.dependsOnInputDefinitionId = null;
            rate.dependsOnInputValueId = null;
          }
        });
      });
    });
  }

  // ================= CALCULATION RULE HELPERS =================
  getNumberPricingInputs(): PricingInputEditUI[] {
    return this.pricingInputs.filter(
      (x) => x.dataType === MetadataDataType.Number,
    );
  }

  getSelectPricingInputs(): PricingInputEditUI[] {
    return this.pricingInputs.filter(
      (x) => x.dataType === MetadataDataType.Select,
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
      outputCode: this.generateUniqueOutputCode('estimated_weight_kg'),
      outputLabel: 'Estimated Weight',
      unitLabel: 'kg',
      ruleType: ServiceCalculationRuleType.MultiplyTwoNumbersBySelectedFactor,
      firstNumberInputDefinitionId: numberInputs[0].inputDefinitionId,
      secondNumberInputDefinitionId: numberInputs[1].inputDefinitionId,
      displayToUser: true,
      displayToAdmin: true,
      factors: [],
    } as CalculationRuleUI);
  }

  removeCalculationRule(index: number): void {
    const removed = this.calculationRules[index];
    this.calculationRules.splice(index, 1);

    if (removed?.outputCode) {
      const removedCode = removed.outputCode.trim().toLowerCase();
      this.decisionRules = this.decisionRules.filter(
        (x) => (x.sourceOutputCode ?? '').trim().toLowerCase() !== removedCode,
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
    } as CalculationRuleFactorUI);
  }

  removeCalculationFactorRow(
    rule: CalculationRuleUI,
    factorIndex: number,
  ): void {
    rule.factors.splice(factorIndex, 1);
    rule.factors.forEach((factor, index) => (factor.sortOrder = index + 1));
  }

  canShowFactorDependency(factor: CalculationRuleFactorUI): boolean {
    return this.getFactorDependencyOptions(factor).length > 0;
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
  ): PricingInputEditUI[] {
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

  // ================= DECISION RULE HELPERS =================
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
      outputCode: this.generateUniqueOutputCode('labour_count', 'decision'),
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
    } as DecisionRuleUI);
  }

  removeDecisionRule(index: number): void {
    this.decisionRules.splice(index, 1);
  }

  onDecisionRuleTypeChange(rule: DecisionRuleUI): void {
    if (rule.ruleType === ServiceDecisionRuleType.CalculatedValueRange) {
      rule.maxCalculatedValue = null;
      rule.maxFirstNumberValue = null;
      rule.maxSecondNumberValue = null;
      rule.successValue = null;
      rule.failureValue = null;

      if (!rule.ranges?.length) {
        rule.ranges = [];
        this.addDecisionRange(rule);
      }
    }

    if (
      rule.ruleType ===
      ServiceDecisionRuleType.CalculatedValueAndTwoNumberLimits
    ) {
      rule.ranges = [];
      rule.maxCalculatedValue = rule.maxCalculatedValue ?? 15;
      rule.maxFirstNumberValue = rule.maxFirstNumberValue ?? 36;
      rule.maxSecondNumberValue = rule.maxSecondNumberValue ?? 36;
      rule.successValue = rule.successValue ?? 1;
      rule.failureValue = rule.failureValue ?? 2;
    }
  }

  addDecisionRange(rule: DecisionRuleUI): void {
    rule.ranges = rule.ranges ?? [];
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
    rule.ranges.forEach((range, i) => (range.sortOrder = i + 1));
  }

  private generateUniqueOutputCode(
    base: string,
    type: 'calculation' | 'decision' = 'calculation',
  ): string {
    const usedCodes = new Set(
      (type === 'calculation' ? this.calculationRules : this.decisionRules).map(
        (x: any) =>
          String(x.outputCode ?? '')
            .trim()
            .toLowerCase(),
      ),
    );

    let code = base;
    let index = 2;

    while (usedCodes.has(code.toLowerCase())) {
      code = `${base}_${index}`;
      index++;
    }

    return code;
  }

  private cleanupRulesByRemovedInput(removedInputDefinitionId: number): void {
    const removedId = Number(removedInputDefinitionId);

    this.calculationRules = this.calculationRules.filter(
      (rule) =>
        Number(rule.firstNumberInputDefinitionId) !== removedId &&
        Number(rule.secondNumberInputDefinitionId) !== removedId,
    );

    for (const rule of this.calculationRules) {
      for (const factor of rule.factors ?? []) {
        if (Number(factor.dependsOnInputDefinitionId) === removedId) {
          factor.dependsOnInputDefinitionId = null;
          factor.dependsOnInputValueId = null;
        }

        factor.conditions = (factor.conditions ?? []).filter(
          (condition) => Number(condition.inputDefinitionId) !== removedId,
        );
      }
    }

    const existingOutputCodes = new Set(
      this.calculationRules.map((rule) =>
        String(rule.outputCode ?? '')
          .trim()
          .toLowerCase(),
      ),
    );

    this.decisionRules = this.decisionRules.filter((rule) => {
      if (Number(rule.firstNumberInputDefinitionId) === removedId) return false;
      if (Number(rule.secondNumberInputDefinitionId) === removedId)
        return false;

      const sourceOutputCode = String(rule.sourceOutputCode ?? '')
        .trim()
        .toLowerCase();
      return existingOutputCodes.has(sourceOutputCode);
    });
  }

  private cleanupInvalidRuleReferences(): void {
    const numberInputIds = new Set(
      this.getNumberPricingInputs().map((input) =>
        Number(input.inputDefinitionId),
      ),
    );

    const selectInputIds = new Set(
      this.getSelectPricingInputs().map((input) =>
        Number(input.inputDefinitionId),
      ),
    );

    const selectedValueIds = new Set<number>();
    Object.values(this.inputValuesMap).forEach((values) => {
      values.forEach((value) => selectedValueIds.add(Number(value.id)));
    });

    this.calculationRules = this.calculationRules.filter((rule) => {
      return (
        numberInputIds.has(Number(rule.firstNumberInputDefinitionId)) &&
        numberInputIds.has(Number(rule.secondNumberInputDefinitionId))
      );
    });

    for (const rule of this.calculationRules) {
      for (const factor of rule.factors ?? []) {
        if (
          factor.dependsOnInputDefinitionId != null &&
          !selectInputIds.has(Number(factor.dependsOnInputDefinitionId))
        ) {
          factor.dependsOnInputDefinitionId = null;
          factor.dependsOnInputValueId = null;
        }

        if (
          factor.dependsOnInputValueId != null &&
          !selectedValueIds.has(Number(factor.dependsOnInputValueId))
        ) {
          factor.dependsOnInputDefinitionId = null;
          factor.dependsOnInputValueId = null;
        }

        factor.conditions = (factor.conditions ?? []).filter((condition) => {
          if (!selectInputIds.has(Number(condition.inputDefinitionId)))
            return false;
          if (!selectedValueIds.has(Number(condition.inputValueId)))
            return false;
          return true;
        });
      }
    }

    const calculationOutputCodes = new Set(
      this.calculationRules.map((rule) =>
        String(rule.outputCode ?? '')
          .trim()
          .toLowerCase(),
      ),
    );

    this.decisionRules = this.decisionRules.filter((rule) => {
      const source = String(rule.sourceOutputCode ?? '')
        .trim()
        .toLowerCase();
      if (!calculationOutputCodes.has(source)) return false;

      if (
        rule.ruleType ===
        ServiceDecisionRuleType.CalculatedValueAndTwoNumberLimits
      ) {
        return (
          numberInputIds.has(Number(rule.firstNumberInputDefinitionId)) &&
          numberInputIds.has(Number(rule.secondNumberInputDefinitionId))
        );
      }

      return true;
    });
  }

  // ================= VALIDATION =================
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

  private validateCalculationAndDecisionRules(): boolean {
    const calculationCodes = new Set<string>();

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

      const code = rule.outputCode.trim().toLowerCase();
      if (calculationCodes.has(code)) {
        this.toast.show(
          `Duplicate calculation output code "${code}".`,
          'error',
        );
        return false;
      }
      calculationCodes.add(code);

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

      if (!rule.factors?.length) {
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

        if (!factor.conditions?.length) {
          this.toast.show(
            'Each factor row must have at least one condition.',
            'error',
          );
          return false;
        }

        for (const condition of factor.conditions) {
          if (!condition.inputDefinitionId || !condition.inputValueId) {
            this.toast.show(
              'Each factor condition must have input and value.',
              'error',
            );
            return false;
          }
        }
      }
    }

    const decisionCodes = new Set<string>();

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

      const code = rule.outputCode.trim().toLowerCase();
      if (decisionCodes.has(code)) {
        this.toast.show(`Duplicate decision output code "${code}".`, 'error');
        return false;
      }
      decisionCodes.add(code);

      const sourceOutputCode = String(rule.sourceOutputCode ?? '')
        .trim()
        .toLowerCase();
      if (!sourceOutputCode || !calculationCodes.has(sourceOutputCode)) {
        this.toast.show('Decision rule source output is required.', 'error');
        return false;
      }

      if (rule.ruleType === ServiceDecisionRuleType.CalculatedValueRange) {
        if (!rule.ranges?.length) {
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

        if (Number(rule.successValue) <= 0 || Number(rule.failureValue) <= 0) {
          this.toast.show(
            'Decision success/failure values must be greater than zero.',
            'error',
          );
          return false;
        }
      }
    }

    return true;
  }

  // ================= PREVIEW + PAYLOAD =================
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
        !selectedValues.includes(Number(rule.dependsOnInputValueId))
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

  buildPricingInputsPayload(): PricingInputSaveRow[] {
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
        (input.pricingBehavior === PricingInputBehavior.None ||
          input.pricingBehavior === PricingInputBehavior.Fixed ||
          input.pricingBehavior === PricingInputBehavior.Rate)
      ) {
        this.pushSingleInputRow(
          result,
          input,
          input.pricingBehavior === PricingInputBehavior.None
            ? 0
            : Number(input.amount ?? 0),
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
            const parent = this.findParentByValue(rate.dependsOnInputValueId);

            result.push({
              inputDefinitionId: input.inputDefinitionId,
              inputValueId: value.id,
              pricingBehavior: input.pricingBehavior,
              amount:
                input.pricingBehavior === PricingInputBehavior.None
                  ? 0
                  : Number(rate.amount ?? 0),
              isRequired: input.isRequired,
              priority: input.priority,
              dependsOnInputDefinitionId:
                rate.dependsOnInputDefinitionId ??
                parent?.inputDefinitionId ??
                null,
              dependsOnInputValueId: rate.dependsOnInputValueId ?? null,
              min: null,
              max: null,
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

  private buildCalculationRulesPayload(): CalculationRuleUI[] {
    return this.calculationRules.map((rule) => ({
      ...rule,
      ruleName: rule.ruleName.trim(),
      outputCode: rule.outputCode.trim().toLowerCase(),
      outputLabel: rule.outputLabel.trim(),
      unitLabel: rule.unitLabel?.trim() ?? null,
      factors: rule.factors.map((factor, index) => ({
        ...factor,
        sortOrder: Number(factor.sortOrder ?? index + 1),
        factor: Number(factor.factor),
        dependsOnInputDefinitionId: factor.dependsOnInputDefinitionId ?? null,
        dependsOnInputValueId: factor.dependsOnInputValueId ?? null,
        conditions: factor.conditions.map((condition) => ({
          inputDefinitionId: Number(condition.inputDefinitionId),
          inputValueId: Number(condition.inputValueId),
        })),
      })),
    })) as CalculationRuleUI[];
  }

  private buildDecisionRulesPayload(): DecisionRuleUI[] {
    return this.decisionRules.map((rule) => ({
      ...rule,
      ruleName: rule.ruleName.trim(),
      outputCode: rule.outputCode.trim().toLowerCase(),
      outputLabel: rule.outputLabel.trim(),
      sourceOutputCode: String(rule.sourceOutputCode).trim().toLowerCase(),
      ranges:
        rule.ruleType === ServiceDecisionRuleType.CalculatedValueRange
          ? rule.ranges.map((range, index) => ({
              minValue: Number(range.minValue),
              maxValue: Number(range.maxValue),
              resultValue: Number(range.resultValue),
              sortOrder: Number(range.sortOrder ?? index + 1),
            }))
          : [],
      maxCalculatedValue:
        rule.ruleType ===
        ServiceDecisionRuleType.CalculatedValueAndTwoNumberLimits
          ? Number(rule.maxCalculatedValue)
          : 0,
      firstNumberInputDefinitionId:
        rule.ruleType ===
        ServiceDecisionRuleType.CalculatedValueAndTwoNumberLimits
          ? Number(rule.firstNumberInputDefinitionId)
          : 0,
      maxFirstNumberValue:
        rule.ruleType ===
        ServiceDecisionRuleType.CalculatedValueAndTwoNumberLimits
          ? Number(rule.maxFirstNumberValue)
          : 0,
      secondNumberInputDefinitionId:
        rule.ruleType ===
        ServiceDecisionRuleType.CalculatedValueAndTwoNumberLimits
          ? Number(rule.secondNumberInputDefinitionId)
          : 0,
      maxSecondNumberValue:
        rule.ruleType ===
        ServiceDecisionRuleType.CalculatedValueAndTwoNumberLimits
          ? Number(rule.maxSecondNumberValue)
          : 0,
      successValue:
        rule.ruleType ===
        ServiceDecisionRuleType.CalculatedValueAndTwoNumberLimits
          ? Number(rule.successValue)
          : 0,
      failureValue:
        rule.ruleType ===
        ServiceDecisionRuleType.CalculatedValueAndTwoNumberLimits
          ? Number(rule.failureValue)
          : 0,
    })) as DecisionRuleUI[];
  }

  // ================= LABELS =================
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

  onSubmit(): void {
    if (this.pricingMode !== 'Dynamic') {
      this.toast.show(
        'This service is static. Inputs are not editable.',
        'error',
      );
      return;
    }

    if (!this.validateNumericMinMax()) return;
    if (!this.validateCalculationAndDecisionRules()) return;

    const payload: UpdateServiceInputsPayload = {
      pricingInputs: this.buildPricingInputsPayload(),
      calculationRules: this.buildCalculationRulesPayload(),
      decisionRules: this.buildDecisionRulesPayload(),
    };

    if (!payload.pricingInputs.length) {
      this.toast.show('Pricing inputs are required.', 'error');
      return;
    }

    this.saving = true;

    this.serviceService.updateServiceInputs(this.serviceId, payload).subscribe({
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
        this.toast.show(err.error?.message ?? 'Inputs update failed', 'error');
      },
    });
  }
}
