import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment.prod';
import { ServiceRequestResponseDto } from '../../Models/ServiceRequestDetailDto.Model';
import { AllowedStatusDto, ServiceRequestStatusUpdateDto } from '../../Models/statusRequest.Model';

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestStatusService {

  private baseUrl = `${environment.apiUrl}/ServiceRequest`;

  constructor(private http: HttpClient) {}

  // 🔹 Fetch allowed statuses for current role
  getAllowedStatuses(): Observable<{ isSuccessful: boolean; response: AllowedStatusDto[] }> {
    return this.http.get<{ isSuccessful: boolean; response: AllowedStatusDto[] }>(
      `${this.baseUrl}/allowed-statuses`
    );
  }

  // 🔹 Update request status
  updateStatus(dto: ServiceRequestStatusUpdateDto): Observable<{ isSuccessful: boolean; response: ServiceRequestResponseDto }> {
    return this.http.put<{ isSuccessful: boolean; response: ServiceRequestResponseDto }>(
      `${this.baseUrl}/update-status`, dto
    );
  }
}
