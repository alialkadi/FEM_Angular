import { Component, OnInit } from '@angular/core';
import {
  ServiceRequestListDto,
  ServiceRequestDetailDto,
  PagedServiceRequestListResponse
} from '../../../../Models/ServiceRequestDetailDto.Model';

import { AdminServiceRequestService } from '../../../Services/admin-service-request.service';
import { ServiceRequestStatusService } from '../../../Services/service-request-status.service';
import { CreateWorkerService } from '../../../Services/create-worker.service';

import {
  AllowedStatusDto,
  ServiceRequestStatusUpdateDto
} from '../../../../Models/statusRequest.Model';

import { AuthService } from '../../../../../core/Auth/auth.service';
import { WorkersResponseModel } from '../../../Services/workers.model';

@Component({
  selector: 'app-admin-service-request',
  templateUrl: './admin-service-request.component.html',
  styleUrls: ['./admin-service-request.component.scss']
})
export class AdminServiceRequestComponent implements OnInit {

  /* ------------------------------------------------------
   *  REQUEST LIST DATA
   * ------------------------------------------------------ */
  requests: ServiceRequestListDto[] = [];
  totalCount = 0;
  page = 1;
  pageSize = 10;
  loading = false;
  errorMessage = '';

  /* ------------------------------------------------------
   *  STATUS DROPDOWN
   * ------------------------------------------------------ */
  allowedStatuses: Record<number, AllowedStatusDto[]> = {};
  selectedStatus: Record<number, number | null> = {};
  openDropdownId: number | null = null;

  /* ------------------------------------------------------
   *  REQUEST DETAILS POPUP
   * ------------------------------------------------------ */
  popupVisible = false;
  selectedRequest?: ServiceRequestDetailDto;

  /* ------------------------------------------------------
   *  ASSIGN WORKER POPUP
   * ------------------------------------------------------ */
  assignPopupVisible = false;
  assignLoading = false;
  assignMessage = '';
  selectedRequestId: number | null = null;

  workers: any;
  filteredWorkers: WorkersResponseModel[] = [];
  workerSearchTerm = '';

  alreadyAssignedIds: number[] = [];
  selectedWorkers: number[] = [];
  allowUnassign = false;

  constructor(
    private adminService: AdminServiceRequestService,
    private statusService: ServiceRequestStatusService,
    private auth: AuthService,
    private workerService: CreateWorkerService
  ) {}

  /* ------------------------------------------------------
   *  INIT
   * ------------------------------------------------------ */
  ngOnInit(): void {
    this.loadRequests();
  }

  /* ------------------------------------------------------
   *  LOAD REQUESTS + STATUSES
   * ------------------------------------------------------ */
  loadRequests() {
    this.loading = true;

    this.adminService.getAll(this.page, this.pageSize).subscribe({
      next: (res: PagedServiceRequestListResponse) => {
        this.requests = res.requests;
        this.totalCount = res.totalCount;
        this.loading = false;
        this.loadAllowedStatuses();
      },
      error: () => {
        this.errorMessage = 'Failed to load service requests.';
        this.loading = false;
      }
    });
  }
  getStatusClass(name: string): string {
    if (!name) return '';
    return name.toLowerCase().replace(/\s+/g, '-');
  }
  loadAllowedStatuses() {
    this.statusService.getAllowedStatuses().subscribe({
      next: (res) => {
        if (res.isSuccessful) {
          for (const r of this.requests) {
            this.allowedStatuses[r.id] = res.response.filter(
              (s) => s.name !== r.statusName
            );
          }
        }
      }
    });
  }

  /* ------------------------------------------------------
   *  STATUS DROPDOWN LOGIC
   * ------------------------------------------------------ */
  toggleDropdown(requestId: number) {
    this.openDropdownId = this.openDropdownId === requestId ? null : requestId;
  }

  closeDropdown() {
    this.openDropdownId = null;
  }

  onSelectStatus(requestId: number, newStatusId: number) {
    const dto = { requestId, newStatusId, notes: 'Status changed by Admin' };
    console.log(dto)
    this.statusService.updateStatus(dto).subscribe({
      next: (res) => {
        if (res.isSuccessful) {
          const updated = res.response;
          const req = this.requests.find(r => r.id === requestId);
    console.log(res)

          if (req) {
            req.statusId = updated.statusId;
            req.statusName = updated.statusName;
          }
          this.closeDropdown();
        }
      }
    });
  }

  /* ------------------------------------------------------
   *  DETAILS POPUP
   * ------------------------------------------------------ */
  openDetails(requestId: number) {
    this.popupVisible = true;
    this.loading = true;

    this.adminService.getById(requestId).subscribe({
      next: (res) => {
        this.selectedRequest = res;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load request details.';
        this.loading = false;
      }
    });
  }

  closePopup() {
    this.popupVisible = false;
    this.selectedRequest = undefined;
  }

  /* ------------------------------------------------------
   *  ASSIGN WORKER POPUP — STEP 1: LOAD DETAILS FIRST
   * ------------------------------------------------------ */
  openAssignWorker(requestId: number) {
    this.adminService.getById(requestId).subscribe({
      next: (res) => {
        this.selectedRequest = res;
        this.openAssignPopup(requestId);
      },
      error: () => {
        this.assignMessage = 'Could not load request details.';
      }
    });
  }

  /* ------------------------------------------------------
   *  ASSIGN WORKER POPUP — STEP 2: OPEN POPUP
   * ------------------------------------------------------ */
  openAssignPopup(requestId: number) {
    this.assignPopupVisible = true;
    this.assignLoading = true;
    this.assignMessage = '';
    this.selectedRequestId = requestId;

    this.alreadyAssignedIds =
      this.selectedRequest?.serviceRequestAssignmentResponses?.map(a => a.workerId) || [];

    this.selectedWorkers = [];

    this.workerService.getAllWorkers().subscribe({
      next: (res) => {
        this.workers = res.data.response;
        this.filteredWorkers = [...this.workers];
        this.assignLoading = false;
      },
      error: () => {
        this.assignMessage = 'Failed to load workers.';
        this.assignLoading = false;
      }
    });
  }

  closeAssignPopup() {
    this.assignPopupVisible = false;
    this.assignMessage = '';
    this.selectedWorkers = [];
    this.workerSearchTerm = '';
  }

  /* ------------------------------------------------------
   *  WORKER LIST HELPERS
   * ------------------------------------------------------ */
  isAlreadyAssigned(workerId: number) {
    return this.alreadyAssignedIds.includes(workerId);
  }

  filterWorkers() {
    const term = this.workerSearchTerm.toLowerCase();
    this.filteredWorkers = this.workers.filter((w: { fullName: string; phoneNumber: string; }) =>
      w.fullName.toLowerCase().includes(term) ||
      w.phoneNumber.toLowerCase().includes(term)
    );
  }

  toggleWorkerSelection(event: any, worker: WorkersResponseModel) {
    const workerId = Number(event.target.value);

    if (event.target.checked) {
      if (!this.isAlreadyAssigned(workerId))
        this.selectedWorkers.push(workerId);
    } else {
      this.selectedWorkers = this.selectedWorkers.filter(id => id !== workerId);
    }
  }

  /* ------------------------------------------------------
   *  SUBMIT ASSIGNMENT
   * ------------------------------------------------------ */
  submitWorkersAssignment() {
    const newWorkerIds = this.selectedWorkers.filter(
      id => !this.alreadyAssignedIds.includes(id)
    );

    if (newWorkerIds.length === 0) {
      this.assignMessage = 'No new workers selected.';
      return;
    }

    const payload = {
      serviceRequestId: this.selectedRequestId!,
      workerId: newWorkerIds,
      notes: ''
    };

    this.workerService.assignWorker(payload).subscribe({
      next: (res) => {
        this.assignMessage = res.message || 'Workers assigned successfully.';
        this.alreadyAssignedIds = [...this.alreadyAssignedIds, ...newWorkerIds];
        this.loadRequests();

        setTimeout(() => this.closeAssignPopup(), 1200);
      },
      error: () => {
        this.assignMessage = 'Failed to assign workers.';
      }
    });
  }

  /* ------------------------------------------------------
   *  PAGINATION
   * ------------------------------------------------------ */
  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadRequests();
  }
}
