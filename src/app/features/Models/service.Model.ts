// export interface ServiceResponse{
//     calculatedTotal: any
//     id: number,
//     name?: string,
//     description?: string,
//     baseCost?: number,
//     warrantyDuration?: number,
//     warrantyUnit?: string,
//     deliveryDays?: number,
//     structureId?: number,
//     partId?: number,
//     partOptionId?: number,
//     partName?: string,
//     structureName?: string,
//     partOptionName?: string

import { MetadataDataType } from './MetadataTargetType';
import {
  ServiceInputDefinition,
  ServiceInputAnswer,
} from './RequestedInputs.model';

// }

// export interface ServiceListResponse{
//     totalNumber?: number,
//     services: ServiceResponse[]
// }

// export interface createUpdateServiceRequest{
//     id?: number,
//     name?: string,
//     description?: string,
//     baseCost?: number,
//     warrentyDuration?: number,
//     warrantyUnit?: string,
//     deliveryDays?: number,
//     structureId?: number,
//     partId?: number,
//     partOptionId?: number
// }

// export interface ServiceStep{
//     id?: number,
//     serviceId?: number,
//     description?: string,
//     serviceName?: string,
//     stepOrder?:number
// }

// export interface CreateServiceStep {
//     serviceId?: number,
//     description?: string
// }

// export interface UpdateServiceStep {
//     id?: number,
//     serviceId?: number,
//     description?: string
// }

// export interface ServiceStepListResponse{
//     totalCount?: number,
//     serviceSteps?: ServiceStep[]
// }

// export interface FeeBreakdownItem{
//     name?: string,
//     amount?: number
// }
// export interface ServiceUserInfo {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   address: string;
//   preferredContactMethod?: 'Email' | 'Phone';
// }
// export interface ServiceCalculationResult {
//   serviceName: string;
//   baseCost: number;
//   globalFees: FeeBreakdownItem[];
//   serviceSpecificFees: FeeBreakdownItem[];
//   subTotal: number;
//   total: number;
// }

// export interface RequestedService {
//   service: ServiceResponse;
//   calculation: ServiceCalculationResult;
//   steps: ServiceStep[];
// }
// export interface ServiceRequestResponse {
//   requestId: number;
//   userId: string;
//   total: number;
//   status: string;
//   message: string;
// }

// ========================================================
//  CORE SERVICE MODELS — already in your system
// ========================================================

export interface ServiceResponse {
  requiredInputs?: any[];
  inputs?: ServiceInputDefinition[];
  id: number;
  name?: string;
  description?: string;
  notes?: string;
  baseCost?: number;
  materialWarrantyDuration?: number;
  workmanshipWarrantyUnit?: string;
  workmanshipWarrantyDuration?: number;
  materialWarrantyUnit?: string;
  deliveryDays?: number;
  structureId?: number;
  fileUrl?: string;
  partId?: number;
  partOptionId?: number;
  partName?: string;
  labors?: number;
  structureName?: string;
  categoryName?: string;
  categoryTypeName?: string;
  partOptionName?: string;
  applyGlobalFees?: boolean;
  applyLogistics?: boolean;
  baseRate?: number;
  pricingMode?: number;
  displayOrder?: number;
  calculatedTotal?: number; // added dynamically after cost calculation
  metadata?: ServiceSelectedMetadataDto[];

  // ✅ advertise fields
  isAdvertised?: boolean;
  advertiseSlug?: string | null;
  advertiseSortOrder?: number | null;
}

export interface ServiceListResponse {
  totalNumber?: number;
  services: ServiceResponse[];
}

// ========================================================
//  SERVICE CREATION/UPDATE REQUEST MODELS
// ========================================================

export interface CreateUpdateServiceRequest {
  id?: number;
  name?: string;
  description?: string;
  baseCost?: number;
  warrantyDuration?: number;
  warrantyUnit?: string;
  deliveryDays?: number;
  structureId?: number;
  partId?: number;
  partOptionId?: number;
  labors?: number;
}

// ========================================================
//  SERVICE STEP (Workflow) MODELS
// ========================================================

export interface ServiceStep {
  id?: number;
  serviceId?: number;
  description?: string;
  serviceName?: string;
  stepOrder?: number;
}

export interface CreateServiceStep {
  serviceId?: number;
  description?: string;
}

export interface UpdateServiceStep {
  id?: number;
  serviceId?: number;
  description?: string;
}

export interface ServiceStepListResponse {
  totalCount?: number;
  serviceSteps?: ServiceStep[];
}

// ========================================================
//  FEE AND CALCULATION STRUCTURE
// ========================================================

export interface FeeBreakdownItem {
  name?: string;
  amount?: number;
}

export interface ServiceCalculationResult {
  serviceName: string;
  baseCost: number;
  globalFees: FeeBreakdownItem[];
  serviceSpecificFees: FeeBreakdownItem[];
  subTotal: number;
  total: number;
  quantity?: number;
  lineTotal?: number;
  calculatedOutputs?: ServiceCalculatedOutput[];
  calculatedLabors?: number | null;
}

// ========================================================
//  USER INFORMATION (For anonymous or logged-in submitter)
// ========================================================

export interface ServiceUserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  preferredContactMethod?: 'Email' | 'Phone';
}

// ========================================================
//  REQUESTED SERVICE (Used in Review & Submission)
// ========================================================

export interface RequestedService {
  service: ServiceResponse;
  calculation: ServiceCalculationResult | null;
  steps: ServiceStep[];
  // inputs?: ServiceInputDefinition[];
  answers: ServiceInputAnswer[];
  quantity: number;
}

// ========================================================
//  API SUBMISSION MODELS (Main payload sent to backend)
// ========================================================

export interface ServiceItemRequest {
  serviceId: number;
  baseCost: number;
  calculatedTotal: number;
  description?: string;
}

export interface CreateServiceRequest {
  user: ServiceUserInfo;
  services: ServiceItemRequest[];
  total: number;
  notes?: string;
}

// ========================================================
//  BACKEND RESPONSE AFTER SERVICE REQUEST CREATION
// ========================================================

export interface ServiceRequestResponse {
  requestId: number;
  userId: string;
  total: number;
  status: string;
  message: string;
}
export interface ServiceSelectedMetadataDto {
  attributeCode: string;
  attributeName: string;
  value: string;
  valueName: string;
  dataType: number;
  affectsPricing: boolean;
  metadataAttributeId?: number;
  metadataAttributeValueId: number;
  valueText?: string;
}
export enum PricingInputBehavior {
  None = 0,
  Dimensional = 1,
  Rate = 2,
  Fixed = 3,
}

export interface InputDefinitionDto {
  id: number;
  code: string;
  label: string;
  dataType: MetadataDataType;
  pricingBehavior: PricingInputBehavior;
}
export interface ExplorerService {
  id: number;
  name: string;
  fileUrl?: string;
  itemType: number;
  inputs?: ServiceInputDefinition[];
  metadata?: any[];
}
export enum ServiceCalculationRuleType {
  MultiplyTwoNumbersBySelectedFactor = 1,
}

export enum ServiceDecisionRuleType {
  CalculatedValueAndTwoNumberLimits = 1,
  CalculatedValueRange = 2,
}

export interface ServiceCalculationRuleFactorConditionRequest {
  inputDefinitionId: number;
  inputValueId: number;
}

export interface ServiceCalculationRuleFactorRequest {
  factor: number;
  sortOrder: number;

  dependsOnInputDefinitionId?: number | null;
  dependsOnInputValueId?: number | null;

  conditions: ServiceCalculationRuleFactorConditionRequest[];
}

export interface ServiceCalculationRuleRequest {
  ruleName: string;
  outputCode: string;
  outputLabel: string;
  unitLabel?: string | null;

  ruleType: ServiceCalculationRuleType;

  firstNumberInputDefinitionId: number;
  secondNumberInputDefinitionId: number;

  displayToUser: boolean;
  displayToAdmin: boolean;

  factors: ServiceCalculationRuleFactorRequest[];
}
export interface ServiceDecisionRuleRequest {
  ruleName: string;
  outputCode: string;
  outputLabel: string;

  ruleType: ServiceDecisionRuleType;

  sourceOutputCode: string;

  maxCalculatedValue: number;

  firstNumberInputDefinitionId: number;
  maxFirstNumberValue: number;

  secondNumberInputDefinitionId: number;
  maxSecondNumberValue: number;

  successValue: number;
  failureValue: number;

  displayToUser: boolean;
  displayToAdmin: boolean;

  ranges?: ServiceDecisionRuleRangeRequest[];
}

export interface CalculationRuleFactorConditionUI {
  inputDefinitionId: number | null;
  inputValueId: number | null;
}

export interface CalculationRuleFactorUI {
  factor: number | null;
  sortOrder: number;

  dependsOnInputDefinitionId?: number | null;
  dependsOnInputValueId?: number | null;

  conditions: CalculationRuleFactorConditionUI[];
}

export interface CalculationRuleUI {
  ruleName: string;
  outputCode: string;
  outputLabel: string;
  unitLabel: string | null;

  ruleType: ServiceCalculationRuleType;

  firstNumberInputDefinitionId: number | null;
  secondNumberInputDefinitionId: number | null;

  displayToUser: boolean;
  displayToAdmin: boolean;

  factors: CalculationRuleFactorUI[];
}

export interface DecisionRuleUI {
  ruleName: string;
  outputCode: string;
  outputLabel: string;

  ruleType: ServiceDecisionRuleType;

  sourceOutputCode: string | null;

  maxCalculatedValue: number | null;

  firstNumberInputDefinitionId: number | null;
  maxFirstNumberValue: number | null;

  secondNumberInputDefinitionId: number | null;
  maxSecondNumberValue: number | null;

  successValue: number | null;
  failureValue: number | null;

  displayToUser: boolean;
  displayToAdmin: boolean;

  ranges: DecisionRuleRangeUI[];
}

export interface ServiceCalculatedOutput {
  code: string;
  label: string;
  value: number;
  unitLabel?: string | null;
  displayToUser?: boolean;
  displayToAdmin?: boolean;
}
export interface DecisionRuleRangeUI {
  minValue: number | null;
  maxValue: number | null;
  resultValue: number | null;
  sortOrder: number;
}
export interface ServiceDecisionRuleRangeRequest {
  minValue: number;
  maxValue: number;
  resultValue: number;
  sortOrder: number;
}
