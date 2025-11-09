import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { ServiceService } from '../../../admin/Services/service-service.service';
import { RequestedService, ServiceCalculationResult, ServiceResponse, ServiceStep } from '../../../Models/service.Model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-request-review',
  templateUrl: './service-request-review.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./service-request-review.component.scss']
})
export class ServiceRequestReviewComponent {
  requestedServices: RequestedService[] = [];
  overallTotal: number = 0;
  loading = false;

  constructor(private serviceService: ServiceService,private router: Router) {}

  ngOnInit(): void {
    const selected: ServiceResponse[] = history.state.selectedServices || [];
    console.log('Selected services:', selected);
    if (selected.length) {
      this.loadServiceDetails(selected);
    }
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

      // 🔹 Fetch calculation
      this.serviceService.getCalculatedTotal(s.id).subscribe({
        next: (res) => {
          calcRes = res?.response ?? {
            serviceName: s.name,
            baseCost: s.baseCost,
            globalFees: [],
            serviceSpecificFees: [],
            subTotal: s.baseCost,
            total: s.baseCost
          };
          calcDone = true;
          tryPushResult();
        },
        error: (err) => {
          console.error(`Error loading calc for ${s.name}`, err);
          calcDone = true;
          tryPushResult();
        }
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
        }
      });

      // 🔹 Helper: push only when both responses done
      const tryPushResult = () => {
        if (calcDone && stepsDone) {
          results.push({
            service: s,
            calculation: calcRes!,
            steps: steps
          });
          completedCount++;

          console.log(`✅ Added ${s.name}:`, {
            total: calcRes?.total,
            stepCount: steps.length
          });

          // When all services processed → finalize
          if (completedCount === services.length) {
            this.requestedServices = results;

            // Calculate grand total
            this.overallTotal = this.requestedServices.reduce(
              (sum, srv) => sum + (srv.calculation?.total ?? 0),
              0
            );

            this.loading = false;
            console.log('✅ All services loaded:', results);
          }
        }
      };
    });
  }

  confirmRequest() {
    console.log("Befor form request",this.requestedServices)
  this.router.navigate(['/FenetrationMaintainence/Home/service-user-form'], {
    state: { requestedServices: this.requestedServices }
  });
}

}
