
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, db, where } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Plus, Loader2 } from 'lucide-react';
import NoteList from '../components/Notes/NoteList';
import NoteEditor from '../components/Notes/NoteEditor';

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingNote, setEditingNote] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const { currentUser } = useAuth();
    const { activeWorkspace, currentWorkspaceName } = useWorkspace();

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'notes'),
            where('workspaceId', '==', activeWorkspace),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const noteList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotes(noteList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notes:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, activeWorkspace]);

    const handleSaveNote = async (noteData) => {
        try {
            const { id, ...data } = noteData;

            if (id) {
                // Update existing
                await updateDoc(doc(db, 'notes', id), {
                    ...data,
                    updatedAt: Timestamp.now()
                });
            } else {
                // Create new
                await addDoc(collection(db, 'notes'), {
                    ...data,
                    userId: currentUser.uid,
                    workspaceId: activeWorkspace,
                    author: currentUser.email,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
            }

            setEditingNote(null);
            setIsCreating(false);
        } catch (error) {
            console.error("Error saving note:", error);
        }
    };

    const handleDeleteNote = async (id) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;
        try {
            await deleteDoc(doc(db, 'notes', id));
            if (editingNote?.id === id) {
                setEditingNote(null);
            }
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
            {!editingNote && !isCreating ? (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{currentWorkspaceName} - Notes</h1>
                            <p className="text-neutral-400">Capture your ideas and thoughts</p>
                        </div>

                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            New Note
                        </button>
                    </div>

                    <NoteList
                        notes={notes}
                        onEdit={setEditingNote}
                        onDelete={handleDeleteNote}
                    />
                </>
            ) : (
                <NoteEditor
                    note={editingNote}
                    onSave={handleSaveNote}
                    onCancel={() => {
                        setEditingNote(null);
                        setIsCreating(false);
                    }}
                />
            )}
        </div>
    );
};

export default Notes;
