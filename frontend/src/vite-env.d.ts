/// <reference types="vite/client" />

declare global {
  interface Window {
    __ENV__?: {
      VITE_API_URL?: string;
      VITE_GOOGLE_CLIENT_ID?: string;
      VITE_GOOGLE_REDIRECT_URI?: string;
      VITE_GOOGLE_AUTH_URI?: string;
    };
  }
}

export {};
