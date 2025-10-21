export interface UserAuthentication {
  username: string;
  password: string;
}

export interface CompanyDetails {
  company_id: number;
  company_name: string;
  iguru_id: string;
}

export interface User {
  username: string;
  company: CompanyDetails;
}

export interface AuthResponse {
  access_token: string;
  access_expires_at: string;
  refresh_token: string;
  refresh_expires_at: string;
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
  company_details: CompanyDetails;
  token: string;
}

export interface NextAuthUser {
  id: string; // Changed to string for NextAuth compatibility
  role: string;
  username: string;
  token: string;
  refresh_token?: string; // Added for token refresh
  company_details: CompanyDetails;
  company_template?: import("@/types/company-template").CompanyTemplateResponse;
  printer?: { id: string; name: string } | null;
}

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    username: string;
    token: string;
    refresh_token?: string;
    company_details: CompanyDetails;
    company_template?: import("@/types/company-template").CompanyTemplateResponse;
    printer?: { id: string; name: string } | null;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      username: string;
      token: string;
      refresh_token?: string;
      company_details: CompanyDetails;
      printer?: { id: string; name: string } | null;
    };
    company_template?: import("@/types/company-template").CompanyTemplateResponse;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    token: string;
    refresh_token?: string;
    company_details: CompanyDetails;
    username: string;
    expiresAt?: number;
    refreshExpiresAt?: number; // When refresh token expires
    lastActivity?: number; // Last user activity timestamp
    company_template?: import("@/types/company-template").CompanyTemplateResponse;
    printer?: { id: string; name: string } | null;
  }
}