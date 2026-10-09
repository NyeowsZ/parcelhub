import { UserRole } from './database';

export interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  school_id: string;
  role: UserRole;
  push_token?: string | null;
}

export interface ClaimPingPayload {
  parcel_id: string;
  station_code: string;
  mpin: string; // 6 digits
}

export interface ClaimPingResult {
  success: boolean;
  message: string;
  parcel_id: string;
  change_due?: number;
}
