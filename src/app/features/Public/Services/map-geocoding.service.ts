import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ReverseGeocodeResponse {
  display_name?: string;
  lat?: string;
  lon?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MapGeocodingService {
  constructor(private http: HttpClient) {}

  reverseGeocode(lat: number, lng: number): Observable<ReverseGeocodeResponse> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

    return this.http.get<ReverseGeocodeResponse>(url, {
      headers: new HttpHeaders({
        Accept: 'application/json',
      }),
    });
  }
}
