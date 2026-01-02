"use client";

import Sidebar from '@/components/Layout/Sidebar';
import OnboardingTour from '@/components/Onboarding/OnboardingTour';
import { AuthProvider } from '@/context/AuthContext';
import AuthGuard from '@/components/Auth/AuthGuard';

export default function AppLayout({ children }) {
    return (
        <AuthProvider>
            <AuthGuard>
                <div className="flex h-screen w-full overflow-hidden bg-background relative">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto overflow-x-hidden relative h-full">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background pointer-events-none" />
                        <div className="relative z-10 min-h-full p-6 lg:p-10 max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                    <OnboardingTour />
                </div>
            </AuthGuard>
        </AuthProvider>
    );
}
