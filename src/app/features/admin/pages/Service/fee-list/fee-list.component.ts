import { Component } from '@angular/core';
import { FeeResponse } from '../../../../Models/FeeResponse.Model';
import { FeeService } from '../../../Services/fee.service';

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

  constructor(private feeService: FeeService) {}

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

  openServicesModal(fee: FeeResponse): void {
    this.selectedFee = fee;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedFee = null;
  }
}
