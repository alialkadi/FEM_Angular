export interface ProfileResponseDto {
  userId: string;
  email: string;
  userName: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  address: string;
}

export interface UpdateProfileRequestDto {
  userName?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
}

export interface UpdateProfileResponseDto {
  success: boolean;
  message: string;
}
