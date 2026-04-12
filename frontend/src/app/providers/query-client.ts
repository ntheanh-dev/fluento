import { QueryCache, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error) => {
            console.error('Query error:', error);
        },
    }),
    defaultOptions: {
        queries: {
            staleTime: 15000,
            gcTime: 5 * 60000,
            throwOnError: false,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            retry: (failureCount, error: unknown) => {
                const status = (error as { response?: { status?: number } })?.response?.status;
                // Client / permanent errors: retrying wastes time and hurts UX (e.g. 404 × 4).
                if (
                    status === 400 ||
                    status === 401 ||
                    status === 403 ||
                    status === 404 ||
                    status === 500
                ) {
                    return false;
                }
                return failureCount < 3;
            },
        },mutations: {
                retry: false,
            },
    },
});