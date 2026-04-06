export interface RawServiceInput {
  inputDefinitionId: number;
  code: string;
  label: string;
  dataType: number;

  isRequired: boolean;
  pricingBehavior: number;

  amount: number;
  unitRate: number;

  dependsOnInputDefinitionId: number | null;

  inputValueId: number | null;
  inputValueCode: string | null;
  inputValueLabel: string | null;

  dependsOnInputValueId: number | null;
  dependsOnValueCode: string | null;

  priority: number;
}
