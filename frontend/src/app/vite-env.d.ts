/// <reference types="vite/client" />
// vite/client already declares asset imports (*.png, *.svg, *.pdf, ...).

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Social card design hash (scripts/og/version.mjs), injected by vite.config.ts. */
declare const __OG_VERSION__: string;
