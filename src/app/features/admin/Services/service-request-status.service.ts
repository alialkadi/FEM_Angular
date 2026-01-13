import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment.prod';
import { ServiceRequestResponseDto } from '../../Models/ServiceRequestDetailDto.Model';
import { AllowedStatusDto, ServiceRequestStatusUpdateDto } from '../../Models/statusRequest.Model';
import { ApiResponse } from '../../Models/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestStatusService {

  private baseUrl = `${environment.apiUrl}/workers`;

  constructor(private http: HttpClient) {}

  // 🔹 Fetch allowed statuses
  getAllowedStatuses(): Observable<ApiResponse<AllowedStatusDto[]>> {
    return this.http.get<ApiResponse<AllowedStatusDto[]>>(
      `${this.baseUrl}/statuses`
    );
  }

  // 🔹 Update request status
  updateStatus(dto: ServiceRequestStatusUpdateDto): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/update-status`,
      dto
    );
  }
}

