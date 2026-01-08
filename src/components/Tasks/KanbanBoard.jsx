import React from 'react';
import { Reorder } from 'framer-motion';
import TaskItem from './TaskItem';

const KanbanColumn = ({ title, tasks, onReorder, status, onToggle, onDelete }) => {
    return (
        <div className="flex-1 min-w-[300px] flex flex-col glass-panel rounded-2xl h-full max-h-full">
            <div className="p-4 border-b border-white/5 bg-white/5 rounded-t-2xl flex justify-between items-center">
                <h3 className="font-semibold text-white">{title}</h3>
                <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-neutral-400 font-mono">
                    {tasks.length}
                </span>
            </div>

            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                <Reorder.Group axis="y" values={tasks} onReorder={(newOrder) => onReorder(status, newOrder)} className="space-y-3">
                    {tasks.map(task => (
                        <div key={task.id} className="cursor-grab active:cursor-grabbing">
                            {/* We wrap TaskItem to ensure drag handlers work, or use TaskItem directly if it supports ref */}
                            <TaskItem
                                task={task}
                                onToggle={onToggle}
                                onDelete={onDelete}
                                compact={true}
                            />
                        </div>
                    ))}
                    {tasks.length === 0 && (
                        <div className="text-center py-8 text-neutral-600 border-2 border-dashed border-white/5 rounded-xl">
                            <p className="text-sm">Empty</p>
                        </div>
                    )}
                </Reorder.Group>
            </div>
        </div>
    );
};

const KanbanBoard = ({ tasks, onUpdateStatus, onDelete }) => {
    // We filter tasks locally for display
    const todoTasks = tasks.filter(t => t.status === 'todo' || (!t.status && !t.completed));
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const doneTasks = tasks.filter(t => t.status === 'done' || t.completed);

    const handleReorder = (status, newOrder) => {
        // This visual reorder doesn't persist properly without more complex logic in parent
        // For minimal MVP, we might skip reordering within columns or just let parent handle "update status"
        // Actually, let's just use drag-to-move-between-columns if possible?
        // Framer Motion Reorder is for single list. 
        // For multi-list drag and drop, we might need dnd-kit or react-beautiful-dnd.
        // Given complexity, let's make a simple column view first where you change status via dropdown in TaskItem?
        // OR simpler: Just 3 lists side-by-side.
    };

    return (
        <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
            {/* We will just render columns. Drag and drop between columns is hard with just Reorder. 
               We will add a status switcher to the TaskItem first. */}
            <KanbanColumn
                title="To Do"
                tasks={todoTasks}
                onReorder={handleReorder}
                status="todo"
                onToggle={onUpdateStatus}
                onDelete={onDelete}
            />
            <KanbanColumn
                title="In Progress"
                tasks={inProgressTasks}
                onReorder={handleReorder}
                status="in-progress"
                onToggle={onUpdateStatus}
                onDelete={onDelete}
            />
            <KanbanColumn
                title="Done"
                tasks={doneTasks}
                onReorder={handleReorder}
                status="done"
                onToggle={onUpdateStatus}
                onDelete={onDelete}
            />
        </div>
    );
};

export default KanbanBoard;
