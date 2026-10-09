# ParcelHub Mobile Client (Student & Recipient)

A React Native (Expo) mobile client built for the **ParcelHub** asynchronous micro-logistics escrow system at **CTU Danao Campus**.

---

## 🏛 System Architecture & Invariants

The mobile client is the primary **Client Interface (Recipient)** defined in `CONTEXT.md` and `ARCHITECTURE_CONTEXT.md`:

```
[ External Domain ]          [ Escrow Intermediary ]             [ Internal Domain ]
  Courier / Rider   <------->  Staff Terminal / Hub Node   <----->  Student Mobile Client
 (Waybill + COD Only)          (Verification & Disbursal)            (App / Auth / Claim Token)
```

### Core Invariants Enforced

1. **Solvency Invariant (Zero-Credit Escrow):**
   - Recipient pre-registers the parcel (`STAGED`).
   - Counter staff cannot disburse funds to couriers unless physical cash is deposited in the isolated parcel envelope (`cash_deposited >= cod_amount`).
2. **State Progression Invariant (Monotonic Flow):**
   - Parcels follow strict state transitions: `STAGED -> FUNDED -> RECEIVED_LOGGED -> CLAIMED`.
3. **Release Invariant (Inverted Handshake):**
   - When a parcel reaches `RECEIVED_LOGGED`, the student receives an instant Expo Push Notification.
   - At the counter, the student scans the station's physical printable QR code (`CTU-DANAO-MAIN-HUB`) and enters their 6-digit MPIN.
   - This dispatches a claim ping (`claim_pinged_at = NOW()`) directly to the active Staff Terminal queue for atomic handover.
4. **Physical Envelope Isolation:**
   - Pre-calculated change (`cash_deposited - cod_amount`) is tracked and handed back to the student at pickup.
5. **Identity Decoupling (Zero-Knowledge):**
   - Student identities, school IDs, and MPINs are never exposed to external delivery riders.

---

## 🎨 Design System Implementation

Conforms strictly to `DESIGN_CONTEXT.md` specifications:
- **60-30-10 Color Rule**:
  - `60%`: Canvas `#F8FAFC`, card surfaces `#FFFFFF`, input fills `#F1F5F9`, hero `#0F172A`.
  - `30%`: Structural text `#0F172A`, field labels `#475569`, muted text `#94A3B8`, borders `#E2E8F0`.
  - `10%`: Brand accents `#2563EB`, active tap `#1D4ED8`, success `#DCFCE7` / `#15803D`, warning `#FEF3C7` / `#B45309`.
- **Hyper-Rounded Language**:
  - Buttons & Keypads: `rounded-full` (`9999px`)
  - Hero Card & Camera Viewfinder: `rounded-3xl` (`28px`)
  - Cards: `rounded-2xl` (`20px`)
  - Inputs: `rounded-2xl` (`16px`)
- **Keypad & Inputs**:
  - MPIN keypad uses solid filled circular keys (`w-16 h-16 rounded-full bg-slate-100`), **never** hollow wireframe outlines.
  - Form inputs use solid tinted containers with top uppercase micro-labels, **never** notched cutout outlines.
- **Floating Navigation Dock**:
  - Floats above the screen bottom with rounded-full pill styling and unread alert badges.

---

## 📁 Directory Structure

```
mobile/
├── App.tsx                      # Root component managing navigation & providers
├── app.json                     # Expo configuration & app permissions
├── index.js                     # Root entry registration
├── package.json                 # Dependencies (Expo, Supabase, Camera, Notifications)
├── tsconfig.json                # TypeScript paths and config
├── .env.example                 # Environment template
├── assets/                      # Application icons & splash assets
└── src/
    ├── constants/
    │   ├── theme.ts             # 60-30-10 colors, radius hierarchy, typography
    │   └── config.ts            # Supported couriers, campus station defaults
    ├── types/
    │   ├── database.ts          # Database schema & FSM enum types
    │   ├── parcel.ts            # Parcel domain types & status mapping
    │   └── auth.ts              # User profile & claim payload types
    ├── services/
    │   ├── supabase.ts          # Supabase client setup
    │   ├── parcelService.ts     # Pre-registration, parcel list, claim dispatch
    │   ├── pushService.ts       # Expo push token registration & notifications
    │   └── authService.ts       # Student credentials & MPIN verification
    ├── components/
    │   ├── common/
    │   │   ├── Button.tsx       # Pill button (rounded-full) with press animation
    │   │   ├── Input.tsx        # Pill input with clean uppercase label
    │   │   ├── StatusBadge.tsx  # Rounded-full semantic status badge
    │   │   └── Card.tsx         # Soft rounded-2xl container
    │   ├── home/
    │   │   ├── HeroMetricCard.tsx # Deep slate card with active orders & quick actions
    │   │   └── ParcelCard.tsx     # Activity card with monospace waybill & status
    │   ├── mpin/
    │   │   └── MpinKeypad.tsx   # Filled circular keypad (w-16 h-16) & pin dots
    │   ├── scanner/
    │   │   └── HubQrScannerModal.tsx # Camera viewfinder for physical hub QR scan
    │   └── navigation/
    │       └── FloatingTabBar.tsx # Floating island bottom navigation dock
    └── screens/
        ├── HomeScreen.tsx       # Active counter, quick actions, ready banner
        ├── PreRegisterScreen.tsx# Pre-registration form (STAGED)
        ├── ClaimHandshakeScreen.tsx # Hub QR + 6-Digit MPIN claim handshake
        ├── OrdersScreen.tsx     # Filterable orders list with FSM stepper
        ├── AlertsScreen.tsx     # Notification audit feed
        └── ProfileScreen.tsx    # Student ID, MPIN security & invariant rules
```

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your Supabase project credentials:
   ```bash
   cp .env.example .env
   ```

3. **Start Expo Development Server**:
   ```bash
   npm start
   ```
   - Press `w` to run in web browser.
   - Scan the QR code using the **Expo Go** app on iOS or Android.
