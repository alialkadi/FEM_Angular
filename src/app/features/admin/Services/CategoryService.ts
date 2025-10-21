import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environment.prod";
import { AuthService } from "../../../core/Auth/auth.service";
import { ApiResponse } from "../../Models/ApiResponse";
import { Category, CategoryListResponse, CreateCategory } from "../../Models/Category";

@Injectable({ providedIn: "root" })
export class CategoryService {
  constructor(private _http: HttpClient, private auth: AuthService) { }
    
  getAllCategories(all: boolean = false ,page?: number , pageSize?: number ): Observable<ApiResponse<CategoryListResponse>> {
     let params = new HttpParams().set('all', all);

  if (page !== undefined) params = params.set('page', page);
  if (pageSize !== undefined) params = params.set('pageSize', pageSize);
    return this._http.get<ApiResponse<CategoryListResponse>>(
      `${environment.apiUrl}/Category`, {params});
  }

  CreateCategory(data: CreateCategory): Observable<ApiResponse<Category>> {
    return this._http.post<ApiResponse<Category>>(`${environment.apiUrl}/Category`, data)
  }

  DeleteCategory(id: number): Observable<ApiResponse<boolean>> {
    return this._http.delete<ApiResponse<boolean>>(
      `${environment.apiUrl}/Category/${id}`
    );
  }

updateCategory(id: number, data: { name: string }): Observable<ApiResponse<Category>> {
  return this._http.put<ApiResponse<Category>>(
    `${environment.apiUrl}/Category/${id}`,
    data, // ✅ request body
    { headers: { 'Content-Type': 'application/json' } } // ✅ set content-type
  );
}


 
  
}