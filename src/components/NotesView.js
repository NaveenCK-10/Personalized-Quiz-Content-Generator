// components/NotesView.js
import React, { useState } from "react";
import { Plus, Trash2, Edit3, Calendar, Save, X, AlertCircle, FileText, Search } from "lucide-react";
import { useNotes } from "../contexts/NotesContext";

export default function NotesView() {
  const { 
    notesData, 
    isLoading, 
    error, 
    saveNote, 
    updateNote, 
    deleteNote, 
    clearError 
  } = useNotes();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newNote, setNewNote] = useState({ title: "", content: "", type: "general" });
  const [editNote, setEditNote] = useState({ title: "", content: "", type: "general" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const handleSaveNote = async () => {
    const success = await saveNote(newNote.title, newNote.content, newNote.type);
    if (success) {
      setNewNote({ title: "", content: "", type: "general" });
      setIsCreating(false);
    }
  };

  const handleUpdateNote = async (noteId) => {
    const success = await updateNote(noteId, editNote.title, editNote.content, editNote.type);
    if (success) {
      setEditingId(null);
      setEditNote({ title: "", content: "", type: "general" });
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      await deleteNote(noteId);
    }
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setEditNote({
      title: note.title,
      content: note.content,
      type: note.type || "general"
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditNote({ title: "", content: "", type: "general" });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "quiz": return "bg-purple-500/20 text-purple-200 border-purple-500/30";
      case "explanation": return "bg-blue-500/20 text-blue-200 border-blue-500/30";
      case "mindmap": return "bg-green-500/20 text-green-200 border-green-500/30";
      case "flashcards": return "bg-orange-500/20 text-orange-200 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-200 border-gray-500/30";
    }
  };

  // Filter and search notes
  const filteredNotes = notesData.filter(note => {
    const matchesSearch = searchTerm === "" || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || note.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText size={24} />
            My Notes
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {filteredNotes.length} of {notesData.length} notes
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          disabled={isLoading}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
        >
          <Plus size={16} />
          New Note
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          <option value="all">All Types</option>
          <option value="general">General</option>
          <option value="quiz">Quiz</option>
          <option value="explanation">Explanation</option>
          <option value="mindmap">Mind Map</option>
          <option value="flashcards">Flashcards</option>
        </select>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg relative mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={clearError} className="text-red-200 hover:text-white ml-2">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Create New Note Form */}
      {isCreating && (
        <div className="bg-black/30 border border-white/20 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Create New Note</h3>
          <input
            type="text"
            placeholder="Note title..."
            value={newNote.title}
            onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 mb-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <textarea
            placeholder="Write your note here..."
            value={newNote.content}
            onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 mb-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <select
              value={newNote.type}
              onChange={(e) => setNewNote(prev => ({ ...prev, type: e.target.value }))}
              className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="general">General</option>
              <option value="quiz">Quiz</option>
              <option value="explanation">Explanation</option>
              <option value="mindmap">Mind Map</option>
              <option value="flashcards">Flashcards</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewNote({ title: "", content: "", type: "general" });
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={isLoading || !newNote.title.trim() || !newNote.content.trim()}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {isLoading && notesData.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400 mx-auto mb-4"></div>
            <p>Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            {searchTerm || filterType !== "all" ? (
              <div>
                <Search className="mx-auto w-16 h-16 mb-4 opacity-50" />
                <p>No notes match your search criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                  className="text-pink-400 hover:text-pink-300 mt-2"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div>
                <Plus className="mx-auto w-16 h-16 mb-4 opacity-50" />
                <p>No notes yet. Create your first note to get started!</p>
              </div>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} className="bg-black/30 border border-white/20 rounded-lg p-4 hover:bg-black/40 transition-colors">
              {editingId === note.id ? (
                // Edit Mode
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Edit Note</h3>
                  <input
                    type="text"
                    value={editNote.title}
                    onChange={(e) => setEditNote(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white mb-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <textarea
                    value={editNote.content}
                    onChange={(e) => setEditNote(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white mb-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <select
                      value={editNote.type}
                      onChange={(e) => setEditNote(prev => ({ ...prev, type: e.target.value }))}
                      className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="general">General</option>
                      <option value="quiz">Quiz</option>
                      <option value="explanation">Explanation</option>
                      <option value="mindmap">Mind Map</option>
                      <option value="flashcards">Flashcards</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={cancelEditing}
                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateNote(note.id)}
                        disabled={isLoading || !editNote.title.trim() || !editNote.content.trim()}
                        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Save size={16} />
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 break-words">{note.title}</h3>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(note.type)}`}>
                          {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                        </span>
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(note.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => startEditing(note)}
                        disabled={isLoading}
                        className="text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors p-1"
                        title="Edit note"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={isLoading}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors p-1"
                        title="Delete note"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                    {note.content.length > 200 ? (
                      <>
                        {note.content.substring(0, 200)}...
                        <button 
                          onClick={() => startEditing(note)}
                          className="text-pink-400 hover:text-pink-300 ml-2"
                        >
                          Read more
                        </button>
                      </>
                    ) : (
                      note.content
                    )}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
