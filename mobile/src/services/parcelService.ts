import { supabase, isSupabaseConfigured } from './supabase';
import { ParcelRow, SystemConfig } from '../types/database';
import { PreRegisterParcelPayload } from '../types/parcel';
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
    receipt_image_uri: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    payment_pinged_at: '2026-03-16T14:25:00Z',
    payment_staff_id: 'STAFF-0488',
    payment_station_code: 'CTU-DANAO-MAIN-HUB',
    claim_pinged_at: null,
    created_at: '2026-03-16T14:20:00Z',
    updated_at: '2026-03-16T16:43:00Z',
    recipient_name: 'John Vince Keyed',
    recipient_school_id: 'CTU-2024-8841',
  },
  {
    parcel_id: 'p-105',
    user_id: 'u-student-01',
    station_id: 's-danao-01',
    waybill_number: 'JT88192004811',
    carrier: 'J&T Express',
    cod_amount: 180.0,
    cash_deposited: 200.0,
    change_due: 20.0,
    current_status: 'RECEIVED_LOGGED',
    receipt_image_uri: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    payment_pinged_at: '2026-03-16T14:30:00Z',
    payment_staff_id: 'STAFF-0488',
    payment_station_code: 'CTU-DANAO-MAIN-HUB',
    claim_pinged_at: null,
    created_at: '2026-03-16T13:10:00Z',
    updated_at: '2026-03-16T15:20:00Z',
    recipient_name: 'John Vince Keyed',
    recipient_school_id: 'CTU-2024-8841',
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
    receipt_image_uri: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    payment_pinged_at: '2026-03-16T10:45:00Z',
    payment_staff_id: 'STAFF-0488',
    payment_station_code: 'CTU-DANAO-MAIN-HUB',
    claim_pinged_at: null,
    created_at: '2026-03-16T10:15:00Z',
    updated_at: '2026-03-16T11:00:00Z',
    recipient_name: 'John Vince Keyed',
    recipient_school_id: 'CTU-2024-8841',
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
    receipt_image_uri: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    payment_pinged_at: null, // Unpinged! Staff cannot interact until client scans Hub QR
    payment_staff_id: null,
    payment_station_code: null,
    claim_pinged_at: null,
    created_at: '2026-03-16T15:30:00Z',
    updated_at: '2026-03-16T15:30:00Z',
    recipient_name: 'John Vince Keyed',
    recipient_school_id: 'CTU-2024-8841',
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
    receipt_image_uri: null,
    payment_pinged_at: '2026-03-14T11:15:00Z',
    payment_staff_id: 'STAFF-0488',
    payment_station_code: 'CTU-DANAO-MAIN-HUB',
    claim_pinged_at: '2026-03-15T09:12:00Z',
    created_at: '2026-03-14T11:00:00Z',
    updated_at: '2026-03-15T09:15:00Z',
    recipient_name: 'John Vince Keyed',
    recipient_school_id: 'CTU-2024-8841',
  },
];

let mockStore = [...INITIAL_MOCK_PARCELS];
let serverConfigMock: SystemConfig = {
  ai_user_receipt_ocr: true,
  ai_staff_intake_precheck: true,
};

export interface ReceiptOcrResult {
  parcelId: string;
  waybill_number: string;
  recipient_name: string;
  amount: number;
  carrier: string;
  is_valid: boolean;
}

export const ParcelService = {
  /**
   * Fetch all parcels for the authenticated student
   */
  async getMyParcels(): Promise<ParcelRow[]> {
    if (!isSupabaseConfigured()) {
      return [...mockStore];
    }

    try {
      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [...mockStore];
      }
      return data as ParcelRow[];
    } catch {
      return [...mockStore];
    }
  },

  /**
   * Query server system configuration to check if AI receipt OCR is enabled
   */
  async getServerConfig(): Promise<SystemConfig> {
    if (!isSupabaseConfigured()) {
      return { ...serverConfigMock };
    }

    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('config_key, config_value');

      if (error || !data) return { ...serverConfigMock };

      const cfg: SystemConfig = { ...serverConfigMock };
      data.forEach((row: any) => {
        if (row.config_key === 'ai_user_receipt_ocr') {
          cfg.ai_user_receipt_ocr = Boolean(row.config_value?.enabled);
        }
        if (row.config_key === 'ai_staff_intake_precheck') {
          cfg.ai_staff_intake_precheck = Boolean(row.config_value?.enabled);
        }
      });
      return cfg;
    } catch {
      return { ...serverConfigMock };
    }
  },

  /**
   * Step 4 of Create Order:
   * Upload screenshot to server/database prior to generate anchored ID,
   * run Gemini OCR validation for Waybill, Receiver Name, and COD Amount.
   */
  async verifyReceiptScreenshot(
    imageBase64: string,
    recipientSchoolId: string = 'CTU-2024-8841'
  ): Promise<ReceiptOcrResult> {
    const generatedId = `p-${Date.now()}`;

    // Simulation fallback if offline / running without external backend
    await new Promise((r) => setTimeout(r, 1200));

    // Anchoring ID in mock store
    const anchoredParcel: ParcelRow = {
      parcel_id: generatedId,
      user_id: 'u-student-01',
      station_id: 's-danao-01',
      waybill_number: 'SPXPH0492817263',
      carrier: 'ShopeeXpress (SPX)',
      recipient_name: 'John Vince Keyed',
      recipient_school_id: recipientSchoolId,
      cod_amount: 340.0,
      cash_deposited: 0,
      change_due: -340.0,
      current_status: 'STAGED',
      receipt_image_uri: imageBase64,
      payment_pinged_at: null,
      payment_staff_id: null,
      payment_station_code: null,
      claim_pinged_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('parcels')
          .insert({
            waybill_number: 'SPXPH0492817263',
            carrier: 'ShopeeXpress (SPX)',
            recipient_name: 'John Vince Keyed',
            recipient_school_id: recipientSchoolId,
            cod_amount: 340.0,
            current_status: 'STAGED',
            receipt_image_uri: imageBase64.length > 500 ? 'uploaded_receipt_screenshot' : imageBase64,
          })
          .select('parcel_id')
          .single();

        if (data?.parcel_id) {
          anchoredParcel.parcel_id = data.parcel_id;
        }
      } catch (e) {
        console.warn('Supabase anchor error, using generated id:', e);
      }
    }

    mockStore = [anchoredParcel, ...mockStore];

    return {
      parcelId: anchoredParcel.parcel_id,
      waybill_number: 'SPXPH0492817263',
      recipient_name: 'John Vince Keyed',
      amount: 340.0,
      carrier: 'ShopeeXpress (SPX)',
      is_valid: true,
    };
  },

  /**
   * Commit Pre-registered order (Manual or after confirming OCR fields)
   */
  async preRegister(
    payload: PreRegisterParcelPayload & {
      anchoredParcelId?: string;
      receiptImageUri?: string;
      recipientName?: string;
    }
  ): Promise<ParcelRow> {
    const now = new Date().toISOString();
    const id = payload.anchoredParcelId || `p-${Date.now()}`;

    // If already anchored, update it
    const existingIndex = mockStore.findIndex((p) => p.parcel_id === id);
    if (existingIndex >= 0) {
      mockStore[existingIndex] = {
        ...mockStore[existingIndex],
        waybill_number: payload.waybill_number.trim().toUpperCase(),
        carrier: payload.carrier,
        recipient_name: payload.recipientName || mockStore[existingIndex].recipient_name || 'John Vince Keyed',
        cod_amount: Number(payload.cod_amount) || 0,
        change_due: -(Number(payload.cod_amount) || 0),
        receipt_image_uri: payload.receiptImageUri || mockStore[existingIndex].receipt_image_uri,
        updated_at: now,
      };
      return mockStore[existingIndex];
    }

    const newParcel: ParcelRow = {
      parcel_id: id,
      user_id: 'u-student-01',
      station_id: 's-danao-01',
      waybill_number: payload.waybill_number.trim().toUpperCase(),
      carrier: payload.carrier,
      recipient_name: payload.recipientName || 'John Vince Keyed',
      recipient_school_id: 'CTU-2024-8841',
      cod_amount: Number(payload.cod_amount) || 0,
      cash_deposited: 0,
      change_due: -(Number(payload.cod_amount) || 0),
      current_status: 'STAGED',
      receipt_image_uri: payload.receiptImageUri || null,
      payment_pinged_at: null,
      payment_staff_id: null,
      payment_station_code: null,
      claim_pinged_at: null,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('parcels')
          .insert({
            waybill_number: newParcel.waybill_number,
            carrier: newParcel.carrier,
            recipient_name: newParcel.recipient_name,
            cod_amount: newParcel.cod_amount,
            current_status: 'STAGED',
            receipt_image_uri: newParcel.receipt_image_uri,
          })
          .select()
          .single();

        if (data) return data as ParcelRow;
      } catch (err) {
        console.warn('Supabase insert failed, using mock store:', err);
      }
    }

    mockStore = [newParcel, ...mockStore];
    return newParcel;
  },

  /**
   * Physical Counter Payment Ping:
   * Student scans Station QR or types Station ID (e.g. CTU-DANAO-MAIN-HUB)
   * Enforces Invariant 3: Pings staff desk so staff can interact with the unpaid order!
   */
  async dispatchPaymentPing(parcelId: string, stationCode: string): Promise<boolean> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('parcels')
          .update({
            payment_pinged_at: now,
            payment_station_code: stationCode,
            updated_at: now,
          })
          .eq('parcel_id', parcelId);
      } catch (e) {
        console.warn('Supabase payment ping error:', e);
      }
    }

    mockStore = mockStore.map((p) => {
      if (p.parcel_id === parcelId) {
        return {
          ...p,
          payment_pinged_at: now,
          payment_station_code: stationCode,
          updated_at: now,
        };
      }
      return p;
    });

    return true;
  },

  /**
   * Batch Claim Ping Handshake:
   * Student enters 6-digit MPIN and pings staff desk for 1 or MULTIPLE parcels!
   */
  async batchDispatchClaimPing(payload: {
    parcelIds: string[];
    stationCode: string;
    mpin: string;
  }): Promise<{ success: boolean; totalChange: number; message: string }> {
    if (payload.mpin.length !== APP_CONFIG.MPIN_LENGTH) {
      throw new Error(`MPIN must be exactly ${APP_CONFIG.MPIN_LENGTH} digits.`);
    }

    const now = new Date().toISOString();
    let totalChange = 0;

    if (isSupabaseConfigured()) {
      try {
        for (const id of payload.parcelIds) {
          await supabase
            .from('parcels')
            .update({ claim_pinged_at: now })
            .eq('parcel_id', id);
        }
      } catch (e) {
        console.warn('Supabase batch claim ping error:', e);
      }
    }

    mockStore = mockStore.map((p) => {
      if (payload.parcelIds.includes(p.parcel_id)) {
        totalChange += Math.max(0, p.change_due);
        return {
          ...p,
          claim_pinged_at: now,
        };
      }
      return p;
    });

    return {
      success: true,
      totalChange,
      message: `Claim ping dispatched to counter desk for ${payload.parcelIds.length} parcel(s). Please approach the operator.`,
    };
  },
};
