import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./query-client";
import { Suspense, type PropsWithChildren } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppSpinner } from "@/shared/components/AppSpinner";

const isDEV = import.meta.env.DEV;

export const ReactQueryProvider = ({ children }: PropsWithChildren) => {
    return (
        <QueryClientProvider client={queryClient}>
            <Suspense fallback={<AppSpinner />}>
                {children}
            </Suspense>
            {isDEV && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
        </QueryClientProvider>
    );
};