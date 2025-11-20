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

// Crew assignment history types
export interface CrewAssignmentHistoryEntry {
  history_id: string;
  crew_id: string;
  crew_name: string;
  crew_phone: string;
  vehicle_id: string;
  number_plate: string;
  assigned_at: string;
  unassigned_at: string | null;
}

export interface GetCrewHistoryResponse {
  success: boolean;
  data: CrewAssignmentHistoryEntry[];
  message?: string;
}

// Assign vehicle types
export type AssignVehiclePayload = {
  vehicle_id: number;
  crew_id: number | number[];
};

export interface AssignVehicleResponse {
  message: string;
  success?: boolean;
}
