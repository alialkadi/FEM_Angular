export interface ServiceRequestListDto {
  id: number;
  userFullName: string;
  email: string;
  requestedDate: string; // ISO
  status: string;
  totalCost: number;
}
export interface PagedServiceRequestListResponse {
  requests: ServiceRequestListDto[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}
export interface ServiceRequestDetailItemDto {
  serviceId: number;
  serviceName: string;
  description?: string;
  baseCost: number;
  calculatedTotal: number;
}
export interface ServiceRequestDetailDto {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  requestedDate: string;
  status: string;
  totalCost: number;
  notes?: string;
  requestedServices: ServiceRequestDetailItemDto[];
}
