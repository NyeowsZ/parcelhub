import { ParcelRow, ParcelStatus } from './database';
export type { ClaimPingPayload, ClaimPingResult } from './auth';

export interface PreRegisterParcelPayload {
  waybill_number: string;
  carrier: string;
  cod_amount: number;
  item_description?: string;
  station_code?: string;
}

export interface ParcelSummary {
  total: number;
  staged: number;
  funded: number;
  readyToClaim: number;
  claimed: number;
}

export interface StatusMeta {
  label: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  step: 1 | 2 | 3 | 4;
}

export const PARCEL_STATUS_MAP: Record<ParcelStatus, StatusMeta> = {
  STAGED: {
    label: 'Awaiting Cash-In',
    description: 'Pre-registered. Visit counter to deposit physical COD envelope.',
    badgeBg: '#FEF3C7', // Amber-100
    badgeText: '#B45309', // Amber-700
    step: 1,
  },
  FUNDED: {
    label: 'Funded & Waiting',
    description: 'Cash secured in envelope. Awaiting courier arrival at desk.',
    badgeBg: '#EFF6FF', // Blue-50
    badgeText: '#1D4ED8', // Blue-700
    step: 2,
  },
  RECEIVED_LOGGED: {
    label: 'Ready to Claim',
    description: 'Delivered & verified by AI. Scan Hub QR to pick up.',
    badgeBg: '#DCFCE7', // Emerald-100
    badgeText: '#15803D', // Emerald-700
    step: 3,
  },
  CLAIMED: {
    label: 'Claimed',
    description: 'Handshake completed. Package & change disbursed to recipient.',
    badgeBg: '#F1F5F9', // Slate-100
    badgeText: '#475569', // Slate-600
    step: 4,
  },
};
