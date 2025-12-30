import { MetadataDataType, MetadataTarget, PricingMode } from "./MetadataDataType";

export interface MetadataAttributeCreate {
  name: string;
  code: string;
  dataType: MetadataDataType;
  allowMultipleValues: boolean;

  isFilterable: boolean;
  isVisibleToUser: boolean;
  affectsPricing: boolean;
}
export interface MetadataAttributeValueCreate {
  value: string;
  displayName?: string;
  sortOrder: number;
}
