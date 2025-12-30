export enum MetadataTargetType {
  Structure = 1,
  Part = 2,
  PartOption = 3
}
export interface MetadataAssignmentSaveRequest {
  targetType: MetadataTargetType;
  targetId: number;
  attributes: MetadataAssignmentItemRequest[];
}

export interface MetadataAssignmentItemRequest {
  metadataAttributeId: number;
  valueIds?: number[];
  valueText?: string;
}

export interface MetadataAttributeDto {
  id: number;
  name: string;
  dataType: MetadataDataType;
  allowMultipleValues: boolean;
  values?: MetadataAttributeValueDto[];
}

export interface MetadataAttributeValueDto {
  id: number;
  displayName: string;
}

export enum MetadataDataType {
  Select = 1,
  Number = 2,
  Boolean = 3,
  Text = 4
}
