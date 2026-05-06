import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment.prod';
import { ApiResponse } from '../../Models/ApiResponse';
import { GeneralResponse } from '../../Models/general-response.model';
import {
  CreateWorkerModel,
  CreateWorkerResponse,
} from '../../Models/create-worker.model';
import { Observable } from 'rxjs';
import { WorkersResponseModel } from './workers.model';
import { GetTechnicianAssignmentsApiResponse } from '../../technician-dashboard/Models/assignment.model';
export interface WorkerConflictDto {
  workerId: number;
  workerName: string;
  existingRequestId: number;
  existingStatus: string;
}

export interface AssignWorkerResultDto {
  assigned: boolean;
  requiresConfirmation: boolean;
  conflicts: WorkerConflictDto[];
}
export interface TechnicianForAssignmentDto {
  workerId: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  specialty?: string;
  assignmentCount: number;
  isAssignedToCurrentRequest: boolean;
}
export interface AssignWorkerRequest {
  serviceRequestId: number;
  workerId: number[];
  notes?: string;
  forceAssign?: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class CreateWorkerService {
  private baseUrl = `${environment.apiUrl}/workers`;

  constructor(private http: HttpClient) {}

  createWorker(
    data: CreateWorkerResponse,
  ): Observable<ApiResponse<CreateWorkerResponse>> {
    return this.http.post<ApiResponse<CreateWorkerResponse>>(
      `${this.baseUrl}/create`,
      data,
    );
  }

  getAllWorkers(): Observable<ApiResponse<WorkersResponseModel[]>> {
    return this.http.get<ApiResponse<WorkersResponseModel[]>>(
      `${this.baseUrl}`,
    );
  }
  lockWorker(workerId: number): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.baseUrl}/${workerId}/lock`,
      {},
    );
  }

  unlockWorker(workerId: number): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.baseUrl}/${workerId}/unlock`,
      {},
    );
  }
  updateWorker(workerId: number, dto: CreateWorkerModel): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${workerId}`, dto);
  }
  deleteWorker(workerId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${workerId}`);
  }

  assignWorker(
    data: AssignWorkerRequest,
  ): Observable<ApiResponse<AssignWorkerResultDto>> {
    return this.http.post<ApiResponse<AssignWorkerResultDto>>(
      `${this.baseUrl}/assign-worker`,
      data,
    );
  }

  getWorkerAssignedJobs(workerId: number) {
    const params = new HttpParams().set('nameIdentifier', workerId);
    return this.http.get<GetTechnicianAssignmentsApiResponse>(
      `${this.baseUrl}/assignedJobs`,
      { params },
    );
  }
  getWorkersForAssignment(
    requestId: number,
  ): Observable<ApiResponse<TechnicianForAssignmentDto[]>> {
    return this.http.get<ApiResponse<TechnicianForAssignmentDto[]>>(
      `${this.baseUrl}/for-assignment/${requestId}`,
    );
  }
}
