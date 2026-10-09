import { supabase, isSupabaseConfigured } from './supabase';
import { ParcelRow, VisualLogRow, EscrowLedgerRow } from '../types/database';
import {
  INITIAL_PARCELS,
  INITIAL_VISUAL_LOGS,
  INITIAL_LEDGER,
} from './store';

let localParcels = [...INITIAL_PARCELS];
let localVisualLogs = [...INITIAL_VISUAL_LOGS];
let localLedger = [...INITIAL_LEDGER];

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
   * Cash-In: Advance from STAGED -> FUNDED
   */
  async commitCashIn(parcelId: string, cashDeposited: number): Promise<void> {
    const change = cashDeposited; // will be computed against cod_amount in DB or locally

    if (isSupabaseConfigured()) {
      await supabase
        .from('parcels')
        .update({
          cash_deposited: cashDeposited,
          current_status: 'FUNDED',
          updated_at: new Date().toISOString(),
        })
        .eq('parcel_id', parcelId);

      await supabase.from('escrow_ledger').insert({
        parcel_id: parcelId,
        amount: cashDeposited,
        transaction_type: 'DEPOSIT',
        staff_session_id: 'ST-0488',
        committed_at: new Date().toISOString(),
      });
    }

    // Also update local cache
    localParcels = localParcels.map((p) => {
      if (p.parcel_id === parcelId) {
        return {
          ...p,
          cash_deposited: cashDeposited,
          change_due: cashDeposited - p.cod_amount,
          current_status: 'FUNDED',
          updated_at: new Date().toISOString(),
        };
      }
      return p;
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
    aiBypassed: boolean
  ): Promise<void> {
    if (isSupabaseConfigured()) {
      await supabase
        .from('parcels')
        .update({
          current_status: 'RECEIVED_LOGGED',
          updated_at: new Date().toISOString(),
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
        verified_by_staff_id: 'ST-0488',
        verified_at: new Date().toISOString(),
      });
    }

    localParcels = localParcels.map((p) => {
      if (p.parcel_id === parcelId) {
        return {
          ...p,
          current_status: 'RECEIVED_LOGGED',
          updated_at: new Date().toISOString(),
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
      verified_by_staff_id: 'ST-0488',
      verified_at: new Date().toISOString(),
    });
  },

  /**
   * Atomic Claim Handshake: Advance from RECEIVED_LOGGED -> CLAIMED
   */
  async executeClaim(parcelId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      await supabase
        .from('parcels')
        .update({
          current_status: 'CLAIMED',
          updated_at: new Date().toISOString(),
        })
        .eq('parcel_id', parcelId);
    }

    localParcels = localParcels.map((p) => {
      if (p.parcel_id === parcelId) {
        return {
          ...p,
          current_status: 'CLAIMED',
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    });
  },

  /**
   * Subscribe to live Supabase Realtime channel for instant claim ping updates
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
