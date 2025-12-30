import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class MetadataValuesService {

    private readonly baseUrl = environment.apiUrl+'/MetadataAttributeValues';

  constructor(private http: HttpClient) {}

  // ============================
  // SINGLE CREATE (already used)
  // ============================
  create(attributeId: number, payload: {
    value: string;
    displayName?: string;
    sortOrder: number;
  }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}?attributeId=${attributeId}`,
      payload
    );
  }

  // ============================
  // BULK CREATE (NEW)
  // ============================
  createBulk(attributeId: number, payload: {
    values: {
      value: string;
      displayName?: string;
      sortOrder: number;
    }[];
  }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/bulk?attributeId=${attributeId}`,
      payload
    );
  }
}
