"use client";

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

const cards = [
    { id: 1, title: "Tasks Are Symptoms", content: "Execution systems solve the real problem." },
    { id: 2, title: "Overplanning Kills", content: "Honest capacity beats perfect schedules." },
    { id: 3, title: "Protect Focus", content: "Distractions are blocked. Flow is defended." },
    { id: 4, title: "Execution Measured", content: "Results, not motivation." },
    { id: 5, title: "System Learns", content: "Every week, you execute better." },
];

export default function ThreeDCarousel() {
    const [rotation, setRotation] = useState(0);
    const controls = useAnimation();

    useEffect(() => {
        // Auto-rotation
        const interval = setInterval(() => {
            setRotation((prev) => prev - 72); // 360 / 5 cards = 72deg
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative h-[400px] w-full flex items-center justify-center perspective-[1000px] overflow-hidden">
            {/* Glow center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/20 blur-[100px] rounded-full" />

            <motion.div
                className="relative w-[300px] h-[200px] preserve-3d"
                animate={{ rotateY: rotation }}
                transition={{ duration: 1, ease: "easeInOut" }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {cards.map((card, index) => {
                    const angle = index * 72;
                    return (
                        <div
                            key={card.id}
                            className="absolute inset-0 backface-hidden"
                            style={{
                                transform: `rotateY(${angle}deg) translateZ(350px)`,
                            }}
                        >
                            <div className="w-full h-full p-8 rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-md shadow-2xl flex flex-col justify-center items-center text-center group hover:border-blue-500/50 transition-colors">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{card.title}</h3>
                                <p className="text-zinc-400 text-sm font-medium">{card.content}</p>
                            </div>
                        </div>
                    );
                })}
            </motion.div>
        </div>
    );
}
