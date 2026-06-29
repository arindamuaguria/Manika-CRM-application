// ==========================================
// Manika CRM — Core TypeScript Types
// ==========================================

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

// User & Auth Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  email_verified_at: string | null;
  roles: Role[];
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Geography Types
export interface Division {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  territories_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Territory {
  id: number;
  division_id: number;
  division?: Division;
  name: string;
  code: string;
  description: string | null;
  boundaries: GeoJsonPolygon | null;
  is_active: boolean;
  assigned_bdm?: User;
  localities_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Locality {
  id: number;
  territory_id: number;
  territory?: Territory;
  name: string;
  code: string;
  description: string | null;
  polygon: GeoJsonPolygon | null;
  geo_data: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeoIdentifyResult {
  locality: Locality | null;
  territory: Territory | null;
  division: Division | null;
  bdm: User | null;
  is_mapped: boolean;
}

// CRM Types
export type LeadStatus = 'new' | 'assigned' | 'qualified' | 'deal_created' | 'won' | 'lost';
export type LeadPriority = 'low' | 'medium' | 'high';
export type DealStatus = 'draft' | 'verification' | 'documentation' | 'approval' | 'won' | 'lost';
export type DocumentVerificationStatus = 'pending' | 'verified' | 'rejected';
export type PartnerType = 'bdm' | 'seller' | 'service_person';
export type PartnerStatus = 'active' | 'inactive' | 'suspended';

export interface Lead {
  id: number;
  title: string;
  contact_name: string;
  contact_email: string | null;
  contact_mobile: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  locality_id: number | null;
  locality?: Locality;
  territory_id: number | null;
  territory?: Territory;
  division_id: number | null;
  division?: Division;
  assigned_bdm_id: number | null;
  assigned_bdm?: User;
  source: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  notes: string | null;
  is_mapped: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: number;
  lead_id: number;
  lead?: Lead;
  title: string;
  description: string | null;
  value: number | null;
  status: DealStatus;
  assigned_bdm_id: number | null;
  assigned_bdm?: User;
  territory_id: number | null;
  territory?: Territory;
  verification_status: string | null;
  approval_status: string | null;
  approved_by: number | null;
  approved_at: string | null;
  notes: string | null;
  documents?: DealDocument[];
  created_at: string;
  updated_at: string;
}

export interface DealDocument {
  id: number;
  deal_id: number;
  document_type: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  verification_status: DocumentVerificationStatus;
  verified_by: number | null;
  verified_at: string | null;
  notes: string | null;
  uploaded_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: number;
  user_id: number | null;
  user?: User;
  deal_id: number | null;
  deal?: Deal;
  partner_type: PartnerType;
  business_name: string;
  business_address: string | null;
  latitude: number | null;
  longitude: number | null;
  locality_id: number | null;
  locality?: Locality;
  territory_id: number | null;
  territory?: Territory;
  contact_name: string;
  contact_email: string | null;
  contact_mobile: string;
  status: PartnerStatus;
  onboarded_at: string | null;
  coverage_localities?: Locality[];
  created_at: string;
  updated_at: string;
}

// Notification Types
export interface CrmNotification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  channel: 'in_app' | 'email' | 'sms';
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

// Dashboard Types
export interface DashboardStats {
  leads: { total: number; by_status: Record<LeadStatus, number> };
  deals: { total: number; by_status: Record<DealStatus, number> };
  partners: { total: number; by_type: Record<PartnerType, number> };
  geography: { divisions: number; territories: number; localities: number };
  conversion_rates: { lead_to_deal: number; deal_to_partner: number };
}

// Filter/Query Types
export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
}

export interface LeadFilters extends PaginationParams {
  status?: LeadStatus;
  priority?: LeadPriority;
  territory_id?: number;
  division_id?: number;
  is_mapped?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface DealFilters extends PaginationParams {
  status?: DealStatus;
  territory_id?: number;
  date_from?: string;
  date_to?: string;
}
