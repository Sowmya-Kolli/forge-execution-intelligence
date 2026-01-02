import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Badge Definitions
const BADGES = [
    { id: 'streak_3', name: 'Momentum', description: '3-day streak', icon: '🔥', condition: (stats) => stats.currentStreak >= 3 },
    { id: 'streak_7', name: '7-Day Forge', description: '7-day streak', icon: '⚡', condition: (stats) => stats.currentStreak >= 7 },
    { id: 'deep_focus', name: 'Deep Focus', description: 'Intensity > 80% for a session', icon: '🧠', condition: (session) => session.averageIntensity >= 80 },
    { id: 'marathon', name: 'Iron Will', description: 'Session > 45 mins', icon: '🏃', condition: (session) => session.duration >= 45 },
    { id: 'perfect', name: 'No-Distraction', description: '0 interruptions', icon: '🛡️', condition: (session) => session.interruptionsCount === 0 },
];

export const useFocusStore = create(
    persist(
        (set, get) => ({
            // Phases: 'idle' | 'entry' | 'lock-in' | 'focus' | 'completion' | 'exit'
            phase: 'idle',
            activeTask: null,

            // Timer State
            timer: {
                timeLeft: 25 * 60,
                initialDuration: 25 * 60,
                isActive: false,
            },

            // Current Session Metrics
            intensity: 0, // 0-100
            startTime: null,
            distractions: 0,
            pauses: 0,

            // Persisted Data
            history: [], // Array of sessions
            stats: {
                totalSessions: 0,
                totalMinutes: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastActiveDate: null, // "YYYY-MM-DD"
                xp: 0,
                level: 1,
            },
            badges: [], // Array of badge IDs

            // Actions
            setPhase: (phase) => set({ phase }),

            setTask: (task) => set({
                activeTask: task,
                timer: {
                    timeLeft: (parseInt(task.duration) || 25) * 60,
                    initialDuration: (parseInt(task.duration) || 25) * 60,
                    isActive: false
                }
            }),

            startSession: () => set((state) => ({
                phase: 'focus',
                startTime: Date.now(),
                distractions: 0,
                pauses: 0,
                timer: { ...state.timer, isActive: true }
            })),

            pauseSession: () => set((state) => {
                // Penalty: -3% for manual pause
                // Discourages breaks unless necessary
                const penalty = 3;
                return {
                    timer: { ...state.timer, isActive: false },
                    pauses: state.pauses + 1,
                    intensity: Math.max(0, state.intensity - penalty)
                };
            }),

            resumeSession: () => set((state) => ({
                timer: { ...state.timer, isActive: true }
            })),

            tickTimer: () => {
                const { timer, intensity } = get();
                if (!timer.isActive || timer.timeLeft <= 0) return;

                const newTime = timer.timeLeft - 1;

                // Intensity Calculation Logic
                // Grow by ~1.6% per minute (0.027 per second) if uninterrupted
                // Maxes out at 100%
                const growthRate = 0.027;
                let newIntensity = intensity + growthRate;

                // Clamp to 0-100
                newIntensity = Math.min(100, Math.max(0, newIntensity));

                if (newTime <= 0) {
                    get().finishSession(true); // Complete successfully
                } else {
                    set({
                        timer: { ...timer, timeLeft: newTime },
                        intensity: newIntensity
                    });
                }
            },

            registerDistraction: () => set((state) => {
                // Penalty: -5% for distraction (tab switch)
                // Ensures user feels the cost of breaking focus immediately
                const penalty = 5;
                return {
                    distractions: state.distractions + 1,
                    intensity: Math.max(0, state.intensity - penalty)
                };
            }),

            resetSession: () => set({
                phase: 'idle',
                activeTask: null,
                intensity: 0,
                distractions: 0,
                pauses: 0,
                startTime: null,
                timer: { timeLeft: 25 * 60, isActive: false, initialDuration: 25 * 60 }
            }),

            finishSession: (successful = true) => {
                const state = get();
                const now = new Date();
                const today = now.toISOString().split('T')[0];

                const durationSeconds = state.timer.initialDuration - state.timer.timeLeft; // Actual duration if aborted, or full if complete
                const durationMinutes = Math.floor(durationSeconds / 60);

                // Derived Metrics
                // Simple XP formula: Duration * Intensity Factor
                const sessionXP = successful ? Math.floor(durationMinutes * (state.intensity / 10)) : 0;

                const finalIntensity = state.intensity;

                // Construct Session Object
                const newSession = {
                    id: Date.now(),
                    date: today,
                    timestamp: now.getTime(),
                    duration: durationMinutes,
                    averageIntensity: finalIntensity,
                    interruptionsCount: state.distractions + state.pauses,
                    taskId: state.activeTask?.id || null,
                    taskTitle: state.activeTask?.title || "Focus Session",
                    successful,
                };

                // Update Stats & Streaks
                let newStats = { ...state.stats };
                if (successful && durationMinutes > 1) { // Only count if > 1 min
                    newStats.totalSessions += 1;
                    newStats.totalMinutes += durationMinutes;
                    newStats.xp += sessionXP;
                    newStats.level = Math.floor(Math.sqrt(newStats.xp / 100)) + 1;

                    // Streak Logic
                    if (newStats.lastActiveDate !== today) {
                        const yesterday = new Date(now);
                        yesterday.setDate(yesterday.getDate() - 1);
                        const yesterdayStr = yesterday.toISOString().split('T')[0];

                        // If last active was yesterday, increment. If today, do nothing. Else reset.
                        if (newStats.lastActiveDate === yesterdayStr) {
                            newStats.currentStreak += 1;
                        } else if (newStats.lastActiveDate !== today) {
                            // It wasn't yesterday and it wasn't today, so gap > 1 day
                            newStats.currentStreak = 1;
                        }
                        // Default case: if lastActiveDate is today, streak remains same
                        newStats.lastActiveDate = today;
                    } else if (!newStats.lastActiveDate) {
                        newStats.currentStreak = 1;
                        newStats.lastActiveDate = today;
                    }

                    if (newStats.currentStreak > newStats.longestStreak) {
                        newStats.longestStreak = newStats.currentStreak;
                    }
                }

                // Check Badges
                let newBadges = [...state.badges];
                BADGES.forEach(badge => {
                    if (!newBadges.includes(badge.id)) {
                        // Check condition against session OR stats
                        if (successful && (
                            (badge.id.startsWith('streak') && badge.condition(newStats)) ||
                            (!badge.id.startsWith('streak') && badge.condition(newSession))
                        )) {
                            newBadges.push(badge.id);
                        }
                    }
                });

                set({
                    phase: 'completion',
                    timer: { ...state.timer, timeLeft: 0, isActive: false },
                    intensity: 100, // Visual flair
                    history: successful ? [newSession, ...state.history] : state.history,
                    stats: newStats,
                    badges: newBadges
                });
            },

            // Computes heatmap data: { "0-14": 45, "1-9": 30 } (Day-Hour : Minutes)
            getHeatmapData: () => {
                const { history } = get();
                const map = {};
                history.forEach(s => {
                    if (!s.successful) return;
                    const date = new Date(s.timestamp);
                    const day = date.getDay(); // 0-Sun
                    const hour = date.getHours();
                    const key = `${day}-${hour}`;
                    map[key] = (map[key] || 0) + s.duration;
                });
                return map;
            },

            getBadges: () => {
                const { badges } = get();
                return BADGES.filter(b => badges.includes(b.id));
            }
        }),
        {
            name: 'forge-storage',
            partialize: (state) => ({
                history: state.history,
                stats: state.stats,
                badges: state.badges
            }),
        }
    )
);
