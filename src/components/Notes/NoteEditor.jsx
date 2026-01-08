
import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Maximize2, Minimize2 } from 'lucide-react';

const NoteEditor = ({ note, onSave, onCancel }) => {
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content, isFullscreen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() && !content.trim()) return;

        onSave({
            ...note,
            title: title || 'Untitled Note',
            content,
            updatedAt: new Date(),
        });
    };

    return (
        <div className={`
            glass-panel rounded-2xl flex flex-col overflow-hidden transition-all duration-300
            ${isFullscreen ? 'fixed inset-4 z-50' : 'h-[600px]'}
        `}>
            {/* Toolbar / Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-transparent">
                <input
                    type="text"
                    placeholder="Untitled Note"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-transparent text-3xl font-bold text-white placeholder-neutral-600 focus:outline-none w-full mr-8 font-display"
                />

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>

                    <button
                        onClick={onCancel}
                        className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                        title="Cancel"
                    >
                        <X size={20} />
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-5 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors font-medium shadow-lg shadow-white/5"
                    >
                        <Save size={18} />
                        <span>Save</span>
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-transparent">
                <textarea
                    ref={textareaRef}
                    placeholder="Start typing..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-transparent text-lg text-neutral-200 placeholder-neutral-600 resize-none focus:outline-none leading-relaxed min-h-[500px]"
                    style={{ minHeight: '100%' }}
                />
            </div>
        </div>
    );
};

export default NoteEditor;
