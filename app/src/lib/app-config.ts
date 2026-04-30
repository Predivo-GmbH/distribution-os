/* ============================================================
   App Configuration — Single source of truth for brand & URLs
   Change APP_NAME here for rebrand. Set VITE_APP_URL in .env.
   ============================================================ */

export const APP_NAME = 'ShipSolo'

export const APP_URL =
  import.meta.env.VITE_APP_URL || 'https://distributionos.predivo.ch'
