"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Hexagon, Zap, Shield, BarChart2, Layers, Code, PenTool, GraduationCap, Briefcase } from 'lucide-react';
import HeroParallax from '@/components/Landing/HeroParallax';
import TiltCard from '@/components/Landing/TiltCard';
import CardSpace3D from '@/components/Landing/CardSpace3D';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/Auth/AuthModal';

export default function LandingPageWrapper() {
  return (
    <AuthProvider>
      <LandingPage />
    </AuthProvider>
  );
}

function LandingPage() {
  const { login } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState('login');

  const openAuth = (view) => {
    setAuthView(view);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#030304] text-foreground overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialView={authView} />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/0 backdrop-blur-sm border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hexagon className="text-white fill-white/5" size={24} />
            <span className="font-bold text-lg tracking-tight text-white">FORGE</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => openAuth('login')} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Log In
            </button>
            <button onClick={() => openAuth('signup')} className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-all">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* SECTION 1: HERO (Experimental) */}
      <section className="h-screen relative flex items-center justify-center overflow-hidden perspective-[1px]">
        <HeroParallax />

        <div className="container mx-auto px-6 relative z-10 text-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="pointer-events-auto"
          >
            <div className="inline-block mb-4 px-4 py-1 border border-white/10 rounded-full bg-black/20 backdrop-blur-md">
              <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">System v1.0 // Capacity Aware</span>
            </div>

            <h1 className="text-8xl md:text-[10rem] font-bold tracking-tighter mb-2 leading-none text-white mix-blend-screen">
              FORGE
            </h1>

            <p className="text-lg md:text-xl text-zinc-500 max-w-lg mx-auto mb-8 font-medium tracking-wide uppercase opacity-80">
              The Operating System for High-Output Individuals
            </p>

            <p className="text-xl md:text-2xl text-zinc-300 max-w-xl mx-auto mb-10 font-light tracking-wide leading-relaxed">
              Not a Todo App. <br />
              <span className="text-white font-medium shadow-[0_0_30px_rgba(255,255,255,0.2)]">An Execution Intelligence System.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button onClick={() => openAuth('signup')} className="group px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-zinc-200 transition-all flex items-center gap-2 hover:gap-4 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                Start Executing <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: FEATURES (Tilt Cards) */}
      <section className="py-32 relative z-10 bg-gradient-to-b from-transparent via-[#06060a] to-transparent">
        <div className="container mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Core Modules</h2>
            <h3 className="text-4xl text-white font-bold">The Architecture of Focus.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TiltCard className="h-64" spotlightColor="rgba(59, 130, 246, 0.5)">
              <div className="flex flex-col h-full justify-center">
                <div className="mb-4 text-blue-500">
                  <Zap size={32} />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Intent → Execution</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">Bridge the gap. Turn abstract goals into concrete actions.</p>
              </div>
            </TiltCard>
            <TiltCard className="h-64" spotlightColor="rgba(168, 85, 247, 0.5)">
              <div className="flex flex-col h-full justify-center">
                <div className="mb-4 text-purple-500">
                  <Shield size={32} />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Deep Work Protection</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">Flow state defense. We block the noise so you can build.</p>
              </div>
            </TiltCard>
            <TiltCard className="h-64" spotlightColor="rgba(99, 102, 241, 0.5)">
              <div className="flex flex-col h-full justify-center">
                <div className="mb-4 text-indigo-500">
                  <Layers size={32} />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Capacity Planning</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">Honest schedules. No more wishful thinking overload.</p>
              </div>
            </TiltCard>
            <TiltCard className="h-64" spotlightColor="rgba(16, 185, 129, 0.5)">
              <div className="flex flex-col h-full justify-center">
                <div className="mb-4 text-emerald-500">
                  <BarChart2 size={32} />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Analytics Engine</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">Measure output, not busyness. Learn from your data.</p>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* SECTION 3: WHY FORGE (3D SPACE) */}
      <section className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#030304] via-[#080812] to-[#030304]">
        {/* Background Enhancement */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] animate-pulse-slow" />
        </div>

        <div className="container mx-auto px-6 text-center relative z-20 mb-[-50px]">
          <h2 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-4">Philosophy</h2>
          <h3 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">Why Forge?</h3>
        </div>

        <CardSpace3D />
      </section>

      {/* SECTION 4: WHO IS IT FOR */}
      <section className="py-40 relative z-10">
        <div className="container mx-auto px-6">
          <div className="mb-20 text-center">
            <h2 className="text-4xl text-white font-bold">Built for Builders.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <PersonaCard
              icon={Code}
              title="Developers"
              desc="Who need longer flow states to solve hard problems."
            />
            <PersonaCard
              icon={Briefcase}
              title="Founders"
              desc="Balancing high-level strategy with deep execution."
            />
            <PersonaCard
              icon={PenTool}
              title="Creators"
              desc="Managing consistent output without creative burnout."
            />
            <PersonaCard
              icon={GraduationCap}
              title="Students"
              desc="Handling rigorous workloads with structured systems."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Hexagon className="text-zinc-600" size={20} />
            <span className="font-bold text-zinc-600 tracking-widest text-xs">FORGE SYSTEMS INC.</span>
          </div>
          <p className="text-zinc-700 text-xs tracking-wider">&copy; 2025</p>
        </div>
      </footer>
    </div>
  );
}

function PersonaCard({ icon: Icon, title, desc }) {
  return (
    <Link href="/app/planner">
      <TiltCard className="h-full" spotlightColor="rgba(255, 255, 255, 0.2)">
        <div className="flex items-center gap-6 h-full">
          <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 border border-white/10 text-white shadow-lg">
            <Icon size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2 group-hover:text-blue-200 transition-colors">
              {title}
              <ArrowRight size={16} className="text-blue-500 -rotate-45" />
            </h3>
            <p className="text-zinc-400 text-sm group-hover:text-zinc-300 transition-colors">{desc}</p>
          </div>
        </div>
      </TiltCard>
    </Link>
  );
}
