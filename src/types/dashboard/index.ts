// Dashboard stats types

export interface VehicleTypeStat {
  type_name: string;
  count: string; // API returns count as string
}

export interface VehicleStats {
  total_vehicles: number;
  types: VehicleTypeStat[];
}

export interface CrewRoleStat {
  crew_role_id: string;
  role_name: string;
  count: string; // API returns count as string
}

export interface CrewStats {
  total_crew: number;
  roles: CrewRoleStat[];
}

export interface DashboardStats {
  vehicles: VehicleStats;
  crew: CrewStats;
}

export interface GetDashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
  message?: string;
}