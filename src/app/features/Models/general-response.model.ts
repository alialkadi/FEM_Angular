export interface GeneralResponse<T>{
    isSuccessful: boolean,
    errors: any[],
    response: T
}