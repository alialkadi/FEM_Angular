export interface MetadataAttributeUpdateRequest {
  name: string;
  description?: string;
  isFilterable: boolean;
  isVisibleToUser: boolean;
  affectsPricing: boolean;
  isActive: boolean;
}

export interface MetadataAttributeDetails {
  id: number;
  name: string;
  code: string;
  description?: string;
  dataType: string;
  allowMultipleValues: boolean;
  isFilterable: boolean;
  isVisibleToUser: boolean;
  affectsPricing: boolean;
  isActive: boolean;
}
