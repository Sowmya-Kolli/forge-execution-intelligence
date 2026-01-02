import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusStore } from '@/store/useFocusStore';

const MANTRAS = [
    "Prepare to forge.",
    "Remove distractions.",
    "One task. One outcome."
];

export default function EntryOverlay() {
    const setPhase = useFocusStore(state => state.setPhase);
    const [mantraIndex, setMantraIndex] = useState(0);

    useEffect(() => {
        // Cycle mantras every 2s for a slower, more cinematic feel
        const interval = setInterval(() => {
            setMantraIndex(prev => {
                if (prev < MANTRAS.length - 1) return prev + 1;
                return prev;
            });
        }, 2000);

        // Auto-advance to Lock-In after sequence (approx 6s total)
        const timeout = setTimeout(() => {
            setPhase('lock-in');
        }, 6500);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [setPhase]);

    // Text Gradient Classes based on index (Cool -> Warm)
    const textGradients = [
        "from-blue-400 to-indigo-500",    // Phase 1: Cool/Calm
        "from-indigo-400 to-purple-500",  // Phase 2: Transition
        "from-purple-400 to-orange-500"   // Phase 3: Heat/Intensity
    ];

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, duration: 1 }}
        >
            {/* 1. Cinematic Background Energy */}
            <div className="absolute inset-0 bg-black">
                {/* Slow Moving Gradients */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-black to-purple-950/40"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />

                {/* Noise Overlay */}
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opactiy='1'/%3E%3C/svg%3E")` }} />

                {/* Energy Streaks */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent blur-sm"
                    animate={{ width: ['0%', '100%', '0%'], opacity: [0, 0.5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* 2. The Forge Ring - 3D layering */}
            <div className="relative mb-24 perspective-[1000px]">
                {/* Inner Heat Glow */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-blue-500/30 blur-[80px]"
                    animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 4, repeat: Infinity }}
                />

                {/* Outer Ring (Faint) */}
                <motion.div
                    className="w-80 h-80 rounded-full border border-white/5 opacity-50"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, ease: "linear", repeat: Infinity }}
                />

                {/* Middle Ring (Pulse) */}
                <motion.div
                    className="absolute inset-0 m-auto w-64 h-64 rounded-full border border-indigo-500/20"
                    animate={{ scale: [1, 1.05, 1], borderColor: ['rgba(99,102,241,0.2)', 'rgba(99,102,241,0.4)', 'rgba(99,102,241,0.2)'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Core Ring (Bright) */}
                <motion.div
                    className="absolute inset-0 m-auto w-48 h-48 rounded-full border-2 border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, borderColor: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)'] }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-full" />
                </motion.div>
            </div>


            {/* 3. Cinematic Text Sequence */}
            <div className="absolute top-1/2 left-0 right-0 h-24 flex items-center justify-center transform translate-y-16 perspective-[1000px]">
                <AnimatePresence mode='wait'>
                    <motion.h2
                        key={mantraIndex}
                        className={`text-4xl md:text-5xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-br ${textGradients[mantraIndex]} text-center px-4`}
                        initial={{ opacity: 0, scale: 0.8, z: -100, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, z: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.2, z: 100, filter: 'blur(20px)' }}
                        transition={{
                            duration: 0.8,
                            ease: [0.16, 1, 0.3, 1] // Custom ease for "emerging" feel
                        }}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Light Sweep Effect */}
                        <motion.span
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                        {MANTRAS[mantraIndex]}
                    </motion.h2>
                </AnimatePresence>
            </div>

            {/* Progress Bar (Subtle) */}
            <div className="absolute bottom-12 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-white/50"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 6, ease: "linear" }}
                />
            </div>
        </motion.div>
    );
}
