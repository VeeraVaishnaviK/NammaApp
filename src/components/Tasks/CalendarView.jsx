import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Circle } from 'lucide-react';

const CalendarView = ({ tasks, onUpdateStatus }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Group tasks by date
    const getTasksForDay = (date) => {
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            return isSameDay(task.dueDate.toDate(), date);
        });
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    return (
        <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white font-display">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 rounded-md text-neutral-300 transition-colors">
                        Today
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-4 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-neutral-500 font-medium text-sm text-center">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-4 flex-1 auto-rows-fr">
                {/* Padding for start of month - simplified for now, just listing days */}
                {/* Ensure we align properly with day of week? 
                    Yes, typically we need empty cells. 
                    Let's just iterate days for now. 
                    For a proper grid, we usually need startOfWeek/endOfWeek range. 
                    Let's update 'days' logic slightly if we want full grid.
                */}
                {days.map(day => {
                    const dayTasks = getTasksForDay(day);
                    const isCurrentDay = isToday(day);

                    return (
                        <div
                            key={day.toString()}
                            className={`
                                min-h-[100px] p-3 rounded-xl border transition-all
                                ${isCurrentDay
                                    ? 'bg-blue-500/10 border-blue-500/30'
                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                }
                            `}
                        >
                            <div className={`text-sm font-medium mb-2 ${isCurrentDay ? 'text-blue-400' : 'text-neutral-400'}`}>
                                {format(day, 'd')}
                            </div>

                            <div className="space-y-1.5 overflow-y-auto max-h-[80px] custom-scrollbar">
                                {dayTasks.map(task => (
                                    <button
                                        key={task.id}
                                        onClick={() => onUpdateStatus(task.id, !task.completed)}
                                        className={`
                                            w-full text-left text-xs p-1.5 rounded-md truncate flex items-center gap-1.5 group
                                            ${task.completed || task.status === 'done'
                                                ? 'bg-green-500/10 text-green-400 line-through decoration-green-400/50'
                                                : 'bg-white/5 text-neutral-200 hover:bg-white/10'
                                            }
                                        `}
                                        title={task.text || task.title}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${task.completed ? 'bg-green-500' : 'bg-blue-500'}`} />
                                        <span className="truncate">{task.text || task.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
