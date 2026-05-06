import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment.prod';
import {
  AdminCustomerDto,
  CreateCustomerDto,
  UpdateCustomerDto,
} from '../../Models/AdminCustomerDto.model';
import { ApiResponse } from '../../Models/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class AdminCustomerService {
  private readonly baseUrl = `${environment.apiUrl}/Customers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<AdminCustomerDto[]>> {
    return this.http.get<ApiResponse<AdminCustomerDto[]>>(this.baseUrl);
  }

  getById(userId: string): Observable<ApiResponse<AdminCustomerDto>> {
    return this.http.get<ApiResponse<AdminCustomerDto>>(
      `${this.baseUrl}/${userId}`,
    );
  }

  create(
    payload: CreateCustomerDto,
  ): Observable<ApiResponse<AdminCustomerDto>> {
    return this.http.post<ApiResponse<AdminCustomerDto>>(this.baseUrl, payload);
  }

  update(
    userId: string,
    payload: UpdateCustomerDto,
  ): Observable<ApiResponse<AdminCustomerDto>> {
    return this.http.put<ApiResponse<AdminCustomerDto>>(
      `${this.baseUrl}/${userId}`,
      payload,
    );
  }
}
