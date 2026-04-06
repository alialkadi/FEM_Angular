import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

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

const STORAGE_KEY = 'fenestration_wishlist_v1'; // keep stable; change only if you change schema

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private isBrowser: boolean;

  // Optional reactive stream (does NOT change existing usage)
  private readonly _items$ = new BehaviorSubject<WishlistItem[]>([]);
  public readonly items$: Observable<WishlistItem[]> =
    this._items$.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      // init cache
      this._items$.next(this.read());

      // cross-tab sync
      window.addEventListener('storage', (e: StorageEvent) => {
        if (e.key === STORAGE_KEY) {
          this._items$.next(this.read());
        }
      });
    }
  }

  // -----------------------------
  // STORAGE: localStorage (shared)
  // -----------------------------
  private read(): WishlistItem[] {
    if (!this.isBrowser) return [];

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      return this.normalize(parsed);
    } catch {
      // corrupted data → reset
      this.safeRemove();
      return [];
    }
  }

  private write(items: WishlistItem[]) {
    if (!this.isBrowser) return;

    const normalized = this.normalize(items);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      this._items$.next(normalized); // update same-tab subscribers
    } catch {
      // localStorage might be full/blocked → keep app stable
      this._items$.next(normalized);
    }
  }

  private safeRemove() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  // -----------------------------
  // PUBLIC API (unchanged)
  // -----------------------------
  getAll(): WishlistItem[] {
    return this.read();
  }

  isWishlisted(serviceId: number): boolean {
    return this.read().some((s) => s.serviceId === serviceId);
  }

  add(item: WishlistItem) {
    if (!this.isBrowser) return;

    const items = this.read();

    const safeItem = this.sanitizeItem(item);
    if (!items.some((s) => s.serviceId === safeItem.serviceId)) {
      items.push(safeItem);
      this.write(items);
    } else {
      // still emit latest state to keep UI consistent
      this._items$.next(items);
    }
  }

  remove(serviceId: number) {
    if (!this.isBrowser) return;
    const items = this.read().filter((s) => s.serviceId !== serviceId);
    this.write(items);
  }

  clear() {
    if (!this.isBrowser) return;
    this.safeRemove();
    this._items$.next([]);
  }

  count(): number {
    return this.read().length;
  }

  // -----------------------------
  // Integrity + Security helpers
  // -----------------------------
  private normalize(input: any): WishlistItem[] {
    if (!Array.isArray(input)) return [];

    const result: WishlistItem[] = [];

    for (const raw of input) {
      const item = this.sanitizeItem(raw);
      if (item.serviceId > 0) result.push(item);
    }

    // Ensure unique by serviceId (data integrity)
    const map = new Map<number, WishlistItem>();
    for (const it of result) map.set(it.serviceId, it);
    return Array.from(map.values());
  }

  private sanitizeItem(raw: any): WishlistItem {
    const serviceId = Number(raw?.serviceId);
    const safe: WishlistItem = {
      serviceId: Number.isFinite(serviceId) ? serviceId : 0,
    };

    safe.name = this.safeString(raw?.name, 200);
    safe.description = this.safeString(raw?.description, 1000);
    safe.fileUrl = this.safeString(raw?.fileUrl, 2000);

    if (Array.isArray(raw?.metadata)) {
      safe.metadata = raw.metadata
        .filter((m: any) => m && typeof m === 'object')
        .map((m: any) => ({
          attributeCode: this.safeString(m.attributeCode, 100),
          name: this.safeString(m.name, 200),
          value: this.safeString(m.value, 200),
          valueText: this.safeString(m.valueText, 500),
        }));
    }

    return safe;
  }

  private safeString(v: any, maxLen: number): string | undefined {
    if (typeof v !== 'string') return undefined;
    const s = v.trim();
    if (!s) return undefined;
    // avoid extreme memory abuse
    return s.length > maxLen ? s.slice(0, maxLen) : s;
  }
}
