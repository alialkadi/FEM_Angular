import { Injectable } from '@angular/core';
import { environment } from '../../../environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserServiceRequestResponseDto } from '../Models/UserServiceRequestResponse.Model';
import { ServiceRequestStatusUpdateDto } from '../../Models/statusRequest.Model';
import { ApiResponse } from '../../Models/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class UserServiceRequestService {
  private baseUrl = `${environment.apiUrl}/ServiceRequest`;

  constructor(private http: HttpClient) {}

  getUserRequests(userId: string): Observable<UserServiceRequestResponseDto> {
    return this.http.get<UserServiceRequestResponseDto>(
      `${this.baseUrl}/GetUserRequestById/${userId}`,
    );
  }
  getUserQouteRequests(
    userId: string,
  ): Observable<UserServiceRequestResponseDto> {
    return this.http.get<UserServiceRequestResponseDto>(
      `${this.baseUrl}/GetUserRequestsQouteById/${userId}`,
    );
  }
  updateStatus(
    dto: ServiceRequestStatusUpdateDto,
  ): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${environment.apiUrl}/workers/update-status`,
      dto,
    );
  }

  // updateStatus(requestId: number, status: string): Observable<any> {
  //   return this.http.put(
  //     `${environment.apiUrl}/workers/update-status/${requestId}`,
  //     {
  //       status,
  //     },
  //   );
  // }
}
