export interface CreateWorkerModel {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  dailyCapacity: number;
  province: string;
  specialty: string;
  employmentNumber: string;
  city: string;
}

export interface CreateWorkerResponse {
  workerId: number;
  identityUserId: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  dailyCapacity: string;
  province: string;
  specialty: string;
  employmentNumber: string;
  city: string;
}
