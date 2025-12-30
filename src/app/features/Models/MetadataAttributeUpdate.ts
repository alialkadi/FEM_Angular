import { MetadataTarget, PricingMode } from "./MetadataDataType";

export interface MetadataAttributeUpdate {
  id: number;

  // editable only
  displayName: string;
  description?: string;
  userVisible: boolean;
  sortOrder: number;
  isActive: boolean;

  targets: MetadataTarget[];

  pricingMode: PricingMode;
  pricingValue?: number;
}
