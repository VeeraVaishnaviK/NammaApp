
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Trash2 } from 'lucide-react';

const NoteList = ({ notes, onEdit, onDelete }) => {
    if (notes.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-neutral-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-600">
                    <FileText size={32} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No notes yet</h3>
                <p className="text-neutral-400">Select "New Note" to get started</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
                <div
                    key={note.id}
                    onClick={() => onEdit(note)}
                    className="group relative bg-neutral-800 rounded-xl border border-neutral-700 p-6 cursor-pointer hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 h-64 flex flex-col"
                >
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-1">{note.title}</h3>

                    <p className="text-neutral-400 text-sm line-clamp-6 flex-1 whitespace-pre-wrap">
                        {note.content || "No content"}
                    </p>

                    <div className="mt-4 flex justify-between items-center text-xs text-neutral-500 pt-4 border-t border-neutral-700/50">
                        <span>
                            {note.updatedAt && formatDistanceToNow(
                                note.updatedAt.toDate ? note.updatedAt.toDate() :
                                    (note.updatedAt.seconds ? new Date(note.updatedAt.seconds * 1000) : new Date(note.updatedAt)),
                                { addSuffix: true }
                            )}
                        </span>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(note.id);
                            }}
                            className="text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 -mr-2"
                            title="Delete note"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NoteList;
