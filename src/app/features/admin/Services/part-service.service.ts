import { Injectable } from '@angular/core';
import { environment } from '../../../environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../Models/ApiResponse';
import { createUpdatePart, Part, PartListResponse } from '../../Models/Part.Models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartService {
 baseurl = environment.apiUrl;
  constructor(private _http: HttpClient) { }

  getAllParts(all: boolean = false, page?: number, pageSize?: number) : Observable<ApiResponse<PartListResponse>> {
    let params = new HttpParams().set('all', all);
    if (page != undefined) {
      params = params.set('page', page);
    }
    if (pageSize != undefined) {
      params = params.set('pageSize', pageSize);
    }

    return this._http.get<ApiResponse<PartListResponse>>(
      `${this.baseurl}/Part`, { params }
    );
  }

  CreatePart(data: createUpdatePart): Observable<ApiResponse<Part>>{
    return this._http.post<ApiResponse<Part>>(`${this.baseurl}/Part`,data)
  }
  deletePart(id: number): Observable<ApiResponse<boolean>> {
      return this._http.delete<ApiResponse<boolean>>(`${this.baseurl}/Part/${id}`)
    }
  
    updatePart(id: boolean, data: { name: string, categoryId: number }): Observable<ApiResponse<Part>> {
      return this._http.put<ApiResponse<Part>>(
        `${this.baseurl}/Part/${id}`,
        data, // ✅ request body
        { headers: { 'Content-Type': 'application/json' } } // ✅ set content-type
      );
    }
}
