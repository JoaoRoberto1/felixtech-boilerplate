/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_STRIPE_PRICE_ID_PRO?: string;
  readonly VITE_STRIPE_PRICE_ID_TEAM?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
