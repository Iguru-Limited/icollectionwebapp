// Crew related types
export interface CrewRole {
  role_id: string;
  role_name: string;
  role_description: string;
}

export interface Crew {
  crew_id: string;
  name: string;
  phone: string;
  badge_number: string;
  crew_role_id: string;
  role_name: string;
  badge_expiry: string | null;
  email: string | null;
  employee_no: string | null;
  id_number: string | null;
  type: 'crew';
}

export interface GetCrewsRequest {
  company_id: number;
}

export interface GetCrewsResponse {
  success: boolean;
  data: Crew[];
  message?: string;
}

export interface UpdateCrewRequest {
  crew_id: number;
  name: string;
  crew_role_id: number;
  phone: string;
  badge_number: string;
  badge_expiry?: string | null;
  email?: string | null;
  employee_no?: string | null;
  id_number?: string | null;
}

export interface UpdateCrewResponse {
  success: boolean;
  message: string;
  data?: Crew;
}

export interface GetCrewRolesResponse {
  success: boolean;
  data: CrewRole[];
  message?: string;
}
