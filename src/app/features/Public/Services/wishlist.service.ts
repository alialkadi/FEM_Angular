import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface WishlistItem {
    serviceId: number;
    name?: string;
    description?: string;
    fileUrl?: string;
    metadata?: {
        attributeCode?: string;
        name?: string;
        value?: string;
        valueText?: string;
    }[];
}

const STORAGE_KEY = 'fenestration_wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private read(): WishlistItem[] {
    if (!this.isBrowser) return [];
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private write(items: WishlistItem[]) {
    if (!this.isBrowser) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  getAll(): WishlistItem[] {
    return this.read();
  }

  isWishlisted(serviceId: number): boolean {
    return this.read().some(s => s.serviceId === serviceId);
  }

  add(item: WishlistItem) {
    if (!this.isBrowser) return;

    const items = this.read();
    if (!items.some(s => s.serviceId === item.serviceId)) {
      items.push(item);
      this.write(items);
    }
  }

  remove(serviceId: number) {
    if (!this.isBrowser) return;
    this.write(this.read().filter(s => s.serviceId !== serviceId));
  }

  clear() {
    if (!this.isBrowser) return;
    sessionStorage.removeItem(STORAGE_KEY);
  }

  count(): number {
    return this.read().length;
  }
}
