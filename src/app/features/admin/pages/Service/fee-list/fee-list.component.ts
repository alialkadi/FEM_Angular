import { Component } from '@angular/core';
import { FeeResponse } from '../../../../Models/FeeResponse.Model';
import { FeeService } from '../../../Services/fee.service';
import { EditFeeDialogComponent } from '../../../../../shared/Dialogs/edit-fee-dialog/edit-fee-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../../../../shared/Services/toast.service';

@Component({
  selector: 'app-fee-list',
  templateUrl: './fee-list.component.html',
  styleUrl: './fee-list.component.scss'
})
export class FeeListComponent {

  fees: FeeResponse[] = [];
  totalCount = 0;
  page = 1;
  pageSize = 10;
  searchTerm = '';
  isLoading = false;

  showModal = false;
  selectedFee: FeeResponse | null = null;

  constructor(
    private feeService: FeeService,
    private dialog: MatDialog,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadFees();
  }

  // ❌ DO NOT TOUCH – data loading stays as-is
  loadFees(): void {
    this.isLoading = true;
    this.feeService.getAll(this.page, this.pageSize, this.searchTerm).subscribe({
      next: (res) => {
        this.fees = res.data.fees;
        this.totalCount = res.data.totalCount;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onSearch(): void {
    this.page = 1;
    this.loadFees();
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadFees();
  }

  onEdit(id: number): void {
    // kept as-is
  }

  confirmDelete(fee: FeeResponse): void {
    if (!confirm(`Are you sure you want to delete "${fee.name}"?`)) return;

    this.feeService.delete(fee.id).subscribe({
      next: () => {
        this.toast.show(`Fee "${fee.name}" deleted successfully`, 'success');
        this.loadFees();
      },
      error: () => {
        this.toast.show(`Failed to delete fee "${fee.name}"`, 'error');
      }
    });
  }

  editFee(fee: FeeResponse, mode: 'name' | 'services' | 'full'): void {
    const dialogRef = this.dialog.open(EditFeeDialogComponent, {
      width: '600px',
      data: { fee, mode },
      disableClose: true,
      panelClass: 'fee-edit-dialog'
    });

    dialogRef.afterClosed().subscribe((updatedFee: FeeResponse | null) => {
      if (updatedFee) {
        const index = this.fees.findIndex(f => f.id === updatedFee.id);
        if (index !== -1) {
          this.fees[index] = updatedFee;
        }

        this.toast.show('Fee updated successfully', 'success');
        this.loadFees();
      }
    });
  }

  openServicesModal(fee: FeeResponse): void {
    this.selectedFee = fee;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedFee = null;
  }
}
