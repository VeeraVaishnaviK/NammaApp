import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch, Timestamp, db, where } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Plus, Loader2, LayoutGrid, List as ListIcon, Calendar as CalendarIcon } from 'lucide-react';
import { Reorder } from 'framer-motion';
import TaskItem from '../components/Tasks/TaskItem';
import AddTask from '../components/Tasks/AddTask';
import KanbanBoard from '../components/Tasks/KanbanBoard';
import CalendarView from '../components/Tasks/CalendarView';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'board', 'calendar'
    const { currentUser } = useAuth();
    const { activeWorkspace, currentWorkspaceName } = useWorkspace();
    // Keep track of internal order updates to avoid fighting with real-time listeners
    const [localTasks, setLocalTasks] = useState([]);

    useEffect(() => {
        if (!currentUser) return;

        // Query tasks collection, ordered by creation time (stable fallback)
        // We handle 'order' sorting client-side to ensure legacy tasks (without order field) are still visible
        const q = query(
            collection(db, 'tasks'),
            where('workspaceId', '==', activeWorkspace),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const taskList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort client-side: items with 'order' come first (asc), then fallback to original sort
            taskList.sort((a, b) => {
                if (typeof a.order === 'number' && typeof b.order === 'number') {
                    return a.order - b.order;
                }
                // If only one has order, what to do? 
                // If we assume un-ordered items are 'newly discovered' or 'legacy', we can put them at end or keep relative pos.
                // Simpler: If no order, treat as 'Infinity' (end of list) or just keep createdAt sort?
                // Let's treat missing order as occurring AFTER ordered items? Or mixed?
                // Actually, if we just rely on the array order from snapshot (createdAt desc) for ties, it's fine.
                if (typeof a.order === 'number') return -1;
                if (typeof b.order === 'number') return 1;
                return 0;
            });

            setTasks(taskList);
            setLocalTasks(taskList); // Sync local state
            setLoading(false);
        }, (error) => {
            console.error("Error fetching tasks:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, activeWorkspace]);

    const handleReorder = (newOrder) => {
        setLocalTasks(newOrder);
    };

    // Save order when drag ends (simulated by effect on localTasks change, debounced could be better, but we'll use a manual save or just simple batch on change)
    // Actually, Reorder.Group just updates state. We need to detect when the drag sequence is "done".
    // Framer motion doesn't give an easy global 'onDragEnd'. 
    // We can just update Firestore for every reorder event? No, too many writes.
    // Let's rely on a small timeout or just update simply.
    // For this implementation, we will update the order of ALL items in the batch when the user releases the mouse?
    // We don't have that event here easily. 
    // We'll update the 'order' field for *changed* items after a short debounce.

    useEffect(() => {
        // Debounce saving order
        const timeoutId = setTimeout(() => {
            // Check if order is different from tasks (the server state)
            const isDifferent = JSON.stringify(localTasks.map(t => t.id)) !== JSON.stringify(tasks.map(t => t.id));

            if (isDifferent && localTasks.length > 0) {
                updateTaskOrder(localTasks);
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [localTasks, tasks]);


    const updateTaskOrder = async (orderedTasks) => {
        try {
            const batch = writeBatch(db);
            orderedTasks.forEach((task, index) => {
                // Only update if rank changed? Easier to just write all indices for now in a small list
                const taskRef = doc(db, 'tasks', task.id);
                batch.update(taskRef, { order: index });
            });
            await batch.commit();
        } catch (error) {
            console.error("Error updating order:", error);
        }
    };

    const addTask = async (taskData) => {
        try {
            // Add new task at the end (or beginning?)
            // If beginning, order should be min - 1. If end, max + 1.
            // Let's add to start for visibility, so order = -1 or shift others?
            // Simpler: Just add it, and let it have an order 0?
            // Actually, we sort asc. So order 0 is top.
            // We'll give it order: 0 and maybe re-index others later, or use floating point?
            // For now, let's just create it with order 0 and let it sit there. 
            // Better: Get min order from current list.
            const minOrder = localTasks.length > 0 ? Math.min(...localTasks.map(t => t.order || 0)) : 0;

            await addDoc(collection(db, 'tasks'), {
                ...taskData,
                userId: currentUser.uid,
                userEmail: currentUser.email,
                workspaceId: activeWorkspace,
                createdAt: Timestamp.now(),
                order: minOrder - 1,
                dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : null
            });
            setIsAdding(false);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const toggleTask = async (id, completed, status = null) => {
        try {
            const taskRef = doc(db, 'tasks', id);
            const updates = { completed };
            if (status) updates.status = status;

            await updateDoc(taskRef, updates);
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const deleteTask = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await deleteDoc(doc(db, 'tasks', id));
        } catch (error) {
            console.error("Error deleting task:", error);
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
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{currentWorkspaceName} - Tasks</h1>
                    <p className="text-neutral-400">Manage your daily tasks and to-dos</p>
                </div>

                <div className="flex items-center gap-2 bg-neutral-800 p-1 rounded-lg border border-white/5">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                    >
                        <ListIcon size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('board')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'board' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                    >
                        <CalendarIcon size={20} />
                    </button>
                </div>

                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={20} />
                        New Task
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {isAdding && (
                    <AddTask onAdd={addTask} onCancel={() => setIsAdding(false)} />
                )}

                {localTasks.length === 0 && !isAdding ? (
                    <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 border-dashed backdrop-blur-sm">
                        <p className="text-neutral-400 mb-4 text-lg">No tasks in this workspace</p>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="text-blue-400 hover:text-blue-300 font-medium"
                        >
                            Create your first task
                        </button>
                    </div>
                ) : (
                    <>
                        {viewMode === 'list' && (
                            <Reorder.Group axis="y" values={localTasks} onReorder={handleReorder} className="space-y-2">
                                {localTasks.map(task => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onToggle={toggleTask}
                                        onDelete={deleteTask}
                                    />
                                ))}
                            </Reorder.Group>
                        )}

                        {viewMode === 'board' && (
                            <KanbanBoard
                                tasks={localTasks}
                                onUpdateStatus={toggleTask}
                                onDelete={deleteTask}
                            />
                        )}

                        {viewMode === 'calendar' && (
                            <CalendarView
                                tasks={localTasks}
                                onUpdateStatus={toggleTask}
                            />
                        )}
                    </>
                )}
            </div>
        </div >
    );
};

export default Tasks;
