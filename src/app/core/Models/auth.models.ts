export interface JwtPayload{
    sub: string;
    role: 'Admin' | 'user' | 'technician';
    exp: number;
    [k: string]: any;
}

export interface DecodedToken {
  unique_name?: string;
  role?: string | string[];
  exp?: number;
   [key: string]: any;
}