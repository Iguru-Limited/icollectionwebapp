// Receipt/Collection related types
export interface ReceiptMetadata {
  number_plate: string;
  receipt_no: string;
  trip_date: string;
}

export interface ReceiptSlugs {
  [key: string]: number;
}

export interface ReceiptPayload {
  meta: ReceiptMetadata;
  slugs: ReceiptSlugs;
}

export interface SaveReceiptRequest {
  route: 'app_save_raw_data';
  company_id: number;
  vehicle_id: number;
  user_id: number;
  stage_id: number;
  payload: ReceiptPayload;
}

export interface SaveReceiptResponseData {
  id: string;
  total_amount: number;
  receipt_number: string;
  receipt_text: string;
  escpos_base64: string;
  phone?: string;
}

export interface SaveReceiptResponse {
  success: boolean;
  message: string;
  data: SaveReceiptResponseData;
}

// Report: Get raw data by vehicle and date
export interface ReportByVehicleDateRequest {
  route: 'app_get_raw_data_by_vehicle';
  company_id: number;
  vehicle_id: number;
  date: string; // YYYY-MM-DD
}

export interface ReportReceiptMeta {
  number_plate: string;
  receipt_no: string | null; // can be empty string or null from API
  trip_date: string; // YYYY-MM-DD
  receipt_number: string;
}

export interface ReportReceiptSlugs {
  [key: string]: number;
}

export interface ReportReceiptPayload {
  meta: ReportReceiptMeta;
  slugs: ReportReceiptSlugs;
}

export interface ReportByVehicleRow {
  id: number;
  company_id: number;
  vehicle_id: string; // API returns as string in sample
  user_id: number;
  stage_id: string; // API returns as string in sample
  payload: ReportReceiptPayload;
  total_amount: number;
  created_at: string; // "YYYY-MM-DD HH:mm:ss"
  number_plate: string;
  receipt_number: string;
}

export interface ReportByVehicleDateData {
  total: number;
  count: number;
  limit: number;
  offset: number;
  rows: ReportByVehicleRow[];
}

export interface ReportByVehicleDateResponse {
  success: boolean;
  data: ReportByVehicleDateData;
}
