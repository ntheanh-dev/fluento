import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./query-client";
import { Suspense, type PropsWithChildren } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const isDEV = import.meta.env.DEV;

export const ReactQueryProvider = ({ children }: PropsWithChildren) => {
    return (
        <QueryClientProvider client={queryClient}>
            <Suspense fallback={<Spin indicator={<LoadingOutlined />} />}>
                {children}
            </Suspense>
            {isDEV && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />}
        </QueryClientProvider>
    );
};