import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { AuthService } from '../../../core/Auth/auth.service';
import {
  UserServiceRequestDto,
  UserServiceRequestResponseDto,
} from '../Models/UserServiceRequestResponse.Model';
import { UserServiceRequestService } from '../Services/user-service-request.service';

@Component({
  selector: 'app-user-service-qoute-requests',
  templateUrl: './user-service-qoute-requests.component.html',
  styleUrl: './user-service-qoute-requests.component.scss',
})
export class UserServiceQouteRequestsComponent implements OnInit {
  @ViewChild('receiptContent')
  receiptContent!: ElementRef<HTMLElement>;

  loading = false;
  downloadingPdf = false;

  response: UserServiceRequestResponseDto | null = null;

  selectedRequest: UserServiceRequestDto | null = null;
  printableRequest: UserServiceRequestDto | null = null;

  updatingStatusRequestId: number | null = null;
  openStatusDropdownId: number | null = null;

  userId: string | null = null;

  readonly userAllowedStatusOptions = [
    {
      id: 9,
      name: 'Canceled',
      label: 'Cancel Request',
    },
  ];

  constructor(
    private requestService: UserServiceRequestService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getUserId();

    if (!this.userId) {
      this.loading = false;
      return;
    }

    this.loadRequests();
  }

  loadRequests(): void {
    if (!this.userId) {
      return;
    }

    this.loading = true;

    this.requestService.getUserQouteRequests(this.userId).subscribe({
      next: (res) => {
        this.response = res;
        this.loading = false;

        console.log('Quoted service requests:', res);
      },

      error: (err) => {
        console.error('Failed to load quoted requests', err);

        this.response = null;
        this.loading = false;
      },
    });
  }

  openRequest(req: UserServiceRequestDto): void {
    this.selectedRequest = req;
  }

  closeDetails(): void {
    this.selectedRequest = null;
    this.closeStatusDropdown();
  }

  // =========================================================
  // QUANTITY AND PRICE HELPERS
  // =========================================================

  getQuantity(service: any): number {
    const quantity = Number(service?.quantity ?? 1);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return 1;
    }

    return quantity;
  }

  /**
   * Base cost for one unit.
   */
  getUnitBaseCost(service: any): number {
    return this.toValidAmount(service?.baseCost);
  }

  /**
   * Unit base cost multiplied by requested quantity.
   */
  getBaseCostForQuantity(service: any): number {
    return this.getUnitBaseCost(service) * this.getQuantity(service);
  }

  /**
   * Complete calculated total for one unit.
   *
   * New records should return unitTotal directly.
   * calculatedTotal / quantity supports records where unitTotal
   * is not yet returned by the API.
   */
  getUnitTotal(service: any): number {
    const explicitUnitTotal = Number(service?.unitTotal);

    if (Number.isFinite(explicitUnitTotal) && explicitUnitTotal >= 0) {
      return explicitUnitTotal;
    }

    const calculatedTotal = this.toValidAmount(service?.calculatedTotal);

    const quantity = this.getQuantity(service);

    return quantity > 0 ? calculatedTotal / quantity : calculatedTotal;
  }

  /**
   * Authoritative complete total for this requested service line.
   *
   * calculatedTotal should be:
   * unitTotal × quantity
   */
  getServiceLineTotal(service: any): number {
    const calculatedTotal = Number(service?.calculatedTotal);

    if (Number.isFinite(calculatedTotal) && calculatedTotal >= 0) {
      return calculatedTotal;
    }

    return this.getUnitTotal(service) * this.getQuantity(service);
  }

  /**
   * Visible fee snapshot total for one unit.
   */
  getFeesTotal(fees: any[] | undefined | null): number {
    if (!fees?.length) {
      return 0;
    }

    return fees.reduce((sum, fee) => sum + this.toValidAmount(fee?.amount), 0);
  }

  /**
   * Visible fee snapshot total multiplied by quantity.
   */
  getFeesTotalForQuantity(service: any): number {
    return this.getFeesTotal(service?.fees) * this.getQuantity(service);
  }

  /**
   * Total of all requested service lines.
   */
  getServiceTotal(services: any[] | undefined | null): number {
    if (!services?.length) {
      return 0;
    }

    return services.reduce(
      (sum, service) => sum + this.getServiceLineTotal(service),
      0,
    );
  }

  /**
   * Number of distinct selected services.
   */
  getServicesCount(services: any[] | undefined | null): number {
    return services?.length ?? 0;
  }

  /**
   * Sum of quantities across all requested services.
   */
  getTotalQuantity(services: any[] | undefined | null): number {
    if (!services?.length) {
      return 0;
    }

    return services.reduce(
      (sum, service) => sum + this.getQuantity(service),
      0,
    );
  }

  /**
   * Total of base cost × quantity for all services.
   */
  getBaseCostTotal(services: any[] | undefined | null): number {
    if (!services?.length) {
      return 0;
    }

    return services.reduce(
      (sum, service) => sum + this.getBaseCostForQuantity(service),
      0,
    );
  }

  /**
   * Total visible fees multiplied by each service quantity.
   */
  getAllFeesTotal(services: any[] | undefined | null): number {
    if (!services?.length) {
      return 0;
    }

    return services.reduce(
      (sum, service) => sum + this.getFeesTotalForQuantity(service),
      0,
    );
  }

  private toValidAmount(value: unknown): number {
    const amount = Number(value);

    if (!Number.isFinite(amount) || amount < 0) {
      return 0;
    }

    return amount;
  }

  // =========================================================
  // STATUS
  // =========================================================

  canUserUpdateStatus(statusName: string | null | undefined): boolean {
    if (!statusName) {
      return false;
    }

    const normalizedStatus = statusName.trim().toLowerCase();

    return normalizedStatus === 'pending' || normalizedStatus === 'approved';
  }

  updateStatus(
    req: UserServiceRequestDto,
    newStatusId: number,
    statusName: string,
  ): void {
    if (!newStatusId) {
      return;
    }

    if (statusName === req.statusName) {
      return;
    }

    const dto = {
      requestId: req.requestId,
      newStatusId,
    };

    this.updatingStatusRequestId = req.requestId;

    this.requestService.updateStatus(dto).subscribe({
      next: (res) => {
        req.statusName = statusName;

        if (this.selectedRequest?.requestId === req.requestId) {
          this.selectedRequest.statusName = statusName;
        }

        this.updatingStatusRequestId = null;
        this.closeStatusDropdown();

        console.log('Status updated:', res);

        this.loadRequests();
      },

      error: (err) => {
        console.error('Status update failed', err);

        this.updatingStatusRequestId = null;
      },
    });
  }

  toggleStatusDropdown(requestId: number, event?: Event): void {
    event?.stopPropagation();

    this.openStatusDropdownId =
      this.openStatusDropdownId === requestId ? null : requestId;
  }

  closeStatusDropdown(): void {
    this.openStatusDropdownId = null;
  }

  onSelectUserStatus(
    req: UserServiceRequestDto,
    statusId: number,
    statusName: string,
    event?: Event,
  ): void {
    event?.stopPropagation();

    if (!this.canUserUpdateStatus(req.statusName)) {
      return;
    }

    this.updateStatus(req, statusId, statusName);
  }

  // =========================================================
  // RECEIPT
  // =========================================================

  async downloadReceipt(req: UserServiceRequestDto): Promise<void> {
    if (this.downloadingPdf) {
      return;
    }

    this.printableRequest = req;
    this.downloadingPdf = true;

    setTimeout(async () => {
      try {
        const element = this.receiptContent.nativeElement;

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        });

        const imageData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');

        const pageWidth = pdf.internal.pageSize.getWidth();

        const pageHeight = pdf.internal.pageSize.getHeight();

        const imageWidth = pageWidth;

        const imageHeight = (canvas.height * imageWidth) / canvas.width;

        let heightLeft = imageHeight;
        let position = 0;

        pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight);

        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imageHeight;

          pdf.addPage();

          pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight);

          heightLeft -= pageHeight;
        }

        pdf.save(`Service-Receipt-${req.requestId}.pdf`);
      } catch (error) {
        console.error('PDF generation failed', error);
      } finally {
        this.downloadingPdf = false;
        this.printableRequest = null;
      }
    }, 200);
  }
}
