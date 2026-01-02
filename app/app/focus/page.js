"use client";

import { useEffect } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useFocusStore } from '@/store/useFocusStore';

// Components
import EntryOverlay from '@/components/Focus/EntryOverlay';
import TaskLockIn from '@/components/Focus/TaskLockIn';
import DeepFocus from '@/components/Focus/DeepFocus';
import CompletionEffect from '@/components/Focus/CompletionEffect';
import ExitSummary from '@/components/Focus/ExitSummary';
import { Zap, Play } from 'lucide-react';

export default function FocusPage() {
    const { phase, setPhase } = useFocusStore();

    // Reset on mount if needed
    useEffect(() => {
        // Optional: Auto reset if returning from elsewhere
        // resetSession();
    }, []);

    const renderPhase = () => {
        switch (phase) {
            case 'entry':
                return <EntryOverlay key="entry" />;
            case 'lock-in':
                return <TaskLockIn key="lock-in" />;
            case 'focus':
                return <DeepFocus key="deep-focus" />;
            case 'completion':
                return <CompletionEffect key="completion" />;
            case 'exit':
                return <ExitSummary key="exit" />;
            default: // idle
                return <IdleFocusView setPhase={setPhase} />;
        }
    };

    return (
        <div className="h-full relative overflow-hidden bg-black text-white selection:bg-blue-500/30">
            {/* Global Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/40 via-black to-black pointer-events-none" />

            <AnimatePresence mode='wait'>
                {renderPhase()}
            </AnimatePresence>
        </div>
    );
}

function IdleFocusView({ setPhase }) {
    // Parallax & 3D Tilt Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { width, height } = currentTarget.getBoundingClientRect();
        const centerX = width / 2;
        const centerY = height / 2;

        mouseX.set((clientX - centerX) / centerX);
        mouseY.set((clientY - centerY) / centerY);
    };

    // Smooth spring physics for Tilt
    const springConfig = { damping: 20, stiffness: 300 }; // Tighter, premium feel
    const rotateX = useSpring(useTransform(mouseY, [-1, 1], [10, -10]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-1, 1], [-10, 10]), springConfig);

    // Background Parallax
    const bgX = useSpring(useTransform(mouseX, [-1, 1], [-20, 20]), { damping: 30, stiffness: 200 });
    const bgY = useSpring(useTransform(mouseY, [-1, 1], [-20, 20]), { damping: 30, stiffness: 200 });

    return (
        <div
            className="h-full w-full flex flex-col items-center justify-center relative perspective-[1000px] overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            {/* 1. Dynamic Layered Background */}
            <motion.div
                className="absolute inset-[-50px] pointer-events-none z-0"
                style={{ x: bgX, y: bgY }}
            >
                {/* Deep Noise */}
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opactiy='1'/%3E%3C/svg%3E")` }} />

                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-80" />

                {/* Subtle Moving Spots (Simulating distant energy) */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[80px] mix-blend-screen" />
            </motion.div>

            {/* 2. 3D Card Container */}
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative z-10 flex flex-col items-center justify-center pointer-events-none" // Disable pointer events on container, re-enable on children if needed
            >
                {/* Icon */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-24 h-24 bg-zinc-900/40 backdrop-blur-md rounded-[24px] flex items-center justify-center mb-10 border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] group overflow-hidden relative pointer-events-auto"
                    style={{ transform: "translateZ(30px)" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-blue-500/0 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Zap className="text-zinc-400 group-hover:text-blue-400 transition-colors duration-500" size={48} strokeWidth={1.5} />
                </motion.div>

                {/* Text Title */}
                <motion.div
                    className="text-center mb-16"
                    style={{ transform: "translateZ(50px)" }}
                >
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.8 }}
                        className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 mb-6 tracking-tight"
                    >
                        THE FORGE
                    </motion.h2>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-zinc-400 text-lg font-medium tracking-wide max-w-md mx-auto leading-relaxed"
                    >
                        Ritualized focus to forge your work.<br />
                        <span className="text-zinc-500 text-sm uppercase tracking-widest mt-2 block">Deep Work Protocol v2.0</span>
                    </motion.p>
                </motion.div>

                {/* 3. Hero CTA - Visual Overhaul */}
                <motion.div
                    style={{ transform: "translateZ(80px)" }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="pointer-events-auto"
                >
                    <button
                        onClick={() => setPhase('entry')}
                        className="group relative flex items-center gap-4 px-12 py-6 bg-zinc-50 text-black rounded-full overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.3)] transition-shadow hover:shadow-[0_0_80px_rgba(59,130,246,0.5)] cursor-pointer"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/60 to-transparent z-10 skew-x-12" />

                        {/* Inner Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white to-zinc-300 opacity-100" />

                        <span className="relative z-20 font-bold text-xl tracking-wide flex items-center gap-3">
                            ENTER FOCUS MODE <Play size={22} fill="currentColor" />
                        </span>
                    </button>

                    {/* Micro Text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] text-center mt-8"
                    >
                        Execution Chamber
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}
