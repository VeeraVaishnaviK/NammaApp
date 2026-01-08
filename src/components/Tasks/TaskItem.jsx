import React from 'react';
import { format } from 'date-fns';
import { Trash2, GripVertical, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';

const TaskItem = ({ task, onToggle, onDelete, compact = false }) => {
    const controls = useDragControls();

    const getStatusIcon = () => {
        if (task.completed || task.status === 'done') return <CheckCircle2 className="text-green-500" size={20} />;
        if (task.status === 'in-progress') return <Clock className="text-blue-500" size={20} />;
        return <Circle className="text-neutral-500" size={20} />;
    };

    const handleStatusClick = () => {
        if (task.completed || task.status === 'done') {
            onToggle(task.id, false, 'todo'); // uncomplete
        } else if (task.status === 'in-progress') {
            onToggle(task.id, true, 'done'); // complete
        } else {
            onToggle(task.id, false, 'in-progress'); // start
        }
    };

    return (
        <Reorder.Item
            value={task}
            id={task.id}
            dragListener={false}
            dragControls={controls}
            className={`
                group glass-panel p-4 rounded-xl flex items-center justify-between 
                transition-all mb-3 border-transparent hover:border-white/10 shadow-sm
                ${task.completed || task.status === 'done' ? 'opacity-75' : ''}
            `}
        >
            <div className="flex items-center gap-4 flex-1">
                {/* Drag Handle */}
                <div
                    onPointerDown={(e) => controls.start(e)}
                    className="cursor-grab active:cursor-grabbing text-neutral-600 hover:text-neutral-400 p-1"
                >
                    <GripVertical size={18} />
                </div>

                {/* Status Toggle */}
                <button
                    onClick={handleStatusClick}
                    className="transition-colors hover:scale-110 active:scale-95"
                    title="Click to cycle status: Todo -> In Progress -> Done"
                >
                    {getStatusIcon()}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className={`font-medium text-white truncate transition-all ${task.completed || task.status === 'done' ? 'line-through text-neutral-500' : ''}`}>
                        {task.text || task.title}
                    </p>
                    {task.dueDate && !compact && (
                        <p className="text-xs text-neutral-500 mt-1">
                            Due {format(task.dueDate.toDate(), 'MMM d')}
                        </p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onDelete(task.id)}
                    className="p-2 text-neutral-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                    title="Delete task"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </Reorder.Item>
    );
};

export default TaskItem;
