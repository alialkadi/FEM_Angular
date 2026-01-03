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
  id: number;
  name?: string;
  description?: string;
  baseCost?: number;
  warrantyDuration?: number;
  warrantyUnit?: string;
  deliveryDays?: number;
  structureId?: number;
  partId?: number;
  partOptionId?: number;
  partName?: string;
  labors?: number,
  structureName?: string;
  partOptionName?: string;
  calculatedTotal?: number; // added dynamically after cost calculation
  metadata?: ServiceSelectedMetadataDto[];
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
  labors?: number,

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
  calculation: ServiceCalculationResult;
  steps: ServiceStep[];
  
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
  dataType: number;
  affectsPricing: boolean;
}
