export interface ServiceRequestListDto {
  id: number;
  userFullName: string;
  email: string;
  requestedDate: string;
  statusId: number;
  statusName: string;
  requestNumber: string;
  totalCost: number;
  statusHistory: ServiceRequestStatusHistoryDto[];
}
export interface ServiceRequestStatusHistoryDto {
  id: number;

  oldStatusId: number | null;
  oldStatusName: string | null;

  newStatusId: number;
  newStatusName: string;

  changedByUserId: string;
  changedByRole: string;

  reason: string | null;
  changedOn: string;
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
  quantity: number;
  unitTotal: number;
  inputs: ServiceRequestInputDto[];
  fees: ServiceRequestFeeDto[];
  steps: ServiceRequestStepDto[];
  metadata: ServiceRequestMetadataDto[];
  hierarchy: ServiceHierarchyDto;
}
export interface ServiceHierarchyDto {
  categoryId?: number;
  categoryName?: string;

  typeId?: number;
  typeName?: string;

  structureId?: number;
  structureName?: string;

  partId?: number;
  partName?: string;

  partOptionId?: number;
  partOptionName?: string;

  assignedLevel: 'Structure' | 'Part' | 'PartOption' | 'Unknown';
}
export interface ServiceRequestDetailDto {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  preferredContactMethod: string;
  requestedDate: string;
  statusId: number;
  statusName: string;
  requestNumber: string;
  city: string;
  totalCost: number;
  notes?: string;
  requestedServices: ServiceRequestDetailItemDto[];
  serviceRequestAssignmentResponses: any[];
  statusHistory: ServiceRequestStatusHistoryDto[];
  originalTotalCost: number;
  discountAmount: number;
  totalAfterDiscount: number;
  discountType?: number;
  discountValue?: number;
  discountHistory: ServiceRequestDiscountHistoryDto[];
}

export interface ServiceRequestResponseDto {
  requestId: number;
  userId: string;
  total: number;
  statusId: number;
  statusName: string;
  message: string;
}
export interface ServiceRequestInputDto {
  inputCode: string;
  inputLabel: string;

  // For select / option based inputs
  inputValueCode: string | null;
  inputValueLabel: string | null;

  // For numeric / text inputs
  enteredValue: number | null;
  enteredTextValue: string | null;
  enteredBooleanValue: boolean | null;
  // Pricing behavior enum from backend
  pricingBehavior: number;

  appliedRate: number;
  calculatedCost: number;
}
export interface ServiceRequestFeeDto {
  name: string;
  amount: number;
  isGlobal: boolean;
  description: string | null;
}
export interface ServiceRequestStepDto {
  stepOrder: number;
  description: string;
}
export interface ServiceRequestMetadataDto {
  attributeCode: string;

  // For select attributes
  value: string | null;

  // For text / number / boolean attributes
  valueText: string | null;
}
export enum DiscountType {
  Percentage = 1,
  FixedAmount = 2,
}

export interface ApplyRequestDiscountDto {
  discountType: DiscountType;
  discountValue: number;
  reason?: string;
}

export interface ApplyRequestDiscountResponseDto {
  requestId: number;
  originalTotalCost: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  totalAfterDiscount: number;
  reason?: string;
}
export interface ServiceRequestDiscountHistoryDto {
  id: number;
  originalTotalCost: number;
  discountType: number;
  discountTypeName: string;
  discountValue: number;
  discountAmount: number;
  totalAfterDiscount: number;
  reason?: string;
  appliedByUserId?: string;
  appliedOn: string;
}
