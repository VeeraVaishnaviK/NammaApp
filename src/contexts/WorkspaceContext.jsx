import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkspaceContext = createContext();

export function useWorkspace() {
    return useContext(WorkspaceContext);
}

const STORAGE_KEY = 'namma_app_workspaces';

export function WorkspaceProvider({ children }) {
    const [activeWorkspace, setActiveWorkspace] = useState('personal'); // 'personal', 'partner', 'shared'

    // Default names
    const [workspaceNames, setWorkspaceNames] = useState({
        personal: "Vaishu's Workplace",
        partner: "Rejolin's Workplace",
        shared: "Namma Workplace"
    });

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (data.activeWorkspace) setActiveWorkspace(data.activeWorkspace);
                if (data.workspaceNames) setWorkspaceNames(data.workspaceNames);
            } catch (e) {
                console.error("Failed to parse workspace settings", e);
            }
        }
    }, []);

    const switchWorkspace = (id) => {
        setActiveWorkspace(id);
        saveSettings(id, workspaceNames);
    };

    const renameWorkspace = (id, newName) => {
        const newNames = { ...workspaceNames, [id]: newName };
        setWorkspaceNames(newNames);
        saveSettings(activeWorkspace, newNames);
    };

    const saveSettings = (active, names) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            activeWorkspace: active,
            workspaceNames: names
        }));
    };

    const value = {
        activeWorkspace,
        workspaceNames,
        switchWorkspace,
        renameWorkspace,
        currentWorkspaceName: workspaceNames[activeWorkspace]
    };

    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    );
}
