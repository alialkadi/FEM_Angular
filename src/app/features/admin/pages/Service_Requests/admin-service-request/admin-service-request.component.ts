import { Component, OnInit } from '@angular/core';
import {
  ServiceRequestListDto,
  ServiceRequestDetailDto,
  PagedServiceRequestListResponse,
} from '../../../../Models/ServiceRequestDetailDto.Model';

import { AdminServiceRequestService } from '../../../Services/admin-service-request.service';
import { ServiceRequestStatusService } from '../../../Services/service-request-status.service';
import {
  AssignWorkerRequest,
  CreateWorkerService,
  WorkerConflictDto,
} from '../../../Services/create-worker.service';

import {
  AllowedStatusDto,
  ServiceRequestStatusUpdateDto,
} from '../../../../Models/statusRequest.Model';

import { AuthService } from '../../../../../core/Auth/auth.service';
import { WorkersResponseModel } from '../../../Services/workers.model';
import { ToastService } from '../../../../../shared/Services/toast.service';
import { PricingInputBehavior } from '../../../../Models/InputDefinitionDto';
import { StaticsService } from '../../../Services/statics.service';
import { forkJoin } from 'rxjs';
interface StatCard {
  title: string;
  value: number;
  icon: string;
  className: string;
}
@Component({
  selector: 'app-admin-service-request',
  templateUrl: './admin-service-request.component.html',
  styleUrls: ['./admin-service-request.component.scss'],
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
  allowedStatusesByRequestId: Record<number, AllowedStatusDto[]> = {};
  selectedStatus: Record<number, number | null> = {};
  openDropdownId: number | null = null;
  allStatuses: AllowedStatusDto[] = [];
  pendingStatsCount = 0;
  inProgressStatsCount = 0;
  canceledStatsCount = 0;
  approvedStatsCount = 0;
  totalStatsCount = 0;
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
  selectedWorkers: any[] = [];
  allowUnassign = false;
  selectedWorkerIds: number[] = [];

  filterStatus: string | null = null;
  filterFromDate: string | null = null;
  filterToDate: string | null = null;
  workerConflictVisible = false;
  conflictedWorkers: WorkerConflictDto[] = [];
  pendingAssignPayload: AssignWorkerRequest | null = null;
  statCards: StatCard[] = [];
  constructor(
    private adminService: AdminServiceRequestService,
    private statusService: ServiceRequestStatusService,
    private auth: AuthService,
    private workerService: CreateWorkerService,
    private toast: ToastService,
    private _statService: StaticsService,
  ) {}

  /* ------------------------------------------------------
   *  INIT
   * ------------------------------------------------------ */
  ngOnInit(): void {
    this.loadRequests();
    this.loadAllStatuses();
    this.loadStatics();
  }
  buildCards(): void {
    this.statCards = [
      {
        title: 'Total Requests',
        value: this.totalStatsCount,
        icon: '📊',
        className: 'pending',
      },
      {
        title: 'Pending Requests',
        value: this.pendingStatsCount,
        icon: '⌛',
        className: 'total',
      },

      {
        title: 'In Progress Requests',
        value: this.inProgressStatsCount,
        icon: '⚙',
        className: 'progress',
      },
      {
        title: 'Canceled Requests',
        value: this.canceledStatsCount,
        icon: '✕',
        className: 'canceled',
      },
      {
        title: 'Approved Requests',
        value: this.approvedStatsCount,
        icon: '✓',
        className: 'approved',
      },
    ];
  }
  loadStatics(): void {
    this.loading = true;

    forkJoin({
      total: this._statService.gettotalStatics(),
      pending: this._statService.getPendingStatics(),
      inProgress: this._statService.getInprogressStatics(),
      canceled: this._statService.getcanceledStatics(),
      approved: this._statService.getapprovedStatics(),
    }).subscribe({
      next: (res) => {
        this.pendingStatsCount = res.pending?.data?.response ?? 0;
        this.inProgressStatsCount = res.inProgress?.data?.response ?? 0;
        this.canceledStatsCount = res.canceled?.data?.response ?? 0;
        this.approvedStatsCount = res.approved?.data?.response ?? 0;
        this.totalStatsCount = res.total?.data?.response ?? 0;
        console.log(res);
        this.buildCards();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load statics', err);
        this.buildCards();
        this.loading = false;
      },
    });
  }
  /* ------------------------------------------------------
   *  LOAD REQUESTS + STATUSES
   * ------------------------------------------------------ */
  loadRequests() {
    this.loading = true;

    this.adminService
      .getAll(
        this.page,
        this.pageSize,
        this.filterStatus ?? undefined,
        this.filterFromDate ?? undefined,
        this.filterToDate ?? undefined,
      )
      .subscribe({
        next: (res: PagedServiceRequestListResponse) => {
          this.requests = res.requests;
          this.totalCount = res.totalCount;
          this.loading = false;
          this.loadAllowedStatuses();
          console.log(res);
        },
        error: () => {
          this.errorMessage = 'Failed to load service requests.';
          this.loading = false;
        },
      });
  }
  loadAllStatuses() {
    this.statusService.getAllowedStatuses().subscribe({
      next: (res) => {
        if (res.success) {
          this.allStatuses = res.data;
        }
      },
    });
  }

  getStatusClass(name: string): string {
    if (!name) return '';
    return name.toLowerCase().replace(/\s+/g, '-');
  }
  loadAllowedStatuses() {
    this.statusService.getAllowedStatuses().subscribe({
      next: (res) => {
        if (res.success) {
          for (const r of this.requests) {
            this.allowedStatusesByRequestId[r.id] = res.data.filter(
              (s) => s.name !== r.statusName,
            );
          }
        }
      },
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
    console.log(dto);
    this.statusService.updateStatus(dto).subscribe({
      next: (res) => {
        if (res.success) {
          const updated = res.data;
          const req = this.requests.find((r) => r.id === requestId);
          console.log(res);

          if (req) {
            req.statusId = updated.statusId;
            req.statusName = updated.statusName;
          }
          this.toast.show(res.message, 'success');

          this.closeDropdown();
        }
      },
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
        console.log(res);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load request details.';
        this.loading = false;
      },
    });
  }

  closePopup() {
    this.popupVisible = false;
    this.selectedRequest = undefined;
  }

  /* ------------------------------------------------------
   *  ASSIGN WORKER POPUP — STEP 1: LOAD DETAILS FIRST
   * ------------------------------------------------------ */
  openAssignWorker(requestId: number): void {
    this.selectedRequestId = requestId;
    this.assignPopupVisible = true;
    this.assignLoading = true;
    this.assignMessage = '';
    this.workerConflictVisible = false;

    this.workerService.getWorkersForAssignment(requestId).subscribe({
      next: (res) => {
        this.assignLoading = false;
        console.log(res);
        this.workers = res.data || [];
        this.filteredWorkers = [...this.workers];

        this.selectedWorkerIds = this.workers
          .filter(
            (w: { isAssignedToCurrentRequest: any }) =>
              w.isAssignedToCurrentRequest,
          )
          .map((w: { workerId: any }) => w.workerId);
      },
      error: () => {
        this.assignLoading = false;
        this.assignMessage = 'Failed to load technicians.';
      },
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
    this.selectedWorkerIds = [...this.alreadyAssignedIds];

    this.alreadyAssignedIds =
      this.selectedRequest?.serviceRequestAssignmentResponses?.map(
        (a) => a.workerId,
      ) || [];

    this.selectedWorkers = [];

    this.workerService.getAllWorkers().subscribe({
      next: (res) => {
        this.workers = res.data;
        this.filteredWorkers = [...this.workers];
        this.assignLoading = false;
      },
      error: () => {
        this.assignMessage = 'Failed to load workers.';
        this.assignLoading = false;
      },
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
    this.filteredWorkers = this.workers.filter(
      (w: { fullName: string; phoneNumber: string }) =>
        w.fullName.toLowerCase().includes(term) ||
        w.phoneNumber.toLowerCase().includes(term),
    );
  }

  // toggleWorkerSelection(event: any, worker: WorkersResponseModel) {
  //   const workerId = Number(event.target.value);

  //   if (event.target.checked) {
  //     if (!this.isAlreadyAssigned(workerId))
  //       this.selectedWorkers.push(workerId);
  //   } else {
  //     this.selectedWorkers = this.selectedWorkers.filter(
  //       (id) => id !== workerId,
  //     );
  //   }
  // }

  /* ------------------------------------------------------
   *  SUBMIT ASSIGNMENT
   * ------------------------------------------------------ */
  submitWorkersAssignment(forceAssign = false): void {
    if (!this.selectedRequestId) return;

    if (!this.selectedWorkerIds.length) {
      this.assignMessage = 'Please select at least one technician.';
      return;
    }

    const payload: AssignWorkerRequest = {
      serviceRequestId: this.selectedRequestId,
      workerId: this.selectedWorkerIds,
      forceAssign,
    };

    this.pendingAssignPayload = payload;
    this.assignLoading = true;
    this.assignMessage = '';

    this.workerService.assignWorker(payload).subscribe({
      next: (res) => {
        this.assignLoading = false;

        if (res.data?.requiresConfirmation) {
          this.conflictedWorkers = res.data.conflicts || [];
          this.workerConflictVisible = true;
          return;
        }

        if (res.success && res.data?.assigned) {
          this.assignMessage =
            res.message || 'Technician assignment updated successfully.';
          this.workerConflictVisible = false;
          this.conflictedWorkers = [];
          this.pendingAssignPayload = null;

          this.loadRequests();
          this.closeAssignPopup();
        } else {
          this.assignMessage =
            res.message || 'Failed to update technician assignment.';
        }
      },
      error: () => {
        this.assignLoading = false;
        this.assignMessage = 'Failed to update technician assignment.';
      },
    });
  }
  confirmForceAssign(): void {
    if (!this.pendingAssignPayload) return;

    this.pendingAssignPayload.forceAssign = true;
    this.workerConflictVisible = false;
    this.assignLoading = true;

    this.workerService.assignWorker(this.pendingAssignPayload).subscribe({
      next: (res) => {
        this.assignLoading = false;

        if (res.success && res.data?.assigned) {
          this.closeAssignPopup();
          this.loadRequests();
        } else {
          this.assignMessage =
            res.message || 'Failed to update technician assignment.';
        }
      },
      error: () => {
        this.assignLoading = false;
        this.assignMessage = 'Failed to update technician assignment.';
      },
    });
  }

  cancelForceAssign(): void {
    this.workerConflictVisible = false;
    this.conflictedWorkers = [];
  }
  /* ------------------------------------------------------
   *  PAGINATION
   * ------------------------------------------------------ */
  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadRequests();
  }
  /* ------------------------------------------------------
   *  FILTERS
   * ------------------------------------------------------ */
  applyFilters() {
    this.page = 1;
    this.loadRequests();
    console.log('Filters:', {
      status: this.filterStatus,
      from: this.filterFromDate,
      to: this.filterToDate,
    });
  }

  clearFilters() {
    this.filterStatus = null;
    this.filterFromDate = null;
    this.filterToDate = null;
    this.page = 1;
    this.loadRequests();
  }

  formatInputValue(i: any): string {
    switch (i?.pricingBehavior) {
      case PricingInputBehavior.Dimensional:
        // user typed inches/cm/etc
        return this.formatNumber(i.enteredValue);

      case PricingInputBehavior.Rate:
      case PricingInputBehavior.Fixed:
        // user selected option (code/label), not the admin amount
        return (
          i.inputValueLabel ??
          i.inputValueCode ??
          (i.enteredValue ? this.formatNumber(i.enteredValue) : '—')
        );

      case PricingInputBehavior.None:
      default:
        return i.inputValueLabel ?? i.inputValueCode ?? '—';
    }
  }

  formatPricing(i: any): string {
    switch (i?.pricingBehavior) {
      case PricingInputBehavior.Dimensional:
        return 'Dimensional (user entered)';

      case PricingInputBehavior.Rate:
        return `Rate: ${this.formatNumber(i.appliedRate)}`;

      case PricingInputBehavior.Fixed:
        return `Fixed: ${this.formatNumber(i.appliedRate)}`;

      case PricingInputBehavior.None:
      default:
        return '—';
    }
  }

  formatCost(i: any): string {
    // cost is the calculatedCost returned from backend
    // (don’t recalc on UI)
    if (i?.calculatedCost == null) return '—';
    return `${i.calculatedCost}`;
  }

  getBehaviorLabel(b: number): string {
    switch (b) {
      case PricingInputBehavior.Dimensional:
        return 'Dimensional';
      case PricingInputBehavior.Rate:
        return 'Rate';
      case PricingInputBehavior.Fixed:
        return 'Fixed';
      default:
        return 'None';
    }
  }

  private formatNumber(v: any): string {
    if (v === null || v === undefined) return '—';
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return n % 1 === 0 ? `${n}` : `${n.toFixed(2)}`;
  }

  isWorkerSelected(workerId: number): boolean {
    return this.selectedWorkerIds.includes(workerId);
  }

  toggleWorkerSelection(event: Event, worker: any): void {
    const checked = (event.target as HTMLInputElement).checked;
    const workerId = worker.workerId;

    if (checked) {
      if (!this.selectedWorkerIds.includes(workerId)) {
        this.selectedWorkerIds.push(workerId);
      }
    } else {
      this.selectedWorkerIds = this.selectedWorkerIds.filter(
        (id) => id !== workerId,
      );
    }
  }
}
