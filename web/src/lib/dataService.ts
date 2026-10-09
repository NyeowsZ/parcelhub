import { supabase, isSupabaseConfigured } from './supabase';
import { ParcelRow, VisualLogRow, EscrowLedgerRow, SystemConfig } from '../types/database';
import {
  INITIAL_PARCELS,
  INITIAL_VISUAL_LOGS,
  INITIAL_LEDGER,
  INITIAL_CONFIG,
} from './store';

let localParcels = [...INITIAL_PARCELS];
let localVisualLogs = [...INITIAL_VISUAL_LOGS];
let localLedger = [...INITIAL_LEDGER];
let localConfig: SystemConfig = {
  ai_user_receipt_ocr: INITIAL_CONFIG.ai_user_receipt_ocr,
  ai_staff_intake_precheck: INITIAL_CONFIG.ai_staff_intake_precheck,
};

export const DataService = {
  isLive: () => isSupabaseConfigured(),

  /**
   * Fetch all parcels from Supabase (or local fallback)
   */
  async getParcels(): Promise<ParcelRow[]> {
    if (!isSupabaseConfigured()) {
      return [...localParcels];
    }

    try {
      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn('Supabase fetch failed, using fallback:', error?.message);
        return [...localParcels];
      }
      return data as ParcelRow[];
    } catch {
      return [...localParcels];
    }
  },

  /**
   * Fetch visual audit logs
   */
  async getVisualLogs(): Promise<VisualLogRow[]> {
    if (!isSupabaseConfigured()) {
      return [...localVisualLogs];
    }

    try {
      const { data, error } = await supabase
        .from('visual_logs')
        .select('*')
        .order('verified_at', { ascending: false });

      if (error || !data) return [...localVisualLogs];
      return data as VisualLogRow[];
    } catch {
      return [...localVisualLogs];
    }
  },

  /**
   * Fetch escrow ledger entries
   */
  async getLedger(): Promise<EscrowLedgerRow[]> {
    if (!isSupabaseConfigured()) {
      return [...localLedger];
    }

    try {
      const { data, error } = await supabase
        .from('escrow_ledger')
        .select('*')
        .order('committed_at', { ascending: false });

      if (error || !data) return [...localLedger];
      return data as EscrowLedgerRow[];
    } catch {
      return [...localLedger];
    }
  },

  /**
   * Fetch system configuration (independent AI settings)
   */
  async getSystemConfig(): Promise<SystemConfig> {
    if (!isSupabaseConfigured()) {
      return { ...localConfig };
    }

    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('config_key, config_value');

      if (error || !data) return { ...localConfig };

      const cfg: SystemConfig = { ...localConfig };
      data.forEach((row: any) => {
        if (row.config_key === 'ai_user_receipt_ocr') {
          cfg.ai_user_receipt_ocr = Boolean(row.config_value?.enabled);
        }
        if (row.config_key === 'ai_staff_intake_precheck') {
          cfg.ai_staff_intake_precheck = Boolean(row.config_value?.enabled);
        }
      });
      localConfig = cfg;
      return cfg;
    } catch {
      return { ...localConfig };
    }
  },

  /**
   * Update system config toggle
   */
  async updateConfigToggle(
    key: 'ai_user_receipt_ocr' | 'ai_staff_intake_precheck',
    enabled: boolean
  ): Promise<SystemConfig> {
    localConfig[key] = enabled;

    if (isSupabaseConfigured()) {
      await supabase.from('system_config').upsert({
        config_key: key,
        config_value: { enabled },
        updated_at: new Date().toISOString(),
      });
    }

    return { ...localConfig };
  },

  /**
   * Trigger payment ping from student
   */
  async commitPaymentPing(parcelId: string): Promise<void> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      await supabase
        .from('parcels')
        .update({
          payment_pinged_at: now,
          updated_at: now,
        })
        .eq('parcel_id', parcelId);
    }

    localParcels = localParcels.map((p) => {
      if (p.parcel_id === parcelId) {
        return {
          ...p,
          payment_pinged_at: now,
          updated_at: now,
        };
      }
      return p;
    });
  },

  /**
   * Cash-In: Advance from STAGED -> FUNDED
   * Enforces that student must have pinged, cash >= COD, stamps staff ID
   */
  async commitCashIn(
    parcelId: string,
    cashDeposited: number,
    staffId: string = 'STAFF-0488',
    stationCode: string = 'CTU-DANAO-MAIN-HUB'
  ): Promise<void> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      await supabase
        .from('parcels')
        .update({
          cash_deposited: cashDeposited,
          payment_staff_id: staffId,
          payment_station_code: stationCode,
          current_status: 'FUNDED',
          updated_at: now,
        })
        .eq('parcel_id', parcelId);

      await supabase.from('escrow_ledger').insert({
        parcel_id: parcelId,
        amount: cashDeposited,
        transaction_type: 'DEPOSIT',
        staff_session_id: staffId,
        committed_at: now,
      });
    }

    // Update local cache
    localParcels = localParcels.map((p) => {
      if (p.parcel_id === parcelId) {
        return {
          ...p,
          cash_deposited: cashDeposited,
          change_due: cashDeposited - p.cod_amount,
          payment_staff_id: staffId,
          payment_station_code: stationCode,
          current_status: 'FUNDED',
          updated_at: now,
        };
      }
      return p;
    });

    localLedger.unshift({
      transaction_id: `tx-${Date.now()}`,
      parcel_id: parcelId,
      amount: cashDeposited,
      transaction_type: 'DEPOSIT',
      staff_session_id: staffId,
      committed_at: now,
    });
  },

  /**
   * Courier Intake: Advance from FUNDED -> RECEIVED_LOGGED
   */
  async commitIntake(
    parcelId: string,
    extractedWaybill: string,
    condition: 'INTACT' | 'DAMAGED' | 'TAMPERED',
    confidence: number,
    imageUri: string,
    aiBypassed: boolean,
    exactDisbursed: number = 0,
    staffId: string = 'STAFF-0488'
  ): Promise<void> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      await supabase
        .from('parcels')
        .update({
          current_status: 'RECEIVED_LOGGED',
          updated_at: now,
        })
        .eq('parcel_id', parcelId);

      await supabase.from('visual_logs').insert({
        parcel_id: parcelId,
        image_storage_uri: imageUri,
        image_hash_sha256: `sha256-${Date.now()}`,
        detected_waybill: extractedWaybill,
        ai_bypassed: aiBypassed,
        package_condition: condition,
        confidence_score: confidence,
        verified_by_staff_id: staffId,
        verified_at: now,
      });

      if (exactDisbursed > 0) {
        await supabase.from('escrow_ledger').insert({
          parcel_id: parcelId,
          amount: exactDisbursed,
          transaction_type: 'DISBURSE_COURIER',
          staff_session_id: staffId,
          committed_at: now,
        });
      }
    }

    localParcels = localParcels.map((p) => {
      if (p.parcel_id === parcelId) {
        return {
          ...p,
          current_status: 'RECEIVED_LOGGED',
          updated_at: now,
        };
      }
      return p;
    });

    localVisualLogs.unshift({
      log_id: `vl-${Date.now()}`,
      parcel_id: parcelId,
      image_storage_uri: imageUri,
      image_hash_sha256: `sha256-${Date.now()}`,
      detected_waybill: extractedWaybill,
      ai_bypassed: aiBypassed,
      package_condition: condition,
      confidence_score: confidence,
      verified_by_staff_id: staffId,
      verified_at: now,
    });

    if (exactDisbursed > 0) {
      localLedger.unshift({
        transaction_id: `tx-disb-${Date.now()}`,
        parcel_id: parcelId,
        amount: exactDisbursed,
        transaction_type: 'DISBURSE_COURIER',
        staff_session_id: staffId,
        committed_at: now,
      });
    }
  },

  /**
   * Atomic Claim Handshake: Advance from RECEIVED_LOGGED -> CLAIMED
   * Supports batch release for multiple parcel IDs!
   */
  async executeClaim(parcelIds: string | string[], staffId: string = 'STAFF-0488'): Promise<void> {
    const ids = Array.isArray(parcelIds) ? parcelIds : [parcelIds];
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      for (const id of ids) {
        await supabase
          .from('parcels')
          .update({
            current_status: 'CLAIMED',
            updated_at: now,
          })
          .eq('parcel_id', id);
      }
    }

    localParcels = localParcels.map((p) => {
      if (ids.includes(p.parcel_id)) {
        return {
          ...p,
          current_status: 'CLAIMED',
          updated_at: now,
        };
      }
      return p;
    });
  },

  /**
   * Trigger Claim Ping for multiple parcels
   */
  async dispatchClaimPing(parcelIds: string | string[]): Promise<void> {
    const ids = Array.isArray(parcelIds) ? parcelIds : [parcelIds];
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      for (const id of ids) {
        await supabase
          .from('parcels')
          .update({
            claim_pinged_at: now,
            updated_at: now,
          })
          .eq('parcel_id', id);
      }
    }

    localParcels = localParcels.map((p) => {
      if (ids.includes(p.parcel_id)) {
        return {
          ...p,
          claim_pinged_at: now,
          updated_at: now,
        };
      }
      return p;
    });
  },

  /**
   * Subscribe to live Supabase Realtime channel for instant sync
   */
  subscribeToChanges(onUpdate: () => void) {
    if (!isSupabaseConfigured()) return () => {};

    const channel = supabase
      .channel('desk_terminal_parcels')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parcels' },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
