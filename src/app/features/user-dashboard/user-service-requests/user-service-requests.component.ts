import { Component } from '@angular/core';
import { UserServiceRequestResponseDto, UserServiceRequestDto } from '../Models/UserServiceRequestResponse.Model';
import { UserServiceRequestService } from '../Services/user-service-request.service';

@Component({
  selector: 'app-user-service-requests',
  templateUrl: './user-service-requests.component.html',
  styleUrl: './user-service-requests.component.scss'
})
export class UserServiceRequestsComponent {

  loading = true;
  response!: UserServiceRequestResponseDto;
  selectedRequest: UserServiceRequestDto | null = null;

  statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' }
  ];

  constructor(private requestService: UserServiceRequestService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;

    this.requestService.getUserRequests().subscribe({
      next: (res) => {
        console.log(res)
        this.response = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openRequest(req: UserServiceRequestDto) {
    this.selectedRequest = req;
  }

  closeDetails() {
    this.selectedRequest = null;
  }

  updateStatus(req: UserServiceRequestDto, status: string) {
    this.requestService.updateStatus(req.requestId, status).subscribe(() => {
      req.statusName = status;
    });
  }
}
