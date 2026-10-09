# ParcelHub Staff Counter Terminal (`/web`)

Desktop Counter Web Portal for the **ParcelHub** asynchronous micro-logistics escrow system at **CTU Danao Campus**.

Built with **Next.js (App Router)**, **TypeScript**, **Google Gemini 3.5 Flash-Lite**, and **Supabase**, designed for continuous terminal operation at campus entry desks and ready for 1-click deployment on **Vercel**.

---

## 🏛 System Architecture & Workflows

The web counter portal acts as the physical and transactional intermediary (**Operator Interface / Hub Node**) described in `ARCHITECTURE_CONTEXT.md` and `INVARIANTS.md`:

```
[ External Courier ]      [ Staff Desk Terminal (Next.js) ]      [ Student Client (Expo) ]
   (Waybill & COD)   <--->    (Verification & Disbursal)    <--->  (Station QR & MPIN Ping)
```

### Key Operations Implemented:

1. **Inverted Claim Handshake Queue (Live Listener)**:
   - Real-time queue listening for student pickup requests.
   - Highlights students who scanned the physical stationary Hub QR code and authorized with their 6-digit MPIN.
   - Reconciles envelope change due (`cash_deposited - cod_amount`).
   - Executes atomic claim commit, verifying visual log existence and closing the cash envelope.
2. **Courier Arrival & Visual Intake Logging (`FUNDED -> RECEIVED_LOGGED`)**:
   - Matches arrival waybill against funded envelopes.
   - Disburses exact COD cash to courier (enforces Zero-Knowledge Perimeter).
   - Optical counter camera capture via live WebRTC stream or image upload.
   - **Google Gemini 3.5 Flash-Lite Multimodal Audit**: OCR waybill extraction, box detection, and package condition assessment (`INTACT`, `DAMAGED`, `TAMPERED`).
   - Automatically fires HTTPS POST to **Expo Push API** (`https://exp.host/--/api/v2/push/send`) to ping the student immediately.
3. **Physical Cash-In & Envelope Staging (`STAGED -> FUNDED`)**:
   - Enforces **Solvency Invariant**: Blocks transition unless `cash_deposited >= cod_amount`.
   - Computes change enclosed and generates printable physical envelope slips.
4. **Printable Station Assets**:
   - Printable Stationary Hub QR Code poster for `CTU-DANAO-MAIN-HUB` ready to mount on desk counters.
   - Printable envelope labels.

---

## 🚀 Running Locally

1. Navigate to the `web` folder:
   ```bash
   cd web
   ```

2. Install dependencies (already installed):
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the desk terminal.

---

## ☁️ Deploying to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. In the **Vercel Dashboard**, click **Add New Project** and import the repository.
3. **Configure Project Settings**:
   - **Root Directory**: `web`
   - **Framework Preset**: Next.js
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
4. **Environment Variables**:
   Add the following in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `GEMINI_API_KEY`: Google AI Studio API Key (for Gemini 3.5 Flash-Lite multimodal analysis)
   - `NEXT_PUBLIC_DEFAULT_STATION_CODE`: `CTU-DANAO-MAIN-HUB`
5. Click **Deploy**.
