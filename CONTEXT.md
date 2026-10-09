### System Architecture Context: ParcelHub

**System Classification:** State-Driven Asynchronous Escrow and Micro-Logistics Management System

**Primary Target Environment:** Higher Education Campus Terminal Distribution (CTU Danao Campus)

**Core Objective:** Decouple synchronous last-mile delivery handovers through a deterministic, zero-trust escrow model that eliminates cognitive load and behavioral uncertainty without assuming financial liability.

---

### Core Architectural Roles

```
[ External Domain ]          [ Escrow Intermediary ]             [ Internal Domain ]
  Courier / Rider   <------->  Staff Terminal / Hub Hub Node  <----->  Recipient (Student/Faculty)
 (Waybill + COD Only)          (Verification & Disbursal)            (App / Auth / Claim Token)

```

1. **Client Interface (Recipient):**

- Pre-registers expected consignments via tracking/waybill ingestion.
- Generates time-bounded, cryptographically signed dynamic QR tokens gated by a 6-digit user MPIN.
- Maintains visibility over state transitions without requiring real-time external carrier tracking.

2. **Operator Interface (Hub Staff Node):**

- Acts as the physical and transactional intermediary at campus entry points.
- Executes the physical-to-digital validation pipeline: physical cash acceptance, courier handover, visual intake logging, and authenticated parcel release.

3. **External Courier Interface (Decoupled Perimeter):**

- Treats ParcelHub strictly as an authenticated drop-off point.
- Interacts solely through waybill tracking matching and exact-amount cash reconciliation.

---

### Finite State Machine (FSM) Specification

The system operates strictly as a monotonic directed graph with zero state reversibility or bypass routes.

```
       [ Client Pre-Registers ]
                  │
                  ▼
              ┌───────┐
              │ STAGED│
              └───────┘
                  │  Staff verifies physical cash deposit (cash_deposited >= courier_cod_amount)
                  │  Generates Ledger Transaction ID
                  ▼
              ┌────────┐
              │ FUNDED │
              └────────┘
                  │  Courier arrives; Staff matches Waybill
                  │  Physical cash disbursed to Courier
                  │  Camera module executes Visual Logging Record (Image + Metadata)
                  ▼
          ┌─────────────────┐
          │ RECEIVED_LOGGED │
          └─────────────────┘
                  │  Recipient presents unexpired Dynamic QR (MPIN-derived)
                  │  Staff scans token using active Staff Session
                  │  Atomic Handshake validates and commits release
                  ▼
              ┌─────────┐
              │ CLAIMED │  (Terminal State)
              └─────────┘

```

#### State Definitions & Constraints:

- **`STAGED`:** The record is initialized. Metadata exists (tracking number, declared courier COD value, recipient user ID). The hub holds **no liability**; the courier cannot be paid.
- **`FUNDED`:** Escrow balance is locked. The hub holds verified physical cash deposited by the user where `cash_deposited >= courier_cod_amount`. Status transition requires a Staff deposit session.
- **`RECEIVED_LOGGED`:** Parcel is in physical hub custody. The courier has received payment, and the system has committed a visual audit payload (image hash, timestamp, optical/visual tracking tag, staff ID). Automated notification dispatches to the client.
- **`CLAIMED`:** The terminal state. Custody transferred to recipient. The lifecycle closes permanently.

---

### Formal Enforcement of Invariants

```
                ┌────────────────────────────────────────────────────────┐
                │               ParcelHub Validation Engine              │
                └────────────────────────────────────────────────────────┘
                                             │
      ┌──────────────────┬───────────────────┴───────────────────┬──────────────────┐
      ▼                  ▼                                       ▼                  ▼
[Solvency Engine]  [State Gatekeeper]                     [Atomic Handshake]   [Zero-Knowledge Filter]
- Evaluates:        - Evaluates:                          - Requires:          - Redacts:
  cash_balance >=     Strict current_state -> next_state    1. Dynamic Token     Student Name, ID,
  cod_amount          monotonic mapping                     2. Staff Session     Contact Details from
- Hard block on     - Prevents state skips                  3. Visual Log Hash   Courier-facing views
  disbursement        (e.g., STAGED -> RECEIVED)          - Atomic DB commit

```

#### 1. Solvency Invariant (Zero-Credit Escrow)

- **Rule:** $Balance_{\text{escrow}} - Amount_{\text{COD}} \ge 0$ at all execution points.
- **Backend Assertion:** Staff confirmation endpoints for courier payout trigger a strict database-level check:

```sql
CHECK (deposit_balance >= cod_amount AND deposit_status = 'LOCKED');

```

- **Failure Mode:** If `cash_deposited < courier_cod_amount`, payout execution throws an unhandled constraint exception, terminating the transaction before receipt validation.

#### 2. State Progression Invariant (Monotonic Flow)

- **Rule:** Given state vector $S = \{\text{STAGED}, \text{FUNDED}, \text{RECEIVED\_LOGGED}, \text{CLAIMED}\}$, transitions are legal if and only if:

$$\text{NextState}(S_i) = S_{i+1}$$

- **Backend Assertion:** Update queries enforce current-state matching:

```sql
UPDATE parcels
SET status = 'FUNDED'
WHERE id = :parcel_id AND status = 'STAGED';

```

- **Failure Mode:** Any attempt to process a parcel to `RECEIVED_LOGGED` while in `STAGED` produces a zero-row update, rejecting the intake.

#### 3. Release Invariant (Atomic Handshake)

- **Rule:** Custody resolution occurs inside an atomic transaction requiring three cryptographic and runtime primitives:

1. `User_Token`: An unexpired, single-use, HMAC/time-gated token decrypted via recipient MPIN.
2. `Staff_Session`: An authenticated JWT tied to active terminal operator credentials.
3. `Visual_Log_Ref`: Foreign key reference to an immutable visual verification record.

- **Execution Flow:**

```python
def release_parcel(parcel_id, dynamic_token, staff_session_id):
    with db.transaction():
        assert verify_staff_session(staff_session_id)
        assert verify_user_dynamic_token(dynamic_token, parcel_id)
        assert exists_visual_record(parcel_id)

        commit_status_change(parcel_id, from_state='RECEIVED_LOGGED', to_state='CLAIMED')
        invalidate_token(dynamic_token)

```

#### 4. Identity Decoupling Invariant (Zero-Knowledge Perimeter)

- **Rule:** External courier views expose strictly operational metadata: `Waybill_Tracking_ID`, `Payable_COD_Amount`, and `ParcelHub_Station_ID`.
- **Data Sanitization:** The public courier-intake API projection strips recipient name, student ID, program, mobile phone, and internal security tokens. No recipient-identifying data is persisted on courier physical paper slips generated by the hub.

---

### Core Data Schema Blueprint

```
users
  ├── user_id (UUID, PK)
  ├── school_id (VARCHAR, UNIQUE)
  ├── mpin_hash (VARCHAR)
  └── created_at (TIMESTAMP)

parcels
  ├── parcel_id (UUID, PK)
  ├── user_id (UUID, FK -> users.user_id)
  ├── waybill_number (VARCHAR, INDEX)
  ├── cod_amount (DECIMAL(10,2))
  ├── cash_deposited (DECIMAL(10,2), DEFAULT 0.00)
  ├── current_status (ENUM: STAGED, FUNDED, RECEIVED_LOGGED, CLAIMED)
  └── created_at (TIMESTAMP)

visual_logs
  ├── log_id (UUID, PK)
  ├── parcel_id (UUID, FK -> parcels.parcel_id)
  ├── image_storage_uri (VARCHAR)
  ├── capture_hash_sha256 (VARCHAR)
  ├── staff_id (UUID, FK -> staff_accounts.staff_id)
  └── logged_at (TIMESTAMP)

escrow_ledger
  ├── transaction_id (UUID, PK)
  ├── parcel_id (UUID, FK -> parcels.parcel_id)
  ├── amount (DECIMAL(10,2))
  ├── transaction_type (ENUM: DEPOSIT, DISBURSE_COURIER, REFUND_OVERPAY)
  ├── staff_session_id (VARCHAR)
  └── committed_at (TIMESTAMP)

```

---

### Defensive Architecture Matrix

| Attack / Failure Vector                                            | Enforced Invariant  | System Prevention Layer                                                                                                             |
| ------------------------------------------------------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Short-Deposit Exploit** (User deposits ₱100 for a ₱500 COD)      | Solvency Invariant  | The intake terminal checks `cash_deposited >= courier_cod_amount`. State cannot advance to `FUNDED`; courier payout remains locked. |
| **Skip-Funding Attempt** (Staff logs package arrival directly)     | State Progression   | Database rejects transition from `STAGED` directly to `RECEIVED_LOGGED`. System requires prior row existence in `escrow_ledger`.    |
| **Unauthorized Pickup / Claim Dispute**                            | Release Invariant   | System blocks transition to `CLAIMED` without a valid dynamic token from user MPIN and an active operator session ID.               |
| **Social Engineering via Courier** (Courier requests user details) | Identity Decoupling | Staff terminal UI redacts student identifiers; interface presents only waybill confirmation and payout figures.                     |
