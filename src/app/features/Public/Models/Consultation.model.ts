export interface CreateTechnicalConsultationRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  placeId?: string | null;
  portfolioType: 'Residential' | 'Commercial' | '';
  serviceScopes: string[];
  message: string;
}

export interface UpdateTechnicalConsultationRequest {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  placeId?: string | null;
  portfolioType: 'Residential' | 'Commercial' | '';
  serviceScopes: string[];
  message: string;
}

export interface TechnicalConsultationRequestResponse {
  id: number;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phoneNumber: string;
  email: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  placeId?: string | null;
  portfolioType: string;
  serviceScopes: string[];
  message: string;
  requestedOn: string;
}

export interface TechnicalConsultationRequestListResponse {
  totalCount: number;
  items: TechnicalConsultationRequestResponse[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiMessageResponse {
  success: boolean;
  message: string;
}
