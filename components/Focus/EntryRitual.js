import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusStore } from '@/store/useFocusStore';

const MANTRAS = [
    "Prepare to forge.",
    "Remove distractions.",
    "One task. One outcome."
];

export default function EntryRitual() {
    const setPhase = useFocusStore(state => state.setPhase);
    const [mantraIndex, setMantraIndex] = useState(0);

    useEffect(() => {
        // Cycle mantras
        const interval = setInterval(() => {
            setMantraIndex(prev => {
                if (prev < MANTRAS.length - 1) return prev + 1;
                return prev;
            });
        }, 2000);

        // Auto-advance to Lock-In after sequence
        const timeout = setTimeout(() => {
            setPhase('lock-in');
        }, 6500);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [setPhase]);

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, duration: 1 }}
        >
            {/* Breathing Background */}
            <motion.div
                className="absolute inset-0 bg-blue-900/10"
                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Central Circle */}
            <motion.div
                className="w-64 h-64 rounded-full border border-white/10 flex items-center justify-center relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <div className="absolute inset-0 rounded-full border border-blue-500/30 blur-[2px]" />
                <motion.div
                    className="w-32 h-32 bg-white/5 rounded-full blur-2xl"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
            </motion.div>

            {/* Mantras */}
            <div className="absolute bottom-1/3 h-12 flex items-center justify-center w-full">
                <AnimatePresence mode='wait'>
                    <motion.p
                        key={mantraIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-2xl font-light tracking-[0.2em] text-zinc-300 uppercase"
                    >
                        {MANTRAS[mantraIndex]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
