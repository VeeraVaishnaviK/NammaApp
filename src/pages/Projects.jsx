import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy } from '../firebase';
import { db } from '../firebase';
import { Plus, Trash2, Folder, FileText, Upload, MessageSquare, Send, Calendar, PieChart, Briefcase } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const Projects = () => {
    const { activeWorkspace, currentWorkspaceName } = useWorkspace();
    const { currentUser } = useAuth();

    // Data States
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null); // ID of active project view

    // UI States
    const [isAdding, setIsAdding] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'files', 'discussion'

    // Form States
    const [newProject, setNewProject] = useState({ title: '', description: '', deadline: '', status: 'active', progress: 0 });
    const [newMessage, setNewMessage] = useState('');

    // Fetch Projects
    useEffect(() => {
        if (!currentUser) return;
        const q = query(
            collection(db, 'projects'),
            where('workspaceId', '==', activeWorkspace),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(items);
        });
        return () => unsubscribe();
    }, [currentUser, activeWorkspace]);

    // Handlers
    const handleAddProject = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'projects'), {
                ...newProject,
                userId: currentUser.uid,
                workspaceId: activeWorkspace,
                files: [], // Array of file objects mock
                comments: [], // Array of comment objects mock
                createdAt: Timestamp.now()
            });
            setIsAdding(false);
            setNewProject({ title: '', description: '', deadline: '', status: 'active', progress: 0 });
        } catch (error) {
            console.error("Error adding project:", error);
        }
    };

    const handleDeleteProject = async (id) => {
        if (window.confirm("Delete this project and all its data?")) {
            if (selectedProject?.id === id) setSelectedProject(null);
            await deleteDoc(doc(db, 'projects', id));
        }
    };

    const handleFileUpload = async () => {
        if (!selectedProject) return;
        // Mock File Upload
        const fileNames = ['Project_Specs.pdf', 'Design_Mockups.fig', 'Budget_Q1.xlsx', 'Meeting_Notes.docx'];
        const randomFile = fileNames[Math.floor(Math.random() * fileNames.length)];
        const newFile = {
            id: Date.now(),
            name: randomFile,
            size: '2.4 MB',
            uploadedBy: currentUser.email,
            createdAt: new Date().toISOString()
        };

        const updatedFiles = [...(selectedProject.files || []), newFile];

        // Optimistic update
        const updatedProject = { ...selectedProject, files: updatedFiles };
        setSelectedProject(updatedProject);

        await updateDoc(doc(db, 'projects', selectedProject.id), {
            files: updatedFiles
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedProject) return;

        const newComment = {
            id: Date.now(),
            text: newMessage,
            userId: currentUser.uid,
            userName: currentUser.email.split('@')[0],
            createdAt: new Date().toISOString()
        };

        const updatedComments = [...(selectedProject.comments || []), newComment];

        // Optimistic update
        const updatedProject = { ...selectedProject, comments: updatedComments };
        setSelectedProject(updatedProject);
        setNewMessage('');

        await updateDoc(doc(db, 'projects', selectedProject.id), {
            comments: updatedComments
        });
    };

    const calculateProgress = (project) => {
        // In a real app this might be calculated from linked tasks
        // For now we use the manual slider value
        return project.progress || 0;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    {selectedProject ? (
                        <button onClick={() => setSelectedProject(null)} className="text-neutral-400 hover:text-white mb-2 flex items-center gap-2 transition-colors">
                            &larr; Back to Projects
                        </button>
                    ) : (
                        <div className="h-8"></div>
                    )}
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {selectedProject ? selectedProject.title : `${currentWorkspaceName} - Projects`}
                    </h1>
                    <p className="text-neutral-400">
                        {selectedProject ? selectedProject.description : "Manage complex work, share files, and collaborate."}
                    </p>
                </div>
                {!selectedProject && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        <Plus size={20} />
                        New Project
                    </button>
                )}
            </div>

            {/* List View */}
            {!selectedProject && (
                <>
                    {isAdding && (
                        <div className="glass-panel p-6 rounded-xl mb-8 animate-in fade-in slide-in-from-top-4 max-w-2xl">
                            <form onSubmit={handleAddProject} className="space-y-4">
                                <div>
                                    <label className="text-xs text-neutral-400 mb-1 block">Project Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Website Redesign"
                                        value={newProject.title}
                                        onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-400 mb-1 block">Description</label>
                                    <textarea
                                        placeholder="Brief overview..."
                                        value={newProject.description}
                                        onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 min-h-[80px]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-neutral-400 mb-1 block">Deadline</label>
                                        <input
                                            type="date"
                                            value={newProject.deadline}
                                            onChange={e => setNewProject({ ...newProject, deadline: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-neutral-400 mb-1 block">Initial Progress (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={newProject.progress}
                                            onChange={e => setNewProject({ ...newProject, progress: parseInt(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5">Cancel</button>
                                    <button type="submit" className="px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700">Create Project</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <div
                                key={project.id}
                                onClick={() => setSelectedProject(project)}
                                className="glass-panel p-6 rounded-2xl border border-transparent hover:border-white/10 transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                        <Briefcase size={24} />
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border ${project.status === 'completed' ? 'border-green-500/30 text-green-400' : 'border-blue-500/30 text-blue-400'}`}>
                                        {project.status}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                                <p className="text-neutral-400 text-sm mb-6 line-clamp-2">{project.description}</p>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-neutral-500">Progress</span>
                                            <span className="text-white font-mono">{project.progress}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${project.progress}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-neutral-500 border-t border-white/5 pt-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            <span>{project.deadline ? format(new Date(project.deadline), 'MMM d') : 'No date'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Folder size={14} />
                                            <span>{project.files?.length || 0} Files</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Detail View */}
            {selectedProject && (
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl w-fit">
                        {['overview', 'files', 'discussion'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 glass-panel p-8 rounded-2xl">
                                    <h2 className="text-xl font-bold text-white mb-4">Project Details</h2>
                                    <p className="text-neutral-300 leading-relaxed mb-8">{selectedProject.description}</p>

                                    <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Milestones</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-white text-sm">Project Initiated</span>
                                            <span className="ml-auto text-xs text-neutral-500">{format(new Date(selectedProject.createdAt.toDate ? selectedProject.createdAt.toDate() : selectedProject.createdAt), 'MMM d, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 opacity-50">
                                            <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
                                            <span className="text-neutral-400 text-sm">Completion</span>
                                            <span className="ml-auto text-xs text-neutral-500">{selectedProject.deadline}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="glass-panel p-6 rounded-2xl">
                                        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Team</h3>
                                        <div className="flex -space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border-2 border-[#171717] flex items-center justify-center text-xs font-bold text-white" title={currentUser.email}>
                                                {currentUser.email[0].toUpperCase()}
                                            </div>
                                            {/* Mock Avatars */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 border-2 border-[#171717]"></div>
                                            <div className="w-10 h-10 rounded-full bg-neutral-700 border-2 border-[#171717] flex items-center justify-center text-xs text-neutral-400">+2</div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteProject(selectedProject.id)}
                                        className="w-full py-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        Delete Project
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'files' && (
                            <div className="glass-panel p-8 rounded-2xl min-h-[400px]">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white">Project Files</h2>
                                    <button
                                        onClick={handleFileUpload}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Upload size={18} />
                                        Upload File
                                    </button>
                                </div>

                                {(selectedProject.files?.length === 0 || !selectedProject.files) ? (
                                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                                        <Folder size={48} className="text-neutral-600 mb-4" />
                                        <p className="text-neutral-400">No files uploaded yet.</p>
                                        <p className="text-xs text-neutral-600 mt-1">Upload specs, designs, or docs.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {selectedProject.files.map((file, idx) => (
                                            <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/20 transition-colors group">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                                        <p className="text-xs text-neutral-500 mt-1">{file.size} • {new Date(file.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'discussion' && (
                            <div className="glass-panel rounded-2xl flex flex-col h-[600px]">
                                <div className="p-6 border-b border-white/5">
                                    <h2 className="text-xl font-bold text-white">Team Chat</h2>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar flex flex-col-reverse">
                                    {/* Mock Messages reversed for chat feel if needed, but here simple list */}
                                    {(selectedProject.comments?.slice().reverse())?.map(comment => (
                                        <div key={comment.id} className={`flex gap-3 ${comment.userId === currentUser.uid ? 'flex-row-reverse' : ''}`}>
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                                {comment.userName[0].toUpperCase()}
                                            </div>
                                            <div className={`p-3 rounded-2xl max-w-[80%] ${comment.userId === currentUser.uid ? 'bg-blue-600 text-white rounded-br-none' : 'bg-neutral-800 text-neutral-200 rounded-bl-none'}`}>
                                                <p className="text-sm">{comment.text}</p>
                                                <p className="text-[10px] opacity-50 mt-1 text-right">{formatDistanceToNow(new Date(comment.createdAt))} ago</p>
                                            </div>
                                        </div>
                                    ))}

                                    {(!selectedProject.comments || selectedProject.comments.length === 0) && (
                                        <div className="text-center text-neutral-500 py-10 mt-auto">
                                            <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
                                            <p>Start the conversation!</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t border-white/5">
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
