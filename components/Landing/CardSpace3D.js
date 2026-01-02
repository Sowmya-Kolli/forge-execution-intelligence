"use client";

import { motion, useAnimation, animate, useMotionValue } from 'framer-motion';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

const cards = [
    { id: 1, title: "Tasks Are Symptoms", subtitle: "Execution systems solve the real problem.", color: "from-blue-600 to-blue-900", border: "border-blue-500/50", shadow: "shadow-blue-900/40" },
    { id: 2, title: "Overplanning Kills", subtitle: "Honest capacity beats perfect schedules.", color: "from-red-600 to-red-900", border: "border-red-500/50", shadow: "shadow-red-900/40" },
    { id: 3, title: "Protect Focus", subtitle: "Distractions are blocked. Flow is defended.", color: "from-purple-600 to-purple-900", border: "border-purple-500/50", shadow: "shadow-purple-900/40" },
    { id: 4, title: "Execution Is Measured", subtitle: "Results, not motivation.", color: "from-amber-600 to-amber-900", border: "border-amber-500/50", shadow: "shadow-amber-900/40" },
    { id: 5, title: "The System Learns", subtitle: "Every week, you execute better.", color: "from-emerald-600 to-emerald-900", border: "border-emerald-500/50", shadow: "shadow-emerald-900/40" },
];

export default function CardSpace3D() {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const rotation = useMotionValue(0);

    // Auto-rotation when no card is selected
    useEffect(() => {
        if (selectedIndex !== null) return;

        const controls = animate(rotation, rotation.get() - 360, {
            duration: 60,
            ease: "linear",
            repeat: Infinity,
        });
        return controls.stop;
    }, [selectedIndex, rotation]);

    // Snap to center when selected
    useEffect(() => {
        if (selectedIndex !== null) {
            // Calculate target angle to bring selected card to front (0deg)
            const cardAngle = selectedIndex * (360 / cards.length);
            let target = -cardAngle % 360;

            animate(rotation, target, {
                type: "spring",
                stiffness: 60,
                damping: 15
            });
        }
    }, [selectedIndex, rotation]);

    return (
        <div className="h-[80vh] w-full relative flex items-center justify-center perspective-[2000px] overflow-visible z-10 text-center">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-radial-gradient from-indigo-900/10 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-[1000px] h-[400px] flex justify-center items-center transform-style-3d">
                <CarouselRing rotation={rotation} setSelectedIndex={setSelectedIndex} selectedIndex={selectedIndex} />
            </div>
        </div>
    );
}

function CarouselRing({ rotation, setSelectedIndex, selectedIndex }) {
    const angleStep = 360 / cards.length;
    const radius = 380; // Reduced from 500 for tighter rotation

    return (
        <motion.div
            className="absolute w-full h-full transform-style-3d flex items-center justify-center"
            style={{
                rotateY: rotation,
                transformStyle: "preserve-3d"
            }}
        >
            {cards.map((card, index) => {
                const angle = index * angleStep;
                return (
                    <div
                        key={card.id}
                        className="absolute transform-style-3d"
                        style={{
                            transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                        }}
                    >
                        <RotatingCard
                            card={card}
                            index={index}
                            setSelectedIndex={setSelectedIndex}
                            isSelected={selectedIndex === index}
                        />
                    </div>
                );
            })}
        </motion.div>
    );
}

function RotatingCard({ card, index, setSelectedIndex, isSelected }) {
    return (
        <motion.div
            className={clsx(
                "w-[260px] h-[360px] rounded-3xl p-6 relative group cursor-pointer flex flex-col justify-center items-center text-center transition-all duration-500",
                card.border
            )}
            onMouseEnter={() => setSelectedIndex(index)}
            onMouseLeave={() => setSelectedIndex(null)}
            animate={{
                scale: isSelected ? 1.15 : 0.9,
                opacity: isSelected ? 1 : 0.6,
                filter: isSelected ? 'grayscale(0%)' : 'grayscale(60%)'
            }}
            // Colorful Gradient Style
            style={{
                background: `linear-gradient(135deg, rgba(0,0,0,0.9), rgba(20,20,20,0.8))`,
                boxShadow: isSelected ? `0 0 100px -20px var(--tw-shadow-color)` : 'none',
                '--tw-shadow-color': card.shadow.replace('shadow-', '').replace('/40', ''),
                borderColor: 'rgba(255,255,255,0.1)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
            }}
        >
            {/* Colorful Overlay */}
            <div className={clsx("absolute inset-0 opacity-20 rounded-3xl bg-gradient-to-b", card.color)} />

            {/* Highlight Gradient on Selected */}
            {isSelected && (
                <motion.div
                    layoutId="highlight"
                    className={clsx("absolute inset-0 opacity-40 rounded-3xl bg-gradient-to-t mix-blend-overlay pointer-events-none", card.color)}
                />
            )}

            <div className="relative z-10 flex flex-col items-center justify-center h-full">
                {/* Top Decoration */}
                <div className="mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 border border-white/10 px-2 py-1 rounded-full">0{index + 1}</span>
                </div>

                {/* Main Content */}
                <div style={{ transform: 'translateZ(30px)' }}>
                    <h3 className="text-2xl font-black text-white tracking-tighter mb-4 uppercase leading-[0.9] drop-shadow-xl">
                        {card.title}
                    </h3>
                    <div className={clsx("h-1 w-12 mx-auto mb-4 rounded-full bg-gradient-to-r", card.color)} />
                    <p className="text-xs font-medium text-zinc-300 leading-relaxed opacity-90 mx-auto max-w-[200px]">
                        {card.subtitle}
                    </p>
                </div>
            </div>

            {/* Border Glow */}
            <div className={clsx("absolute inset-0 border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none", card.border)} />
        </motion.div>
    );
}
