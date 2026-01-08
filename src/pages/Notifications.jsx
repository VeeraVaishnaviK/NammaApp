import React, { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Bell, CheckCircle2, MessageSquare, Briefcase, Calendar, Clock, BookOpen, Trash2 } from 'lucide-react';
import { formatDistanceToNow, subHours, subMinutes, subDays } from 'date-fns';

const Notifications = () => {
    const { currentWorkspaceName } = useWorkspace();

    // Mock Notifications Data
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'message',
            title: 'New comment in Website Redesign',
            message: 'Alex: "The new mockups look great! When can we review?"',
            time: subMinutes(new Date(), 5),
            read: false,
            icon: MessageSquare,
            color: 'bg-blue-500'
        },
        {
            id: 2,
            type: 'task',
            title: 'Task Assigned',
            message: 'You were assigned to "Fix navigation bug"',
            time: subHours(new Date(), 2),
            read: false,
            icon: CheckCircle2,
            color: 'bg-green-500'
        },
        {
            id: 3,
            type: 'event',
            title: 'Meeting in 30 mins',
            message: 'Weekly Sync with Marketing Team',
            time: subMinutes(new Date(), 30),
            read: true,
            icon: Calendar,
            color: 'bg-orange-500'
        },
        {
            id: 4,
            type: 'study',
            title: 'Exam Reminder',
            message: 'Physics Final is in 3 days. Keep studying!',
            time: subDays(new Date(), 1),
            read: true,
            icon: BookOpen,
            color: 'bg-purple-500'
        },
        {
            id: 5,
            type: 'project',
            title: 'File Uploaded',
            message: 'Sarah uploaded "Q3_Budget.xlsx" to Financial Plans',
            time: subDays(new Date(), 2),
            read: true,
            icon: Briefcase,
            color: 'bg-indigo-500'
        }
    ]);

    const markAsRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{currentWorkspaceName} - Inbox</h1>
                    <p className="text-neutral-400">Stay updated with your team and deadlines.</p>
                </div>
                <div className="flex gap-4">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden flex-1 flex flex-col">
                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell size={18} className="text-white" />
                        <span className="font-bold text-white">Notifications</span>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </div>

                <div className="overflow-y-auto custom-scrollbar flex-1">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                            <Bell size={48} className="mb-4 opacity-20" />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`
                                        p-6 flex gap-4 transition-colors group
                                        ${notification.read ? 'bg-transparent hover:bg-white/5' : 'bg-blue-500/5 hover:bg-blue-500/10'}
                                    `}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-lg
                                        ${notification.read ? 'bg-neutral-700 text-neutral-400' : notification.color}
                                    `}>
                                        <notification.icon size={18} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`text-sm font-medium ${notification.read ? 'text-neutral-300' : 'text-white font-bold'}`}>
                                                {notification.title}
                                            </h3>
                                            <span className="text-xs text-neutral-500 whitespace-nowrap ml-2">
                                                {formatDistanceToNow(notification.time, { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className={`text-sm ${notification.read ? 'text-neutral-500' : 'text-neutral-300'}`}>
                                            {notification.message}
                                        </p>
                                    </div>

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                            className="p-2 text-neutral-600 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
