export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type FieldType =
  | 'text' | 'number' | 'email' | 'password' | 'date'
  | 'datetime' | 'textarea' | 'select' | 'checkbox' | 'radio'
  | 'file' | 'phone' | 'url';

export interface FormField {
  id?: number;
  label: string;
  field_name: string;
  field_type: FieldType;
  placeholder?: string;
  help_text?: string;
  is_required: boolean;
  order: number;
  options: string[];
  default_value?: string;
  validation_rules?: Record<string, unknown>;
}

export interface EmployeeForm {
  id: number;
  name: string;
  description?: string;
  fields: FormField[];
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  field_count?: number;
}

export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';

export interface Employee {
  id: number;
  form?: number;
  form_details?: EmployeeForm;
  form_name?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  status: EmployeeStatus;
  date_joined?: string;
  avatar?: string;
  dynamic_data: Record<string, unknown>;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  on_leave: number;
  terminated: number;
  by_department: Array<{ department: string; count: number }>;
}
