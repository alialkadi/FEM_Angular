import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../Models/ApiResponse';
import {
  InputDefinitionDto,
  CreateInputDefinitionRequest,
} from '../../Models/InputDefinitionDto';
import { environment } from '../../../environment.prod';

@Injectable({ providedIn: 'root' })
export class InputDefinitionService {
  private readonly baseUrl = environment.apiUrl + '/InputDefinitions';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get<ApiResponse<InputDefinitionDto[]>>(this.baseUrl);
  }

  create(payload: CreateInputDefinitionRequest) {
    return this.http.post<ApiResponse<InputDefinitionDto>>(
      this.baseUrl,
      payload,
    );
  }

  delete(id: number) {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
  }
}
