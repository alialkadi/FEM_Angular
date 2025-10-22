import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment.prod';
import { createUpdateServiceRequest, ServiceListResponse, ServiceResponse } from '../../Models/service.Model';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../Models/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  baseurl : string = environment.apiUrl;
  constructor(private _http: HttpClient) { }


  
    getAllServices(all: boolean = false, page?: number, pageSize?: number) : Observable<ApiResponse<ServiceListResponse>> {
      let params = new HttpParams().set('all', all);
      if (page != undefined) {
        params = params.set('page', page);
      }
      if (pageSize != undefined) {
        params = params.set('pageSize', pageSize);
      }
  
      return this._http.get<ApiResponse<ServiceListResponse>>(
        `${this.baseurl}/Service`, { params }
      );
    }
  
    CreateService(data: createUpdateServiceRequest): Observable<ApiResponse<ServiceResponse>>{
      return this._http.post<ApiResponse<ServiceResponse>>(`${this.baseurl}/Service`,data)
    }
    deleteService(id: number): Observable<ApiResponse<boolean>> {
        return this._http.delete<ApiResponse<boolean>>(`${this.baseurl}/Service/${id}`)
      }
    
      updateService(id: boolean, data: { name: string, categoryId: number }): Observable<ApiResponse<ServiceResponse>> {
        return this._http.put<ApiResponse<ServiceResponse>>(
          `${this.baseurl}/Service/${id}`,
          data, // ✅ request body
          { headers: { 'Content-Type': 'application/json' } } // ✅ set content-type
        );
      }
}
