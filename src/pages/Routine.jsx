import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy } from '../firebase';
import { db } from '../firebase'; // Ensure db is imported
import { Plus, Trash2, Clock, CheckCircle2, Circle } from 'lucide-react';

const Routine = () => {
    const { activeWorkspace, currentWorkspaceName } = useWorkspace();
    const { currentUser } = useAuth();
    const [routines, setRoutines] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ title: '', startTime: '08:00', endTime: '09:00' });

    // Fetch routines
    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'routines'),
            where('workspaceId', '==', activeWorkspace),
            orderBy('startTime', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRoutines(items);
        });

        return () => unsubscribe();
    }, [currentUser, activeWorkspace]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'routines'), {
                ...newItem,
                userId: currentUser.uid,
                workspaceId: activeWorkspace,
                completed: false,
                createdAt: Timestamp.now()
            });
            setIsAdding(false);
            setNewItem({ title: '', startTime: '09:00', endTime: '10:00' });
        } catch (error) {
            console.error("Error adding routine:", error);
        }
    };

    const toggleComplete = async (id, currentStatus) => {
        await updateDoc(doc(db, 'routines', id), { completed: !currentStatus });
    };

    const deleteRoutine = async (id) => {
        if (window.confirm("Remove this routine item?")) {
            await deleteDoc(doc(db, 'routines', id));
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{currentWorkspaceName} - Daily Routine</h1>
                    <p className="text-neutral-400">Design your perfect day, track your flow.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                    <Plus size={20} />
                    Add Block
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 relative">
                {/* Visual Timeline Line - simplified for now */}
                <div className="absolute left-[85px] top-0 bottom-0 w-px bg-white/10 hidden md:block"></div>

                {isAdding && (
                    <div className="glass-panel p-6 rounded-xl mb-6 animate-in fade-in slide-in-from-top-4">
                        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="text-xs text-neutral-400 mb-1 block">Activity</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Morning Workout"
                                    value={newItem.title}
                                    onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="w-full md:w-32">
                                <label className="text-xs text-neutral-400 mb-1 block">Start</label>
                                <input
                                    type="time"
                                    value={newItem.startTime}
                                    onChange={e => setNewItem({ ...newItem, startTime: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="w-full md:w-32">
                                <label className="text-xs text-neutral-400 mb-1 block">End</label>
                                <input
                                    type="time"
                                    value={newItem.endTime}
                                    onChange={e => setNewItem({ ...newItem, endTime: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                )}

                {routines.map((item) => (
                    <div key={item.id} className="flex gap-6 group relative z-10">
                        {/* Time Column */}
                        <div className="w-20 pt-4 text-right text-sm font-mono text-neutral-500 hidden md:block">
                            {item.startTime}
                        </div>

                        {/* Card */}
                        <div className={`
                            flex-1 glass-panel p-4 rounded-xl border flex items-center gap-4 transition-all
                            ${item.completed
                                ? 'bg-green-500/5 border-green-500/20 opacity-75'
                                : 'hover:bg-white/5 border-transparent hover:border-white/10'}
                        `}>
                            <div className="md:hidden text-xs font-mono text-neutral-500 flex flex-col items-center justify-center min-w-[50px] border-r border-white/5 pr-3">
                                <span>{item.startTime}</span>
                                <div className="h-2 w-px bg-white/10 my-1"></div>
                                <span>{item.endTime}</span>
                            </div>

                            <div className="flex-1">
                                <h3 className={`font-medium text-lg ${item.completed ? 'text-neutral-400 line-through' : 'text-white'}`}>
                                    {item.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                                    <Clock size={12} />
                                    <span>{item.startTime} - {item.endTime}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => toggleComplete(item.id, item.completed)}
                                className="text-neutral-500 hover:text-green-400 transition-colors"
                            >
                                {item.completed ? <CheckCircle2 size={24} className="text-green-500" /> : <Circle size={24} />}
                            </button>

                            <button
                                onClick={() => deleteRoutine(item.id)}
                                className="p-2 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {routines.length === 0 && !isAdding && (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <p className="text-neutral-400 mb-4">No routines set for this workspace.</p>
                        <button onClick={() => setIsAdding(true)} className="text-blue-400 hover:underline">Start your day</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Routine;
