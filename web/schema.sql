-- ==============================================================================
-- ParcelHub PostgreSQL Database Schema (CTU Danao Campus Logistics Node)
-- Source: ARCHITECTURE_CONTEXT.md Section 3 & INVARIANTS.md
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'FACULTY', 'STAFF', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE parcel_status AS ENUM ('STAGED', 'FUNDED', 'RECEIVED_LOGGED', 'CLAIMED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE package_condition AS ENUM ('INTACT', 'DAMAGED', 'TAMPERED', 'UNKNOWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. SYSTEM CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(64) PRIMARY KEY,
    config_value JSONB NOT NULL,
    updated_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Independent AI policy toggles: User Receipt OCR vs Staff Intake Precheck
INSERT INTO system_config (config_key, config_value)
VALUES 
    ('ai_user_receipt_ocr', '{"enabled": true}'::jsonb),
    ('ai_staff_intake_precheck', '{"enabled": true}'::jsonb)
ON CONFLICT (config_key) DO UPDATE
SET config_value = EXCLUDED.config_value;

-- 3. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- references auth.users(id) in Supabase Auth
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    school_id VARCHAR(64) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    mpin_hash VARCHAR(255) NOT NULL DEFAULT 'hash_123456',
    push_token VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Staff Account for Counter Login
INSERT INTO users (email, full_name, school_id, role, mpin_hash)
VALUES ('staff.danao@ctu.edu.ph', 'Counter Staff Lead', 'STAFF-0488', 'STAFF', 'hash_123456')
ON CONFLICT (email) DO NOTHING;

-- 4. HUB STATIONS (Physical Counter Points)
CREATE TABLE IF NOT EXISTS hub_stations (
    station_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_name VARCHAR(128) NOT NULL,
    station_code VARCHAR(32) UNIQUE NOT NULL, -- embedded in printable static QR
    secret_key VARCHAR(128) NOT NULL DEFAULT 'secret-ctu-hub-key-2026',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default CTU Danao Main Gate Hub
INSERT INTO hub_stations (station_name, station_code)
VALUES ('Campus Terminal 1 (Main Gate Desk)', 'CTU-DANAO-MAIN-HUB')
ON CONFLICT (station_code) DO NOTHING;

-- 5. PARCELS & ENVELOPE LEDGER
CREATE TABLE IF NOT EXISTS parcels (
    parcel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    station_id UUID REFERENCES hub_stations(station_id) ON DELETE SET NULL,
    waybill_number VARCHAR(128) NOT NULL,
    carrier VARCHAR(64),
    recipient_name VARCHAR(255),
    recipient_school_id VARCHAR(64),
    receipt_image_uri TEXT, -- Screenshot uploaded by student during order creation
    cod_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    cash_deposited DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    change_due DECIMAL(10,2) GENERATED ALWAYS AS (cash_deposited - cod_amount) STORED,
    current_status parcel_status NOT NULL DEFAULT 'STAGED',
    payment_pinged_at TIMESTAMPTZ, -- populates when student scans station QR to pay cash
    payment_staff_id VARCHAR(64), -- staff member who accepted the cash deposit
    payment_station_code VARCHAR(32), -- hub station where cash was deposited
    claim_pinged_at TIMESTAMPTZ, -- populates when student enters MPIN to claim package
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_solvency CHECK (
        (current_status = 'STAGED') OR
        (cash_deposited >= cod_amount)
    )
);

CREATE INDEX IF NOT EXISTS idx_parcels_waybill ON parcels(waybill_number);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON parcels(current_status);
CREATE INDEX IF NOT EXISTS idx_parcels_pings ON parcels(claim_pinged_at) WHERE current_status = 'RECEIVED_LOGGED';

-- 6. VISUAL LOGS (AI Verification Records)
CREATE TABLE IF NOT EXISTS visual_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcel_id UUID UNIQUE NOT NULL REFERENCES parcels(parcel_id) ON DELETE RESTRICT,
    image_storage_uri TEXT NOT NULL,
    image_hash_sha256 VARCHAR(64) NOT NULL,
    detected_waybill VARCHAR(128),
    ai_bypassed BOOLEAN NOT NULL DEFAULT FALSE,
    package_condition package_condition NOT NULL DEFAULT 'INTACT',
    confidence_score DECIMAL(5,4) NOT NULL DEFAULT 0.95,
    verified_by_staff_id VARCHAR(64) DEFAULT 'staff-terminal-01',
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ESCROW LEDGER (Financial Handshakes)
CREATE TABLE IF NOT EXISTS escrow_ledger (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcel_id UUID NOT NULL REFERENCES parcels(parcel_id) ON DELETE RESTRICT,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(32) NOT NULL, -- DEPOSIT, DISBURSE_COURIER, REFUND_OVERPAY
    staff_session_id VARCHAR(64) NOT NULL,
    committed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MONOTONIC FSM DATABASE TRIGGER (Prevents State Skips & Reversals)
CREATE OR REPLACE FUNCTION enforce_monotonic_fsm()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.current_status = 'STAGED' AND NEW.current_status != 'FUNDED' THEN
        RAISE EXCEPTION 'FSM Violation: Cannot transition from STAGED directly to %', NEW.current_status;
    ELSIF OLD.current_status = 'FUNDED' AND NEW.current_status != 'RECEIVED_LOGGED' THEN
        RAISE EXCEPTION 'FSM Violation: Cannot transition from FUNDED directly to %', NEW.current_status;
    ELSIF OLD.current_status = 'RECEIVED_LOGGED' AND NEW.current_status != 'CLAIMED' THEN
        RAISE EXCEPTION 'FSM Violation: Cannot transition from RECEIVED_LOGGED directly to %', NEW.current_status;
    ELSIF OLD.current_status = 'CLAIMED' AND NEW.current_status != 'CLAIMED' THEN
        RAISE EXCEPTION 'FSM Violation: Terminal state CLAIMED is immutable';
    END IF;

    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_parcel_fsm ON parcels;
CREATE TRIGGER trg_parcel_fsm
BEFORE UPDATE OF current_status ON parcels
FOR EACH ROW
EXECUTE FUNCTION enforce_monotonic_fsm();

-- 9. ENABLE SUPABASE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE parcels;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Allow public reads and updates for prototype / campus desk terminal operations
CREATE POLICY "Public full access to parcels" ON parcels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to visual_logs" ON visual_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to escrow_ledger" ON escrow_ledger FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read system_config" ON system_config FOR SELECT USING (true);
CREATE POLICY "Public update system_config" ON system_config FOR UPDATE USING (true) WITH CHECK (true);

-- 11. INITIAL SEED DATA (For Immediate Demonstration)
INSERT INTO parcels (
    waybill_number, carrier, recipient_name, recipient_school_id,
    cod_amount, cash_deposited, current_status, claim_pinged_at
) VALUES
(
    'SPXPH0492817263', 'ShopeeXpress (SPX)', 'John Vince Keyed', 'CTU-2024-8841',
    340.00, 500.00, 'RECEIVED_LOGGED', NOW()
),
(
    'JT99482103847', 'J&T Express', 'Mary Jane Rivera', 'CTU-2023-1102',
    620.00, 620.00, 'FUNDED', NULL
),
(
    'FLASH982173620', 'Flash Express', 'Christian Alcantara', 'CTU-2024-9912',
    215.00, 0.00, 'STAGED', NULL
)
ON CONFLICT DO NOTHING;
