import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedServiceRequestListResponse, ServiceRequestDetailDto } from '../../Models/ServiceRequestDetailDto.Model';
import { environment } from '../../../environment.prod';
@Injectable({ providedIn: 'root' })
export class AdminServiceRequestService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(
  page = 1,
  pageSize = 20,
  status?: string,
  fromDate?: string | null,
  toDate?: string | null
) {
  let params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize);

  if (status && status !== '') {
    params = params.set('status', status);
  }

  if (fromDate && fromDate.trim() !== '') {
    params = params.set('fromDate', fromDate);
  }

  if (toDate && toDate.trim() !== '') {
    params = params.set('toDate', toDate);
  }

  return this.http.get<PagedServiceRequestListResponse>(
    `${this.base}/ServiceRequest/get-all`,
    { params }
  );
}


  getById(id: number): Observable<ServiceRequestDetailDto> {
    return this.http.get<ServiceRequestDetailDto>(`${this.base}/ServiceRequest/${id}`);
  }
}
