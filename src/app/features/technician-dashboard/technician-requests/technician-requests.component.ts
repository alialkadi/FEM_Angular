import { Component } from '@angular/core';
import { TechnicianAssignmentResponse, GetTechnicianAssignmentsApiResponse } from '../Models/assignment.model';
import { AssignmentsService } from '../Services/assignments.service';

@Component({
  selector: 'app-technician-requests',
  templateUrl: './technician-requests.component.html',
  styleUrl: './technician-requests.component.scss'
})
export class TechnicianRequestsComponent {

  assignments: TechnicianAssignmentResponse[] = [];
  loading = true;
  errorMessage = '';

  constructor(private _assignmentsService: AssignmentsService) {}

  ngOnInit(): void {
    this.getMyJobs();
  }

  getMyJobs() {
    this.loading = true;
    this.errorMessage = '';

    this._assignmentsService.getMyJobs().subscribe({
      next: (res: GetTechnicianAssignmentsApiResponse) => {
        this.loading = false;

        if (res.success && res.data.isSuccessful) {
          this.assignments = res.data.response;
        } else {
          this.errorMessage = 'Unable to load your jobs.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Something went wrong. Please try again.';
      }
    });
  }
}
