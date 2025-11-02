export interface UserAuthentication {
  username: string;
  password: string;
}

export interface CompanyDetails {
  company_id: string;
  company_name: string;
  iguru_id: string;
}

export interface StageDetails {
  stage_id: string;
  stage_name: string;
}

export interface PrinterDetails {
  id: string;
  name: string;
}

export interface User {
  user_id: string;
  username: string;
  company: CompanyDetails;
  stage: StageDetails;
  printer: PrinterDetails;
}

export interface AuthResponse {
  access_token: string;
  access_expires_at: string;
  refresh_token: string;
  refresh_expires_at: string;
  company_template?: import('@/types/company-template').CompanyTemplateResponse;
  role: string;
  user: User;
}

export interface TokenRefreshRequest {
  refresh_token: string;
}

export interface TokenRefreshResponse {
  status: string;
  token: string;
  refresh_token: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface NextAuthUser {
  id: string;
  user_id: string;
  role: string;
  username: string;
  token: string;
  refresh_token?: string;
  company: CompanyDetails;
  stage: StageDetails;
  printer: PrinterDetails;
  company_template?: import('@/types/company-template').CompanyTemplateResponse;
}

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    id: string;
    user_id: string;
    role: string;
    username: string;
    token: string;
    refresh_token?: string;
    company: CompanyDetails;
    stage: StageDetails;
    printer: PrinterDetails;
    company_template?: import('@/types/company-template').CompanyTemplateResponse;
  }

  interface Session {
    user: {
      id: string;
      user_id: string;
      role: string;
      username: string;
      token: string;
      refresh_token?: string;
      company: CompanyDetails;
      stage: StageDetails;
      printer: PrinterDetails;
    };
    company_template?: import('@/types/company-template').CompanyTemplateResponse;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user_id: string;
    role: string;
    token: string;
    refresh_token?: string;
    company: CompanyDetails;
    stage: StageDetails;
    printer: PrinterDetails;
    username: string;
    expiresAt?: number;
    refreshExpiresAt?: number;
    lastActivity?: number;
    company_template?: import('@/types/company-template').CompanyTemplateResponse;
  }
}
