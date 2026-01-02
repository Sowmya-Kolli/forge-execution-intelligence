"use client";

import { useState, useEffect } from 'react';
import Card from '@/components/UI/Card';
import { User, Bell, CreditCard, Settings, RotateCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';


import { useFocusStore } from '@/store/useFocusStore';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (data) setProfile(data);
            };
            fetchProfile();
        }
    }, [user]);

    const handleReset = async () => {
        if (!confirm("⚠️ PERMANENT RESET ⚠️\n\nThis will delete:\n- All active tasks\n- All history & stats\n- All streaks and badges\n\nAre you sure?")) return;

        try {
            // 1. Clear Supabase Tasks
            const { error } = await supabase.from('tasks').delete().neq('id', 0); // Delete all
            if (error) throw error;

            // 2. Clear Local Storage (Zustand)
            useFocusStore.persist.clearStorage();
            localStorage.clear(); // Safety nuke

            // 3. Reload
            alert("System Reset Complete. Reloading...");
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Reset failed. Check console.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-zinc-400">Manage your account and preferences.</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
                <Card title="Personal Information">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg uppercase">
                            {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{profile?.name || 'Loading...'}</h3>
                            <p className="text-zinc-400">{profile?.role || 'Explorer'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-lg">
                            <label className="text-xs font-semibold text-zinc-500 uppercase block mb-1">Email</label>
                            <div className="text-white">{user?.email || 'N/A'}</div>
                        </div>
                        <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-lg">
                            <label className="text-xs font-semibold text-zinc-500 uppercase block mb-1">Member Since</label>
                            <div className="text-white">{new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                        </div>
                    </div>
                </Card>

                <Card title="Preferences">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-lg hover:bg-zinc-900/50 cursor-pointer transition-colors border border-transparent hover:border-white/5">
                            <div className="flex items-center gap-3">
                                <Bell className="text-zinc-400" size={20} />
                                <div>
                                    <div className="text-sm font-medium text-white">Notifications</div>
                                    <div className="text-xs text-zinc-500">Manage how we contact you</div>
                                </div>
                            </div>
                            <button className="text-xs font-bold text-blue-400">Edit</button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-lg hover:bg-zinc-900/50 cursor-pointer transition-colors border border-transparent hover:border-white/5">
                            <div className="flex items-center gap-3">
                                <CreditCard className="text-zinc-400" size={20} />
                                <div>
                                    <div className="text-sm font-medium text-white">Subscription</div>
                                    <div className="text-xs text-zinc-500">Pro Plan (Active)</div>
                                </div>
                            </div>
                            <button className="text-xs font-bold text-blue-400">Manage</button>
                        </div>
                    </div>
                </Card>

                <Card title="One-Time Maintenance (Pre-Release)">
                    <div className="p-4 border border-red-500/20 bg-red-900/10 rounded-xl flex items-center justify-between">
                        <div className='flex items-center gap-4'>
                            <div className="p-3 bg-red-500/20 rounded-lg text-red-500">
                                <RotateCcw size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-red-200">Factory Reset</h3>
                                <p className="text-xs text-red-300/60">Clear all tasks, stats, and history.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-lg shadow-red-900/20"
                        >
                            Reset System
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
