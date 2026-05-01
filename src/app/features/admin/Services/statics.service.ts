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
  getUnderReviewStatics(): Observable<ApiResponse<GeneralResponse<number>>> {
    return this._http.get<ApiResponse<GeneralResponse<number>>>(
      `${this.baseurl}UnderReview`,
    );
  }
  getCompletedStatics(): Observable<ApiResponse<GeneralResponse<number>>> {
    return this._http.get<ApiResponse<GeneralResponse<number>>>(
      `${this.baseurl}Completed`,
    );
  }
  getRejectedStatics(): Observable<ApiResponse<GeneralResponse<number>>> {
    return this._http.get<ApiResponse<GeneralResponse<number>>>(
      `${this.baseurl}Rejected`,
    );
  }
  getOnHoldStatics(): Observable<ApiResponse<GeneralResponse<number>>> {
    return this._http.get<ApiResponse<GeneralResponse<number>>>(
      `${this.baseurl}OnHold`,
    );
  }
  getAwaitingPaymentStatics(): Observable<
    ApiResponse<GeneralResponse<number>>
  > {
    return this._http.get<ApiResponse<GeneralResponse<number>>>(
      `${this.baseurl}AwaitingPayment`,
    );
  }
  getAssignedStatics(): Observable<ApiResponse<GeneralResponse<number>>> {
    return this._http.get<ApiResponse<GeneralResponse<number>>>(
      `${this.baseurl}Assigned`,
    );
  }
}
