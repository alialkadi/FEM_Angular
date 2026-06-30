export interface ServiceMiniResponse {
  id: number;
  name: string;

  categoryId?: number;
  categoryName?: string;

  categoryTypeId?: number;
  categoryTypeName?: string;

  structureId?: number;
  structureName?: string;

  partId?: number;
  partName?: string;

  partOptionId?: number;
  partOptionName?: string;

  path?: string;
}

export interface FeeResponse {
  id: number;
  name: string;
  amount: number;
  isVisible: boolean;
  isGlobal: boolean;
  description?: string;
  services: ServiceMiniResponse[];
}

export interface FeeResponseList {
  totalCount: number;
  fees: FeeResponse[];
}
