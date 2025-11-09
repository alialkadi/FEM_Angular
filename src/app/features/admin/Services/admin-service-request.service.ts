import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedServiceRequestListResponse, ServiceRequestDetailDto } from '../../Models/ServiceRequestDetailDto.Model';
import { environment } from '../../../environment.prod';
@Injectable({ providedIn: 'root' })
export class AdminServiceRequestService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(page = 1, pageSize = 20, status?: string): Observable<PagedServiceRequestListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    if (status) params = params.set('status', status);
    return this.http.get<PagedServiceRequestListResponse>(`${this.base}/ServiceRequest/get-all`, { params });
  }

  getById(id: number): Observable<ServiceRequestDetailDto> {
    return this.http.get<ServiceRequestDetailDto>(`${this.base}/ServiceRequest/${id}`);
  }
}
