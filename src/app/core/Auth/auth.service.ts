import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environment.prod';
import { HttpClient } from '@angular/common/http';
import { LoginRequest } from '../../features/login/Models/LoginRequest';
import { Observable } from 'rxjs';
import { LoginResponse } from '../../features/login/Models/LoginResponse';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../Models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly key = 'app_token';
    private apiUrl = environment.apiUrl + '/Auth';
    constructor(@Inject(PLATFORM_ID) private platformId: object, private http: HttpClient) {}

    private get isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    login(request: LoginRequest): Observable<any>{
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`,request)
    }
    get token(): string | null {
        if (!this.isBrowser) return null;
        return localStorage.getItem(this.key);
    }

    set token(v: string | null) {
        if (!this.isBrowser) return;
        if (v) localStorage.setItem(this.key, v);
        else localStorage.removeItem(this.key);
    }

    isLoggedIn(): boolean {
        const t = this.token;
        if (!t) return false;
        try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        return payload?.exp * 1000 > Date.now();
        } catch { return false; }
    }
    getDecodedToken(): DecodedToken | null {
        const token = this.token;
        if (!token) return null;
        try {
        return jwtDecode<DecodedToken>(token);
        } catch {
        return null;
        }
    }
    getRole(): string | null {
    const decoded: any = this.getDecodedToken();
    if (!decoded) return null;
        console.log(decoded)
    // ASP.NET Identity default role claim
    const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (Array.isArray(roleClaim)) {
      return roleClaim[0];
    }
    if (roleClaim) {
      return roleClaim;
    }

    // fallback: custom "role" claim
    if (Array.isArray(decoded.role)) {
      return decoded.role[0];
    }
    return decoded.role || null;
  }

    getUserRole(): string {
    return this.getRole() ?? '';
  }
    fakeLoginAsAdmin() {
        if (!this.isBrowser) return;
        const payload = btoa(JSON.stringify({
        sub: '1', role: 'Admin', exp: Math.floor(Date.now() / 1000) + 86400
        }));
        this.token = ['hdr', payload, 'sig'].join('.');
        
        console.log(this.token)
        console.log(payload)
    }

    logout() {
        if (this.isBrowser) localStorage.removeItem(this.key);
    }
}
