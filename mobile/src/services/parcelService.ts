import { supabase, isSupabaseConfigured } from './supabase';
import { ParcelRow, ParcelStatus } from '../types/database';
import { PreRegisterParcelPayload, ClaimPingPayload, ClaimPingResult } from '../types/parcel';
import { APP_CONFIG } from '../constants/config';

// Mock seed data matching CTU Danao higher education campus context & DESIGN_CONTEXT.md examples
const INITIAL_MOCK_PARCELS: ParcelRow[] = [
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
    claim_pinged_at: null,
    created_at: '2026-03-16T14:20:00Z',
    updated_at: '2026-03-16T16:43:00Z',
  },
  {
    parcel_id: 'p-102',
    user_id: 'u-student-01',
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
  },
  {
    parcel_id: 'p-103',
    user_id: 'u-student-01',
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
  },
];

let mockStore = [...INITIAL_MOCK_PARCELS];

export const ParcelService = {
  /**
   * Fetch all parcels for the authenticated student
   */
  async getMyParcels(): Promise<ParcelRow[]> {
    if (!isSupabaseConfigured()) {
      return [...mockStore];
    }

    const { data, error } = await supabase
      .from('parcels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching parcels from Supabase, falling back to mock store:', error.message);
      return [...mockStore];
    }

    return data as ParcelRow[];
  },

  /**
   * Pre-register a consignment (Status starts strictly as STAGED)
   * Solvency Invariant: Hub holds no liability yet; user must deposit cash at counter.
   */
  async preRegister(payload: PreRegisterParcelPayload): Promise<ParcelRow> {
    if (!isSupabaseConfigured()) {
      const newParcel: ParcelRow = {
        parcel_id: `p-${Date.now()}`,
        user_id: 'u-student-01',
        station_id: 's-danao-01',
        waybill_number: payload.waybill_number.trim().toUpperCase(),
        carrier: payload.carrier,
        cod_amount: Number(payload.cod_amount) || 0,
        cash_deposited: 0,
        change_due: -(Number(payload.cod_amount) || 0),
        current_status: 'STAGED',
        claim_pinged_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockStore = [newParcel, ...mockStore];
      return newParcel;
    }

    const { data, error } = await supabase
      .from('parcels')
      .insert({
        waybill_number: payload.waybill_number.trim().toUpperCase(),
        carrier: payload.carrier,
        cod_amount: Number(payload.cod_amount) || 0,
        current_status: 'STAGED',
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as ParcelRow;
  },

  /**
   * Inverted Claim Handshake:
   * Recipient scans stationary Hub QR and enters 6-digit MPIN.
   * Transmits claim ping to surface student on counter terminal queue.
   */
  async dispatchClaimPing(payload: {
    parcelId: string;
    stationCode: string;
    mpin: string;
  }): Promise<{ success: boolean; changeDue: number; message: string }> {
    if (payload.mpin.length !== APP_CONFIG.MPIN_LENGTH) {
      throw new Error(`MPIN must be exactly ${APP_CONFIG.MPIN_LENGTH} digits.`);
    }

    if (!isSupabaseConfigured()) {
      const target = mockStore.find((p) => p.parcel_id === payload.parcelId);
      if (!target) {
        throw new Error('Parcel not found.');
      }
      if (target.current_status !== 'RECEIVED_LOGGED') {
        throw new Error('Parcel is not yet marked Ready to Claim by staff desk.');
      }

      target.claim_pinged_at = new Date().toISOString();
      return {
        success: true,
        changeDue: target.change_due,
        message: `Claim ping dispatched to ${payload.stationCode}! Head to counter desk to collect your parcel.`,
      };
    }

    // Call Supabase update or RPC
    const { data, error } = await supabase
      .from('parcels')
      .update({ claim_pinged_at: new Date().toISOString() })
      .eq('parcel_id', payload.parcelId)
      .eq('current_status', 'RECEIVED_LOGGED')
      .select('change_due')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      changeDue: data.change_due,
      message: `Claim ping dispatched to counter desk.`,
    };
  },
};
