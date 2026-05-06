import { ServiceInputDefinition } from './../../../Models/RequestedInputs.model';
import { fileURLToPath } from 'node:url';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { ServiceService } from '../../../admin/Services/service-service.service';
import {
  RequestedService,
  ServiceCalculationResult,
  ServiceResponse,
  ServiceStep,
} from '../../../Models/service.Model';
import { CommonModule } from '@angular/common';
import { WishlistItem, WishlistService } from '../../Services/wishlist.service';
import { FormsModule } from '@angular/forms';
import { MetadataDataType } from '../../../Models/MetadataTargetType';

@Component({
  selector: 'app-service-request-review',
  templateUrl: './service-request-review.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./service-request-review.component.scss'],
})
export class ServiceRequestReviewComponent {
  requestedServices: RequestedService[] = [];
  overallTotal: number = 0;
  loading = false;
  metadate: any;
  constructor(
    private serviceService: ServiceService,
    private router: Router,
    private wishlist: WishlistService,
  ) {}
  MetadataDataType = MetadataDataType;
  ngOnInit(): void {
    const selected: any[] = history.state.selectedServices || [];
    console.log(
      'Selected services:',
      selected.forEach((e) => console.log(e.inputs)),
    );
    const fromExplorer: ServiceResponse[] =
      history.state.selectedServices || [];
    const wishlisted = this.wishlist.getAll();
    const uniqueServiceIds = new Set<number>();

    fromExplorer.forEach((s) => uniqueServiceIds.add(s.id));
    wishlisted.forEach((w) => uniqueServiceIds.add(w.serviceId));

    if (!uniqueServiceIds.size) return;

    const mergedServices: ServiceResponse[] = [];

    uniqueServiceIds.forEach((id) => {
      const fromNav = fromExplorer.find((s) => s.id === id);
      if (fromNav) {
        mergedServices.push(fromNav);
      } else {
        // Minimal ServiceResponse placeholder
        mergedServices.push({
          id: id,
          name: wishlisted.find((w) => w.serviceId === id)?.name || '',
          description: wishlisted.find((w) => w.serviceId === id)?.description,
          baseCost: 0,
          metadata: [],
        } as ServiceResponse);
      }
    });

    this.loadServiceDetails(mergedServices);
  }

  private loadServiceDetails(services: ServiceResponse[]) {
    this.loading = true;
    const results: RequestedService[] = [];
    let completedCount = 0;

    services.forEach((s) => {
      let calcRes: ServiceCalculationResult | null = null;
      let steps: ServiceStep[] = [];
      let calcDone = false;
      let stepsDone = false;
      let inputs: ServiceInputDefinition[];
      // 🔹 Fetch calculation
      this.serviceService.getCalculatedTotal(s.id).subscribe({
        next: (res) => {
          calcRes = res?.response ?? {
            serviceName: s.name,
            baseCost: s.baseCost,
            globalFees: [],
            serviceSpecificFees: [],
            subTotal: s.baseCost,
            total: s.baseCost,
          };
          console.log(res);
          calcDone = true;
          tryPushResult();
        },
        error: (err) => {
          console.error(`Error loading calc for ${s.name}`, err);
          calcDone = true;
          tryPushResult();
        },
      });

      // 🔹 Fetch steps
      this.serviceService.getStepsByServiceId(s.id).subscribe({
        next: (res) => {
          steps = res?.data?.serviceSteps ?? [];
          stepsDone = true;
          tryPushResult();
        },
        error: (err) => {
          console.error(`Error loading steps for ${s.name}`, err);
          stepsDone = true;
          tryPushResult();
        },
      });

      // 🔹 Helper: push only when both responses done
      const tryPushResult = () => {
        if (calcDone && stepsDone) {
          results.push({
            service: s,
            calculation: calcRes!,
            steps: steps,
            // inputs: s.inputs ?? [],
            answers: [],
          });
          completedCount++;
          console.log(results);
          console.log(`✅ Added ${s.name}:`, {
            total: calcRes?.total,
            stepCount: steps.length,
          });

          // When all services processed → finalize
          if (completedCount === services.length) {
            this.requestedServices = results;

            // Calculate grand total
            this.overallTotal = this.requestedServices.reduce(
              (sum, srv) => sum + (srv.calculation?.total ?? 0),
              0,
            );

            this.loading = false;
            console.log('✅ All services loaded:', results);
          }
        }
      };
    });
  }

  confirmRequest() {
    console.log('Befor form request', this.requestedServices);
    this.router.navigate(['/FenetrationMaintainence/Home/service-user-form'], {
      state: { requestedServices: this.requestedServices },
    });
  }

  // WISHLIST

  isWishlisted(serviceId: number): boolean {
    return this.wishlist.isWishlisted(serviceId);
  }

  toggleWishlist(item: RequestedService) {
    const s = item.service;

    if (this.isWishlisted(s.id)) {
      this.wishlist.remove(s.id);
    } else {
      this.wishlist.add({
        serviceId: s.id,
        name: s.name,
        description: s.description,
        fileUrl: s.fileUrl,

        // ✅ Store metadata ONLY
        metadata: s.metadata?.map((m) => ({
          attributeCode: m.attributeCode,
          name: m.value || m.valueText || m.valueName,
          value: m.value,
          valueText: m.valueText,
        })),
      });
    }
  }
  calculateOnlyWhenReady(item: RequestedService) {
    item.calculation = null;
    this.recalculateOverall();

    if (!this.areRequiredVisibleInputsCompleted(item)) {
      return;
    }

    const existingTimer = this.calculationTimers.get(item.service.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.recalculate(item);
      this.calculationTimers.delete(item.service.id);
    }, 500);

    this.calculationTimers.set(item.service.id, timer);
  }
  private calculationTimers = new Map<number, any>();
  areRequiredVisibleInputsCompleted(item: RequestedService): boolean {
    const inputs = item.service.inputs ?? [];

    const requiredVisibleInputs = inputs.filter(
      (input) => input.isRequired && this.isInputVisible(item, input),
    );

    return requiredVisibleInputs.every((input) => {
      const answer = this.getAnswer(item, input.code);
      return this.isAnswerCompleted(input, answer);
    });
  }

  isAnswerCompleted(input: ServiceInputDefinition, answer: any): boolean {
    if (!answer) return false;

    switch (input.dataType) {
      case MetadataDataType.Number:
        return (
          answer.numericValue !== null &&
          answer.numericValue !== undefined &&
          !answer.error
        );

      case MetadataDataType.Select:
        return !!answer.selectedValueCode;

      case MetadataDataType.Text:
        return !!answer.textValue && answer.textValue.trim().length > 0;

      case MetadataDataType.Boolean:
        return answer.booleanValue === true || answer.booleanValue === false;

      default:
        return false;
    }
  }
  removeFromReview(item: RequestedService) {
    this.requestedServices = this.requestedServices.filter(
      (r) => r.service.id !== item.service.id,
    );

    // Optional: also remove from wishlist
    this.wishlist.remove(item.service.id);

    this.overallTotal = this.requestedServices.reduce(
      (sum, r) => sum + (r.calculation?.total ?? 0),
      0,
    );
  }
  getAnswer(item: RequestedService, code: string): any {
    return item.answers?.find((a: any) => a.inputCode === code) || null;
  }

  recalculate(item: RequestedService) {
    const userInputs = item.answers.map((a) => ({
      InputCode: a.inputCode,
      NumericValue: a.numericValue ?? null,
      SelectedValueCode: a.selectedValueCode ?? null,
      TextValue: a.textValue ?? null,
      BooleanValue: a.booleanValue ?? null,
    }));

    this.serviceService
      .calculateService(item.service.id, userInputs)
      .subscribe({
        next: (res) => {
          if (!res.isSuccessful) {
            item.calculation = null;
            return;
          }

          item.calculation = res.response;
          this.recalculateOverall();
        },
        error: (err) => {
          console.error('Calculation failed', err, userInputs);
          item.calculation = null;
        },
      });
  }
  get canConfirm(): boolean {
    return this.requestedServices.every((item) => {
      const inputs = item.service.inputs ?? [];

      const hasErrors = item.answers?.some((a: any) => !!a.error);
      if (hasErrors) return false;

      return this.areRequiredVisibleInputsCompleted(item);
    });
  }

  recalculateOverall() {
    this.overallTotal = this.requestedServices.reduce(
      (sum, r) => sum + (r.calculation?.total ?? 0),
      0,
    );
  }

  setAnswer(
    item: RequestedService,
    input: ServiceInputDefinition,
    value: number | string | boolean | null,
  ) {
    let ans = item.answers.find((a) => a.inputCode === input.code);

    if (!ans) {
      ans = {
        inputCode: input.code,
        numericValue: null,
        selectedValueCode: null,
        textValue: null,
        booleanValue: null,
      };
      item.answers.push(ans);
    }

    ans.inputCode = input.code;
    ans.numericValue = null;
    ans.selectedValueCode = null;
    ans.textValue = null;
    ans.booleanValue = null;

    switch (input.dataType) {
      case MetadataDataType.Number:
        ans.numericValue = value as number | null;
        break;

      case MetadataDataType.Select:
        ans.selectedValueCode = value as string | null;
        break;

      case MetadataDataType.Text:
        ans.textValue = (value as string) ?? '';
        break;

      case MetadataDataType.Boolean:
        ans.booleanValue = value as boolean | null;
        break;
    }

    this.clearInvalidAnswers(item);
    this.calculateOnlyWhenReady(item);
  }
  clearInvalidAnswers(item: RequestedService) {
    item.answers = item.answers.filter((ans) => {
      const input = item.service.inputs?.find((i) => i.code === ans.inputCode);
      if (!input) return false;

      if (!this.isInputVisible(item, input)) return false;

      if (input.dataType === MetadataDataType.Select && ans.selectedValueCode) {
        const allowedValues = this.getVisibleValues(item, input);
        return allowedValues.some((v) => v.code === ans.selectedValueCode);
      }

      return true;
    });
  }
  toNullableNumber(value: string): number | null {
    if (value === null || value === undefined || value.trim() === '') {
      return null;
    }

    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }
  getParentLabel(item: RequestedService, input: ServiceInputDefinition) {
    const parent = item.service.inputs?.find(
      (i) => i.inputDefinitionId === input.dependsOnInputDefinitionId,
    );
    return parent?.label ?? '';
  }

  getInputById(item: RequestedService, id: number) {
    return item.service.inputs?.find((i) => i.inputDefinitionId === id);
  }
  isInputVisible(
    item: RequestedService,
    input: ServiceInputDefinition,
  ): boolean {
    if (!input.dependsOnInputDefinitionId) return true;

    const parent = item.service.inputs?.find(
      (i) => i.inputDefinitionId === input.dependsOnInputDefinitionId,
    );

    if (!parent) return false;

    const parentAnswer = this.getAnswer(item, parent.code);

    if (!this.isAnswerCompleted(parent, parentAnswer)) {
      return false;
    }

    if (input.dataType === MetadataDataType.Select) {
      return this.getVisibleValues(item, input).length > 0;
    }

    return true;
  }

  getVisibleValues(item: RequestedService, input: ServiceInputDefinition) {
    if (!input.values?.length) return [];

    // no dependency on another input
    if (!input.dependsOnInputDefinitionId) {
      return input.values.filter(
        (v) =>
          !v.dependsOnInputValueIds || v.dependsOnInputValueIds.length === 0,
      );
    }

    const parent = item.service.inputs?.find(
      (i) => i.inputDefinitionId === input.dependsOnInputDefinitionId,
    );

    if (!parent) return [];

    const parentAnswer = this.getAnswer(item, parent.code);
    if (!parentAnswer || !parentAnswer.selectedValueCode) return [];

    const parentSelectedValue = parent.values?.find(
      (pv) => pv.code === parentAnswer.selectedValueCode,
    );

    if (!parentSelectedValue) return [];

    return input.values.filter((v) => {
      // global value
      if (!v.dependsOnInputValueIds || v.dependsOnInputValueIds.length === 0) {
        return true;
      }

      return v.dependsOnInputValueIds.includes(parentSelectedValue.id);
    });
  }

  setNumberAnswer(
    item: RequestedService,
    input: ServiceInputDefinition,
    rawValue: string,
  ): void {
    const value = this.toNullableNumber(rawValue);

    const error = this.validateNumberRange(input, value);

    this.setAnswer(item, input, value);

    const answer = this.getAnswer(item, input.code);
    if (answer) {
      answer.error = error;
    }

    if (!error) {
      this.calculateOnlyWhenReady(item);
    } else {
      item.calculation = null;
      this.recalculateOverall();
    }
  }

  private validateNumberRange(
    input: ServiceInputDefinition,
    value: number | null,
  ): string | null {
    if (value == null) {
      return null;
    }

    if (input.min != null && value < Number(input.min)) {
      return `Minimum allowed value is ${input.min}.`;
    }

    if (input.max != null && value > Number(input.max)) {
      return `Maximum allowed value is ${input.max}.`;
    }

    return null;
  }

  getInputError(item: RequestedService, inputCode: string): string | null {
    return this.getAnswer(item, inputCode)?.error ?? null;
  }
}
