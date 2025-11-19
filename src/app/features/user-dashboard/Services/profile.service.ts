import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment.prod';
import { ProfileResponseDto, UpdateProfileRequestDto, UpdateProfileResponseDto } from '../Models/ProfileResponse.Model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
   private baseUrl = `${environment.apiUrl}/Profile`;

    constructor(private http: HttpClient) {}

  getProfile(): Observable<ProfileResponseDto> {
    return this.http.get<ProfileResponseDto>(`${this.baseUrl}/me`);
  }

  updateProfile(dto: UpdateProfileRequestDto): Observable<UpdateProfileResponseDto> {
    return this.http.put<UpdateProfileResponseDto>(`${this.baseUrl}/update`, dto);
  }
}
