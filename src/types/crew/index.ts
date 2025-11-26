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
  role_name: string | null;
  badge_expiry: string | null;
  email: string | null;
  employee_no: string | null;
  id_number: string | null;
  type: 'crew';
  active: string; // '0' | '1'
  profile_completion_percentage: string;
  created_at: string;
  updated_at: string;
  photo: string | null;
  vehicle_id: string | null;
  vehicle_plate: string | null;
  vehicle_type_name: string | null;
}

export interface GetCrewsRequest {
  company_id: number;
}

export interface GetCrewsResponse {
  success: boolean;
  data: Crew[];
  message?: string;
}

export interface CreateCrewRequest {
  name: string;
  crew_role_id: number;
  phone: string;
  employee_no?: string;
  email?: string;
  id_number?: string;
  badge_number: string;
  vehicle_id?: number;
  badge_expiry?: string;
}

export interface CreateCrewResponse {
  message: string;
  crew_id: string;
  success?: boolean;
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

// Partial edit types (EDIT_CREW)
// Accepts only changed fields; crew_id is required for identification.
export interface EditCrewPayload {
  crew_id: string; // keep as string to align with existing Crew type
  name?: string;
  phone?: string;
  badge_number?: string;
  crew_role_id?: string; // allow role change
  role_name?: string | null;
  badge_expiry?: string | null;
  email?: string | null;
  employee_no?: string | null;
  id_number?: string | null;
  active?: string; // '1' | '0'
  photo?: string | null; // base64 or URL if supported
}

export interface EditCrewResponse {
  message: string;
  success?: boolean;
  error?: string;
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
  error?: string;
  pending_assignment_ids?: string[];
}

export interface ConfirmAssignmentPayload {
  assignment_ids: number[];
}

export interface ConfirmAssignmentResponse {
  message: string;
  success?: boolean;
}
