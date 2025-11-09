import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FeeResponseList, FeeResponse } from '../../Models/FeeResponse.Model';
import { environment } from '../../../environment.prod';
import { ApiResponse } from '../../Models/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class FeeService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(page = 1, pageSize = 10, search = ''): Observable<ApiResponse<FeeResponseList>> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search) params = params.set('search', search);

    return this.http.get<ApiResponse<FeeResponseList>>(`${this.baseUrl}/Fee`, { params });
  }

  getById(id: number): Observable<FeeResponse> {
    return this.http.get<FeeResponse>(`${this.baseUrl}/${id}`);
  }
createFee(data: {
  name: string;
  amount: number;
  isGlobal: boolean;
  description?: string;
  serviceIds?: number[];
}): Observable<ApiResponse<FeeResponse>> {
  return this.http.post<ApiResponse<FeeResponse>>(`${this.baseUrl}/Fee`, data);
}
  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/Fee/${id}`);
  }
}
