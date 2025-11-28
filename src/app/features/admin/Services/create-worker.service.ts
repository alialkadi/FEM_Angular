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

    baseUrl = `${environment.apiUrl}/Workers`
    constructor(private _http: HttpClient) { }
    
    createWorker(data: CreateWorkerResponse):Observable<ApiResponse<GeneralResponse<CreateWorkerResponse>>> {
        return this._http.post<ApiResponse<GeneralResponse<CreateWorkerResponse>>>(`${this.baseUrl}/create`,data)
    }

    getAllWorkers(): Observable<ApiResponse<GeneralResponse<WorkersResponseModel>>>{
        return this._http.get<ApiResponse<GeneralResponse<WorkersResponseModel>>>(`${this.baseUrl}`)
    }

    assignWorker(data: {serviceRequestId: number;workerId: number[];notes?: string;}): Observable<ApiResponse<GeneralResponse<any>>>{
        return this._http.post<ApiResponse<GeneralResponse<any>>>(`${this.baseUrl}/assign-worker`,data)
  }
}