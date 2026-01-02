"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Calendar as CalendarIcon, Battery, Clock, AlertCircle, CheckCircle, Plus, X, Trash2, Pencil, Zap, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
// import { MOCK_TASKS } from '@/lib/mockTasks';

// --- Helper Functions for Real Calendar ---
const getWeekDays = (baseDate = new Date()) => {
    const days = [];
    const current = new Date(baseDate);
    const dayOfWeek = current.getDay(); // 0-6 (Sun-Sat)
    const diffToMon = current.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diffToMon));

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push(d);
    }
    return days;
};

const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();
};

export default function PlannerPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);

    // Calendar State
    const [today] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekDays, setWeekDays] = useState([]);

    useEffect(() => {
        setWeekDays(getWeekDays(new Date()));
    }, []);

    // Add State
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');
    const [newTaskEnergy, setNewTaskEnergy] = useState('medium'); // Default medium
    const [newTaskDuration, setNewTaskDuration] = useState(30);

    // Edit State
    const [editingTask, setEditingTask] = useState(null); // Task object being edited

    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    // --- Data Fetching ---
    useEffect(() => {
        if (user) fetchTasks();
    }, [user]);

    const fetchTasks = async () => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('status', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setTasks(data);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        }
    };

    // seedInitialTasks removed for production verification

    // --- Handlers ---

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!user || !newTaskTitle.trim()) return;

        try {
            const newTask = {
                user_id: user.id,
                title: newTaskTitle,
                energy: newTaskEnergy,
                priority: newTaskPriority,
                duration: parseInt(newTaskDuration) || 30,
                status: 'pending',
                created_at: new Date().toISOString()
            };
            const { data, error } = await supabase.from('tasks').insert([newTask]).select();
            if (error) throw error;
            if (data) {
                setTasks(prev => [data[0], ...prev]);
                setNewTaskTitle('');
                setIsAdding(false);
            }
        } catch (err) { console.error(err); alert("Failed to add task."); }
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        if (!editingTask || !editingTask.title.trim()) return;

        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    title: editingTask.title,
                    priority: editingTask.priority,
                    duration: editingTask.duration,
                    energy: editingTask.energy
                })
                .eq('id', editingTask.id);

            if (error) throw error;

            // Optimistic Update
            setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t));
            setEditingTask(null);
        } catch (err) { console.error(err); alert("Failed to update task."); }
    };

    const handleDeleteTask = async (id) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (!error) setTasks(prev => prev.filter(t => t.id !== id));
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'high': return 'text-red-400 bg-red-900/20 border-red-500/30';
            case 'medium': return 'text-amber-400 bg-amber-900/20 border-amber-500/30';
            case 'low': return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
            default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
        }
    };
    const getEnergyColor = (e) => {
        switch (e) {
            case 'high': return 'bg-purple-500';
            case 'medium': return 'bg-blue-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-zinc-500';
        }
    };

    return (
        <div className="min-h-full pb-32 text-white p-6 md:p-12 max-w-7xl mx-auto relative">

            {/* Header Area */}
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                        Structure
                    </h1>
                    <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                        <CalendarIcon size={16} />
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-5 py-2 rounded-full bg-zinc-900 border border-white/5 flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-zinc-500">Pending</span>
                            <span className="text-xl font-bold leading-none">{pendingTasks.length}</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-zinc-500">Done</span>
                            <span className="text-xl font-bold text-green-500 leading-none">{completedTasks.length}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </header>

            {/* Calendar Strip */}
            <div className="mb-12 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
                <div className="flex justify-between md:justify-start gap-4 min-w-max">
                    {weekDays.map((date, i) => {
                        const isSelected = isSameDay(date, selectedDate);
                        const isToday = isSameDay(date, today);
                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(date)}
                                className={clsx(
                                    "relative w-16 h-24 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 border",
                                    isSelected ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/40 scale-105 z-10" : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:bg-zinc-800 hover:border-white/10"
                                )}
                            >
                                <span className={clsx("text-xs font-bold uppercase", isSelected ? "text-blue-200" : "text-zinc-600")}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                <span className={clsx("text-2xl font-black", isSelected ? "text-white" : "text-zinc-400")}>{date.getDate()}</span>
                                {isToday && <span className="absolute bottom-2 w-1 h-1 rounded-full bg-current" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Pending Column */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3"><Zap className="text-amber-500" size={20} /> Today's Targets</h2>

                    {/* Add Form */}
                    <AnimatePresence>
                        {isAdding && (
                            <motion.form
                                initial={{ opacity: 0, height: 0, mb: 0 }}
                                animate={{ opacity: 1, height: 'auto', mb: 24 }}
                                exit={{ opacity: 0, height: 0, mb: 0 }}
                                onSubmit={handleAddTask}
                                className="bg-zinc-900 border border-blue-500/30 rounded-2xl p-6 overflow-hidden relative group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <input
                                        autoFocus type="text" placeholder="What needs forging?"
                                        className="bg-transparent text-xl font-bold placeholder-zinc-600 text-white w-full outline-none"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                    />
                                    <button type="button" onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
                                </div>
                                <div className="flex flex-wrap gap-4 items-center">
                                    <select
                                        value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}
                                        className="bg-black/30 text-xs font-bold uppercase text-zinc-300 px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-blue-500"
                                    >
                                        <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                                    </select>
                                    <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-lg border border-white/10">
                                        <Clock size={14} className="text-zinc-400" />
                                        <input type="number" value={newTaskDuration} onChange={(e) => setNewTaskDuration(e.target.value)} className="w-12 bg-transparent text-xs font-bold text-white outline-none text-center" />
                                        <span className="text-xs text-zinc-500">min</span>
                                    </div>
                                    <button type="submit" className="ml-auto px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors">Add</button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode='popLayout'>
                        {pendingTasks.map((task) => (
                            <motion.div
                                layout
                                key={task.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group relative"
                            >
                                <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-white/5 hover:border-blue-500/30 p-5 rounded-2xl flex items-center justify-between transition-all hover:translate-x-1">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx("w-1 h-12 rounded-full", getEnergyColor(task.energy))} />
                                        <div>
                                            <h3 className="font-bold text-lg text-zinc-100 mb-1 leading-tight">{task.title}</h3>
                                            <div className="flex items-center gap-3">
                                                <span className={clsx("text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider", getPriorityColor(task.priority))}>
                                                    {task.priority || 'Normal'}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-zinc-500 font-medium bg-black/20 px-2 py-0.5 rounded">
                                                    <Clock size={12} /> {task.duration || 30}m
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                        <button onClick={() => setEditingTask(task)} className="p-2 text-zinc-600 hover:text-blue-400 transition-colors">
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {pendingTasks.length === 0 && !isAdding && (
                        <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-3xl">
                            <p className="text-zinc-500 font-medium">All clear for today.</p>
                            <button onClick={() => setIsAdding(true)} className="text-blue-400 text-sm font-bold mt-2 hover:underline">Add a new target</button>
                        </div>
                    )}
                </div>

                {/* Completed Column */}
                <div>
                    <h2 className="text-xl font-bold text-zinc-500 flex items-center gap-3 mb-6"><CheckCircle size={20} /> Completed Forges</h2>
                    <div className="space-y-4">
                        {completedTasks.length > 0 ? (
                            completedTasks.map(task => (
                                <div key={task.id} className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1 rounded-full bg-green-500/20 text-green-500"><Check size={14} strokeWidth={3} /></div>
                                        <span className="font-medium text-zinc-300 line-through decoration-zinc-600">{task.title}</span>
                                    </div>
                                    <span className="text-xs text-zinc-600 font-mono">{new Date(task.created_at).toLocaleDateString()}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-zinc-600 text-sm italic">No completed tasks yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* EDIT TASK MODAL */}
            <AnimatePresence>
                {editingTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative"
                        >
                            <button onClick={() => setEditingTask(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={24} /></button>
                            <h2 className="text-xl font-bold text-white mb-6">Edit Target</h2>

                            <form onSubmit={handleUpdateTask} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Task Title</label>
                                    <input
                                        type="text"
                                        value={editingTask.title}
                                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                        className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-white font-medium focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Priority</label>
                                        <select
                                            value={editingTask.priority}
                                            onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                                            className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-white font-medium outline-none"
                                        >
                                            <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Duration (min)</label>
                                        <input
                                            type="number"
                                            value={editingTask.duration}
                                            onChange={(e) => setEditingTask({ ...editingTask, duration: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-white font-medium outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setEditingTask(null)} className="px-5 py-2.5 rounded-xl text-zinc-400 font-bold hover:bg-zinc-800 transition-colors">Cancel</button>
                                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors">Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
