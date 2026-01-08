import { useState, useEffect } from 'react';

// Mock Data Store
const STORAGE_KEY = 'namma_app_data';
const AUTH_KEY = 'namma_app_auth';

const getStore = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {
        users: [], tasks: [],
        routines: [], // New collection for Daily Routine
        events: [],   // New collection for Events
        projects: [], // New collection for Projects
        exams: [],    // New collection for Exams/Study
        habits: [],    // New collection for Habit Tracker
        notes: []
    };
};

const setStore = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Dispatch event for cross-tab or same-tab updates
    window.dispatchEvent(new Event('storage-update'));
};

const getAuthUser = () => {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
}

const setAuthUser = (user) => {
    if (user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(AUTH_KEY);
    }
    // Simple event to notify auth changes
    window.dispatchEvent(new Event('auth-change'));
}


// --- Auth Mocks ---

export const getAuth = (app) => {
    return { currentUser: getAuthUser() };
};

export const createUserWithEmailAndPassword = async (auth, email, password) => {
    const newUser = {
        uid: 'user_' + Date.now(),
        email,
        emailVerified: true,
        isAnonymous: false,
        metadata: { creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString() }
    };
    setAuthUser(newUser);
    return { user: newUser };
};

export const signInWithEmailAndPassword = async (auth, email, password) => {
    // Determine if it matches any "user" in our fake db or just allow any login for now
    // For simplicity, just log them in as the user they claim to be.
    const user = {
        uid: 'user_' + btoa(email), // approximate stable ID
        email,
        emailVerified: true
    };
    setAuthUser(user);
    return { user };
};

export const signOut = async (auth) => {
    setAuthUser(null);
};

export const onAuthStateChanged = (auth, callback) => {
    // Initial call
    callback(getAuthUser());

    const handler = () => {
        callback(getAuthUser());
    };

    window.addEventListener('auth-change', handler);
    return () => window.removeEventListener('auth-change', handler);
};


// --- Firestore Mocks ---

export const getFirestore = (app) => ({});

export const collection = (db, collectionName) => {
    return { type: 'collection', path: collectionName };
};

export const query = (collectionRef, ...constraints) => {
    return { type: 'query', collection: collectionRef, constraints };
};

export const where = (field, op, value) => {
    return { type: 'where', field, op, value };
};

export const onSnapshot = (queryObj, callback) => {
    const collectionName = queryObj.collection ? queryObj.collection.path : queryObj.path;

    // Initial fetch
    const emit = () => {
        const store = getStore();
        let docs = store[collectionName] || [];

        // Apply filters (basic implementation)
        if (queryObj.constraints) {
            queryObj.constraints.forEach(c => {
                if (c.type === 'where') {
                    docs = docs.filter(d => {
                        if (c.op === '==') return d[c.field] === c.value;
                        return true; // other ops not implemented
                    });
                }
            });
        }

        // Wrap in snapshot object
        const snapshot = {
            docs: docs.map(d => ({
                id: d.id,
                data: () => d
            })),
            size: docs.length,
            forEach: (fn) => docs.forEach(d => fn({ id: d.id, data: () => d }))
        };
        callback(snapshot);
    };

    emit();

    // Listen for updates
    const handler = () => emit();
    window.addEventListener('storage-update', handler);
    return () => window.removeEventListener('storage-update', handler);
};

export const addDoc = async (collectionRef, data) => {
    const store = getStore();
    const collectionName = collectionRef.path;
    if (!store[collectionName]) store[collectionName] = [];

    const newDoc = { ...data, id: 'doc_' + Date.now() };
    store[collectionName].push(newDoc);
    setStore(store);
    return { id: newDoc.id };
};

export const doc = (db, collectionName, docId) => {
    return { path: collectionName, id: docId };
};

export const deleteDoc = async (docRef) => {
    const store = getStore();
    const collectionName = docRef.path;
    // Wait, docRef in firebase is db.collection(path).doc(id), which we might not be perfectly mocking
    // Actually docRef from `doc(db, col, id)` returns specific object. 
    // My `doc` implementation returns { path: collectionName, id: docId } which is imprecise.
    // Usually usage is `doc(db, 'notes', id)`.

    if (store[collectionName]) {
        store[collectionName] = store[collectionName].filter(d => d.id !== docRef.id);
        setStore(store);
    }
};

export const updateDoc = async (docRef, data) => {
    const store = getStore();
    const collectionName = docRef.path;

    if (store[collectionName]) {
        const idx = store[collectionName].findIndex(d => d.id === docRef.id);
        if (idx !== -1) {
            store[collectionName][idx] = { ...store[collectionName][idx], ...data };
            setStore(store);
        }
    }
};

// Helper for Timestamps (used in NoteList)
export const serverTimestamp = () => new Date().toISOString();

export const Timestamp = {
    now: () => {
        const d = new Date();
        return {
            seconds: Math.floor(d.getTime() / 1000),
            nanoseconds: (d.getTime() % 1000) * 1000000,
            toDate: () => d,
            toMillis: () => d.getTime()
        };
    },
    fromDate: (date) => {
        return {
            seconds: Math.floor(date.getTime() / 1000),
            nanoseconds: (date.getTime() % 1000) * 1000000,
            toDate: () => date,
            toMillis: () => date.getTime()
        };
    }
};

export const orderBy = (field, direction) => {
    return { type: 'orderBy', field, direction };
};

export const writeBatch = (db) => {
    return {
        update: (ref, data) => {
            // we will commit later
            updateDoc(ref, data);
        },
        commit: async () => {
            // already done in update
        }
    }
};

// Mock the auth object itself for export default if needed, 
// but usually app is exported.
const app = {};
export const initializeApp = () => app;
export default app;

// Mock DB export
export const db = {};
export const auth = {};
