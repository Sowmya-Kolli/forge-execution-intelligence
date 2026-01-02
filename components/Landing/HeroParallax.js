"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { useRef, useEffect } from 'react';

export default function HeroParallax() {
    const containerRef = useRef(null);
    const { scrollY } = useScroll();

    // Mouse tracking
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Normalize mouse position (-1 to 1)
            const { innerWidth, innerHeight } = window;
            mouseX.set((e.clientX / innerWidth) * 2 - 1);
            mouseY.set((e.clientY / innerHeight) * 2 - 1);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    // Smoothed mouse values
    const smoothX = useSpring(mouseX, { stiffness: 100, damping: 30 });
    const smoothY = useSpring(mouseY, { stiffness: 100, damping: 30 });

    // Parallax transforms based on scroll and mouse
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    // Mouse parallax layers
    const xLayer1 = useTransform(smoothX, [-1, 1], [-50, 50]);
    const yLayer1 = useTransform(smoothY, [-1, 1], [-50, 50]);

    const xLayer2 = useTransform(smoothX, [-1, 1], [30, -30]);
    const yLayer2 = useTransform(smoothY, [-1, 1], [30, -30]);

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute inset-0 bg-background mix-blend-overlay opacity-90" />

            {/* Deep Background Word */}
            <motion.div
                style={{ x: xLayer2, y: yLayer2, opacity: 0.1 }}
                className="absolute top-[20%] left-[10%] text-[15vw] font-black text-white leading-none tracking-tighter select-none blur-sm"
            >
                EXECUTE
            </motion.div>

            {/* Mid Background Word */}
            <motion.div
                style={{ x: xLayer1, y: yLayer1, translateY: y1, opacity: 0.15 }}
                className="absolute bottom-[10%] right-[5%] text-[20vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-zinc-700 to-transparent leading-none tracking-tighter select-none"
            >
                FOCUS
            </motion.div>

            {/* Gradient Orbs */}
            <motion.div
                style={{ x: useTransform(smoothX, [-1, 1], [-20, 20]) }}
                className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/20 blur-[150px]"
            />
            <motion.div
                style={{ x: useTransform(smoothX, [-1, 1], [20, -20]) }}
                className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/20 blur-[150px]"
            />
        </div>
    );
}
