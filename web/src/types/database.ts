/**
 * Database and FSM Types for ParcelHub Counter Terminal
 * Aligned with ARCHITECTURE_CONTEXT.md Section 3
 */

export type UserRole = 'STUDENT' | 'FACULTY' | 'STAFF' | 'ADMIN';
export type ParcelStatus = 'STAGED' | 'FUNDED' | 'RECEIVED_LOGGED' | 'CLAIMED';
export type PackageCondition = 'INTACT' | 'DAMAGED' | 'TAMPERED' | 'UNKNOWN';

export interface UserRow {
  user_id: string;
  auth_id: string;
  email: string;
  full_name: string;
  school_id: string;
  role: UserRole;
  mpin_hash: string;
  push_token?: string | null;
  created_at: string;
}

export interface HubStationRow {
  station_id: string;
  station_name: string;
  station_code: string;
  secret_key: string;
  is_active: boolean;
  created_at: string;
}

export interface ParcelRow {
  parcel_id: string;
  user_id: string;
  station_id: string;
  waybill_number: string;
  carrier: string | null;
  cod_amount: number;
  cash_deposited: number;
  change_due: number;
  current_status: ParcelStatus;
  claim_pinged_at?: string | null;
  created_at: string;
  updated_at: string;
  recipient_name?: string;
  recipient_school_id?: string;
}

export interface VisualLogRow {
  log_id: string;
  parcel_id: string;
  image_storage_uri: string;
  image_hash_sha256: string;
  detected_waybill: string | null;
  ai_bypassed: boolean;
  package_condition: PackageCondition;
  confidence_score: number;
  verified_by_staff_id: string;
  verified_at: string;
}

export interface EscrowLedgerRow {
  transaction_id: string;
  parcel_id: string;
  amount: number;
  transaction_type: 'DEPOSIT' | 'DISBURSE_COURIER' | 'REFUND_OVERPAY';
  staff_session_id: string;
  committed_at: string;
}

export interface GeminiExtractionResult {
  waybill_number: string | null;
  courier_name: string | null;
  is_parcel_detected: boolean;
  package_condition: PackageCondition;
  confidence_score: number;
}
