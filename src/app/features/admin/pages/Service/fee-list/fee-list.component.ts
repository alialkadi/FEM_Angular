import { Component } from '@angular/core';
import { FeeResponse } from '../../../../Models/FeeResponse.Model';
import { FeeService } from '../../../Services/fee.service';
import { EditFeeDialogComponent } from '../../../../../shared/Dialogs/edit-fee-dialog/edit-fee-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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

  constructor(private feeService: FeeService,private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadFees();
  }

  loadFees(): void {
    this.isLoading = true;
    this.feeService.getAll(this.page, this.pageSize, this.searchTerm).subscribe({
      next: (res) => {
        this.fees = res.data.fees;
        this.totalCount = res.data.totalCount;
        console.log(res);
        
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
    // Navigate to edit form
  }

  confirmDelete(fee: FeeResponse): void {
    if (confirm(`Are you sure you want to delete "${fee.name}"?`)) {
      this.feeService.delete(fee.id).subscribe(() => this.loadFees());
    }
  }
editFee(fee: FeeResponse, mode: 'name' | 'services' | 'full'): void {
  const dialogRef = this.dialog.open(EditFeeDialogComponent, {
    width: '600px',
    data: { fee, mode },
    disableClose: true, // prevent accidental close while editing
    panelClass: 'fee-edit-dialog'
  });
console.log("fee from edit",fee)
  dialogRef.afterClosed().subscribe((updatedFee: FeeResponse | null) => {
    if (updatedFee) {
      // ✅ Update local data instead of reloading full list
      const index = this.fees.findIndex(f => f.id === updatedFee.id);
      if (index !== -1) {
        this.fees[index] = updatedFee;
      }
      this.loadFees();
      // // ✅ Optional: if using MatTableDataSource
      // if (this.dataSource) {
      //   this.dataSource.data = [...this.fees];
      // }

      // this.snackBar.open('Fee updated successfully', 'Close', { duration: 3000 });
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
