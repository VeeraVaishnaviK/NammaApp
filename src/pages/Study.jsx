import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy } from '../firebase';
import { db } from '../firebase';
import { Plus, Trash2, BookOpen, GraduationCap, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const Study = () => {
    const { activeWorkspace, currentWorkspaceName } = useWorkspace();
    const { currentUser } = useAuth();
    const [exams, setExams] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newExam, setNewExam] = useState({
        subject: '',
        date: '',
        syllabus: '' // Just comma separated for MVP
    });

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'exams'),
            where('workspaceId', '==', activeWorkspace),
            orderBy('date', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setExams(items);
        });

        return () => unsubscribe();
    }, [currentUser, activeWorkspace]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            // Parse syllabus
            const modules = newExam.syllabus.split(',').map(s => ({
                name: s.trim(),
                completed: false
            })).filter(m => m.name);

            await addDoc(collection(db, 'exams'), {
                subject: newExam.subject,
                date: newExam.date,
                modules,
                userId: currentUser.uid,
                workspaceId: activeWorkspace,
                createdAt: Timestamp.now()
            });
            setIsAdding(false);
            setNewExam({ subject: '', date: '', syllabus: '' });
        } catch (error) {
            console.error("Error adding exam:", error);
        }
    };

    const toggleModule = async (exam, moduleIndex) => {
        const updatedModules = [...exam.modules];
        updatedModules[moduleIndex].completed = !updatedModules[moduleIndex].completed;

        await updateDoc(doc(db, 'exams', exam.id), {
            modules: updatedModules
        });
    };

    const deleteExam = async (id) => {
        if (window.confirm("Remove this exam tracker?")) {
            await deleteDoc(doc(db, 'exams', id));
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{currentWorkspaceName} - Study</h1>
                    <p className="text-neutral-400">Ace your exams with syllabus tracking.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                    <Plus size={20} />
                    New Exam
                </button>
            </div>

            {isAdding && (
                <div className="glass-panel p-6 rounded-xl mb-8 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">Subject / Exam Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Advanced Calculus"
                                    value={newExam.subject}
                                    onChange={e => setNewExam({ ...newExam, subject: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">Exam Date</label>
                                <input
                                    type="date"
                                    value={newExam.date}
                                    onChange={e => setNewExam({ ...newExam, date: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-neutral-400 mb-1 block">Syllabus Modules (Comma separated)</label>
                            <textarea
                                placeholder="Unit 1: Limits, Unit 2: Derivatives, Unit 3: Integrals..."
                                value={newExam.syllabus}
                                onChange={e => setNewExam({ ...newExam, syllabus: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700">Start Tracking</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar pb-8">
                {exams.map(exam => {
                    const daysLeft = differenceInDays(new Date(exam.date), new Date());
                    const totalModules = exam.modules.length;
                    const completedModules = exam.modules.filter(m => m.completed).length;
                    const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

                    let urgencyColor = 'text-green-400';
                    if (daysLeft < 3) urgencyColor = 'text-red-400';
                    else if (daysLeft < 7) urgencyColor = 'text-orange-400';

                    return (
                        <div key={exam.id} className="glass-panel p-6 rounded-2xl flex flex-col h-full group">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1">{exam.subject}</h3>
                                    <div className="text-sm text-neutral-400 flex items-center gap-2">
                                        <GraduationCap size={16} />
                                        <span>{format(new Date(exam.date), 'MMMM d, yyyy')}</span>
                                    </div>
                                </div>
                                <div className={`flex flex-col items-center justify-center bg-white/5 rounded-xl p-3 min-w-[80px] ${urgencyColor}`}>
                                    <span className="text-2xl font-bold">{daysLeft}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Days Left</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-neutral-400">Syllabus Completion</span>
                                    <span className="text-white font-mono">{progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Syllabus List */}
                            <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                                <h4 className="text-xs text-neutral-500 uppercase font-bold mb-3 tracking-wider">Modules</h4>
                                {exam.modules.map((module, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => toggleModule(exam, idx)}
                                        className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${module.completed ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`}
                                    >
                                        {module.completed ? <CheckCircle2 size={18} className="shrink-0" /> : <Circle size={18} className="shrink-0 text-neutral-500" />}
                                        <span className={`text-sm ${module.completed ? 'line-through opacity-70' : ''}`}>{module.name}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => deleteExam(exam.id)}
                                    className="flex items-center gap-2 text-red-400 hover:bg-red-400/10 px-3 py-1.5 rounded-lg text-sm transition-colors"
                                >
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Study;
