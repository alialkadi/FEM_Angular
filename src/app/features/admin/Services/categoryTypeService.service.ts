import { Injectable } from "@angular/core";
import { environment } from "../../../environment.prod";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { CategoryType, CategoryTypeListResponse, CreateCategoryType } from "../../Models/CategoryType";
import { ApiResponse } from "../../Models/ApiResponse";

@Injectable({ providedIn: 'root' })
export class CategoryTypeService {

    baseurl = environment.apiUrl;
    constructor(protected _http: HttpClient) { }
    getAllCategoriestypes(all : boolean = false,page?: number , pageSize? : number): Observable<ApiResponse<CategoryTypeListResponse>> {
         let params = new HttpParams().set('all', all);
        
          if (page !== undefined) params = params.set('page', page);
          if (pageSize !== undefined) params = params.set('pageSize', pageSize);
        return this._http.get<ApiResponse<CategoryTypeListResponse>>(this.baseurl + `/CategoryTypes`,{params}
        );
    }

     CreateCategoryType(formData: FormData): Observable<ApiResponse<CategoryType>> {
    return this._http.post<ApiResponse<CategoryType>>(
      `${this.baseurl}/CategoryTypes`,
      formData
    );
  }
  updateCategoryType(id: number, data: FormData): Observable<ApiResponse<CategoryType>> {
    return this._http.put<ApiResponse<CategoryType>>(
      `${environment.apiUrl}/CategoryTypes/${id}`,
      data  // ✅ set content-type
    );
  }
  getTypesByCategory(id: number): Observable<ApiResponse<CategoryTypeListResponse>> {
    return this._http.get<ApiResponse<CategoryTypeListResponse>>(this.baseurl + `/CategoryTypes/byCategory/${id}`)
  }
    deleteCategoryType(id: number): Observable<ApiResponse<boolean>>{
        return this._http.delete<ApiResponse<boolean>>(`${this.baseurl}/CategoryTypes/${id}`)
    }

  
  }