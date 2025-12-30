import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse } from "../../Models/ApiResponse";
import { MetadataAssignmentSaveRequest, MetadataTargetType } from "../../Models/MetadataTargetType";
import { environment } from "../../../environment.prod";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class MetadataAssignmentService {
  constructor(private http: HttpClient) {}
private readonly baseUrl = environment.apiUrl+'/MetadataAssignments';
  save(request: MetadataAssignmentSaveRequest) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl,
      request
    );
  }
  getByTarget(
    targetType: MetadataTargetType,
    targetId: number
  ): Observable<any> {

    const params = new HttpParams()
      .set('targetType', targetType)
      .set('targetId', targetId);

    return this.http.get(`${this.baseUrl}/by-target`, { params });
  }
}
