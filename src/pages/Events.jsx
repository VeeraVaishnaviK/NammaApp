import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy } from '../firebase';
import { db } from '../firebase';
import { Plus, Trash2, MapPin, Calendar, Clock, Map } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const Events = () => {
    const { activeWorkspace, currentWorkspaceName } = useWorkspace();
    const { currentUser } = useAuth();
    const [events, setEvents] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: ''
    });

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'events'),
            where('workspaceId', '==', activeWorkspace),
            orderBy('date', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEvents(items);
        });

        return () => unsubscribe();
    }, [currentUser, activeWorkspace]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'events'), {
                ...newEvent,
                userId: currentUser.uid,
                workspaceId: activeWorkspace,
                createdAt: Timestamp.now()
            });
            setIsAdding(false);
            setNewEvent({ title: '', date: '', time: '', location: '', description: '' });
        } catch (error) {
            console.error("Error adding event:", error);
        }
    };

    const deleteEvent = async (id) => {
        if (window.confirm("Delete this event?")) {
            await deleteDoc(doc(db, 'events', id));
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{currentWorkspaceName} - Events</h1>
                    <p className="text-neutral-400">Never miss a meeting, deadline, or party.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                    <Plus size={20} />
                    New Event
                </button>
            </div>

            {isAdding && (
                <div className="glass-panel p-6 rounded-xl mb-8 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">Event Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Project Kickoff"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">Location</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="e.g. Conference Room A or Zoom"
                                        value={newEvent.location}
                                        onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:outline-none focus:border-blue-500"
                                    />
                                    <MapPin size={16} className="absolute left-3 top-3.5 text-neutral-500" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">Date</label>
                                <input
                                    type="date"
                                    value={newEvent.date}
                                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">Time</label>
                                <input
                                    type="time"
                                    value={newEvent.time}
                                    onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-neutral-400 mb-1 block">Description (Optional)</label>
                            <textarea
                                placeholder="Details..."
                                value={newEvent.description}
                                onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 min-h-[80px]"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700">Save Event</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar pb-8">
                {events.map(event => {
                    const eventDate = new Date(`${event.date}T${event.time || '00:00'}`);
                    const isPast = eventDate < new Date();

                    return (
                        <div key={event.id} className={`glass-panel p-6 rounded-2xl border border-transparent hover:border-white/10 transition-all group relative overflow-hidden ${isPast ? 'opacity-60' : ''}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                                        <Calendar size={14} />
                                        <span>{format(eventDate, 'MMM d, yyyy')}</span>
                                        {event.time && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                                <Clock size={14} />
                                                <span>{event.time}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isPast ? 'bg-neutral-800 text-neutral-500' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {isPast ? 'Past' : formatDistanceToNow(eventDate, { addSuffix: true })}
                                </div>
                            </div>

                            {event.location && (
                                <div className="flex items-center gap-2 text-sm text-neutral-300 mb-4 bg-white/5 p-2 rounded-lg inline-flex">
                                    <MapPin size={14} className="text-red-400" />
                                    <span>{event.location}</span>
                                </div>
                            )}

                            {event.description && (
                                <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                                    {event.description}
                                </p>
                            )}

                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => deleteEvent(event.id)}
                                    className="p-2 bg-neutral-800/80 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-700 backdrop-blur-sm"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {events.length === 0 && !isAdding && (
                    <div className="col-span-full text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <div className="inline-flex p-4 rounded-full bg-white/5 mb-4 text-neutral-500">
                            <Map size={32} />
                        </div>
                        <p className="text-neutral-400 mb-4">No upcoming events planned.</p>
                        <button onClick={() => setIsAdding(true)} className="text-blue-400 hover:underline">Schedule something</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Events;
