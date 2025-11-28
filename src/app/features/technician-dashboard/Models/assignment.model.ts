import { ApiResponse } from "../../Models/ApiResponse";

export interface TechnicianAssignmentService {
  serviceId: number;
  serviceName: string;
  baseCost: number;
  calculatedTotal: number;
}

export interface TechnicianAssignmentResponse {
  assignmentId: number;
  requestId: number;
  assignedDate: string;
  assignmentStatus: string;
  customerName: string;
  customerPhone: string;
  address: string;
  requestStatus: string;
  services: TechnicianAssignmentService[];
}

export interface TechnicianAssignmentsListResponse {
  isSuccessful: boolean;
  errors: string[];
  response: TechnicianAssignmentResponse[];
}

export type GetTechnicianAssignmentsApiResponse =
  ApiResponse<TechnicianAssignmentsListResponse>;
