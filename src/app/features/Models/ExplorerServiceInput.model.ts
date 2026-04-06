import { MetadataDataType } from './MetadataTargetType';

export interface ExplorerInputValue {
  id: number;
  code: string;
  displayName: string;
}

export interface ExplorerServiceInput {
  inputDefinitionId: number;
  code: string;
  label: string;
  dataType: MetadataDataType;

  pricingBehavior: number;

  isRequired: boolean;
  allowDecimal?: boolean;
  min?: number;
  max?: number;

  priority: number;

  dependsOnInputValueId?: number | null;

  values?: ExplorerInputValue[] | null;
}
export interface ServiceInputValue {
  inputDefinitionId: number;

  // Only ONE of these is used depending on dataType
  valueId?: number; // Select
  valueText?: string; // Text
  valueNumber?: number; // Number
  valueBoolean?: boolean; // Boolean
}

export interface UserServiceInput {
  inputDefinitionId: number;
  code: string;
  label: string;
  dataType: 'Text' | 'Number' | 'Boolean' | 'Select';

  valueText?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  valueId?: number;

  isRequired: boolean;
  min?: number;
  max?: number;

  dependsOnInputValueId?: number;
}
