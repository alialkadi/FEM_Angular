export interface UserServiceRequestResponseDto {
  requests: UserServiceRequestDto[];
  summary: UserServiceRequestSummaryDto;
}

export interface UserServiceRequestDto {
  requestId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  statusName: string;
  requestedDate: string;
  preferredDateTime?: string;
  totalCost: number;
  requestedServices: UserRequestedServiceDetailDto[];
}

export interface UserRequestedServiceDetailDto {
  serviceId: number;
  serviceName: string;
  baseCost: number;
  calculatedTotal: number;
  description?: string;
  steps: ServiceStepDto[];
  fees: ServiceFeeDto[];
}

export interface ServiceStepDto {
  stepOrder: number;
  description: string;
}

export interface ServiceFeeDto {
  name: string;
  amount: number;
  isGlobal: boolean;
  description?: string;
}

export interface UserServiceRequestSummaryDto {
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  inProgressRequests: number; 
}
