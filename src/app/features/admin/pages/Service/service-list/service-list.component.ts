import { Component, OnInit } from '@angular/core';
import { ApiResponse } from '../../../../Models/ApiResponse';
import { ServiceResponse } from '../../../../Models/service.Model';
import { ServiceService } from '../../../Services/service-service.service';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit {

  services: ServiceResponse[] = [];
  totalCount: number = 0;
  page: number = 1;
  pageSize: number = 10;
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(private serviceService: ServiceService) { }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading = true;
    this.serviceService.getAllServices(false, this.page, this.pageSize).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.success) {
          this.services = res.data.services;
          this.totalCount = res.data.totalCount;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onDelete(id: number): void {
    if (confirm('Are you sure you want to delete this service?')) {
      this.serviceService.deleteService(id).subscribe(() => {
        this.loadServices();
      });
    }
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadServices();
  }

  onSearch(): void {
    if (this.searchTerm.trim() === '') {
      this.loadServices();
      return;
    }
    const filtered = this.services.filter(s => s.name?.toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.services = filtered;
  }
}
