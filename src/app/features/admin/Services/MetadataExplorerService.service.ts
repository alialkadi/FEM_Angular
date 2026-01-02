// admin/Services/metadata-explorer.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environment.prod';

export interface MetadataFilterValue {
  id: number;
  value: string;
  displayName: string;
}

export interface MetadataFilter {
  attributeId: number;
  code: string;
  name: string;
  allowMultipleValues: boolean;
  values: MetadataFilterValue[];
}

export interface ExplorerItemMetadata {
  attributeCode: string;
  value?: string | null;
  valueText?: string | null;
}

export enum ExplorerItemType {
  Structure = 0,
  Part = 1,
  PartOption = 2,
  Service = 3
}

export interface ExplorerItem {
  id: number;
  name: string;
  fileUrl?: string;
  itemType: ExplorerItemType;
  metadata: {
    attributeCode: string;
    value?: string | null;
    valueText?: string | null;
  }[];
}

export interface ExplorerResponse {
  filters: MetadataFilter[];
  items: ExplorerItem[];
}

export interface ServiceExplorerRequest {
  structureId?: number;
  partId?: number;
  partOptionId?: number;
  metadataFilters: {
    attributeCode: string;
    valueText?: string;
    valueIds?: number[];
  }[];
}
export interface MetadataFilter {
  attributeId: number;
  code: string;
  name: string;
  allowMultiple: boolean;
  values: {
    id: number;
    value: string;
    displayName: string;
  }[];
}
export interface ServiceExplorerRequest {
  categoryTypeId?: number;
  structureId?: number;
  partId?: number;
  partOptionId?: number;
  metadataFilters: {
    attributeCode: string;
    valueIds?: number[];
    valueText?: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class MetadataExplorerService {
  private baseUrl = environment.apiUrl + '/MetadataExplorer';

  constructor(private http: HttpClient) {}

  explore(request: ServiceExplorerRequest): Observable<ExplorerResponse> {
    return this.http
      .post<any>(`${this.baseUrl}/explore`, request)
      .pipe(map(res => res));
  }
}
