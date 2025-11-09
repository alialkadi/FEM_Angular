export interface ServiceMiniResponse {
  id: number;
  name: string;
}

export interface FeeResponse {
  id: number;
  name: string;
  amount: number;
  isGlobal: boolean;
  description?: string;
  services: ServiceMiniResponse[];
}

export interface FeeResponseList {
  totalCount: number;
  fees: FeeResponse[];
}
