"use client";

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import clsx from 'clsx';

export default function TiltCard({ children, className, spotlightColor = "rgba(99, 102, 241, 0.4)" }) {
    const ref = useRef(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXPx = useMotionValue(0);
    const mouseYPx = useMotionValue(0);

    // Smooth out the tilt coordinates
    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();

        // Calculate position relative to center of card (-1 to 1)
        const xPct = ((clientX - left) / width) * 2 - 1;
        const yPct = ((clientY - top) / height) * 2 - 1;

        x.set(xPct);
        y.set(yPct);

        // Pixel coordinates for spotlight
        mouseXPx.set(clientX - left);
        mouseYPx.set(clientY - top);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
        mouseXPx.set(0);
        mouseYPx.set(0);
    }

    const rotateX = useTransform(mouseY, [-1, 1], [15, -15]); // Inverse Y for natural tilt
    const rotateY = useTransform(mouseX, [-1, 1], [-15, 15]);

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={clsx(
                "relative perspective-1000 group",
                className
            )}
        >
            {/* Spotlight Border Layer */}
            <motion.div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: useTransform(
                        [mouseXPx, mouseYPx],
                        ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, ${spotlightColor}, transparent 40%)`
                    )
                }}
            />

            <div
                style={{ transform: "translateZ(50px)" }}
                className="h-full w-full bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
                {/* Shine effect (Internal Light) */}
                <motion.div
                    style={{
                        x: useTransform(mouseX, [-1, 1], [-100, 100]),
                        y: useTransform(mouseY, [-1, 1], [-100, 100]),
                        opacity: useTransform(mouseX, (value) => Math.abs(value) * 0.3)
                    }}
                    className="absolute -inset-[100%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_60%)] pointer-events-none z-10 blur-xl"
                />

                {/* Content Layer */}
                <div className="relative z-20 h-full flex flex-col justify-between" style={{ transform: "translateZ(20px)" }}>
                    {children}
                </div>
            </div>
        </motion.div>
    );
}
