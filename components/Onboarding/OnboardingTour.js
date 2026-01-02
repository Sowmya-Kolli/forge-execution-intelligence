"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Hexagon, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TOUR_STEPS = [
    {
        id: 'welcome',
        title: "Welcome to FORGE",
        description: "Your execution intelligence system. This isn't just a todo list—it's a framework for high-output work. Let's get you oriented.",
        path: null // Overlay on current page
    },
    {
        id: 'planner',
        title: "The Planner",
        description: "Decide what to work on. Filter noise, match tasks to your energy levels, and commit to a realistic workload.",
        path: '/app/planner'
    },
    {
        id: 'structure',
        title: "Structure View",
        description: "Visualise dependencies. See what's blocking you and organize complex projects into a clear execution graph.",
        path: '/app/structure'
    },
    {
        id: 'execution',
        title: "Focus Mode",
        description: "Deep work protection. A distraction-free environment to burn through your queue with focus timers.",
        path: '/app/focus'
    },
    {
        id: 'analytics',
        title: "Analytics Engine",
        description: "Measure your output. Understanding your velocity is the only way to improve your system.",
        path: '/app/analytics'
    }
];

export default function OnboardingTour() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const router = useRouter();

    // Check storage on mount
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('forge_onboarding_seen');
        if (!hasSeenTour) {
            // Small delay for smooth entrance
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }

        const handleReplay = () => {
            setIsOpen(true);
            setCurrentStep(0); // Reset to first step on replay
        };
        window.addEventListener('replay-tour', handleReplay);
        return () => window.removeEventListener('replay-tour', handleReplay);
    }, []);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            const nextStepIndex = currentStep + 1;
            setCurrentStep(nextStepIndex);

            const nextPath = TOUR_STEPS[nextStepIndex].path;
            if (nextPath) {
                router.push(nextPath);
            }
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            const prevStepIndex = currentStep - 1;
            setCurrentStep(prevStepIndex);

            const prevPath = TOUR_STEPS[prevStepIndex].path;
            if (prevPath) {
                router.push(prevPath);
            }
        }
    };

    const handleComplete = () => {
        setIsOpen(false);
        localStorage.setItem('forge_onboarding_seen', 'true');
    };

    if (!isOpen) return null;

    const step = TOUR_STEPS[currentStep];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        onClick={handleComplete}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-10 right-10 md:bottom-20 md:right-20 w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl z-[101] overflow-hidden"
                    >
                        {/* Progress Bar */}
                        <div className="h-1 bg-zinc-800 w-full">
                            <motion.div
                                className="h-full bg-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
                            />
                        </div>

                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                    <Hexagon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">{step.title}</h3>
                                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                                        Step {currentStep + 1} of {TOUR_STEPS.length}
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <p className="text-zinc-300 leading-relaxed mb-8 h-20">
                                {step.description}
                            </p>

                            {/* Footer Controls */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={handleComplete}
                                    className="text-xs font-bold text-zinc-500 hover:text-white transition-colors"
                                >
                                    Skip Tour
                                </button>

                                <div className="flex items-center gap-2">
                                    {currentStep > 0 && (
                                        <button
                                            onClick={handleBack}
                                            className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 text-white hover:bg-white/5 transition-colors"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                    )}

                                    <button
                                        onClick={handleNext}
                                        className="px-6 h-10 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2"
                                    >
                                        {currentStep === TOUR_STEPS.length - 1 ? (
                                            <>Get Started <Check size={18} /></>
                                        ) : (
                                            <>Next <ChevronRight size={18} /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
