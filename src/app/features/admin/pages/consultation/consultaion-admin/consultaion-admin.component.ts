import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  TechnicalConsultationRequestResponse,
  UpdateTechnicalConsultationRequest,
} from '../../../../Public/Models/Consultation.model';
import { TechnicalConsultationService } from '../../../../Public/Services/technical-consultation.service';

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

  constructor(
    private consultationService: TechnicalConsultationService,
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
}
