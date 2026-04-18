type RuntimeEnv = Partial<{
    VITE_API_URL: string;
    VITE_GOOGLE_CLIENT_ID: string;
    VITE_GOOGLE_REDIRECT_URI: string;
    VITE_GOOGLE_AUTH_URI: string;
    VITE_SITE_URL: string;
    VITE_SUPPORT_FACEBOOK_URL: string;
}>;

export function getRuntimeEnv(): RuntimeEnv {
    const w = window as unknown as { __ENV__?: RuntimeEnv };
    return w.__ENV__ ?? {};
}

export function getSupportFacebookUrl(): string {
    const env = getRuntimeEnv();
    const fromWindow = env.VITE_SUPPORT_FACEBOOK_URL?.trim();
    const fromVite = (import.meta.env.VITE_SUPPORT_FACEBOOK_URL as string | undefined)?.trim();
    return fromWindow || fromVite || "";
}

