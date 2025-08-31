import React from 'react';
import Header from './Header';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <Header/>
            <div className="h-screen pt-16">{children}</div>
        </>
    );
};
