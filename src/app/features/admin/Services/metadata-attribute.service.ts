import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MetadataAttribute } from '../../Models/MetadataAttribute';
import { MetadataAttributeCreate } from '../../Models/MetadataAttributeCreate';
import { MetadataAttributeListResponse } from '../../Models/MetadataAttributeListResponse';
import { MetadataAttributeUpdate } from '../../Models/MetadataAttributeUpdate';
import { environment } from '../../../environment.prod';
import { ApiResponse } from '../../Models/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class MetadataAttributeService {

  private readonly baseUrl = environment.apiUrl+'/MetadataAttributes';

  constructor(private http: HttpClient) {}

  // LIST
  getAll(
    page = 1,
    pageSize = 20,
    search?: string
  ): Observable<MetadataAttributeListResponse> {

    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<MetadataAttributeListResponse>(this.baseUrl);
  }

  // DETAILS
  getById(id: number): Observable<MetadataAttribute> {
  return this.http
    .get<ApiResponse<MetadataAttribute>>(`${this.baseUrl}/${id}`)
    .pipe(map(res => res.data));
}


  create(model: any) {
    return this.http.post<number>(this.baseUrl, model);
  }

 update(id: number, model: MetadataAttributeUpdate): Observable<any> {
  return this.http.put<any>(`${this.baseUrl}/${id}`, model);
}


  // DELETE (SOFT + GUARDED)
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ACTIVATE / DEACTIVATE (OPTIONAL BUT RECOMMENDED)
  toggleActive(id: number, isActive: boolean): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/${id}/status`,
      { isActive }
    );
  }
}
