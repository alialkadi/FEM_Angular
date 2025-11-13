import { Component, OnInit } from '@angular/core';
import {
  ServiceRequestListDto,
  ServiceRequestDetailDto,
  PagedServiceRequestListResponse
} from '../../../../Models/ServiceRequestDetailDto.Model';
import { AdminServiceRequestService } from '../../../Services/admin-service-request.service';
import { ServiceRequestStatusService } from '../../../Services/service-request-status.service';
import {
  AllowedStatusDto,
  ServiceRequestStatusUpdateDto
} from '../../../../Models/statusRequest.Model';
import { AuthService } from '../../../../../core/Auth/auth.service';

@Component({
  selector: 'app-admin-service-request',
  templateUrl: './admin-service-request.component.html',
  styleUrls: ['./admin-service-request.component.scss']
})
export class AdminServiceRequestComponent implements OnInit {
  requests: ServiceRequestListDto[] = [];
  allowedStatuses: Record<number, AllowedStatusDto[]> = {}; // RequestId → Status list
  selectedStatus: Record<number, number | null> = {};
  selectedRequest?: ServiceRequestDetailDto;

  totalCount = 0;
  page = 1;
  pageSize = 10;
  loading = false;
  popupVisible = false;
  errorMessage = '';

  constructor(
    private adminService: AdminServiceRequestService,
    private statusService: ServiceRequestStatusService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.adminService.getAll(this.page, this.pageSize).subscribe({
      next: (res: PagedServiceRequestListResponse) => {
        this.requests = res.requests;
        this.totalCount = res.totalCount;
        this.loading = false;
        this.loadAllowedStatuses();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load service requests.';
        this.loading = false;
      },
    });
  }

  loadAllowedStatuses() {
    this.statusService.getAllowedStatuses().subscribe({
      next: (res) => {
        if (res.isSuccessful) {
          // assign same allowed statuses to each request (based on user role)
          for (const r of this.requests) {
            this.allowedStatuses[r.id] = res.response.filter(
              (s) => s.name !== r.statusName
            );
          }
        }
      },
      error: (err) => console.error('Failed to load allowed statuses', err),
    });
  }
openDropdownId: number | null = null;

toggleDropdown(requestId: number): void {
  this.openDropdownId = this.openDropdownId === requestId ? null : requestId;
}

closeDropdown(): void {
  this.openDropdownId = null;
}

onSelectStatus(requestId: number, newStatusId: number): void {
  const dto = {
    requestId,
    newStatusId,
    notes: 'Status changed inline by Admin'
  };

  this.statusService.updateStatus(dto).subscribe({
    next: (res) => {
      if (res.isSuccessful) {
        const updated = res.response;
        const req = this.requests.find(r => r.id === requestId);
        if (req) {
          req.statusId = updated.statusId;
          req.statusName = updated.statusName;
        }
        this.openDropdownId = null; // close dropdown
      } else {
        alert(res.response.message);
      }
    },
    error: (err) => console.error('Status update failed', err)
  });
}
getStatusClass(name: string): string {
  if (!name) return '';
  return name.toLowerCase().replace(/\s+/g, '-');
}

  onStatusChange(requestId: number) {
    const newStatusId = this.selectedStatus[requestId];
    if (!newStatusId) return;

    const dto: ServiceRequestStatusUpdateDto = {
      requestId,
      newStatusId,
      notes: 'Status updated by Admin'
    };

    this.statusService.updateStatus(dto).subscribe({
      next: (res) => {
        if (res.isSuccessful) {
          const updated = res.response;
          const req = this.requests.find((r) => r.id === requestId);
          if (req) {
            req.statusId = updated.statusId;
            req.statusName = updated.statusName;
          }
          alert(updated.message);
        } else {
          alert(res.response.message);
        }
      },
      error: (err) => console.error('Failed to update status', err)
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
