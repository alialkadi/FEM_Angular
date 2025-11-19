import { Injectable } from '@angular/core';
import { environment } from '../../../environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserServiceRequestResponseDto } from '../Models/UserServiceRequestResponse.Model';

@Injectable({
  providedIn: 'root'
})
export class UserServiceRequestService {

   private baseUrl = `${environment.apiUrl}/ServiceRequest`;

  constructor(private http: HttpClient) {}

  getUserRequests(): Observable<UserServiceRequestResponseDto> {
    return this.http.get<UserServiceRequestResponseDto>(`${this.baseUrl}/GetReqeuestById`);
  }

  updateStatus(requestId: number, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/UpdateRequestStatus/${requestId}`, { status });
  }
}
