// src/app/admin/services/app-setting.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../Models/ApiResponse';
import { AppSettingResponse, AppSettingCreateRequest, AppSettingUpdateRequest } from '../../Models/app-setting.model';
import { environment } from '../../../environment.prod';


@Injectable({
  providedIn: 'root'
})
export class AppSettingService {
  private readonly baseUrl = `${environment.apiUrl}/AppSetting`;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<ApiResponse<AppSettingResponse>> {
    return this.http.get<ApiResponse<AppSettingResponse>>(this.baseUrl);
  }

  createSettings(data: AppSettingCreateRequest): Observable<ApiResponse<AppSettingResponse>> {
    return this.http.post<ApiResponse<AppSettingResponse>>(this.baseUrl, data);
  }

  updateSettings(data: AppSettingUpdateRequest): Observable<ApiResponse<AppSettingResponse>> {
    return this.http.put<ApiResponse<AppSettingResponse>>(this.baseUrl, data);
  }

  deleteSettings(): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(this.baseUrl);
  }
}
