
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { LayoutDashboard, CheckSquare, StickyNote, LogOut, Settings, ChevronDown, User, Users, Clock, CheckCircle2, Calendar, BookOpen, Briefcase, Bell, Sparkles } from 'lucide-react';

const Sidebar = () => {
    const { logout } = useAuth();
    const { activeWorkspace, switchWorkspace, workspaceNames } = useWorkspace();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/notifications', icon: Bell, label: 'Inbox' },
        { path: '/projects', icon: Briefcase, label: 'Projects' },
        { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
        { path: '/events', icon: Calendar, label: 'Events' },
        { path: '/study', icon: BookOpen, label: 'Study' },
        { path: '/routine', icon: Clock, label: 'Routine' },
        { path: '/habits', icon: CheckCircle2, label: 'Habits' },
        { path: '/notes', icon: StickyNote, label: 'Notes' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    const workspaces = [
        { id: 'personal', label: workspaceNames.personal, icon: User, color: 'text-blue-400' },
        { id: 'partner', label: workspaceNames.partner, icon: User, color: 'text-purple-400' },
        { id: 'shared', label: workspaceNames.shared, icon: Users, color: 'text-green-400' },
    ];

    const currentWorkspace = workspaces.find(w => w.id === activeWorkspace);

    return (
        <div className="h-screen w-64 glass-sidebar flex flex-col transition-all duration-300">
            {/* App Branding */}
            <div className="p-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
                    <Sparkles size={24} className="text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Namma App
                </h1>
            </div>
            <div className="p-4 border-b border-white/5">
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-neutral-700 transition-colors group"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-1.5 rounded-md bg-white/5 ${currentWorkspace.color}`}>
                                <currentWorkspace.icon size={16} />
                            </div>
                            <span className="font-bold text-white truncate text-left">
                                {currentWorkspace.label}
                            </span>
                        </div>
                        <ChevronDown size={16} className={`text-neutral-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                            {workspaces.map(ws => (
                                <button
                                    key={ws.id}
                                    onClick={() => {
                                        switchWorkspace(ws.id);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 hover:bg-neutral-700 transition-colors ${activeWorkspace === ws.id ? 'bg-neutral-700/50' : ''}`}
                                >
                                    <div className={`p-1.5 rounded-md bg-white/5 ${ws.color}`}>
                                        <ws.icon size={16} />
                                    </div>
                                    <span className="text-white text-sm font-medium truncate">{ws.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-white/10 text-white shadow-lg shadow-black/5 backdrop-blur-sm'
                                : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-neutral-400 hover:bg-white/5 hover:text-red-400 transition-all duration-200 group"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Log Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
