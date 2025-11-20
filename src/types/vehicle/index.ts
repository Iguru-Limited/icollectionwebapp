// Vehicle related types derived from list vehicles endpoint

export interface VehicleCollectionFieldCollectionMeta {
  id: number;
  title: string;
}

export interface VehicleCollectionField {
  slug: string;
  label: string;
  value_type: string; // e.g. 'decimal'
  input_type: string; // e.g. 'number'
  options: unknown | null;
  required: boolean;
  default: number;
  transform: string; // 'NONE'
  multiplier: number;
  collection: VehicleCollectionFieldCollectionMeta;
  initial_value?: number;
  auto_apply?: boolean;
}

export interface VehicleCollectionsMeta {
  company_id: string;
  generated_at: string;
  count: number;
  vehicle_id: string;
}

export interface VehicleCollectionsWrapper {
  success: boolean;
  meta: VehicleCollectionsMeta;
  fields: VehicleCollectionField[];
}

export interface VehicleCrewMemberSummary {
  crew_id: string;
  name: string;
  phone: string;
  crew_role_id: string;
}

export interface VehicleItem {
  vehicle_id: string;
  number_plate: string;
  investor_id: string;
  vehicle_type_id: string;
  brand_id: string | null;
  investor_name: string;
  type_name: string; // Bus / Van etc
  brand_name: string | null;
  active_status: string; // '1'
  inspection_status: string; // 'Passed' / 'failed'
  rsl_number: string | null;
  rsl_registration_date: string | null;
  rsl_expiry_date: string | null;
  rsl_details: string | null;
  fleet_number: string | null;
  crew: VehicleCrewMemberSummary[];
  vehicle_collections: VehicleCollectionsWrapper;
}

export interface GetVehiclesResponse {
  success: boolean;
  data: VehicleItem[];
  message?: string;
}
