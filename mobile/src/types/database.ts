/**
 * Database Types matching ParcelHub PostgreSQL Schema
 * Source: ARCHITECTURE_CONTEXT.md Section 3.1
 */

export type UserRole = 'STUDENT' | 'FACULTY' | 'STAFF' | 'ADMIN';

export type ParcelStatus = 'STAGED' | 'FUNDED' | 'RECEIVED_LOGGED' | 'CLAIMED';

export type PackageCondition = 'INTACT' | 'DAMAGED' | 'TAMPERED' | 'UNKNOWN';

export interface UserRow {
  user_id: string; // UUID
  auth_id: string; // UUID references auth.users(id)
  email: string;
  full_name: string;
  school_id: string;
  role: UserRole;
  mpin_hash: string;
  push_token?: string | null;
  created_at: string;
}

export interface HubStationRow {
  station_id: string; // UUID
  station_name: string;
  station_code: string; // e.g. CTU-DANAO-MAIN-HUB
  secret_key: string;
  is_active: boolean;
  created_at: string;
}

export interface ParcelRow {
  parcel_id: string; // UUID
  user_id: string; // UUID
  station_id: string; // UUID
  waybill_number: string;
  carrier: string | null;
  cod_amount: number; // DECIMAL(10,2)
  cash_deposited: number; // DECIMAL(10,2)
  change_due: number; // GENERATED ALWAYS AS (cash_deposited - cod_amount)
  current_status: ParcelStatus;
  receipt_image_uri?: string | null;
  payment_pinged_at?: string | null;
  payment_staff_id?: string | null;
  payment_station_code?: string | null;
  claim_pinged_at?: string | null; // Populates when student scans hub QR
  created_at: string;
  updated_at: string;
  recipient_name?: string;
  recipient_school_id?: string;
}

export interface SystemConfig {
  ai_user_receipt_ocr: boolean;
  ai_staff_intake_precheck: boolean;
}

export interface VisualLogRow {
  log_id: string; // UUID
  parcel_id: string; // UUID
  image_storage_uri: string;
  image_hash_sha256: string;
  detected_waybill: string | null;
  ai_bypassed: boolean;
  package_condition: PackageCondition;
  confidence_score: number;
  verified_by_staff_id: string;
  verified_at: string;
}
