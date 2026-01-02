"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Info,
    Calendar,
    Zap,
    GitGraph,
    BarChart2,
    Settings,
    Hexagon,
    LogOut,
    HelpCircle
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { label: 'Planner', path: '/app/planner', icon: Calendar },
    { label: 'Focus Mode', path: '/app/focus', icon: Zap },
    { label: 'Structure', path: '/app/structure', icon: GitGraph },
    { label: 'Analytics', path: '/app/analytics', icon: BarChart2 },
];

import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside className="w-20 lg:w-64 h-full border-r border-white/5 bg-zinc-900/50 backdrop-blur-xl flex flex-col justify-between py-6 px-3 lg:px-4 z-50 transition-all duration-300">
            <div>
                <div className="flex items-center gap-3 mb-10 px-2 lg:px-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20" />
                        <Hexagon className="text-white relative z-10" size={28} strokeWidth={1.5} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white hidden lg:block">FORGE</span>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={clsx(
                                    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                    isActive
                                        ? "text-white"
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white/10 rounded-lg border border-white/5"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} className="relative z-10" />
                                <span className="text-sm font-medium relative z-10 hidden lg:block">{item.label}</span>

                                {isActive && (
                                    <div className="absolute right-2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)] hidden lg:block" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="px-2">
                <button
                    onClick={() => window.dispatchEvent(new Event('replay-tour'))}
                    className="flex items-center gap-3 p-3 w-full rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors group mb-1"
                >
                    <HelpCircle size={20} strokeWidth={1.5} />
                    <span className="text-sm font-medium hidden lg:block">Replay Guide</span>
                </button>
                <Link
                    href="/app/settings"
                    className={clsx(
                        "flex items-center gap-3 p-3 w-full rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors group mb-1",
                        pathname === '/app/settings' && "bg-white/10 text-white"
                    )}
                >
                    <Settings size={20} strokeWidth={1.5} />
                    <span className="text-sm font-medium hidden lg:block">Settings</span>
                </Link>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 p-3 w-full rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors group"
                >
                    <LogOut size={20} strokeWidth={1.5} />
                    <span className="text-sm font-medium hidden lg:block">Log Out</span>
                </button>
            </div>
        </aside>
    );
}
