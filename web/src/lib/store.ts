import { ParcelRow, VisualLogRow, EscrowLedgerRow } from '../types/database';

export interface SystemConfig {
  ai_required: boolean;
  station_code: string;
  station_name: string;
}

export const INITIAL_CONFIG: SystemConfig = {
  ai_required: true,
  station_code: 'CTU-DANAO-MAIN-HUB',
  station_name: 'Campus Terminal 1 (Main Gate Counter)',
};

export const INITIAL_PARCELS: ParcelRow[] = [
  {
    parcel_id: 'p-101',
    user_id: 'u-student-01',
    station_id: 's-danao-01',
    waybill_number: 'SPXPH0492817263',
    carrier: 'ShopeeXpress (SPX)',
    cod_amount: 340.0,
    cash_deposited: 500.0,
    change_due: 160.0,
    current_status: 'RECEIVED_LOGGED',
    claim_pinged_at: '2026-03-16T16:44:12Z', // Real-time claim ping active!
    created_at: '2026-03-16T14:20:00Z',
    updated_at: '2026-03-16T16:43:00Z',
    recipient_name: 'John Vince Keyed',
    recipient_school_id: 'CTU-2024-8841',
  },
  {
    parcel_id: 'p-102',
    user_id: 'u-student-02',
    station_id: 's-danao-01',
    waybill_number: 'JT99482103847',
    carrier: 'J&T Express',
    cod_amount: 620.0,
    cash_deposited: 620.0,
    change_due: 0.0,
    current_status: 'FUNDED',
    claim_pinged_at: null,
    created_at: '2026-03-16T10:15:00Z',
    updated_at: '2026-03-16T11:00:00Z',
    recipient_name: 'Mary Jane Rivera',
    recipient_school_id: 'CTU-2023-1102',
  },
  {
    parcel_id: 'p-103',
    user_id: 'u-student-03',
    station_id: 's-danao-01',
    waybill_number: 'FLASH982173620',
    carrier: 'Flash Express',
    cod_amount: 215.0,
    cash_deposited: 0.0,
    change_due: -215.0,
    current_status: 'STAGED',
    claim_pinged_at: null,
    created_at: '2026-03-16T15:30:00Z',
    updated_at: '2026-03-16T15:30:00Z',
    recipient_name: 'Christian Alcantara',
    recipient_school_id: 'CTU-2024-9912',
  },
  {
    parcel_id: 'p-104',
    user_id: 'u-student-01',
    station_id: 's-danao-01',
    waybill_number: 'LEXPH881920381',
    carrier: 'Lazada (LEX)',
    cod_amount: 0.0,
    cash_deposited: 0.0,
    change_due: 0.0,
    current_status: 'CLAIMED',
    claim_pinged_at: '2026-03-15T09:12:00Z',
    created_at: '2026-03-14T11:00:00Z',
    updated_at: '2026-03-15T09:15:00Z',
    recipient_name: 'John Vince Keyed',
    recipient_school_id: 'CTU-2024-8841',
  },
];

export const INITIAL_VISUAL_LOGS: VisualLogRow[] = [
  {
    log_id: 'vl-01',
    parcel_id: 'p-101',
    image_storage_uri: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80',
    image_hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    detected_waybill: 'SPXPH0492817263',
    ai_bypassed: false,
    package_condition: 'INTACT',
    confidence_score: 0.985,
    verified_by_staff_id: 'staff-terminal-01',
    verified_at: '2026-03-16T16:43:00Z',
  },
];

export const INITIAL_LEDGER: EscrowLedgerRow[] = [
  {
    transaction_id: 'tx-001',
    parcel_id: 'p-101',
    amount: 500.0,
    transaction_type: 'DEPOSIT',
    staff_session_id: 'sess-danao-88',
    committed_at: '2026-03-16T14:30:00Z',
  },
  {
    transaction_id: 'tx-002',
    parcel_id: 'p-101',
    amount: 340.0,
    transaction_type: 'DISBURSE_COURIER',
    staff_session_id: 'sess-danao-88',
    committed_at: '2026-03-16T16:42:00Z',
  },
  {
    transaction_id: 'tx-003',
    parcel_id: 'p-102',
    amount: 620.0,
    transaction_type: 'DEPOSIT',
    staff_session_id: 'sess-danao-88',
    committed_at: '2026-03-16T11:00:00Z',
  },
];
