export interface CustomStatus {
  id: string;
  project_id: string;
  name: string;
  color: string;
  display_order: number;
  is_default: boolean;
}

export interface GetCustomStatusResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: CustomStatus[];
}
