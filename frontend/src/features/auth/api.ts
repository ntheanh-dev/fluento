import type { LoginInput, LoginOutput, RegisterInput, RegisterOutput, OAuthOutput } from "../../entities/auth/schema";
import { createRestClient } from "../../shared/api/rest-client";

const BASE = "/auth";

export const login = (payload: LoginInput): Promise<LoginOutput> => {
    return createRestClient<LoginOutput>(`${BASE}/token`, payload);
};

export const register = (payload: RegisterInput): Promise<RegisterOutput> => {
    return createRestClient<RegisterOutput>(`${BASE}/register`, payload);
};

export const oauthAuthenticate = (code: string): Promise<OAuthOutput> => {
    const endpoint = `${BASE}/outbound/authentication?code=${code}`;    
    return createRestClient<OAuthOutput>(endpoint, null);
};

export const logout = (accessToken: string): Promise<void> => {
    const endpoint = `${BASE}/logout`;
    return createRestClient<void>(endpoint, { token :accessToken });
};