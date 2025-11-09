import { Component } from '@angular/core';
import { ServiceRequestListDto, ServiceRequestDetailDto, PagedServiceRequestListResponse } from '../../../../Models/ServiceRequestDetailDto.Model';
import { AdminServiceRequestService } from '../../../Services/admin-service-request.service';

@Component({
  selector: 'app-admin-service-request',
  templateUrl: './admin-service-request.component.html',
  styleUrl: './admin-service-request.component.scss'
})
export class AdminServiceRequestComponent {
requests: ServiceRequestListDto[] = [];
  selectedRequest?: ServiceRequestDetailDto;
  totalCount = 0;
  page = 1;
  pageSize = 10;
  loading = false;
  popupVisible = false;
  errorMessage = '';

  constructor(private adminService: AdminServiceRequestService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.adminService
      .getAll(this.page, this.pageSize)
      .subscribe({
        next: (res: PagedServiceRequestListResponse) => {
          this.requests = res.requests;
          this.totalCount = res.totalCount;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to load service requests.';
          this.loading = false;
        },
      });
  }

  openDetails(id: number) {
    this.popupVisible = true;
    this.loading = true;
    this.adminService.getById(id).subscribe({
      next: (res: ServiceRequestDetailDto) => {
        this.selectedRequest = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load request details.';
        this.loading = false;
      },
    });
  }

  closePopup() {
    this.popupVisible = false;
    this.selectedRequest = undefined;
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadRequests();
  }
}
