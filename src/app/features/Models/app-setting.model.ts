// src/app/admin/models/app-setting.model.ts

export interface AppSettingResponse {
  id: number;
  rate: number;
  logistic: number;
  createdOn: string;
  modifyOn?: string;
}

export interface AppSettingCreateRequest {
  rate: number;
  logistic: number;
}

export interface AppSettingUpdateRequest {
  rate: number;
  logistic: number;
}

export interface ApiResponse<T> {
  isSuccessful: boolean;
  response: T;
  errors?: string[];
  message?: string;
}
