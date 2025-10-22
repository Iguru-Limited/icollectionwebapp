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
  route: "app_save_raw_data";
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
}

export interface SaveReceiptResponse {
  success: boolean;
  message: string;
  data: SaveReceiptResponseData;
}
