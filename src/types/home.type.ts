export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  role: string;
}

export interface Activity {
  id: string;
  project_id: string;
  organization_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  created_at: string;
  title: string;
}

export interface data {
  user: User | null;
  activities: Activity[];
}

export interface HomeResponse {
  data: data;
}
