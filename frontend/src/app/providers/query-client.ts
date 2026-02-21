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
            retry: (failureCount, error: any) => {
                if (error.response?.status === 400 || error.response?.status === 500) {
                    return false;
                } else {
                    return failureCount < 3;
                }
            },
        },mutations: {
                retry: false,
            },
    },
});