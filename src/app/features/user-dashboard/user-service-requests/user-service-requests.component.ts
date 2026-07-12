import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import {
  UserServiceRequestResponseDto,
  UserServiceRequestDto,
} from '../Models/UserServiceRequestResponse.Model';
import { UserServiceRequestService } from '../Services/user-service-request.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AuthService } from '../../../core/Auth/auth.service';
import { PDFDocument } from 'pdf-lib';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-user-service-requests',
  templateUrl: './user-service-requests.component.html',
  styleUrl: './user-service-requests.component.scss',
})
export class UserServiceRequestsComponent implements OnInit {
  @ViewChild('receiptContent') receiptContent!: ElementRef;

  loading = false;
  response: UserServiceRequestResponseDto | null = null;

  selectedRequest: UserServiceRequestDto | null = null;
  printableRequest: UserServiceRequestDto | null = null;

  downloadingPdf = false;
  updatingStatusRequestId: number | null = null;

  userId: string | null = null;
  websiteLoginUrl =
    'http://fenestrationservices.ca/FenetrationMaintainence/Home/login';
  readonly gstRate = 0.05;

  getQuantity(service: any): number {
    const quantity = Number(service?.quantity ?? 1);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return 1;
    }

    return quantity;
  }

  /**
   * Base price for one requested unit.
   */
  getUnitBaseCost(service: any): number {
    return Number(service?.baseCost ?? 0);
  }

  /**
   * Base price multiplied by quantity.
   */
  getBaseCostForQuantity(service: any): number {
    return this.getUnitBaseCost(service) * this.getQuantity(service);
  }

  /**
   * Complete total for one unit.
   *
   * New records should return unitTotal from the backend.
   * The calculatedTotal / quantity fallback supports older responses.
   */
  getUnitTotal(service: any): number {
    const unitTotal = Number(service?.unitTotal);

    if (Number.isFinite(unitTotal) && unitTotal >= 0) {
      return unitTotal;
    }

    const calculatedTotal = Number(service?.calculatedTotal ?? 0);
    const quantity = this.getQuantity(service);

    return calculatedTotal / quantity;
  }

  /**
   * Final line total for all requested units.
   *
   * calculatedTotal should already be:
   * UnitTotal × Quantity
   */
  getServiceLineTotal(service: any): number {
    const calculatedTotal = Number(service?.calculatedTotal);

    if (Number.isFinite(calculatedTotal) && calculatedTotal >= 0) {
      return calculatedTotal;
    }

    return this.getUnitTotal(service) * this.getQuantity(service);
  }

  getFeesTotal(fees: any[] | undefined | null): number {
    if (!fees?.length) return 0;

    return fees.reduce((sum, fee) => sum + Number(fee?.amount ?? 0), 0);
  }

  getFeesTotalForQuantity(service: any): number {
    return this.getFeesTotal(service?.fees) * this.getQuantity(service);
  }

  /**
   * The backend total includes 5% GST.
   * Deriving GST from the final total also includes labor,
   * logistics and applicable fees.
   */
  getServiceGst(service: any): number {
    const lineTotal = this.getServiceLineTotal(service);

    if (lineTotal <= 0) {
      return 0;
    }

    const beforeGst = lineTotal / (1 + this.gstRate);

    return lineTotal - beforeGst;
  }

  getServiceNetTotal(service: any): number {
    return this.getServiceLineTotal(service) - this.getServiceGst(service);
  }

  getServiceTotal(services: any[] | undefined | null): number {
    if (!services?.length) return 0;

    return services.reduce(
      (sum, service) => sum + this.getServiceLineTotal(service),
      0,
    );
  }

  getTotalQuantity(services: any[] | undefined | null): number {
    if (!services?.length) return 0;

    return services.reduce(
      (sum, service) => sum + this.getQuantity(service),
      0,
    );
  }

  getBaseCostTotal(services: any[] | undefined | null): number {
    if (!services?.length) return 0;

    return services.reduce(
      (sum, service) => sum + this.getBaseCostForQuantity(service),
      0,
    );
  }

  getNetTotal(services: any[] | undefined | null): number {
    if (!services?.length) return 0;

    return services.reduce(
      (sum, service) => sum + this.getServiceNetTotal(service),
      0,
    );
  }

  getGstTotal(services: any[] | undefined | null): number {
    if (!services?.length) return 0;

    return services.reduce(
      (sum, service) => sum + this.getServiceGst(service),
      0,
    );
  }

  getGrandTotalWithGst(services: any[] | undefined | null): number {
    return this.getServiceTotal(services);
  }
  getReceiptNumber(req: UserServiceRequestDto): string {
    return `${req.requestId}`;
  }

  getOrderNumber(req: UserServiceRequestDto): string {
    return `${req.requestId}`;
  }
  // statuses user is allowed to send
  userAllowedStatusOptions = [
    { id: 9, name: 'Canceled', label: 'Cancel Request', type: 'danger' },
    { id: 3, name: 'Approved', label: 'Approve Quote', type: 'success' },
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
    this.loading = true;

    this.requestService.getUserRequests(this.userId!).subscribe({
      next: (res) => {
        this.response = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load requests', err);
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
  }

  canUserUpdateStatus(statusName: string | null | undefined): boolean {
    if (!statusName) return false;

    const normalized = statusName.toLowerCase();

    // user can only cancel requests before final states
    // return normalized === 'pending' || normalized === 'approved';
    return normalized === 'pending';
  }
  approvePopupVisible = false;
  requestToApprove: UserServiceRequestDto | null = null;
  approveStatusId: number | null = null;
  cancelReason = '';
  cancelReasonError = '';

  updateStatus(
    req: UserServiceRequestDto,
    newStatusId: number,
    statusName: string,
    reason?: string,
  ): void {
    if (!newStatusId) return;
    if (statusName === req.statusName) return;

    const dto = {
      requestId: req.requestId,
      newStatusId,
      reason: reason?.trim() || undefined,
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
        this.closeCancelPopup();
        this.closeApprovePopup();
        this.loadRequests();
      },
      error: (err) => {
        console.error('Status update failed', err);
        this.updatingStatusRequestId = null;
      },
    });
  }
  openStatusDropdownId: number | null = null;

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

    if (!this.canUserUpdateStatus(req.statusName)) return;

    if (statusName === 'Approved') {
      this.requestToApprove = req;
      this.approveStatusId = statusId;
      this.approvePopupVisible = true;
      this.closeStatusDropdown();
      return;
    }
    if (statusName === 'Canceled') {
      this.requestToCancel = req;
      this.cancelStatusId = statusId;
      this.cancelReason = '';
      this.cancelReasonError = '';
      this.cancelPopupVisible = true;
      this.closeStatusDropdown();
      return;
    }
    this.updateStatus(req, statusId, statusName);
  }
  confirmApproveRequest(): void {
    if (!this.requestToApprove || !this.approveStatusId) return;

    this.updateStatus(this.requestToApprove, this.approveStatusId, 'Approved');

    this.closeApprovePopup();
  }

  closeApprovePopup(): void {
    this.approvePopupVisible = false;
    this.requestToApprove = null;
    this.approveStatusId = null;
  }
  qrCodeDataUrl = '';

  async downloadReceipt(req: UserServiceRequestDto): Promise<void> {
    if (this.downloadingPdf) return;

    this.printableRequest = req;
    this.downloadingPdf = true;

    try {
      this.qrCodeDataUrl = await QRCode.toDataURL(this.websiteLoginUrl, {
        width: 180,
        margin: 1,
      });

      setTimeout(async () => {
        try {
          const element = this.receiptContent.nativeElement;

          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
          });

          const warrantyResponse = await fetch(
            'assets/documents/Warranty-Policy-Disclaimer.pdf',
          );

          if (!warrantyResponse.ok) {
            throw new Error('Warranty PDF not found');
          }

          const warrantyPdfBytes = await warrantyResponse.arrayBuffer();
          const warrantyDoc = await PDFDocument.load(warrantyPdfBytes);

          const finalDoc = await PDFDocument.create();

          // Use warranty page size so receipt and warranty have same width/size
          const firstWarrantyPage = warrantyDoc.getPage(0);
          const { width: pageWidth, height: pageHeight } =
            firstWarrantyPage.getSize();

          const receiptPage = finalDoc.addPage([pageWidth, pageHeight]);

          const imgData = canvas.toDataURL('image/png');
          const receiptImage = await finalDoc.embedPng(imgData);

          const margin = 24;
          const availableWidth = pageWidth - margin * 2;
          const availableHeight = pageHeight - margin * 2;

          const imageRatio = receiptImage.width / receiptImage.height;
          const pageRatio = availableWidth / availableHeight;

          let drawWidth = availableWidth;
          let drawHeight = availableHeight;

          if (imageRatio > pageRatio) {
            drawHeight = availableWidth / imageRatio;
          } else {
            drawWidth = availableHeight * imageRatio;
          }

          receiptPage.drawImage(receiptImage, {
            x: (pageWidth - drawWidth) / 2,
            y: pageHeight - drawHeight - margin,
            width: drawWidth,
            height: drawHeight,
          });

          const warrantyPages = await finalDoc.copyPages(
            warrantyDoc,
            warrantyDoc.getPageIndices(),
          );

          warrantyPages.forEach((page) => {
            finalDoc.addPage(page);
          });

          const finalPdf = await finalDoc.save();

          const finalPdfBuffer = finalPdf.buffer.slice(
            finalPdf.byteOffset,
            finalPdf.byteOffset + finalPdf.byteLength,
          ) as ArrayBuffer;

          const blob = new Blob([finalPdfBuffer], {
            type: 'application/pdf',
          });

          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = `Service-Receipt-${req.requestId}.pdf`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(url);
        } finally {
          this.downloadingPdf = false;
          this.printableRequest = null;
        }
      }, 200);
    } catch (error) {
      console.error('PDF generation failed', error);
      this.downloadingPdf = false;
      this.printableRequest = null;
    }
  }

  cancelPopupVisible = false;
  requestToCancel: UserServiceRequestDto | null = null;
  cancelStatusId = 9;

  openApprovePopup(req: UserServiceRequestDto, event?: Event): void {
    event?.stopPropagation();

    if (!this.canUserUpdateStatus(req.statusName)) return;

    this.requestToApprove = req;
    this.approveStatusId = 3;
    this.approvePopupVisible = true;
  }

  openCancelPopup(req: UserServiceRequestDto, event?: Event): void {
    event?.stopPropagation();

    if (!this.canUserUpdateStatus(req.statusName)) return;

    this.requestToCancel = req;
    this.cancelPopupVisible = true;
  }

  confirmCancelRequest(): void {
    if (!this.requestToCancel) return;

    const reason = this.cancelReason.trim();

    if (!reason) {
      this.cancelReasonError = 'Cancellation reason is required.';
      return;
    }

    this.updateStatus(
      this.requestToCancel,
      this.cancelStatusId,
      'Canceled',
      reason,
    );
  }

  closeCancelPopup(): void {
    this.cancelPopupVisible = false;
    this.requestToCancel = null;
    this.cancelReason = '';
    this.cancelReasonError = '';
  }
}
