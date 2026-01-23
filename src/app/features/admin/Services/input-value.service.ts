import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateInputValueRequest,
  UpdateInputValueRequest,
} from '../../Models/InputValueDto.model';
import { environment } from '../../../environment.prod';

@Injectable({ providedIn: 'root' })
export class InputValueService {
  private baseUrl = `${environment.apiUrl}/InputValues`;

  constructor(private http: HttpClient) {}

  getByInputDefinition(inputDefinitionId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/by-input/${inputDefinitionId}`);
  }

  create(payload: CreateInputValueRequest): Observable<any> {
    return this.http.post<any>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateInputValueRequest): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
