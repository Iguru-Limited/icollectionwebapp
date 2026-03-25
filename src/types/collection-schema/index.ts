export interface CollectionField {
  slug_id: number;
  slug: string;
  title: string;
  input_type: string;
  value_type: string;
  required: boolean;
  min: number | null;
  max: number | null;
  placeholder: string | null;
}

export interface GetCollectionSchemaRequest {
  route: 'get_collection_form_schema';
  company_id: number;
}

export interface GetCollectionSchemaResponse {
  success: boolean;
  message: string;
  data: CollectionField[];
}
