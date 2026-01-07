import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MetadataAttribute } from '../../Models/MetadataAttribute';
import { MetadataAttributeUpdate } from '../../Models/MetadataAttributeUpdate';
import { MetadataAttributeListResponse } from '../../Models/MetadataAttributeListResponse';
import { environment } from '../../../environment.prod';
import { ApiResponse } from '../../Models/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class MetadataAttributeService {

  private readonly baseUrl = environment.apiUrl + '/MetadataAttributes';

  constructor(private http: HttpClient) {}

  // ================= LIST =================
  getAll(
    page = 1,
    pageSize = 20,
    search?: string
  ): Observable<ApiResponse<MetadataAttributeListResponse>> {

    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<MetadataAttributeListResponse>>(
      this.baseUrl
    );
  }

  // ================= DETAILS =================
  getById(id: number): Observable<MetadataAttribute> {
    return this.http
      .get<ApiResponse<MetadataAttribute>>(`${this.baseUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  // ================= CREATE =================
  create(model: any): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(this.baseUrl, model);
  }

  // ================= UPDATE =================
  update(
    id: number,
    model: MetadataAttributeUpdate
  ): Observable<ApiResponse<object>> {
    return this.http.put<ApiResponse<object>>(
      `${this.baseUrl}/${id}`,
      model
    );
  }

  // ================= DELETE =================
  delete(id: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(
      `${this.baseUrl}/${id}`
    );
  }

  // ================= TOGGLE ACTIVE =================
  toggleActive(
    id: number,
    isActive: boolean
  ): Observable<ApiResponse<object>> {
    return this.http.patch<ApiResponse<object>>(
      `${this.baseUrl}/${id}/status`,
      { isActive }
    );
  }
}
