"use client";

import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Card({ title, children, className = '', action, animate = true }) {
    return (
        <motion.div
            initial={animate ? { opacity: 0, y: 10 } : false}
            whileInView={animate ? { opacity: 1, y: 0 } : false}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className={clsx(
                "glass-card rounded-2xl p-6 relative overflow-hidden group",
                className
            )}
        >
            {(title || action) && (
                <div className="flex justify-between items-center mb-5 relative z-10">
                    {title && <h3 className="text-lg font-semibold text-zinc-100 tracking-tight">{title}</h3>}
                    {action && <div className="text-sm">{action}</div>}
                </div>
            )}
            <div className="relative z-10">
                {children}
            </div>

            {/* Subtle Gradient Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.div>
    );
}
