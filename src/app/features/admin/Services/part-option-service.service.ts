import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment.prod';
import { ApiResponse } from '../../Models/ApiResponse';
import { PartOption, PartOptionList } from '../../Models/PartOption.Model';

@Injectable({
  providedIn: 'root'
})
export class PartOptionService {

  private baseurl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllPartOptions(
    all: boolean = false,
    page?: number,
    pageSize?: number
  ): Observable<ApiResponse<PartOptionList>> {

    let params = new HttpParams().set('all', all);
    if (page !== undefined) params = params.set('page', page);
    if (pageSize !== undefined) params = params.set('pageSize', pageSize);

    return this.http.get<ApiResponse<PartOptionList>>(
      `${this.baseurl}/PartOption`,
      { params }
    );
  }

  getOptionsByPart(id: number): Observable<ApiResponse<PartOptionList>> {
    return this.http.get<ApiResponse<PartOptionList>>(
      `${this.baseurl}/PartOption/byPart/${id}`
    );
  }

  createPartOption(data: FormData): Observable<ApiResponse<PartOption>> {
    return this.http.post<ApiResponse<PartOption>>(
      `${this.baseurl}/PartOption`,
      data
    );
  }

  deletePartOption(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      `${this.baseurl}/PartOption/${id}`
    );
  }

  updatePartOption(id: number, data: FormData): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.baseurl}/PartOption/${id}`,
      data
    );
  }
}
