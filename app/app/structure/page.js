"use client";

import { useState, useEffect } from 'react';
import { ArrowRight, Layers, Box, Zap, Battery, Clock, CheckCircle, AlertOctagon, Calendar, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function StructurePage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchTasks();
        }
    }, [user]);

    const fetchTasks = async () => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .neq('status', 'completed')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTasks(data || []);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    // Grouping Logic for "Cockpit" View
    // 1. High Priority / Overdue (Critical)
    // 2. Today (Standard)
    // 3. Upcoming (Low/Backlog)
    const groupedTasks = {
        critical: tasks.filter(t => t.priority === 'high'),
        today: tasks.filter(t => t.priority === 'medium'),
        upcoming: tasks.filter(t => t.priority === 'low')
    };

    return (
        <div className="space-y-8 h-[calc(100vh-140px)] flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="flex flex-col gap-2 pt-4">
                <motion.h1
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-black tracking-tight text-white"
                >
                    <span className="bg-gradient-to-r from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
                        Command Center
                    </span>
                </motion.h1>
                <div className="flex items-center justify-between">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-zinc-400 font-medium max-w-xl"
                    >
                        Review your priorities and align your trajectory.
                    </motion.p>

                    {/* Status/Meta - Optional */}
                    <div className="hidden md:flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Critical: {groupedTasks.critical.length}</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Active: {groupedTasks.today.length}</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-zinc-500" /> backlog: {groupedTasks.upcoming.length}</div>
                    </div>
                </div>
            </header>

            {/* Main Columns Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 min-h-0 pb-8">

                {/* 1. CRITICAL LANE */}
                <ProjectLane
                    title="Critical Attention"
                    icon={AlertOctagon}
                    tasks={groupedTasks.critical}
                    theme="red"
                    delay={0.1}
                    emptyMsg="No critical items. Clear horizon."
                />

                {/* 2. ACTIVE / TODAY LANE */}
                <ProjectLane
                    title="Active Workflow"
                    icon={Layers}
                    tasks={groupedTasks.today}
                    theme="blue"
                    delay={0.2}
                    emptyMsg="No active tasks queued."
                />

                {/* 3. UPCOMING / BACKLOG LANE */}
                <ProjectLane
                    title="Backlog & Future"
                    icon={Calendar}
                    tasks={groupedTasks.upcoming}
                    theme="zinc"
                    delay={0.3}
                    emptyMsg="Backlog empty."
                />
            </div>
        </div>
    );
}

function ProjectLane({ title, icon: Icon, tasks, theme, delay, emptyMsg }) {
    const themes = {
        red: {
            header: "text-red-400 border-red-500/10",
            bg: "bg-gradient-to-b from-red-500/5 to-transparent",
            cardBorder: "hover:border-red-500/30",
            accent: "bg-red-500",
            iconBg: "bg-red-500/10"
        },
        blue: {
            header: "text-blue-400 border-blue-500/10",
            bg: "bg-gradient-to-b from-blue-500/5 to-transparent",
            cardBorder: "hover:border-blue-500/30",
            accent: "bg-blue-500",
            iconBg: "bg-blue-500/10"
        },
        zinc: {
            header: "text-zinc-400 border-zinc-500/10",
            bg: "bg-gradient-to-b from-zinc-500/5 to-transparent",
            cardBorder: "hover:border-zinc-500/30",
            accent: "bg-zinc-500",
            iconBg: "bg-zinc-500/10"
        }
    };

    const t = themes[theme];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={clsx(
                "flex flex-col h-full rounded-2xl border border-white/5 overflow-hidden backdrop-blur-xl",
                t.bg
            )}
        >
            {/* Header */}
            <div className={clsx("p-6 border-b flex items-center gap-3", t.header)}>
                <div className={clsx("p-2 rounded-lg", t.iconBg)}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
                <span className="ml-auto text-xs font-mono opacity-50">{tasks.length}</span>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {tasks.length > 0 ? (
                    tasks.map((task, i) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: delay + (i * 0.05) }}
                            whileHover={{ y: -4, scale: 1.01, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}
                            className={clsx(
                                "group bg-zinc-900 border border-white/5 rounded-xl p-5 cursor-pointer relative overflow-hidden transition-all duration-300",
                                t.cardBorder
                            )}
                        >
                            <div className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className={clsx("h-full w-full", t.accent)} />
                            </div>

                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-zinc-200 text-sm leading-relaxed group-hover:text-white transition-colors">
                                    {task.title}
                                </h4>
                                {theme === 'red' && <AlertOctagon size={14} className="text-red-400 shrink-0 mt-0.5" />}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                                <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded">
                                    <Clock size={12} />
                                    <span>{task.duration}m</span>
                                </div>

                                <span className={clsx(
                                    "px-2 py-1 rounded border",
                                    task.energy === 'high' ? "border-amber-500/20 text-amber-500 bg-amber-500/5" :
                                        "border-zinc-700 bg-zinc-800"
                                )}>
                                    {task.energy === 'high' ? 'High Energy' : 'Normal'}
                                </span>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-zinc-700 gap-2">
                        <ListFilter size={24} />
                        <span className="text-xs font-medium">{emptyMsg}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
