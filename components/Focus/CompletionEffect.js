import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useFocusStore } from '@/store/useFocusStore';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CompletionEffect() {
    const setPhase = useFocusStore(state => state.setPhase);
    const activeTask = useFocusStore(state => state.activeTask);

    useEffect(() => {
        // Trigger Sparks
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // Spark colors
            confetti({
                ...defaults,
                particleCount,
                colors: ['#fbbf24', '#f59e0b', '#ffffff'], // Gold/White sparks
                shapes: ['square'],
                scalar: 0.5,
                origin: { x: randomInRange(0.3, 0.7), y: randomInRange(0.3, 0.7) }
            });
        }, 250);

        // Update Task Status in Supabase
        if (activeTask?.id) {
            supabase
                .from('tasks')
                .update({ status: 'completed' })
                .eq('id', activeTask.id)
                .then(({ error }) => {
                    if (error) console.error("Failed to sync status:", error);
                });
        }

        // Auto transition to exit
        setTimeout(() => {
            setPhase('exit');
        }, 4000);

        // Play sound if possible (omitted for now)

        return () => clearInterval(interval);
    }, [setPhase, activeTask]);

    return (
        <motion.div
            className="h-full flex flex-col items-center justify-center text-center z-50 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-32 h-32 bg-amber-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_100px_rgba(245,158,11,0.5)]"
            >
                <CheckCircle size={64} className="text-black" />
            </motion.div>

            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-6xl font-bold text-white mb-4 tracking-tighter"
            >
                FORGED.
            </motion.h1>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-zinc-400 max-w-lg"
            >
                <span className="text-white font-bold">"{activeTask?.title}"</span> excecution complete.
            </motion.p>
        </motion.div>
    );
}
