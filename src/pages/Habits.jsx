import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy } from '../firebase';
import { db } from '../firebase';
import { Plus, Trash2, Flame, Calendar as CalendarIcon, Check } from 'lucide-react';
import { format, subDays, isSameDay, startOfYear, eachDayOfInterval, endOfYear } from 'date-fns';

const Habits = () => {
    const { activeWorkspace, currentWorkspaceName } = useWorkspace();
    const { currentUser } = useAuth();
    const [habits, setHabits] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newHabit, setNewHabit] = useState('');

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'habits'),
            where('workspaceId', '==', activeWorkspace),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setHabits(items);
        });

        return () => unsubscribe();
    }, [currentUser, activeWorkspace]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newHabit.trim()) return;

        try {
            await addDoc(collection(db, 'habits'), {
                title: newHabit,
                userId: currentUser.uid,
                workspaceId: activeWorkspace,
                streak: 0,
                history: [], // Array of timestamps
                createdAt: Timestamp.now()
            });
            setIsAdding(false);
            setNewHabit('');
        } catch (error) {
            console.error("Error adding habit:", error);
        }
    };

    const toggleHabitForToday = async (habit) => {
        const today = new Date();
        const history = habit.history ? habit.history.map(t => t.toDate()) : [];
        const completedToday = history.some(date => isSameDay(date, today));

        let newHistory;
        let newStreak = habit.streak;

        if (completedToday) {
            // Remove today
            newHistory = history.filter(date => !isSameDay(date, today));
            // Recalculate streak (naive implementation - simplified)
            newStreak = Math.max(0, newStreak - 1);
        } else {
            // Add today
            newHistory = [...history, today];
            newStreak = newStreak + 1;
        }

        await updateDoc(doc(db, 'habits', habit.id), {
            history: newHistory, // Simplified for mock. Real Firestore needs Timestamps
            streak: newStreak
        });
    };

    const deleteHabit = async (id) => {
        if (window.confirm("Delete this habit tracker?")) {
            await deleteDoc(doc(db, 'habits', id));
        }
    };

    // Contribution Graph (Heatmap) Logic - Last 100 days for visual
    const getHeatmapData = (history) => {
        // ... simplified visual: just 7 days box for now
        const days = [];
        for (let i = 6; i >= 0; i--) {
            days.push(subDays(new Date(), i));
        }
        return days;
    };

    return (
        <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{currentWorkspaceName} - Habits</h1>
                    <p className="text-neutral-400">Build consistency, one day at a time.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                    <Plus size={20} />
                    New Habit
                </button>
            </div>

            {isAdding && (
                <div className="glass-panel p-6 rounded-xl mb-6 max-w-xl animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleAdd} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="What habit do you want to build?"
                            value={newHabit}
                            onChange={e => setNewHabit(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            autoFocus
                        />
                        <button type="submit" className="px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700">Add</button>
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white">Cancel</button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-8">
                {habits.map(habit => {
                    const today = new Date();
                    const history = habit.history ? habit.history.map(t => t.toDate ? t.toDate() : new Date(t)) : []; // Handle both real and mock data types
                    const completedToday = history.some(date => isSameDay(date, today));
                    const last7Days = getHeatmapData(history);

                    return (
                        <div key={habit.id} className="glass-panel p-6 rounded-2xl border border-transparent hover:border-white/10 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-xl text-white">{habit.title}</h3>
                                <div className="flex items-center gap-1 text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full text-sm font-mono">
                                    <Flame size={14} fill="currentColor" />
                                    <span>{habit.streak || 0}</span>
                                </div>
                            </div>

                            {/* Weekly Mini-Heatmap */}
                            <div className="flex gap-1 mb-6 justify-between">
                                {last7Days.map(day => {
                                    const isDone = history.some(d => isSameDay(d, day));
                                    const isTodayDate = isSameDay(day, today);
                                    return (
                                        <div key={day.toString()} className="flex flex-col items-center gap-1">
                                            <div
                                                className={`
                                                    w-8 h-8 rounded-lg flex items-center justify-center transition-all
                                                    ${isDone
                                                        ? 'bg-green-500 text-black shadow-lg shadow-green-500/20'
                                                        : 'bg-white/5 text-transparent border border-white/5'}
                                                `}
                                                title={format(day, 'MMM d')}
                                            >
                                                {isDone && <Check size={16} strokeWidth={3} />}
                                            </div>
                                            <span className={`text-[10px] uppercase font-bold ${isTodayDate ? 'text-white' : 'text-neutral-600'}`}>
                                                {format(day, 'EEE')}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                                <button
                                    onClick={() => toggleHabitForToday(habit)}
                                    className={`
                                        flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                                        ${completedToday
                                            ? 'bg-neutral-700 text-neutral-400 cursor-default'
                                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'}
                                    `}
                                >
                                    {completedToday ? 'Done for today' : 'Check In'}
                                </button>
                                <button
                                    onClick={() => deleteHabit(habit.id)}
                                    className="p-2 text-neutral-600 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Habits;
