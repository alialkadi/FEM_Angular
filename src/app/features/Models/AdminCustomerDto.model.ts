export interface AdminCustomerDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  city: string;
  address: string;
  requests: CustomerRequestDto[];
}

export interface CustomerRequestDto {
  requestId: number;
  requestNumber?: string;
  requestedDate: string;
  preferredDateTime?: string;
  statusName: string;
  totalCost: number;
  address: string;
  notes?: string;
  services: CustomerRequestedServiceDto[];
  technicians: CustomerAssignedTechnicianDto[];
}

export interface CustomerRequestedServiceDto {
  serviceId: number;
  serviceName: string;
  baseCost: number;
  calculatedTotal: number;
  structureName?: string;
  partName?: string;
  partOptionName?: string;
}

export interface CustomerAssignedTechnicianDto {
  workerId: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  assignedDate: string;
  assignmentStatus: string;
}

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  address: string;
  phoneNumber: string;
  password: string;
}

export interface UpdateCustomerDto {
  firstName: string;
  lastName: string;
  city: string;
  address: string;
  phoneNumber: string;
}
