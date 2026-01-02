"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useFocusStore } from '@/store/useFocusStore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const ensureProfile = async (user) => {
        if (!user) return;

        // Helper to wait
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Retry loop to allow backend triggers to run (common in Supabase)
        for (let i = 0; i < 3; i++) {
            try {
                const { data, error } = await supabase.from('profiles').select('id').eq('id', user.id).single();

                if (data) return; // Profile exists, all good

                if (error && error.code !== 'PGRST116') {
                    console.warn("Profile check error:", error.message);
                }

                // If not found, wait and retry
                if (i < 2) await delay(500);
            } catch (err) {
                console.error("Profile check failed", err);
            }
        }

        // Fallback: Attempt manual creation if strict RLS allows it
        // If this fails with 42501, we assume the backend is locked down and ignore it.
        try {
            console.log("Attempting manual profile creation (fallback)...");
            const { error: insertError } = await supabase.from('profiles').upsert([
                {
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Explorer'
                }
            ], { onConflict: 'id', ignoreDuplicates: true });

            if (insertError) {
                if (insertError.code === '42501') {
                    console.log("Manual profile creation blocked by RLS. Assuming valid server-side restrictions.");
                } else if (insertError.code === '23503') {
                    // Foreign Key Violation: The user.id doesn't exist in auth.users
                    console.error("Critical: User ID missing in auth.users. Session is invalid. Force signing out.");
                    await supabase.auth.signOut();
                    window.location.href = '/';
                } else {
                    console.error("Failed to create profile:", JSON.stringify(insertError, null, 2));
                }
            }
        } catch (err) {
            console.error("Critical profile creation error:", err);
        }
    };

    useEffect(() => {
        // Check active session
        const initSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    if (error.message.includes('Refresh Token') || error.message.includes('refresh_token_not_found')) {
                        console.warn("Detected invalid refresh token. Clearing session...");
                        await supabase.auth.signOut();
                        setUser(null);
                        return;
                    }
                    console.error("Supabase Auth Error:", error);
                }

                if (session?.user) {
                    // Critical: Check for Email Confirmation
                    if (!session.user.email_confirmed_at && !session.user.confirmed_at) {
                        console.warn("User email not confirmed. Denying access.");
                        await supabase.auth.signOut();
                        setUser(null);
                        return;
                    }

                    setUser(session.user);
                    await ensureProfile(session.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                if (err.message && (err.message.includes('Refresh Token') || err.message.includes('refresh_token_not_found'))) {
                    console.warn("Caught critical auth error. Resetting...");
                    await supabase.auth.signOut();
                    setUser(null);
                } else {
                    console.error("Unexpected Auth Error:", err);
                }
            } finally {
                setLoading(false);
            }
        };
        initSession();


        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                // Critical: Clear data on logout
                setUser(null);
                setLoading(false);
                try {
                    useFocusStore.persist.clearStorage();
                    localStorage.removeItem('forge-storage');
                } catch (e) { /* Ignore */ }
                return;
            }

            // Enforce Confirmation on Auth Change (e.g. after signup auto-login attempt)
            if (session?.user && !session.user.email_confirmed_at && !session.user.confirmed_at) {
                console.warn("Session detected but email unconfirmed. Forcing logout.");
                await supabase.auth.signOut();
                setUser(null);
                setLoading(false);
                return;
            }

            setUser(session.user);
            await ensureProfile(session.user);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) await ensureProfile(data.user);
        router.push('/app/planner');
    };

    const signup = async (email, password, name) => {
        // 1. Hygienic Logout: Ensure we never sign up "on top" of an existing session
        await supabase.auth.signOut();

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
                // Force email confirmation flow if Supabase requires it
                emailRedirectTo: `${window.location.origin}/app/planner`
            }
        });

        if (error) throw error;

        // 2. Handling the response
        // Even if Supabase returns a session (auto-login enabled), we check confirmation status.
        // If the user isn't confirmed, we force logout and show the message.
        if (data.session && (data.user?.email_confirmed_at || data.user?.confirmed_at)) {
            // Already confirmed? (Rare, maybe dev mode or settings)
            console.log("User already confirmed. Logging in...");
            await ensureProfile(data.user);
            router.push('/app/planner');
        } else {
            // Standard Flow: Email confirmation required
            if (data.session) {
                // If we got a session but aren't confirmed, kill it.
                await supabase.auth.signOut();
            }
            alert("Confirmation email sent! Please check your inbox to confirm your account.");
            // Stay on landing page, user must verify email first.
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        // 3. Clear Local State
        localStorage.removeItem('forge-storage'); // Clear persisted zustand store
        window.location.href = '/'; // Hard reload to clear in-memory state
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
