import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useFocusStore } from '@/store/useFocusStore';
import { Lock, ArrowRight, Zap } from 'lucide-react';
import clsx from 'clsx';

export default function TaskLockIn() {
    const { user } = useAuth();
    const { setTask, startSession } = useFocusStore();
    const [queue, setQueue] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [isLocking, setIsLocking] = useState(false);

    useEffect(() => {
        if (user) fetchQueue();
    }, [user]);

    const fetchQueue = async () => {
        const { data } = await supabase
            .from('tasks')
            .select('*')
            .neq('status', 'completed')
            .order('priority', { ascending: false }) // Prioritize High
            .limit(5);

        if (data) {
            setQueue(data);
            if (data.length > 0) setSelectedTaskId(data[0].id);
        }
    };

    const handleLockIn = () => {
        if (!selectedTaskId) return;
        setIsLocking(true);

        const task = queue.find(t => t.id === selectedTaskId);
        setTask(task);

        // Dramatic pause before start
        setTimeout(() => {
            startSession();
        }, 1500);
    };

    return (
        <motion.div
            className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto px-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <h2 className="text-3xl font-bold text-white mb-2">Select Your Target</h2>
            <p className="text-zinc-500 mb-10">One task. Absolute focus.</p>

            <div className="w-full space-y-3 mb-12">
                {queue.map(task => (
                    <motion.div
                        key={task.id}
                        onClick={() => !isLocking && setSelectedTaskId(task.id)}
                        className={clsx(
                            "p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group",
                            selectedTaskId === task.id
                                ? "bg-zinc-800 border-blue-500 ring-1 ring-blue-500/50"
                                : "bg-zinc-900/50 border-white/5 hover:bg-zinc-800/80"
                        )}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <div className="flex justify-between items-center relative z-10">
                            <span className={clsx(
                                "font-medium text-lg",
                                selectedTaskId === task.id ? "text-white" : "text-zinc-400"
                            )}>{task.title}</span>

                            {task.energy === 'high' && <Zap size={16} className="text-amber-500" />}
                        </div>

                        {selectedTaskId === task.id && (
                            <motion.div
                                layoutId="selectionGlow"
                                className="absolute inset-0 bg-blue-500/5 pointer-events-none"
                            />
                        )}
                    </motion.div>
                ))}
            </div>

            <motion.button
                onClick={handleLockIn}
                disabled={!selectedTaskId || isLocking}
                className={clsx(
                    "group relative px-12 py-5 rounded-full font-bold text-lg tracking-wide transition-all overflow-hidden",
                    isLocking ? "bg-blue-600 text-white cursor-wait" : "bg-white text-black hover:scale-105"
                )}
                whileTap={{ scale: 0.95 }}
            >
                <div className="relative z-10 flex items-center gap-3">
                    {isLocking ? (
                        <>
                            <Lock size={20} className="animate-pulse" /> Locking Target...
                        </>
                    ) : (
                        <>
                            Lock In Task <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </div>

                {/* Progress Fill on Locking */}
                {isLocking && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 bg-blue-500 z-0"
                    />
                )}
            </motion.button>
        </motion.div>
    );
}
