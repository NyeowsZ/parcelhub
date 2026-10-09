/**
 * ParcelHub Mobile Configuration Constants
 * Aligned with ARCHITECTURE_CONTEXT.md
 */

export const APP_CONFIG = {
  APP_NAME: 'ParcelHub',
  TAGLINE: 'Campus Micro-Logistics Escrow',
  CAMPUS_NAME: 'CTU Danao Campus',
  CURRENCY_SYMBOL: '₱',
  
  // Default Hub Station
  DEFAULT_STATION_CODE: 'CTU-DANAO-MAIN-HUB',
  DEFAULT_STATION_NAME: 'Campus Terminal 1 (Main Gate Desk)',

  // Supported delivery couriers (from Gemini AI Extraction specification)
  SUPPORTED_COURIERS: [
    'J&T Express',
    'ShopeeXpress (SPX)',
    'Flash Express',
    'Lazada (LEX)',
    'NinjaVan',
    'Other / Courier',
  ] as const,

  // MPIN constraints
  MPIN_LENGTH: 6,

  // Invariants summary for user reference
  INVARIANTS: {
    solvency: 'The hub never fronts COD funds. Exact cash must be funded at the counter beforehand.',
    fsm: 'Parcels follow monotonic states: STAGED -> FUNDED -> RECEIVED_LOGGED -> CLAIMED.',
    handshake: 'Pickup requires scanning the hub station QR and authorizing with your 6-digit MPIN.',
    change: 'Pre-calculated change is enclosed in your parcel envelope and handed back at pickup.',
  },
};
