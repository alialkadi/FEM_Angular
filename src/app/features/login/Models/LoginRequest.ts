export interface LoginRequest {
  email: string;
  otp?: string;
  password: string;
}
export interface OperationResult {
  success: boolean;
  message: string;
  errors?: string[];
}

export interface ForgetPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  otp: string;
}

export interface ChangePasswordRequest {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}
