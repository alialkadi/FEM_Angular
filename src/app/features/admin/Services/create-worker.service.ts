import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environment.prod";
import { ApiResponse } from "../../Models/ApiResponse";
import { GeneralResponse } from "../../Models/general-response.model";
import { CreateWorkerResponse } from "../../Models/create-worker.model";
import { Observable } from "rxjs";
import { WorkersResponseModel } from "./workers.model";
@Injectable({
  providedIn: 'root'
})
export class CreateWorkerService {

  private baseUrl = `${environment.apiUrl}/workers`;

  constructor(private http: HttpClient) {}

  createWorker(data: CreateWorkerResponse): Observable<ApiResponse<CreateWorkerResponse>> {
    return this.http.post<ApiResponse<CreateWorkerResponse>>(
      `${this.baseUrl}/create`,
      data
    );
  }

  getAllWorkers(): Observable<ApiResponse<WorkersResponseModel[]>> {
    return this.http.get<ApiResponse<WorkersResponseModel[]>>(
      `${this.baseUrl}`
    );
  }

  assignWorker(data: {
    serviceRequestId: number;
    workerId: number[];
    notes?: string;
  }): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this.baseUrl}/assign-worker`,
      data
    );
  }
}
