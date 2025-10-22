export interface CompanyTemplateMeta {
  company_id: string;
  generated_at: string;
  fields_count: number;
  vehicles_count: number;
}

export interface CollectionRef {
  id: number;
  title: string;
}

export interface CompanyCollectionField {
  slug: string;
  label: string;
  value_type: string; // e.g., 'decimal'
  input_type: string; // e.g., 'number'
  options: unknown | null;
  required: boolean;
  default: number | string | null;
  transform: string; // e.g., 'NONE'
  multiplier: number;
  collection: CollectionRef;
}

export type VehicleField = CompanyCollectionField;

export interface Vehicle {
  vehicle_id: number;
  number_plate: string;
  investor_id: number;
  seats: number;
  seat_configuration: string; // JSON string from API
  active_status: number;
  fields: VehicleField[];
}

export interface CompanyTemplateResponse {
  success: boolean;
  meta: CompanyTemplateMeta;
  company_collection_defaults: CompanyCollectionField[];
  vehicles: Vehicle[];
}
