import { Component, ElementRef, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AuthService } from '../../../core/Auth/auth.service';
import {
  UserServiceRequestResponseDto,
  UserServiceRequestDto,
} from '../Models/UserServiceRequestResponse.Model';
import { UserServiceRequestService } from '../Services/user-service-request.service';

@Component({
  selector: 'app-user-service-qoute-requests',
  templateUrl: './user-service-qoute-requests.component.html',
  styleUrl: './user-service-qoute-requests.component.scss',
})
export class UserServiceQouteRequestsComponent {
  @ViewChild('receiptContent') receiptContent!: ElementRef;

  loading = false;
  response: UserServiceRequestResponseDto | null = null;

  selectedRequest: UserServiceRequestDto | null = null;
  printableRequest: UserServiceRequestDto | null = null;

  downloadingPdf = false;
  updatingStatusRequestId: number | null = null;

  userId: string | null = null;

  // statuses user is allowed to send
  userAllowedStatusOptions = [
    { id: 9, name: 'Canceled', label: 'Cancel Request' },
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

    this.requestService.getUserQouteRequests(this.userId!).subscribe({
      next: (res) => {
        this.response = res;
        this.loading = false;
        console.log(res);
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
    return normalized === 'pending' || normalized === 'approved';
  }

  updateStatus(
    req: UserServiceRequestDto,
    newStatusId: number,
    statusName: string,
  ): void {
    if (!newStatusId) return;
    if (statusName === req.statusName) return;

    const dto = {
      requestId: req.requestId,
      newStatusId: newStatusId,
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

        console.log(res);
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

    this.updateStatus(req, statusId, statusName);
  }
  getServiceTotal(services: any[] | undefined | null): number {
    if (!services?.length) return 0;
    return services.reduce((sum, s) => sum + (s.calculatedTotal ?? 0), 0);
  }

  getFeesTotal(fees: any[] | undefined | null): number {
    if (!fees?.length) return 0;
    return fees.reduce((sum, f) => sum + (f.amount ?? 0), 0);
  }

  async downloadReceipt(req: UserServiceRequestDto): Promise<void> {
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

        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
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
