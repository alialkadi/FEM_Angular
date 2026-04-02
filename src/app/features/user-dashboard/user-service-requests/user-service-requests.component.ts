import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  UserServiceRequestResponseDto,
  UserServiceRequestDto,
} from '../Models/UserServiceRequestResponse.Model';
import { UserServiceRequestService } from '../Services/user-service-request.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-user-service-requests',
  templateUrl: './user-service-requests.component.html',
  styleUrl: './user-service-requests.component.scss',
})
export class UserServiceRequestsComponent {
  @ViewChild('receiptContent') receiptContent!: ElementRef;

  loading = true;
  response!: UserServiceRequestResponseDto;
  selectedRequest: UserServiceRequestDto | null = null;

  printableRequest: UserServiceRequestDto | null = null;
  downloadingPdf = false;

  statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
  ];

  constructor(private requestService: UserServiceRequestService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;

    this.requestService.getUserRequests().subscribe({
      next: (res) => {
        console.log(res);
        this.response = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openRequest(req: UserServiceRequestDto) {
    this.selectedRequest = req;
  }

  closeDetails() {
    this.selectedRequest = null;
  }

  updateStatus(req: UserServiceRequestDto, status: string) {
    this.requestService.updateStatus(req.requestId, status).subscribe(() => {
      req.statusName = status;
    });
  }

  getServiceTotal(services: any[]) {
    if (!services || services.length === 0) {
      return 0;
    }
    return services.reduce((sum, s) => sum + (s.calculatedTotal ?? 0), 0);
  }

  getFeesTotal(fees: any[] | undefined | null): number {
    if (!fees || fees.length === 0) {
      return 0;
    }
    return fees.reduce((sum, f) => sum + (f.amount ?? 0), 0);
  }

  async downloadReceipt(req: UserServiceRequestDto) {
    this.printableRequest = req;
    this.downloadingPdf = true;

    // let Angular render the hidden receipt first
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
      }
    }, 200);
  }
}
