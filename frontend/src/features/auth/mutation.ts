import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, register, oauthAuthenticate, logout } from "./api";
import { OK } from "../../shared/api/query-keys";
import type { LoginInput, LoginOutput, RegisterInput, RegisterOutput, OAuthOutput } from "../../entities/auth/schema";
import Cookies from "js-cookie";

export function useLoginMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: LoginInput) => login(payload),
        onSuccess: async (data : LoginOutput) => {
            qc.setQueryData([OK.AUTH_USER], data);
        },
    });
}

export function useRegisterMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: RegisterInput) => register(payload),
        onSuccess: async (data : RegisterOutput) => {
            qc.setQueryData([OK.AUTH_USER], data);
        },
    });
}

export function useOAuthAuthenticateMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (code: string) => oauthAuthenticate(code),
        onSuccess: (data: OAuthOutput) => {
            qc.setQueryData([OK.OAUTH_AUTHENTICATE], data);
        },
    });
}

export function useLogoutMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (accessToken: string) => logout(accessToken),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [OK.AUTH_USER] });
            Cookies.remove("accessToken");
        },
    });
}

