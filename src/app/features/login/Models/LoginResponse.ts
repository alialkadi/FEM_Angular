export interface LoginResponse {
  IsSuccessful: boolean;
  Token?: string;
  Email?: string;
  UserName?: string;
  RequiresOtp: boolean;
  Errors?: string[];
}