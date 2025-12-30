import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environment.prod';


// ===============================
// FILTER MODELS
// ===============================
export interface MetadataFilter {
  attributeId: number;
  code: string;
  name: string;
  allowMultiple: boolean;
  values: MetadataFilterValue[];
}

export interface MetadataFilterValue {
  id: number;
  value: string;
  displayName: string;
}

// ===============================
// ITEM METADATA
// ===============================
export interface ExplorerItemMetadata {
  attributeCode: string;
  value?: string | null;
  valueText?: string | null;
}

// ===============================
// EXPLORER ITEM
// ===============================
export interface ExplorerItem {
  id: number;
  name: string;
  fileUrl?: string;
  metadata: ExplorerItemMetadata[];
}

// ===============================
// EXPLORER RESPONSE
// ===============================
export interface ExplorerResponse {
  filters: MetadataFilter[];
  items: ExplorerItem[];
}

@Injectable({ providedIn: 'root' })
export class MetadataExplorerService {

  private baseUrl = environment.apiUrl + '/MetadataExplorer';
  constructor(private http: HttpClient) {}

  // =====================================================
  // FILTERS ONLY (optional standalone usage)
  // =====================================================
  getFilters(
    targetType: number,
    targetId: number
  ): Observable<MetadataFilter[]> {
    const params = new HttpParams()
      .set('targetType', targetType)
      .set('targetId', targetId);

    return this.http
      .get<any>(`${this.baseUrl}/filters`, { params })
      .pipe(map(res => res.data.filters));
  }

  // =====================================================
  // STRUCTURES EXPLORER
  // =====================================================
  getStructuresExplorer(typeId: number): Observable<ExplorerResponse> {
  const params = new HttpParams().set('typeId', typeId);

  return this.http
    .get<any>(`${this.baseUrl}/structures`, { params })
    .pipe(map(res => res.response));
}


  // =====================================================
  // PARTS EXPLORER
  // =====================================================
  getPartsExplorer(structureId: number): Observable<ExplorerResponse> {
    const params = new HttpParams().set('structureId', structureId);

    return this.http
      .get<any>(`${this.baseUrl}/parts`, { params })
      .pipe(map(res => res.response));
  }

  // =====================================================
  // PART OPTIONS EXPLORER
  // =====================================================
  getPartOptionsExplorer(partId: number): Observable<ExplorerResponse> {
    const params = new HttpParams().set('partId', partId);

    return this.http
      .get<any>(`${this.baseUrl}/options`, { params })
      .pipe(map(res => res.response));
  }
}
