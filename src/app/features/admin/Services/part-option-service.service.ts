import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment.prod';
import { ApiResponse } from '../../Models/ApiResponse';
import { createUpdatePartOption, PartOption, PartOptionList } from '../../Models/PartOption.Model';

@Injectable({
  providedIn: 'root'
})
export class PartOptionService{

  baseurl = environment.apiUrl;
    constructor(private _http: HttpClient) { }
  
    getAllPartOptions(all: boolean = false, page?: number, pageSize?: number) : Observable<ApiResponse<PartOptionList>> {
      let params = new HttpParams().set('all', all);
      if (page != undefined) {
        params = params.set('page', page);
      }
      if (pageSize != undefined) {
        params = params.set('pageSize', pageSize);
      }
  
      return this._http.get<ApiResponse<PartOptionList>>(
        `${this.baseurl}/PartOption`, { params }
      );
    }
  
    CreatePartOption(data: createUpdatePartOption): Observable<ApiResponse<PartOption>>{
      return this._http.post<ApiResponse<PartOption>>(`${this.baseurl}/PartOption`,data)
    }
    deletePartOption(id: number): Observable<ApiResponse<boolean>> {
        return this._http.delete<ApiResponse<boolean>>(`${this.baseurl}/PartOption/${id}`)
      }
    
      updatePartOption(id: boolean, data: { name: string, categoryId: number }): Observable<ApiResponse<PartOption>> {
        return this._http.put<ApiResponse<PartOption>>(
          `${this.baseurl}/PartOption/${id}`,
          data, // ✅ request body
          { headers: { 'Content-Type': 'application/json' } } // ✅ set content-type
        );
      }
}
