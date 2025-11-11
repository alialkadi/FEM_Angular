import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment.prod';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../Models/ApiResponse';
import { createUpdateStructure, Structure, StructureListResponse } from '../../Models/Structure.Model';

@Injectable({
  providedIn: 'root'
})
export class StructureService {
  
  baseurl = environment.apiUrl;
  constructor(private _http: HttpClient) { }

  getAllStructures(all: boolean = false, page?: number, pageSize?: number): Observable<ApiResponse<StructureListResponse>> {
    let params = new HttpParams().set('all', all);

    if (page != undefined) {
      params = params.set('page', page);
    }
    if (pageSize != undefined) {
      params = params.set('pageSize', pageSize);
    }

    return this._http.get<ApiResponse<StructureListResponse>>(
      `${environment.apiUrl}/Structure`, { params });
  }
  getStructuresByType(id: number): Observable<ApiResponse<StructureListResponse>>  {
    return this._http.get<ApiResponse<StructureListResponse>>(
      `${environment.apiUrl}/Structure/bytype/${id}`);
  }
  CreateStructure(data: FormData): Observable<ApiResponse<Structure>> {
    return this._http.post<ApiResponse<Structure>>(`${this.baseurl}/Structure`, data)
  }

  deleteStructure(id: number): Observable<ApiResponse<boolean>> {
    return this._http.delete<ApiResponse<boolean>>(`${this.baseurl}/Structure/${id}`)
  }

  updateStructure(id: boolean, data: FormData): Observable<ApiResponse<Structure>> {
    return this._http.put<ApiResponse<Structure>>(
      `${this.baseurl}/Structure/${id}`,
      data
    );
  }
}
