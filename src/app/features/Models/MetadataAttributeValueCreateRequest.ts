export interface MetadataAttributeValueCreateRequest {
  value: string;
  displayName?: string;
  sortOrder: number;
}
export interface MetadataAttributeValueVm {
  id: number;
  value: string;
  displayName?: string;
  sortOrder: number;
  isActive: boolean;
}
export interface MetadataAttributeVm {
  id: number;
  name: string;
  code: string;
  dataType: string;
}
