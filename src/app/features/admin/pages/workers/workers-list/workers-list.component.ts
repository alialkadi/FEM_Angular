import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateWorkerService } from '../../../Services/create-worker.service';
import { WorkersResponseModel } from '../../../Services/workers.model';
import { CreateWorkerModel } from '../../../../Models/create-worker.model';
import {
  GetTechnicianAssignmentsApiResponse,
  TechnicianAssignmentResponse,
} from '../../../../technician-dashboard/Models/assignment.model';

@Component({
  selector: 'app-workers-list',
  templateUrl: './workers-list.component.html',
  styleUrls: ['./workers-list.component.scss'],
})
export class WorkersListComponent implements OnInit {
  workers: WorkersResponseModel[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';

  showModal = false;
  selectedWorker: WorkersResponseModel | null = null;
  editMode = false;
  submitting = false;

  workerForm!: FormGroup;

  assignments: TechnicianAssignmentResponse[] = [];
  showAssignmentsModal = false;
  assignmentsLoading = false;
  assignmentsErrorMessage = '';
  selectedAssignmentWorker: WorkersResponseModel | null = null;

  constructor(
    private workerService: CreateWorkerService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadWorkers();
  }

  initForm(): void {
    this.workerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      dailyCapacity: [5, [Validators.required, Validators.min(1)]],
    });
  }

  loadWorkers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.workerService.getAllWorkers().subscribe({
      next: (res) => {
        this.loading = false;
        console.log(res);
        if (res.success && res.data) {
          const response = res.data as any;
          this.workers = Array.isArray(response) ? response : [response];
        } else {
          this.errorMessage = 'Failed to load workers.';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'An error occurred while fetching workers.';
      },
    });
  }

  openWorkerModal(worker: WorkersResponseModel): void {
    this.selectedWorker = worker;
    this.editMode = false;
    this.showModal = true;

    this.workerForm.patchValue({
      email: worker.email || '',
      password: '',
      firstName: worker.firstName || '',
      lastName: worker.lastName || '',
      phoneNumber: worker.phoneNumber || '',
      address: worker.address || '',
      dailyCapacity: worker.dailyCapacity ?? 5,
    });
  }

  enableEdit(): void {
    this.editMode = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedWorker = null;
    this.editMode = false;
    this.submitting = false;

    this.workerForm.reset({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      dailyCapacity: 5,
    });
  }

  updateWorker(): void {
    if (!this.selectedWorker) return;

    if (this.workerForm.invalid) {
      this.workerForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.workerForm.getRawValue();

    const dto: CreateWorkerModel = {
      email: formValue.email?.trim() || '',
      password: formValue.password?.trim() || '',
      firstName: formValue.firstName?.trim() || '',
      lastName: formValue.lastName?.trim() || '',
      phoneNumber: formValue.phoneNumber?.trim() || '',
      address: formValue.address?.trim() || '',
      dailyCapacity: Number(formValue.dailyCapacity ?? 5),
    };

    this.workerService
      .updateWorker(this.selectedWorker.workerId, dto)
      .subscribe({
        next: (res) => {
          this.submitting = false;

          if (res.success) {
            this.successMessage = 'Worker updated successfully.';

            const index = this.workers.findIndex(
              (w) => w.workerId === this.selectedWorker!.workerId,
            );

            if (index !== -1) {
              this.workers[index] = {
                ...this.workers[index],
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
                fullName: `${dto.firstName} ${dto.lastName}`.trim(),
                phoneNumber: dto.phoneNumber,
                address: dto.address,
                dailyCapacity: dto.dailyCapacity,
              };
            }

            this.closeModal();
            this.loadWorkers();
          } else {
            this.errorMessage = res.message || 'Failed to update worker.';
          }
        },
        error: () => {
          this.submitting = false;
          this.errorMessage = 'An error occurred while updating worker.';
        },
      });
  }

  deleteWorker(id: number): void {
    this.workerService.deleteWorker(id).subscribe({
      next: () => {
        this.loadWorkers();
      },
      error: () => {
        this.errorMessage = 'Failed to delete worker.';
      },
    });
  }

  openAssignmentsModal(worker: WorkersResponseModel): void {
    this.selectedAssignmentWorker = worker;
    this.showAssignmentsModal = true;
    this.assignments = [];
    this.assignmentsErrorMessage = '';
    this.loadTechnicianAssignments(worker.workerId);
  }

  closeAssignmentsModal(): void {
    this.showAssignmentsModal = false;
    this.assignments = [];
    this.assignmentsLoading = false;
    this.assignmentsErrorMessage = '';
    this.selectedAssignmentWorker = null;
  }

  loadTechnicianAssignments(workerId: number): void {
    this.assignmentsLoading = true;
    this.assignmentsErrorMessage = '';

    this.workerService.getWorkerAssignedJobs(workerId).subscribe({
      next: (res: GetTechnicianAssignmentsApiResponse) => {
        this.assignmentsLoading = false;
        console.log(res);

        if (res.success && res.data) {
          this.assignments = res.data; // ✅ direct array
        } else {
          this.assignmentsErrorMessage =
            res.message || 'Unable to load technician assignments.';
        }
      },
      error: () => {
        this.assignmentsLoading = false;
        this.assignmentsErrorMessage =
          'Something went wrong while loading assignments.';
      },
    });
  }

  getAssignmentServicesText(assignment: TechnicianAssignmentResponse): string {
    if (!assignment.services || assignment.services.length === 0) {
      return 'No services';
    }

    return assignment.services.map((s) => s.serviceName).join(', ');
  }

  trackByAssignment(index: number, item: TechnicianAssignmentResponse): number {
    return item.assignmentId;
  }

  get f() {
    return this.workerForm.controls;
  }
}
