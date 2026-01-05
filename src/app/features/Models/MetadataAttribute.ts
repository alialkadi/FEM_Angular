import { MetadataAttributeValue, MetadataDataType, MetadataTarget, PricingMode } from "./MetadataDataType";
export interface MetadataAttribute {

  // identity
  id: number;
  name: string;
  description: string,
  code: string;
  dataType: MetadataDataType;
  allowMultipleValues: boolean;

  // visibility / behavior
  isFilterable: boolean;
  isVisibleToUser: boolean;
  affectsPricing: boolean;
  isActive: boolean;

  // SELECT only (optional)
  values?: MetadataAttributeValue[];
  sortOrder?: number[];

  // optional legacy / future
  displayName?: string | null;
}