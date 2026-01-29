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
  getAnswer(item: RequestedService, inputCode: string) {
    return item.answers.find((a) => a.inputCode === inputCode) ?? null;
  }

  recalculate(item: RequestedService) {
    this.serviceService
      .calculateService(item.service.id, item.answers)
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
          console.error('Calculation failed', err);
          item.calculation = null;
        },
      });
  }
  get canConfirm(): boolean {
    return (
      this.requestedServices.length > 0 &&
      this.requestedServices.every((r) => r.calculation !== null)
    );
  }

  recalculateOverall() {
    this.overallTotal = this.requestedServices.reduce(
      (sum, r) => sum + (r.calculation?.total ?? 0),
      0,
    );
  }

  setAnswer(item: RequestedService, inputCode: string, value: number | string) {
    let ans = item.answers.find((a) => a.inputCode === inputCode);

    if (!ans) {
      ans = { inputCode };
      item.answers.push(ans);
    }

    if (typeof value === 'number') {
      ans.numericValue = value;
      ans.selectedValueCode = null;
    } else {
      ans.selectedValueCode = value;
      ans.numericValue = null;
    }

    this.recalculate(item); // 🔥 AUTO RECALC
  }
}
