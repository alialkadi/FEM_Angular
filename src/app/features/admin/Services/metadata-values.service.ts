import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment.prod';
import { ApiResponse } from '../../Models/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class MetadataValuesService {

    private readonly baseUrl = environment.apiUrl + '/MetadataAttributeValues';

  constructor(private http: HttpClient) {}

  getByAttribute(attributeId: number) {
    return this.http.get<ApiResponse<any[]>>(this.baseUrl, {
      params: { attributeId }
    });
  }

  create(attributeId: number, payload: any) {
    return this.http.post<ApiResponse<number>>(
      this.baseUrl,
      payload,
      { params: { attributeId } }
    );
  }

  createBulk(attributeId: number, payload: any) {
    return this.http.post<ApiResponse<number[]>>(
      `${this.baseUrl}/bulk`,
      payload,
      { params: { attributeId } }
    );
  }

  update(id: number, payload: any) {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
  }
}
