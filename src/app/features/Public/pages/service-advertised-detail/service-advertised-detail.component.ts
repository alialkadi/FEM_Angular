import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ServiceService } from '../../../admin/Services/service-service.service';
import { ServiceInputDefinition } from '../../../Models/RequestedInputs.model';
import {
  RequestedService,
  ServiceStep,
  ServiceCalculationResult,
  ServiceResponse,
} from '../../../Models/service.Model';
import { WishlistService } from '../../Services/wishlist.service';
import { SeoService } from '../../Services/seo.service';

type PricingBehavior = number; // keep compatible with your enums
type MetadataDataType = number;

interface AdvertisedServiceDetailsDto {
  id: number;
  name: string;
  description?: string;
  fileUrl?: string;

  pricingMode: number; // ServicePricingMode
  baseCost: number;
  baseRate: number;

  applyGlobalFees?: boolean | null;
  applyLogistics?: boolean | null;

  metadata: Array<{
    attributeName?: string;
    valueName?: string | null;
    valueText?: string | null;
  }>;

  inputs?: ServiceInputDefinition[] | null;

  steps: Array<{
    id: number;
    order: number;
    description: string;
  }>;
}

@Component({
  selector: 'app-service-advertised-detail',
  templateUrl: './service-advertised-detail.component.html',
  styleUrls: ['./service-advertised-detail.component.scss'],
})
export class ServiceAdvertisedDetailComponent implements OnInit {
  slug = '';
  loading = false;
  service: any;
  notFound = false;

  requestedServices: RequestedService[] = []; // ✅ SAME AS REVIEW
  overallTotal = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceApi: ServiceService,
    private wishlist: WishlistService,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    if (!this.slug) {
      this.loading = false;
      this.notFound = true;
      return;
    }
    this.loadBySlug();
  }

  private setSeo(): void {
    const title = `${this.service.name} Calgary | Fenestration Services`;

    const description =
      this.service.description ||
      `Professional ${this.service.name} service in Calgary by Fenestration Services.`;

    this.seo.update(title, description, 'index, follow');
  }
  // =========================================
  // 1) Load advertised service by slug
  // =========================================
  private loadBySlug() {
    this.loading = true;

    this.serviceApi.getAdvertisedBySlug(this.slug).subscribe({
      next: (res) => {
        if (!res?.success || !res.data) {
          this.loading = false;
          return;
        }
        console.log(res);
        // ✅ Map your API response to ServiceResponse that review expects
        const s = this.mapAdvertisedDtoToServiceResponse(res.data);

        // Build RequestedService item like review
        const item: RequestedService = {
          service: s,
          calculation: null,
          steps: (res.data.steps ?? []).map((x: any) => ({
            id: x.id,
            stepOrder: x.stepOrder ?? x.order, // handle both names
            description: x.description,
          })) as ServiceStep[],
          answers: [],
          quantity: 1,
        };
        this.service = s;
        this.setSeo();
        this.requestedServices = [item];
        this.notFound = false;
        // Initial calc (static -> GET calculate works; dynamic -> will require inputs to compute)
        this.initialCalculate(item);

        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
        this.notFound = true;
      },
    });
  }

  // =========================================
  // 2) Initial calculate for static service
  // =========================================
  private initialCalculate(item: RequestedService) {
    this.serviceApi.getCalculatedTotal(item.service.id).subscribe({
      next: (res) => {
        item.calculation =
          res?.response ??
          ({
            serviceName: item.service.name,
            baseCost: item.service.baseCost,
            globalFees: [],
            serviceSpecificFees: [],
            subTotal: item.service.baseCost,
            total: item.service.baseCost,
          } as ServiceCalculationResult);

        this.recalculateOverall();
      },
      error: () => {
        item.calculation = null;
        this.recalculateOverall();
      },
    });
  }

  // =========================================
  // 3) SAME calculate logic as review
  // =========================================
  recalculate(item: RequestedService) {
    this.serviceApi.calculateService(item.service.id, item.answers).subscribe({
      next: (res) => {
        // your calculate endpoint returns GeneralResponse (isSuccessful/response)
        if (!res?.isSuccessful) {
          item.calculation = null;
          this.recalculateOverall();
          return;
        }
        item.calculation = res.response;
        this.recalculateOverall();
      },
      error: () => {
        item.calculation = null;
        this.recalculateOverall();
      },
    });
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

    this.clearInvalidAnswers(item);
    this.recalculate(item); // ✅ AUTO RECALC like your review
  }

  // =========================================
  // 4) SAME dependency filter logic as review
  // =========================================
  getAnswer(item: RequestedService, inputCode: string) {
    return item.answers.find((a) => a.inputCode === inputCode) ?? null;
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

  isInputVisible(_: RequestedService, __: ServiceInputDefinition): boolean {
    return true;
  }

  getVisibleValues(item: RequestedService, input: ServiceInputDefinition) {
    if (!input.values?.length) return [];

    // ROOT INPUT → global values only
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

    return input.values.filter((v) => {
      if (!v.dependsOnInputValueIds || v.dependsOnInputValueIds.length === 0)
        return true;

      if (!parentAnswer?.selectedValueCode) return false;

      const parentValue = parent.values?.find(
        (pv) => pv.code === parentAnswer.selectedValueCode,
      );

      if (!parentValue) return false;

      return v.dependsOnInputValueIds.includes(parentValue.id);
    });
  }

  clearInvalidAnswers(item: RequestedService) {
    item.answers = item.answers.filter((ans) => {
      const input = item.service.inputs?.find((i) => i.code === ans.inputCode);
      if (!input) return false;

      if (!this.isInputVisible(item, input)) return false;

      if (ans.selectedValueCode) {
        const allowedValues = this.getVisibleValues(item, input);
        return allowedValues.some((v) => v.code === ans.selectedValueCode);
      }
      return true;
    });
  }

  // =========================================
  // 5) Wishlist: SAME as review
  // =========================================
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

        metadata: s.metadata?.map((m: any) => ({
          attributeCode: m.attributeCode,
          name: m.value || m.valueText || m.valueName,
          value: m.value,
          valueText: m.valueText,
        })),
      });
    }
  }

  // =========================================
  // 6) Continue to your existing user form
  // =========================================
  confirmRequest() {
    this.router.navigate(['/FenetrationMaintainence/Home/service-user-form'], {
      state: { requestedServices: this.requestedServices },
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

  // =========================================
  // Mapper: advertised dto -> ServiceResponse
  // =========================================
  private mapAdvertisedDtoToServiceResponse(
    dto: AdvertisedServiceDetailsDto,
  ): ServiceResponse {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      fileUrl: dto.fileUrl,
      baseCost: dto.baseCost ?? 0,
      metadata: dto.metadata ?? [],
      inputs: dto.inputs ?? [], // ✅ already in correct hierarchy
    } as ServiceResponse;
  }

  removeFromReview(_: RequestedService) {
    // For advertised page: removing means leaving the page
    this.router.navigate(['/FenetrationMaintainence/Home/service-explorer']);
  }

  private buildInputsFromPricingRules(rules: any[]): ServiceInputDefinition[] {
    if (!Array.isArray(rules) || rules.length === 0) return [];

    const grouped = new Map<number, any[]>();
    for (const r of rules) {
      const key = r.inputDefinitionId;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(r);
    }

    const result: ServiceInputDefinition[] = [];

    grouped.forEach((g) => {
      const first = g[0];

      const values =
        first.dataType === 4 // Select (adjust if your enum differs)
          ? g
              .filter((x) => x.inputValueCode)
              .reduce((acc: any[], x: any) => {
                // group by valueCode
                let item = acc.find((a) => a.code === x.inputValueCode);
                if (!item) {
                  item = {
                    id: x.inputValueId,
                    code: x.inputValueCode,
                    displayName: x.inputValueLabel || x.inputValueCode,
                    dependsOnInputValueIds: [],
                  };
                  acc.push(item);
                }
                if (x.dependsOnInputValueId) {
                  item.dependsOnInputValueIds.push(x.dependsOnInputValueId);
                  item.dependsOnInputValueIds = Array.from(
                    new Set(item.dependsOnInputValueIds),
                  );
                }
                return acc;
              }, [])
          : null;

      result.push({
        inputDefinitionId: first.inputDefinitionId,
        code: first.code,
        label: first.label,
        dataType: first.dataType,
        pricingBehavior: first.pricingBehavior,
        isRequired: g.some((x) => x.isRequired),
        allowDecimal: first.allowDecimal ?? false,
        min: first.min ?? null,
        max: first.max ?? null,
        priority: Math.min(...g.map((x: any) => x.priority ?? 999)),
        dependsOnInputDefinitionId: first.dependsOnInputDefinitionId ?? null,
        values: values ?? null,
      } as any);
    });

    return result.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  }
}
