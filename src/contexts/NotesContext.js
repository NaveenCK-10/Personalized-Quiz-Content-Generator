// contexts/NotesContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const NotesContext = createContext();

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider = ({ children }) => {
  const [notesData, setNotesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNotes = useCallback(async () => {
    const user = getAuth().currentUser;
    if (!user) return;
    
    setIsLoading(true);
    try {
      const notesRef = collection(db, "users", user.uid, "notes");
      const snapshot = await getDocs(notesRef);
      const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotesData(notes.sort((a, b) => b.updatedAt?.seconds - a.updatedAt?.seconds));
      setError(null);
    } catch (err) {
      console.error("Error loading notes:", err);
      setError("Failed to load notes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveNote = useCallback(async (title, content, type = "general") => {
    const user = getAuth().currentUser;
    if (!user) {
      setError("You must be logged in to save notes.");
      return false;
    }
    
    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty.");
      return false;
    }

    setIsLoading(true);
    try {
      const noteId = `note_${Date.now()}`;
      const noteRef = doc(db, "users", user.uid, "notes", noteId);
      await setDoc(noteRef, {
        id: noteId,
        title: title.trim(),
        content: content.trim(),
        type,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      await loadNotes(); // Refresh the notes list
      setError(null);
      return true;
    } catch (err) {
      console.error("Error saving note:", err);
      setError("Failed to save note. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadNotes]);

  const updateNote = useCallback(async (noteId, title, content, type) => {
    const user = getAuth().currentUser;
    if (!user) {
      setError("You must be logged in to update notes.");
      return false;
    }

    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty.");
      return false;
    }

    setIsLoading(true);
    try {
      const noteRef = doc(db, "users", user.uid, "notes", noteId);
      await setDoc(noteRef, {
        title: title.trim(),
        content: content.trim(),
        type,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      await loadNotes(); // Refresh the notes list
      setError(null);
      return true;
    } catch (err) {
      console.error("Error updating note:", err);
      setError("Failed to update note. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadNotes]);

  const deleteNote = useCallback(async (noteId) => {
    const user = getAuth().currentUser;
    if (!user) {
      setError("You must be logged in to delete notes.");
      return false;
    }
    
    setIsLoading(true);
    try {
      const noteRef = doc(db, "users", user.uid, "notes", noteId);
      await deleteDoc(noteRef);
      await loadNotes(); // Refresh the notes list
      setError(null);
      return true;
    } catch (err) {
      console.error("Error deleting note:", err);
      setError("Failed to delete note. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadNotes]);

  const saveQuickNote = useCallback(async (content, sourceType = "general", sourceTitle = "") => {
    const title = sourceTitle ? `${sourceType}: ${sourceTitle}` : `Quick Note - ${new Date().toLocaleDateString()}`;
    return await saveNote(title, content, sourceType);
  }, [saveNote]);

  // Load notes when the component mounts
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const value = {
    notesData,
    isLoading,
    error,
    loadNotes,
    saveNote,
    updateNote,
    deleteNote,
    saveQuickNote,
    clearError: () => setError(null)
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};
