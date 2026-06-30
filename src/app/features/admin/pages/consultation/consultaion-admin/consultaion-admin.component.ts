import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  TechnicalConsultationRequestResponse,
  UpdateTechnicalConsultationRequest,
} from '../../../../Public/Models/Consultation.model';
import { TechnicalConsultationService } from '../../../../Public/Services/technical-consultation.service';
import {
  TechnicianForConsultationAssignmentDto,
  ConsultationWorkerConflictDto,
  AssignConsultationWorkerRequest,
} from '../../../../Models/ConsultationWorkerConflictDto.model';
import { CreateWorkerService } from '../../../Services/create-worker.service';

@Component({
  selector: 'app-consultaion-admin',
  templateUrl: './consultaion-admin.component.html',
  styleUrl: './consultaion-admin.component.scss',
})
export class ConsultaionAdminComponent {
  consultations: TechnicalConsultationRequestResponse[] = [];
  filteredConsultations: TechnicalConsultationRequestResponse[] = [];

  loading = false;
  submitting = false;
  deletingId: number | null = null;

  showEditModal = false;
  selectedConsultation: TechnicalConsultationRequestResponse | null = null;

  searchTerm = '';

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 1;

  editForm!: FormGroup;

  assignPopupVisible = false;
  workerConflictVisible = false;
  assignLoading = false;
  assignSubmitting = false;
  assignMessage = '';

  selectedConsultationId: number | null = null;
  selectedWorkerIds: number[] = [];

  workersForAssignment: TechnicianForConsultationAssignmentDto[] = [];
  filteredWorkers: TechnicianForConsultationAssignmentDto[] = [];
  conflictedWorkers: ConsultationWorkerConflictDto[] = [];

  workerSearchTerm = '';
  appointmentDateTime = '';
  assignmentNotes = '';

  lastAssignPayload: AssignConsultationWorkerRequest | null = null;
  constructor(
    private consultationService: TechnicalConsultationService,
    private workerService: CreateWorkerService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadConsultations();
  }

  initForm(): void {
    this.editForm = this.fb.group({
      id: [0],
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required, Validators.maxLength(500)]],
      latitude: [null],
      longitude: [null],
      placeId: [''],
      portfolioType: ['', Validators.required],
      message: ['', [Validators.required, Validators.maxLength(2000)]],
      serviceScopes: [[]],
    });
  }

  loadConsultations(page: number = this.currentPage): void {
    this.loading = true;
    this.currentPage = page;

    this.consultationService
      .getAll(false, this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          const data = res.data;
          console.log(res);
          this.consultations = data?.items || [];

          this.totalCount = data?.totalCount || 0;
          this.totalPages = Math.max(
            1,
            Math.ceil(this.totalCount / this.pageSize),
          );

          this.applyFilter();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading consultations:', err);
          this.consultations = [];
          this.filteredConsultations = [];
          this.loading = false;
        },
      });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredConsultations = [...this.consultations];
      return;
    }

    this.filteredConsultations = this.consultations.filter((item: any) => {
      const fullName =
        item.fullName ||
        `${item.firstName || ''} ${item.lastName || ''}`.trim();

      return (
        fullName.toLowerCase().includes(term) ||
        (item.email || '').toLowerCase().includes(term) ||
        (item.phoneNumber || '').toLowerCase().includes(term) ||
        (item.address || '').toLowerCase().includes(term) ||
        (item.portfolioType || '').toLowerCase().includes(term)
      );
    });
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  openEditModal(item: any): void {
    this.selectedConsultation = item;

    const firstName = item.firstName || this.extractFirstName(item.fullName);
    const lastName = item.lastName || this.extractLastName(item.fullName);

    this.editForm.patchValue({
      id: item.id,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: item.phoneNumber || '',
      email: item.email || '',
      address: item.address || '',
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      placeId: item.placeId || '',
      portfolioType: item.portfolioType || '',
      message: item.message || '',
      serviceScopes: item.serviceScopes || [],
    });

    this.showEditModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedConsultation = null;
    this.editForm.reset({
      id: 0,
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      address: '',
      latitude: null,
      longitude: null,
      placeId: '',
      portfolioType: '',
      message: '',
      serviceScopes: [],
    });
    document.body.style.overflow = 'auto';
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const formValue = this.editForm.value;

    const payload: UpdateTechnicalConsultationRequest = {
      id: formValue.id,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phoneNumber: formValue.phoneNumber,
      email: formValue.email,
      address: formValue.address,
      latitude: formValue.latitude,
      longitude: formValue.longitude,
      placeId: formValue.placeId,
      portfolioType: formValue.portfolioType,
      message: formValue.message,
      serviceScopes: formValue.serviceScopes || [],
    };

    this.consultationService.update(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.closeEditModal();
        this.loadConsultations(this.currentPage);
      },
      error: (err) => {
        console.error('Error updating consultation:', err);
        this.submitting = false;
      },
    });
  }

  deleteConsultation(id: number): void {
    const confirmed = window.confirm(
      'Are you sure you want to delete this consultation?',
    );
    if (!confirmed) return;

    this.deletingId = id;

    this.consultationService.delete(id).subscribe({
      next: () => {
        this.deletingId = null;

        if (this.consultations.length === 1 && this.currentPage > 1) {
          this.loadConsultations(this.currentPage - 1);
        } else {
          this.loadConsultations(this.currentPage);
        }
      },
      error: (err) => {
        console.error('Error deleting consultation:', err);
        this.deletingId = null;
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.loadConsultations(page);
  }

  get pages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getFieldError(controlName: string): boolean {
    const control = this.editForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  private extractFirstName(fullName?: string): string {
    if (!fullName) return '';
    return fullName.split(' ')[0] || '';
  }

  private extractLastName(fullName?: string): string {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  }

  openAssignWorkerConsultation(consultationId: number): void {
    this.selectedConsultationId = consultationId;
    this.assignPopupVisible = true;
    this.assignMessage = '';
    this.workerSearchTerm = '';
    this.appointmentDateTime = '';
    this.assignmentNotes = '';
    this.selectedWorkerIds = [];
    this.workersForAssignment = [];
    this.filteredWorkers = [];

    document.body.style.overflow = 'hidden';

    this.loadWorkersForConsultationAssignment(consultationId);
  }

  loadWorkersForConsultationAssignment(consultationId: number): void {
    this.assignLoading = true;

    this.workerService
      .getWorkersForConsultationAssignment(consultationId)
      .subscribe({
        next: (res) => {
          this.workersForAssignment = res.data || [];
          this.filteredWorkers = [...this.workersForAssignment];
          console.log(res)
        this.workersForAssignment = (res.data || []).sort((a, b) =>
  Number(b.isAssignedToCurrentRequest) - Number(a.isAssignedToCurrentRequest)
);

this.filteredWorkers = [...this.workersForAssignment];

this.selectedWorkerIds = this.workersForAssignment
  .filter(w => w.isAssignedToCurrentRequest)
  .map(w => w.workerId);
          this.assignLoading = false;
        },
        error: (err) => {
          console.error('Error loading consultation workers:', err);
          this.assignMessage = 'Failed to load technicians.';
          this.assignLoading = false;
        },
      });
  }

  closeAssignPopup(): void {
    this.assignPopupVisible = false;
    this.workerConflictVisible = false;
    this.selectedConsultationId = null;
    this.selectedWorkerIds = [];
    this.workersForAssignment = [];
    this.filteredWorkers = [];
    this.conflictedWorkers = [];
    this.workerSearchTerm = '';
    this.appointmentDateTime = '';
    this.assignmentNotes = '';
    this.assignMessage = '';
    this.lastAssignPayload = null;

    document.body.style.overflow = 'auto';
  }

  filterWorkers(): void {
    const term = this.workerSearchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredWorkers = [...this.workersForAssignment];
      return;
    }

    this.filteredWorkers = this.workersForAssignment.filter(
      (w) =>
        w.fullName.toLowerCase().includes(term) ||
        w.phoneNumber.toLowerCase().includes(term) ||
        w.email.toLowerCase().includes(term),
    );
  }

  toggleWorkerSelection(
    event: Event,
    worker: TechnicianForConsultationAssignmentDto,
  ): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      if (!this.selectedWorkerIds.includes(worker.workerId)) {
        this.selectedWorkerIds.push(worker.workerId);
      }
    } else {
      this.selectedWorkerIds = this.selectedWorkerIds.filter(
        (id) => id !== worker.workerId,
      );
    }
  }

  isWorkerSelected(workerId: number): boolean {
    return this.selectedWorkerIds.includes(workerId);
  }

 isAlreadyAssigned(workerId: number): boolean {
  return this.workersForAssignment.some(
    w => w.workerId === workerId && w.isAssignedToCurrentRequest
  );
}

  submitConsultationWorkersAssignment(forceAssign = false): void {
    if (!this.selectedConsultationId) {
      this.assignMessage = 'No consultation selected.';
      return;
    }

    if (!this.selectedWorkerIds.length) {
      this.assignMessage = 'Please select at least one technician.';
      return;
    }

    if (!this.appointmentDateTime) {
      this.assignMessage = 'Please select appointment date and time.';
      return;
    }

    const appointment = new Date(this.appointmentDateTime);

    if (appointment <= new Date()) {
      this.assignMessage = 'Appointment date and time must be in the future.';
      return;
    }

    const payload: AssignConsultationWorkerRequest = {
      consultationRequestId: this.selectedConsultationId,
      workerIds: this.selectedWorkerIds,
      appointmentDateTime: appointment.toISOString(),
      notes: this.assignmentNotes?.trim() || undefined,
      forceAssign,
    };

    this.lastAssignPayload = payload;
    this.assignSubmitting = true;
    this.assignMessage = '';

    this.workerService.assignWorkerToConsultation(payload).subscribe({
      next: (res) => {
        const result = res.data;
        console.log(res);
        if (result?.requiresConfirmation) {
          this.conflictedWorkers = result.conflicts || [];
          this.workerConflictVisible = true;
          this.assignSubmitting = false;
          return;
        }

        this.assignSubmitting = false;
        this.closeAssignPopup();
        this.loadConsultations(this.currentPage);
      },
      error: (err) => {
        console.error('Error assigning consultation technicians:', err);
        this.assignMessage = 'Failed to assign technician to consultation.';
        this.assignSubmitting = false;
      },
    });
  }

  confirmForceAssign(): void {
    this.workerConflictVisible = false;
    this.submitConsultationWorkersAssignment(true);
  }

  cancelForceAssign(): void {
    this.workerConflictVisible = false;
    this.conflictedWorkers = [];
  }
}
