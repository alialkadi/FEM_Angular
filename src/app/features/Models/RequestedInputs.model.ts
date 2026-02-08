export interface ServiceInputDefinition {
  dependsOnInputDefinitionId: any;
  inputDefinitionId: number;
  code: string;
  label: string;
  dataType: number;
  pricingBehavior: number;
  isRequired: boolean;
  allowDecimal: boolean;
  min?: number;
  max?: number;
  priority: number;
  dependsOnInputValueId?: number | null;
  values?: ServiceInputValue[] | null;
}

export interface ServiceInputValue {
  dependsOnInputValueIds?: number[] | null;
  id: number;
  code: string;
  displayName: string;
}
export interface ServiceInputAnswer {
  inputCode: string;
  numericValue?: number | null;
  selectedValueCode?: string | null;
}
