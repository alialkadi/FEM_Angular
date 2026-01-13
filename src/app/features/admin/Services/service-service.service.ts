import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment.prod';
import { CreateServiceStep, CreateUpdateServiceRequest , ServiceListResponse, ServiceResponse, ServiceStep, ServiceStepListResponse } from '../../Models/service.Model';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../Models/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  baseurl: string = environment.apiUrl;
  constructor(private _http: HttpClient) { }


  getAllServices(
  all: boolean = false,
  page?: number,
  pageSize?: number,
  categoryId?: number,
  categoryTypeId?: number,
  structureId?: number,
  partId?: number,
  partOptionId?: number
): Observable<ApiResponse<ServiceListResponse>> {

  let params = new HttpParams().set('all', all);

  if (page !== undefined) {
    params = params.set('page', page);
  }

  if (pageSize !== undefined) {
    params = params.set('pageSize', pageSize);
  }

  if (categoryId !== undefined) {
    params = params.set('categoryId', categoryId);
  }

  if (categoryTypeId !== undefined) {
    params = params.set('categoryTypeId', categoryTypeId);
  }

  if (structureId !== undefined) {
    params = params.set('structureId', structureId);
  }

  if (partId !== undefined) {
    params = params.set('partId', partId);
  }

  if (partOptionId !== undefined) {
    params = params.set('partOptionId', partOptionId);
  }

  return this._http.get<ApiResponse<ServiceListResponse>>(
    `${this.baseurl}/Service`,
    { params }
  );
}


  
  CreateService(data: FormData ): Observable<ApiResponse<ServiceResponse>> {
    return this._http.post<ApiResponse<ServiceResponse>>(`${this.baseurl}/Service`, data)
  }
  deleteService(id: number): Observable<ApiResponse<boolean>> {
    return this._http.delete<ApiResponse<boolean>>(`${this.baseurl}/Service/${id}`)
  }
    
  updateService(
  id: number,
  formData: FormData
): Observable<ApiResponse<ServiceResponse>> {

  return this._http.put<ApiResponse<ServiceResponse>>(
    `${this.baseurl}/Service/${id}`,
    formData
    // ❌ DO NOT set headers
    // Angular will auto-set multipart/form-data with boundary
  );
}

getServicesById(serviceId: number): Observable<ApiResponse<ServiceResponse>> {
    return this._http.get<ApiResponse<ServiceResponse>>(
      `${this.baseurl}/Service/${serviceId}`
    );
  }
/** 🔹 Get services linked to a specific structure */
  getServicesByStructure(structureId: number): Observable<ApiResponse<ServiceListResponse>> {
    return this._http.get<ApiResponse<ServiceListResponse>>(
      `${this.baseurl}/Service/byStructure/${structureId}`
    );
  }

  /** 🔹 Get services linked to a specific part */
  getServicesByPart(partId: number): Observable<ApiResponse<ServiceListResponse>> {
    return this._http.get<ApiResponse<ServiceListResponse>>(
      `${this.baseurl}/Service/byPart/${partId}`
    );
  }

  /** 🔹 Get services linked to a specific part option */
  getServicesByPartOption(partOptionId: number): Observable<ApiResponse<ServiceListResponse>> {
    return this._http.get<ApiResponse<ServiceListResponse>>(
      `${this.baseurl}/Service/byPartOption/${partOptionId}`
    );
  }

  getCalculatedTotal(id: number): Observable<any> {
    return this._http.get(`${this.baseurl}/Service/${id}/calculate`)
  }
  
submitServiceRequest(payload: any): Observable<any> {
    return this._http.post(`${this.baseurl}/ServiceRequest/submit`, payload);
  }

  ////////////////////////////
  // Steps
  ////////////////////////////

  getStepsByServiceId(id: number): Observable<ApiResponse<ServiceStepListResponse>>{
    return this._http.get<ApiResponse<ServiceStepListResponse>>( `${this.baseurl}/ServiceStep/byService/${id}`)
  }

  CreateStep(data: CreateServiceStep): Observable<ApiResponse<ServiceStep>>{
    return this._http.post<ApiResponse<ServiceStep>>(`${this.baseurl}/ServiceStep`,data)
  }

  DeleteStep(id: number) : Observable<ApiResponse<boolean>> {
    return this._http.delete<ApiResponse<boolean>>(`${this.baseurl}/ServiceStep/${id}`)
  }

  getServiceFilterHierarchy(): Observable<any> {
  return this._http.get<any>(
    `${this.baseurl}/Service/filter-hierarchy`
  );
}

}
