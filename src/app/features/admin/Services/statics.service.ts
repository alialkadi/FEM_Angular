import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment.prod';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../Models/ApiResponse';
import { GeneralResponse } from '../../Models/general-response.model';

@Injectable({
  providedIn: 'root',
})
export class StaticsService {
  baseurl: string = environment.apiUrl + '/Statics/';
  constructor(private _http: HttpClient) {}

  getPendingStatics(): Observable<ApiResponse<GeneralResponse<number>>> {
    return this._http.get<ApiResponse<GeneralResponse<number>>>(
      `${this.baseurl}pendingRequests`,
    );
  }
  getInprogressStatics(): Observable<ApiResponse<GeneralResponse<number>>> {
    return this._http.get<ApiResponse<GeneralResponse<number>>>(
      `${this.baseurl}inProgressRequests`,
    );
  }
  getcanceledStatics(): Observable<ApiResponse<GeneralResponse<number>>> {
    return this._http.get<ApiResponse<GeneralResponse<number>>>(
      `${this.baseurl}canceledRequests`,
    );
  }
  getapprovedStatics(): Observable<ApiResponse<GeneralResponse<number>>> {
    return this._http.get<ApiResponse<GeneralResponse<number>>>(
      `${this.baseurl}approvedRequests`,
    );
  }
}
