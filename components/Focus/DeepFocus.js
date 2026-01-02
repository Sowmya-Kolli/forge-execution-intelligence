import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusStore } from '@/store/useFocusStore';
import { Pause, CheckCircle, X, EyeOff } from 'lucide-react';
import clsx from 'clsx';

// Utility for smooth color interpolation
const lerpColor = (a, b, amount) => {
    const ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = Math.min(255, Math.max(0, ar + amount * (br - ar))),
        rg = Math.min(255, Math.max(0, ag + amount * (bg - ag))),
        rb = Math.min(255, Math.max(0, ab + amount * (bb - ab)));
    return '#' + ((1 << 24) + (Math.round(rr) << 16) + (Math.round(rg) << 8) + Math.round(rb)).toString(16).slice(1);
}

export default function DeepFocus() {
    const {
        activeTask,
        timer,
        intensity,
        tickTimer,
        pauseSession,
        resumeSession,
        resetSession,
        registerDistraction,
        finishSession
    } = useFocusStore();

    // Local state for hold-to-pause
    const [pauseHoldProgress, setPauseHoldProgress] = useState(0);
    const [isHoldingPause, setIsHoldingPause] = useState(false);

    // Local state for hold-to-complete
    const [completeHoldProgress, setCompleteHoldProgress] = useState(0);
    const [isHoldingComplete, setIsHoldingComplete] = useState(false);

    // UI Interaction State
    const [isIdle, setIsIdle] = useState(false);
    const idleTimerRef = useRef(null);

    // Distraction State
    const [distractionWarning, setDistractionWarning] = useState(false);

    // Abort State
    const [showAbortConfirm, setShowAbortConfirm] = useState(false);

    // Pulse State (5 min)
    const [pulseKey, setPulseKey] = useState(0);

    // Timer Ticker
    useEffect(() => {
        const interval = setInterval(tickTimer, 1000);
        return () => clearInterval(interval);
    }, [tickTimer]);

    // Idle Detection
    useEffect(() => {
        const resetIdle = () => {
            setIsIdle(false);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            idleTimerRef.current = setTimeout(() => {
                setIsIdle(true);
            }, 3000);
        };

        window.addEventListener('mousemove', resetIdle);
        window.addEventListener('keydown', resetIdle);
        window.addEventListener('click', resetIdle);
        resetIdle();

        return () => {
            window.removeEventListener('mousemove', resetIdle);
            window.removeEventListener('keydown', resetIdle);
            window.removeEventListener('click', resetIdle);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, []);

    // Tab Switch / Visibility Detection (Distraction Penalty)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (timer.isActive) {
                    registerDistraction();
                    setDistractionWarning(true);
                }
            } else {
                setTimeout(() => setDistractionWarning(false), 4000);
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [registerDistraction, timer.isActive]);

    // 5-Minute Micro-Pulse
    const elapsed = timer.initialDuration - timer.timeLeft;
    useEffect(() => {
        if (elapsed > 0 && elapsed % 300 === 0 && timer.isActive) {
            setPulseKey(k => k + 1);
        }
    }, [elapsed, timer.isActive]);


    // Hold to Pause Logic
    useEffect(() => {
        let interval;
        if (isHoldingPause) {
            interval = setInterval(() => {
                setPauseHoldProgress(prev => Math.min(100, prev + 5));
            }, 50);
        } else {
            setPauseHoldProgress(0);
        }
        return () => clearInterval(interval);
    }, [isHoldingPause]);

    useEffect(() => {
        if (pauseHoldProgress >= 100) {
            pauseSession();
            setIsHoldingPause(false);
            setPauseHoldProgress(0);
        }
    }, [pauseHoldProgress, pauseSession]);

    // Hold to Complete Logic
    useEffect(() => {
        let interval;
        if (isHoldingComplete) {
            interval = setInterval(() => {
                setCompleteHoldProgress(prev => Math.min(100, prev + 2));
            }, 30);
        } else {
            setCompleteHoldProgress(0);
        }
        return () => clearInterval(interval);
    }, [isHoldingComplete]);

    useEffect(() => {
        if (completeHoldProgress >= 100) {
            finishSession(true);
            setIsHoldingComplete(false);
            setCompleteHoldProgress(0);
        }
    }, [completeHoldProgress, finishSession]);

    // Timer Format
    const mins = Math.floor(timer.timeLeft / 60).toString().padStart(2, '0');
    const secs = (timer.timeLeft % 60).toString().padStart(2, '0');
    const progress = 1 - (timer.timeLeft / timer.initialDuration);

    // --- Dynamic Color Logic (Time-Based) ---
    // Start (0-35%): Blue -> Cyan
    // Mid (35-75%): Cyan -> Purple -> Magenta
    // End (75-100%): Magenta -> Orange -> Red
    const ringColor = useMemo(() => {
        // Define keypoints
        const p = Math.max(0, Math.min(1, progress));

        if (p < 0.3) {
            // Cool Phase: Blue (#3b82f6) -> Cyan (#06b6d4)
            return lerpColor('#3b82f6', '#06b6d4', p / 0.3);
        } else if (p < 0.6) {
            // Flow Phase: Cyan (#06b6d4) -> Purple (#a855f7)
            return lerpColor('#06b6d4', '#a855f7', (p - 0.3) / 0.3);
        } else if (p < 0.85) {
            // Intensity Phase: Purple (#a855f7) -> Orange (#f97316)
            return lerpColor('#a855f7', '#f97316', (p - 0.6) / 0.25);
        } else {
            // Critical Phase: Orange (#f97316) -> Red (#ef4444)
            return lerpColor('#f97316', '#ef4444', (p - 0.85) / 0.15);
        }
    }, [progress]);

    // Static helper for "Heat" intensity bar (preserving original logic concept, but cleaning code)
    const getIntensityGradient = (val) => {
        if (val < 40) return 'from-blue-500 to-cyan-500';
        if (val < 75) return 'from-cyan-500 to-purple-500';
        return 'from-orange-500 to-red-500';
    };

    return (
        <div className="h-full flex flex-col items-center justify-center relative w-full overflow-hidden bg-black selection:bg-blue-500/30">

            {/* 0. GLOBAL BACKGROUND LAYER */}
            <motion.div
                className="absolute inset-0 z-0 pointer-events-none"
                animate={{
                    background: [
                        `radial-gradient(circle at 50% 50%, ${ringColor}15 0%, #000 70%)`,
                        `radial-gradient(circle at 50% 50%, ${ringColor}25 0%, #000 60%)`,
                        `radial-gradient(circle at 50% 50%, ${ringColor}15 0%, #000 70%)`
                    ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opactiy='1'/%3E%3C/svg%3E")` }}
                />
            </motion.div>

            {/* Distraction Overlay (Z-50) */}
            <AnimatePresence>
                {distractionWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className="flex flex-col items-center gap-6 p-8 text-center max-w-md"
                        >
                            <EyeOff size={64} className="text-zinc-600 mb-2" />
                            <div>
                                <h3 className="text-3xl font-black text-white tracking-widest uppercase mb-2">Focus Broken</h3>
                                <p className="text-zinc-400 font-medium leading-relaxed">
                                    The forge cools when you leave.<br />
                                    Arguments of intensity lost.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* 1. CONTENT LAYER (Z-10) - Centered & Spaced */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-xl px-6 pb-32">

                {/* A. Forge Ring (Centerpiece) */}
                <div className="relative w-[340px] h-[340px] md:w-[420px] md:h-[420px] flex items-center justify-center mb-10">
                    {/* Background Ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 transform drop-shadow-2xl">
                        <circle cx="50%" cy="50%" r="45%" stroke="#1f1f22" strokeWidth="6" fill="none" />

                        {/* Progress Ring */}
                        <motion.circle
                            key={pulseKey}
                            cx="50%" cy="50%" r="45%"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{
                                pathLength: isHoldingComplete ? 1 : progress,
                                stroke: ringColor,
                                strokeWidth: isHoldingComplete ? 10 : 8 + (pulseKey > 0 ? [0, 2, 0] : 0),
                                filter: `drop-shadow(0 0 ${10 + intensity / 5}px ${ringColor})`
                            }}
                            transition={{
                                pathLength: { duration: isHoldingComplete ? 0.5 : 1, ease: "linear" },
                                stroke: { duration: 1, ease: "linear" },
                                strokeWidth: { duration: 2, ease: "easeInOut" },
                                filter: { duration: 1 }
                            }}
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Timer / Status Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {isHoldingComplete ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-3xl font-black text-white uppercase tracking-widest text-center"
                            >
                                <span className="text-amber-500 block text-sm tracking-[0.4em] mb-2">Status</span>
                                Forging...
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <motion.div
                                    className="text-[5rem] md:text-[6.5rem] font-bold text-white tabular-nums tracking-tighter leading-none flex items-center"
                                    animate={{ textShadow: `0 0 30px ${ringColor}40` }}
                                >
                                    {mins}<span className="text-zinc-700 mx-1 text-[4rem] relative -top-2">:</span>{secs}
                                </motion.div>
                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em] mt-2"
                                >
                                    Time Remaining
                                </motion.div>
                            </div>
                        )}
                    </div>
                </div>

                {/* B. Task Title (Below Ring) */}
                <motion.div
                    className="text-center mb-8 max-w-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
                        {activeTask?.title || "Deep Focus Session"}
                    </h2>
                </motion.div>

                {/* C. Intensity Bar (Always Visible) */}
                <div className="w-full space-y-3 group backdrop-blur-sm bg-black/20 p-4 rounded-2xl border border-white/5 shadow-inner">
                    <div className="flex justify-between items-end px-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Focus Intensity</span>
                        <div className="flex items-center gap-2">
                            <div className={clsx("w-2 h-2 rounded-full", intensity > 80 ? 'animate-pulse bg-orange-500' : 'bg-zinc-700')} />
                            <span className="text-sm font-bold text-white tabular-nums">{Math.round(intensity)}%</span>
                        </div>
                    </div>

                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden relative">
                        {/* Fill */}
                        <motion.div
                            className={clsx("h-full bg-gradient-to-r", getIntensityGradient(intensity))}
                            animate={{ width: `${intensity}%` }}
                            transition={{ ease: "linear", duration: 0.5 }}
                        />
                        {/* Glint */}
                        <motion.div
                            className="absolute top-0 bottom-0 w-[40px] bg-white/20 skew-x-12 blur-sm"
                            animate={{ x: ['-100%', '500%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        />
                    </div>

                    {/* Helper text */}
                    <div className="h-4 flex items-center justify-center overflow-hidden">
                        <AnimatePresence mode='wait'>
                            {intensity < 100 && (
                                <motion.p
                                    key="hint"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 0.5, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="text-[10px] text-zinc-400 font-medium tracking-wide text-center"
                                >
                                    Hold steady to increase intensity.
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>


            {/* 2. CONTROLS LAYER (Z-50) - Fixed Bottom Safe Zone */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4 pointer-events-none">
                <div className="pointer-events-auto bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-2xl flex items-center gap-6 md:gap-8 px-8 py-3 ring-1 ring-black/50">

                    {timer.isActive ? (
                        <>
                            {/* Pause Button */}
                            <div className="relative group">
                                <motion.button
                                    onMouseDown={() => setIsHoldingPause(true)}
                                    onMouseUp={() => setIsHoldingPause(false)}
                                    onTouchStart={() => setIsHoldingPause(true)}
                                    onTouchEnd={() => setIsHoldingPause(false)}
                                    onMouseLeave={() => setIsHoldingPause(false)}
                                    className="relative w-12 h-12 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Pause size={20} fill="currentColor" />

                                    {/* Progress Ring overlaid */}
                                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                                        <motion.circle
                                            cx="24" cy="24" r="23"
                                            stroke="white" strokeWidth="2" fill="none"
                                            strokeDasharray="145" // 2*PI*23
                                            strokeDashoffset={145 - (145 * (pauseHoldProgress / 100))}
                                            opacity={isHoldingPause ? 1 : 0}
                                        />
                                    </svg>
                                </motion.button>
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/5">
                                    Hold to Pause
                                </span>
                            </div>

                            {/* Separator */}
                            <div className="w-px h-8 bg-white/10" />

                            {/* Complete Button */}
                            <div className="relative group">
                                <motion.button
                                    onMouseDown={() => setIsHoldingComplete(true)}
                                    onMouseUp={() => setIsHoldingComplete(false)}
                                    onTouchStart={() => setIsHoldingComplete(true)}
                                    onTouchEnd={() => setIsHoldingComplete(false)}
                                    onMouseLeave={() => setIsHoldingComplete(false)}
                                    className={clsx(
                                        "relative w-16 h-16 flex items-center justify-center rounded-full transition-all duration-300 shadow-lg",
                                        isHoldingComplete
                                            ? "bg-amber-500 text-black scale-110 shadow-amber-500/40"
                                            : "bg-white text-black hover:scale-105"
                                    )}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <CheckCircle size={28} />

                                    {/* Progress Ring overlaid */}
                                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none scale-110">
                                        <motion.circle
                                            cx="32" cy="32" r="30"
                                            stroke="#f59e0b" strokeWidth="4" fill="none"
                                            strokeDasharray="188"
                                            strokeDashoffset={188 - (188 * (completeHoldProgress / 100))}
                                            opacity={isHoldingComplete ? 1 : 0}
                                        />
                                    </svg>
                                </motion.button>
                                <span className={clsx(
                                    "absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded transition-opacity whitespace-nowrap pointer-events-none",
                                    isHoldingComplete ? "text-amber-500 opacity-100" : "text-zinc-500 opacity-0 group-hover:opacity-100"
                                )}>
                                    {isHoldingComplete ? "Forging..." : "Hold to Complete"}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <motion.button
                                onClick={resumeSession}
                                className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:scale-105 transition-transform"
                            >
                                Resume
                            </motion.button>
                            <button
                                onClick={() => setShowAbortConfirm(true)}
                                className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}

                </div>

                {/* Abort Confirmation Modal (Centered) */}
                <AnimatePresence>
                    {showAbortConfirm && (
                        <div className="absolute bottom-20 bg-zinc-900 border border-red-500/30 rounded-xl p-4 flex flex-col items-center gap-3 shadow-2xl pointer-events-auto">
                            <div className="text-sm font-bold text-red-400 uppercase tracking-wider">End Session?</div>
                            <div className="flex gap-2">
                                <button onClick={() => setShowAbortConfirm(false)} className="px-4 py-2 bg-zinc-800 rounded-lg text-xs font-bold hover:bg-zinc-700">Resume</button>
                                <button onClick={resetSession} className="px-4 py-2 bg-red-500/20 text-red-200 border border-red-500/50 rounded-lg text-xs font-bold hover:bg-red-500/30">End Session</button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>


        </div>
    );
}
