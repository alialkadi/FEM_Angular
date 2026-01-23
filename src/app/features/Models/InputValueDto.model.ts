import { MetadataDataType } from './MetadataTargetType';
import { InputDefinitionDto, PricingInputBehavior } from './service.Model';

export interface InputValueDto {
  id: number;
  inputDefinitionId: number;
  code: string;
  displayName: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateInputValueRequest {
  inputDefinitionId: number;
  code: string;
  displayName: string;
  sortOrder: number;
}

export interface UpdateInputValueRequest {
  displayName: string;
  sortOrder: number;
  isActive: boolean;
}
export interface PricingInputUI {
  inputDefinitionId: number;
  inputCode: string;
  label: string;
  pricingBehavior: PricingInputBehavior;
  dataType: MetadataDataType;

  // backend fields
  amount: number;
  isRequired: boolean;
  priority: number;
  inputValueId?: number;
  dependsOnInputValueId?: number;

  // UI-only (preview)
  previewNumericValue?: number;
  previewSelectedValueCode?: string;
}
