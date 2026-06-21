export type Token = string | null;

export type TokenKey = Token;

export type StatusResponse = "success" | "error";

export interface VerifyCache {
  at: number;
  verified: boolean;
  token: Token;
}

export interface TokenPayload {
  user_id: number;
  username: string;
  email?: string;
  full_name: string;
  [key: string]: any;
}

export interface UserInfo {
  id: number;
  username: string;
  email?: string;
  full_name: string;
}

export interface ApiResponse {
  code: number;
  data?: any;
  error?: any;
  status: StatusResponse;
}

export interface RefreshTokenSuccessData {
  access: Token;
  refresh_token_key: TokenKey;
}

export interface RefreshTokenResponse extends ApiResponse {
  data?: RefreshTokenSuccessData;
}

export interface VerifyTokenResponse extends ApiResponse {}