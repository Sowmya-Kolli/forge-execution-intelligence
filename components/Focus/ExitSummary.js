import { motion } from 'framer-motion';
import { useFocusStore } from '@/store/useFocusStore';
import { supabase } from '@/lib/supabase';
import { ArrowUnset, RotateCcw, Home, TrendingUp, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ExitSummary() {
    const { user } = useAuth();
    const { intensity, distractions, activeTask, resetSession, timer, history, stats } = useFocusStore();

    // Save session on mount
    useEffect(() => {
        if (!user || !activeTask) return;

        async function saveSession() {
            // Mark task complete in DB
            await supabase.from('tasks')
                .update({ status: 'completed' })
                .eq('id', activeTask.id);

            // NOTE: Future: Save session stats like intensity/distractions to a 'sessions' table
        }
        saveSession();
    }, [user, activeTask]);

    const handleReturn = () => {
        resetSession();
        window.location.href = '/app/planner';
    };

    // Generate Insight based on data
    const getInsight = () => {
        if (!history.length) return "Focus forged.";
        const intensity = history[0].averageIntensity;
        if (intensity > 90) return "Exceptional focus achieved.";
        if (intensity > 75) return "Strong momentum built.";
        return "Consistency is key.";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-black to-black p-6">

            <motion.div
                className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Top Glow & Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />

                <div className="p-8 relative z-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider mb-4">
                            <CheckCircle size={12} />
                            Session Complete
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Task Forged</h2>
                        <div className="text-zinc-400 text-sm font-medium truncate max-w-[280px] mx-auto">
                            {activeTask?.title || "Focus Session"}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    {history.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <motion.div
                                className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Time</span>
                                <span className="text-2xl font-bold text-white">{history[0].duration}m</span>
                            </motion.div>
                            <motion.div
                                className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <span className="text-blue-500/70 text-[10px] uppercase font-bold tracking-wider mb-1">Intensity</span>
                                <span className="text-2xl font-bold text-blue-400">{Math.round(history[0].averageIntensity)}%</span>
                            </motion.div>
                            <motion.div
                                className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center col-span-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <span className="text-amber-500/70 text-[10px] uppercase font-bold tracking-wider mb-1">XP Earned</span>
                                <span className="text-2xl font-bold text-amber-400">+{Math.floor(history[0].duration * (history[0].averageIntensity / 10))} XP</span>
                            </motion.div>
                        </div>
                    )}

                    {/* Insight / Divider */}
                    <div className="text-center mb-8">
                        <p className="text-xs text-zinc-500 italic">"{getInsight()}"</p>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                    {/* Actions - Post Delay */}
                    <motion.div
                        className="flex flex-col gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                    >
                        <button
                            onClick={() => {
                                resetSession(); // Clears active task, resets timer
                                useFocusStore.getState().setPhase('entry'); // Go to entry to pick next
                            }}
                            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={18} /> Forge Next Task
                        </button>

                        <button
                            onClick={() => {
                                resetSession();
                                window.location.href = '/app/planner';
                            }}
                            className="w-full py-4 bg-transparent text-zinc-400 font-bold rounded-xl hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <Home size={16} /> Return to Planner
                        </button>
                    </motion.div>

                </div>
            </motion.div>
        </div>
    );
}
