import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment.prod';
import { GetTechnicianAssignmentsApiResponse } from '../Models/assignment.model';

@Injectable({
  providedIn: 'root'
})
export class AssignmentsService {

  private baseUrl = `${environment.apiUrl}/Workers`;

  constructor(private http: HttpClient) {}

  /**
   * Get all jobs assigned to the technician (current logged-in worker)
   */
  getMyJobs() {
    return this.http.get<
      GetTechnicianAssignmentsApiResponse
    >(`${this.baseUrl}/my-jobs`);
  }
}
