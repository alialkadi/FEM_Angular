import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FilterStateService {
  save<T>(key: string, state: T): void {
    sessionStorage.setItem(key, JSON.stringify(state));
  }

  get<T>(key: string): T | null {
    const value = sessionStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  clear(key: string): void {
    sessionStorage.removeItem(key);
  }
}
