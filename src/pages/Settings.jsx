import React, { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Save } from 'lucide-react';

const Settings = () => {
    const { workspaceNames, renameWorkspace } = useWorkspace();
    const [names, setNames] = useState(workspaceNames);

    const handleSave = (id) => {
        renameWorkspace(id, names[id]);
        alert('Workspace renamed!');
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

            <div className="bg-neutral-800 p-8 rounded-xl border border-neutral-700 space-y-8">
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Workspace Names</h2>
                    <p className="text-neutral-400 mb-6">Customize the names of your personal workspaces.</p>
                </div>

                <div className="space-y-6">
                    {/* Personal */}
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Personal Workspace (User 1)</label>
                            <input
                                type="text"
                                value={names.personal}
                                onChange={(e) => setNames({ ...names, personal: e.target.value })}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <button
                            onClick={() => handleSave('personal')}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                        >
                            <Save size={20} />
                        </button>
                    </div>

                    {/* Partner */}
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Partner Workspace (User 2)</label>
                            <input
                                type="text"
                                value={names.partner}
                                onChange={(e) => setNames({ ...names, partner: e.target.value })}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                        <button
                            onClick={() => handleSave('partner')}
                            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
                        >
                            <Save size={20} />
                        </button>
                    </div>

                    {/* Shared - Read Only or Editable? Let's make it editable too */}
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Shared Workspace</label>
                            <input
                                type="text"
                                value={names.shared}
                                onChange={(e) => setNames({ ...names, shared: e.target.value })}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 transition-colors"
                            />
                        </div>
                        <button
                            onClick={() => handleSave('shared')}
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                        >
                            <Save size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
