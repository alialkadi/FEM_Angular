import { MetadataDataType } from './MetadataTargetType';

export interface InputDefinitionDto {
  id: number;
  code: string;
  label: string;

  dataType: MetadataDataType;
  pricingBehavior: PricingInputBehavior;

  allowDecimal: boolean;
  min?: number | null;
  max?: number | null;

  isActive: boolean;
}

export interface CreateInputDefinitionRequest {
  code: string;
  label: string;

  dataType: MetadataDataType;
  pricingBehavior: PricingInputBehavior;

  allowDecimal: boolean;
  min?: number | null;
  max?: number | null;
}
export enum PricingInputBehavior {
  None = 0,
  Dimensional = 1,
  Rate = 2,
  Fixed = 3,
}
