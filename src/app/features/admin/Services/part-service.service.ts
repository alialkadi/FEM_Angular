import { Injectable } from '@angular/core';
import { environment } from '../../../environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../Models/ApiResponse';
import { Part, PartListResponse } from '../../Models/Part.Models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartService {
  private baseurl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllParts(
    all: boolean = false,
    page?: number,
    pageSize?: number
  ): Observable<ApiResponse<PartListResponse>> {
    let params = new HttpParams().set('all', all);
    if (page !== undefined) params = params.set('page', page);
    if (pageSize !== undefined) params = params.set('pageSize', pageSize);

    return this.http.get<ApiResponse<PartListResponse>>(
      `${this.baseurl}/Part`,
      { params }
    );
  }

  getPartsByStructure(id: number): Observable<ApiResponse<PartListResponse>> {
    return this.http.get<ApiResponse<PartListResponse>>(
      `${this.baseurl}/Part/byStructure/${id}`
    );
  }

  createPart(data: FormData): Observable<ApiResponse<Part>> {
    return this.http.post<ApiResponse<Part>>(
      `${this.baseurl}/Part`,
      data
    );
  }

  deletePart(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      `${this.baseurl}/Part/${id}`
    );
  }

  updatePart(id: number, data: FormData): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.baseurl}/Part/${id}`,
      data
    );
  }
}
