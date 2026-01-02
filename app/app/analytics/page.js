"use client";

import { useState, useEffect, useMemo } from 'react';
import Card from '@/components/UI/Card';
import { Activity, TrendingUp, Award, BrainCircuit, Zap, Calendar, ArrowUpRight, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useFocusStore } from '@/store/useFocusStore';

export default function AnalyticsPage() {
    const { stats, history, getHeatmapData, getBadges } = useFocusStore();
    const [isHydrated, setIsHydrated] = useState(false);
    const badges = useFocusStore(state => state.badges);

    useEffect(() => setIsHydrated(true), []);

    // --- Computed Data ---
    const heatmapData = useMemo(() => getHeatmapData(), [history]);

    // Consistency Score (0-100)
    const consistencyScore = useMemo(() => {
        if (history.length === 0) return 0;
        const now = new Date();
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const uniqueDays = new Set(history.filter(s => new Date(s.timestamp) > twoWeeksAgo).map(s => s.date)).size;

        // Simple formula: (Days Active / 14) * 60% + (Avg Duration vs 45m target) * 40%
        const freqScore = Math.min(100, (uniqueDays / 10) * 100);
        const durScore = Math.min(100, ((stats.totalMinutes / (uniqueDays || 1)) / 45) * 100);
        return Math.round((freqScore * 0.6) + (durScore * 0.4));
    }, [history, stats]);

    // Trend Data (Last 7 Days)
    const trendData = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const val = history
                .filter(s => s.date === dateStr && s.successful)
                .reduce((acc, s) => acc + s.duration, 0);
            days.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), value: val });
        }
        return days;
    }, [history]);

    if (!isHydrated) return null;

    return (
        <div className="min-h-full pb-32 text-white p-6 md:p-12 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <header className="flex flex-col gap-2">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-black tracking-tight"
                >
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
                        Neural Analytics
                    </span>
                </motion.h1>
                <div className="text-zinc-400 font-medium max-w-xl">
                    Deep insights into your cognitive performance and focus consistency.
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Focus Consistency"
                    value={consistencyScore}
                    suffix="/100"
                    icon={Activity}
                    color="blue"
                    trend={consistencyScore > 80 ? "Top Tier" : "Building Momentum"}
                    delay={0}
                />
                <KPICard
                    title="Current Streak"
                    value={stats.currentStreak}
                    suffix="days"
                    icon={TrendingUp}
                    color="green"
                    trend={`Best: ${stats.longestStreak} days`}
                    delay={0.1}
                />
                <KPICard
                    title="Total Focus"
                    value={(stats.totalMinutes / 60).toFixed(1)}
                    suffix="hours"
                    icon={BrainCircuit}
                    color="purple"
                    trend={`${history.length} sessions completed`}
                    delay={0.2}
                />
                <KPICard
                    title="XP Level"
                    value={stats.level}
                    suffix={`(${stats.xp} XP)`}
                    icon={Zap}
                    color="amber"
                    trend="Mastery Rank"
                    delay={0.3}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main: Trend Chart (Spans 2 cols) */}
                <Card className="lg:col-span-2 min-h-[400px] flex flex-col group hover:border-blue-500/30 transition-colors duration-500">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                Daily Focus Volume
                                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-wider">7 Days</span>
                            </h3>
                        </div>
                    </div>
                    <div className="flex-1 p-8 flex items-end justify-center bg-gradient-to-b from-zinc-900/0 to-blue-900/5">
                        <TrendChart data={trendData} />
                    </div>
                </Card>

                {/* Badges / Motivation */}
                <Card className="flex flex-col h-full hover:border-amber-500/30 transition-colors duration-500">
                    <div className="p-6 border-b border-white/5 bg-zinc-900/50">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            Achievements
                            <span className="text-xs font-normal text-zinc-500 ml-auto">{badges.length} Unlocked</span>
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 gap-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                        <BadgeRow id="streak_3" name="Momentum" desc="3-day streak" unlocked={badges.includes('streak_3')} icon="🔥" delay={0.1} />
                        <BadgeRow id="streak_7" name="7-Day Forge" desc="7-day streak" unlocked={badges.includes('streak_7')} icon="⚡" delay={0.15} />
                        <BadgeRow id="deep_focus" name="Deep Mind" desc="Intensity > 80%" unlocked={badges.includes('deep_focus')} icon="🧠" delay={0.2} />
                        <BadgeRow id="marathon" name="Iron Will" desc="Session > 45m" unlocked={badges.includes('marathon')} icon="🏃" delay={0.25} />
                        <BadgeRow id="perfect" name="Unbreakable" desc="0 Interruptions" unlocked={badges.includes('perfect')} icon="🛡️" delay={0.3} />
                    </div>
                </Card>
            </div>

            {/* Heatmap Section */}
            <Card title="Focus Heatmap" className="hover:border-purple-500/30 transition-colors duration-500">
                <div className="p-8 overflow-x-auto bg-gradient-to-br from-zinc-900/0 to-purple-900/5">
                    <Heatmap data={heatmapData} />
                </div>
            </Card>
        </div>
    );
}

// --- Components ---

function KPICard({ title, value, suffix, icon: Icon, color, trend, delay }) {
    const colors = {
        blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20',
        green: 'from-green-500/20 to-green-600/5 text-green-400 border-green-500/20',
        purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20',
        amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}
            transition={{ delay, duration: 0.5, ease: 'backOut' }}
            className={clsx(
                "relative p-6 rounded-2xl border backdrop-blur-xl flex flex-col justify-between h-36 overflow-hidden cursor-default transition-colors",
                "bg-gradient-to-br border-white/5 bg-zinc-900/40 hover:bg-zinc-800/60"
            )}
        >
            <div className={`absolute top-0 right-0 p-32 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${colors[color]} blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none transition-opacity duration-500`} />

            <div className="flex justify-between items-start z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300 transition-colors">{title}</span>
                <div className={clsx("p-2 rounded-lg bg-white/5 ring-1 ring-white/5", colors[color].split(' ')[2])}>
                    <Icon size={18} />
                </div>
            </div>

            <div className="z-10">
                <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
                    <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: delay + 0.2 }}>
                        {value}
                    </motion.span>
                    <span className="text-sm font-medium text-zinc-500 ml-1">{suffix}</span>
                </div>
                {trend && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-zinc-400 bg-black/20 self-start inline-flex px-2 py-1 rounded-full border border-white/5">
                        <ArrowUpRight size={10} /> {trend}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function TrendChart({ data }) {
    const max = Math.max(...data.map(d => d.value), 60);
    const height = 200;
    const width = 800;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.value / max) * height);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-full flex flex-col justify-end">
            <div className="relative w-full h-[250px] flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        d={`M0,${height} L${points.replace(/ /g, ' L')} L${width},${height} Z`}
                        fill="url(#chartGradient)"
                    />

                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        d={`M${points.replace(/ /g, ' L')}`}
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ filter: 'drop-shadow(0 0 10px rgba(59,130,246,0.5))' }}
                    />

                    {data.map((d, i) => {
                        const x = (i / (data.length - 1)) * width;
                        const y = height - ((d.value / max) * height);
                        return d.value > 0 ? (
                            <motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + (i * 0.1) }}>
                                <circle cx={x} cy={y} r="6" className="fill-zinc-900 stroke-blue-400 stroke-2 hover:fill-blue-400 transition-colors cursor-pointer" />
                                <rect x={x - 25} y={y - 40} width="50" height="24" rx="4" fill="#0f172a" stroke="#1e293b" className="opacity-0 hover:opacity-100 transition-opacity" />
                                <text x={x} y={y - 24} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">{d.value}m</text>
                            </motion.g>
                        ) : null;
                    })}
                </svg>
            </div>

            <div className="flex justify-between w-full mt-4 text-xs font-bold text-zinc-500 uppercase">
                {data.map((d, i) => (
                    <div key={i} className="text-center w-8">{d.label}</div>
                ))}
            </div>
        </div>
    );
}

function BadgeRow({ name, desc, unlocked, icon, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className={clsx(
                "p-3 rounded-xl border flex items-center gap-4 transition-all hover:bg-white/5",
                unlocked ? "bg-amber-500/5 border-amber-500/20" : "bg-transparent border-white/5 opacity-60 hover:opacity-80"
            )}
        >
            <div className={clsx(
                "w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 transition-colors",
                unlocked ? "bg-amber-500/10 text-amber-500" : "bg-zinc-800 text-zinc-600 grayscale"
            )}>
                {icon}
            </div>
            <div className="flex-1">
                <div className={clsx("font-bold text-sm", unlocked ? "text-white" : "text-zinc-400")}>{name}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">{desc}</div>
            </div>
            <div className="text-zinc-600">
                {unlocked ? <Unlock size={14} className="text-amber-500" /> : <Lock size={14} />}
            </div>
        </motion.div>
    );
}

function Heatmap({ data }) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="min-w-[600px] select-none">
            <div className="flex mb-2">
                <div className="w-8 shrink-0" />
                <div className="flex-1 flex justify-between text-[9px] text-zinc-600 uppercase font-bold">
                    {hours.filter(h => h % 3 === 0).map(h => <div key={h}>{h}:00</div>)}
                </div>
            </div>
            <div className="flex flex-col gap-1">
                {days.map((day, dIdx) => (
                    <div key={day} className="flex items-center gap-1 group/row">
                        <div className="w-8 shrink-0 text-[10px] font-bold text-zinc-500 uppercase group-hover/row:text-zinc-300 transition-colors">{day}</div>
                        <div className="flex-1 flex gap-1 h-8">
                            {hours.map(h => {
                                const val = data[`${dIdx}-${h}`] || 0;
                                const intensity = Math.min(1, val / 45);
                                return (
                                    <div
                                        key={h}
                                        className={clsx(
                                            "flex-1 rounded-sm transition-all duration-300 relative group/cell",
                                            val > 0 ? "bg-blue-500 hover:scale-125 hover:z-10 hover:shadow-lg hover:shadow-blue-500/40" : "bg-zinc-900 hover:bg-zinc-800"
                                        )}
                                        style={{ opacity: val > 0 ? 0.2 + (intensity * 0.8) : 0.4 }}
                                    >
                                        {val > 0 && (
                                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 text-[10px] text-white px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover/cell:opacity-100 pointer-events-none z-20">
                                                {val} mins
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
