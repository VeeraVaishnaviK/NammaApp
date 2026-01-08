import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Link } from 'react-router-dom';
import { CheckSquare, StickyNote, ArrowRight } from 'lucide-react';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const { activeWorkspace, currentWorkspaceName } = useWorkspace();
    const [stats, setStats] = useState({
        pendingTasks: 0,
        activeNotes: 0
    });

    useEffect(() => {
        if (!currentUser) return;

        // Listen for pending tasks
        const tasksQuery = query(
            collection(db, 'tasks'),
            where('workspaceId', '==', activeWorkspace),
            where('completed', '==', false)
        );

        const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
            setStats(prev => ({
                ...prev,
                pendingTasks: snapshot.size
            }));
        });

        // Listen for notes
        const notesQuery = query(
            collection(db, 'notes'),
            where('workspaceId', '==', activeWorkspace)
        );
        const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
            setStats(prev => ({
                ...prev,
                activeNotes: snapshot.size
            }));
        });

        return () => {
            unsubscribeTasks();
            unsubscribeNotes();
        };
    }, [currentUser, activeWorkspace]);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-2">
                    {currentWorkspaceName}
                </h1>
                <p className="text-neutral-400 text-lg">Detailed overview of your {activeWorkspace === 'personal' ? 'Personal' : 'Professional'} workspace.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link to="/tasks" className="block group">
                    <div className="glass-panel p-8 rounded-2xl border border-transparent hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <CheckSquare size={32} />
                            </div>
                            <ArrowRight className="text-neutral-600 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <h3 className="text-lg font-medium text-neutral-400 mb-1">Pending Tasks</h3>
                        <p className="text-5xl font-bold text-white group-hover:text-blue-400 transition-colors">
                            {stats.pendingTasks}
                        </p>
                    </div>
                </Link>

                <Link to="/notes" className="block group">
                    <div className="glass-panel p-8 rounded-2xl border border-transparent hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                <StickyNote size={32} />
                            </div>
                            <ArrowRight className="text-neutral-600 group-hover:text-purple-400 transition-colors" />
                        </div>
                        <h3 className="text-lg font-medium text-neutral-400 mb-1">Total Notes</h3>
                        <p className="text-5xl font-bold text-white group-hover:text-purple-400 transition-colors">
                            {stats.activeNotes}
                        </p>
                    </div>
                </Link>
            </div>

            {/* Quick Tips or Info section */}
            <div className="glass-panel p-6 rounded-xl border border-white/5 bg-gradient-to-r from-white/5 to-transparent">
                <h3 className="text-white font-semibold mb-2">Pro Tip</h3>
                <p className="text-neutral-400 text-sm">
                    Collaborate effectively by keeping your tasks updated. All changes are synced in real-time.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
