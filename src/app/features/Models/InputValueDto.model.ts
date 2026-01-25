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
  label: string;
  code: string;

  dataType: MetadataDataType;
  pricingBehavior: PricingInputBehavior;

  // pricing
  amount: number;
  isRequired: boolean;
  priority: number;
  inputValueId?: number;

  // dependency (NEW – clearer)
  dependsOnInputDefinitionId?: number;
  dependsOnInputValueId?: number;

  // preview
  previewNumericValue?: number;
  previewSelectedValueId?: number;
}
