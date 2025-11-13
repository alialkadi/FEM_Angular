export interface ServiceRequestStatusUpdateDto {
  requestId: number;
  newStatusId: number;
  notes?: string;
}

export interface AllowedStatusDto {
  id: number;
  name: string;
  modifiedByRole: string;
}
