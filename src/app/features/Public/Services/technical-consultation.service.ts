import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment.prod';
import {
  ApiMessageResponse,
  CreateTechnicalConsultationRequest,
  TechnicalConsultationRequestListResponse,
  TechnicalConsultationRequestResponse,
  UpdateTechnicalConsultationRequest,
} from '../Models/Consultation.model';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../Models/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class TechnicalConsultationService {
  private api = `${environment.apiUrl}/Consultation`;

  constructor(private http: HttpClient) {}

  submit(model: CreateTechnicalConsultationRequest) {
    return this.http.post<{
      success: boolean;
      message: string;
      data: TechnicalConsultationRequestResponse;
    }>(`${this.api}/submit`, model);
  }

  getAll(
    all: boolean = false,
    page: number = 1,
    pageSize: number = 10,
  ): Observable<ApiResponse<TechnicalConsultationRequestListResponse>> {
    const params = new HttpParams()
      .set('all', all)
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<ApiResponse<TechnicalConsultationRequestListResponse>>(
      this.api,
      { params },
    );
  }

  getById(
    id: number,
  ): Observable<ApiResponse<TechnicalConsultationRequestResponse>> {
    return this.http.get<ApiResponse<TechnicalConsultationRequestResponse>>(
      `${this.api}/${id}`,
    );
  }

  update(
    model: UpdateTechnicalConsultationRequest,
  ): Observable<ApiResponse<TechnicalConsultationRequestResponse>> {
    return this.http.put<ApiResponse<TechnicalConsultationRequestResponse>>(
      `${this.api}/${model.id}`,
      model,
    );
  }

  delete(id: number): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(`${this.api}/${id}`);
  }
}
