export interface ServiceInputUserValue {
  inputDefinitionId: number;

  // ONE of these will be used depending on dataType
  valueId?: number; // Select
  valueText?: string; // Text
  valueNumber?: number; // Number
  valueBoolean?: boolean; // Boolean
}
