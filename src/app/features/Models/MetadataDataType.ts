export enum MetadataDataType {
  Select = 4,
  Boolean = 3,
  Number = 2,
  Text = 1
}

export enum PricingMode {
  None = 'NONE',
  Fixed = 'FIXED',
  Percentage = 'PERCENTAGE'
}

export enum MetadataTarget {
  Structure = 'STRUCTURE',
  Part = 'PART',
  PartOption = 'PART_OPTION'
}
export interface MetadataAttributeValue {
  id: number;
  value: string;
  displayName?: string;
  sortOrder: number;
  isActive: boolean;
}
