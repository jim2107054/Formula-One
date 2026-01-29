export interface APIValidationError {
  value: string;
  msg: string;
  param: string;
  location: string;
}

export interface APIErrorResponse {
  success: boolean;
  message: string;
  errors?: APIValidationError[];
}

export interface APISuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}