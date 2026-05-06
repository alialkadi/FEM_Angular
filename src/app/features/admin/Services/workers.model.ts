export interface WorkersResponseModel {
  isAvailable: boolean;
  workerId: number;
  assignmentCount: number;
  identityUserId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: string;
  dailyCapacity: number;
  province: string;
  specialty: string;
  employmentNumber: string;
  city: string;
}
