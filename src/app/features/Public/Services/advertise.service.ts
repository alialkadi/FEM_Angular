import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment.prod';
import { ApiResponse } from '../../Models/ApiResponse';
import { FeeResponseList } from '../../Models/FeeResponse.Model';
import { AdvertisedServiceListItemDto } from '../../Models/Advertised.model';

@Injectable({
  providedIn: 'root',
})
export class AdvertiseService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<AdvertisedServiceListItemDto[]>> {
    return this.http.get<ApiResponse<AdvertisedServiceListItemDto[]>>(
      `${this.baseUrl}/AdvertisedService/advertised`,
    );
  }
}
