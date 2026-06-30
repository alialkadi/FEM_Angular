export interface ConsultationWorkerConflictDto {
  workerId: number;
  workerName: string;
  existingConsultationRequestId: number;
  existingStatus: string;
}

export interface AssignConsultationWorkerResultDto {
  assigned: boolean;
  requiresConfirmation: boolean;
  conflicts: ConsultationWorkerConflictDto[];
}

export interface TechnicianForConsultationAssignmentDto {
  workerId: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  specialty?: string;
  assignmentCount: number;
  isAssignedToCurrentConsultation: boolean;
    isAssignedToCurrentRequest: boolean;

}

export interface AssignConsultationWorkerRequest {
  consultationRequestId: number;
  workerIds: number[];
  appointmentDateTime: string;
  notes?: string;
  forceAssign?: boolean;
}
