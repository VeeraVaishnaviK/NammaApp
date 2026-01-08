
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const AddTask = ({ onAdd, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        onAdd({
            title,
            description,
            dueDate: dueDate ? new Date(dueDate) : null,
            completed: false,
            createdAt: new Date(),
        });

        setTitle('');
        setDescription('');
        setDueDate('');
    };

    return (
        <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">New Task</h3>
                <button onClick={onCancel} className="text-neutral-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="text"
                        placeholder="Task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                        autoFocus
                    />
                </div>

                <div>
                    <textarea
                        placeholder="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors resize-none h-20"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-blue-500"
                    />

                    <div className="flex-1 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add Task
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddTask;
