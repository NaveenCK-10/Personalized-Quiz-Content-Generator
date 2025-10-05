// components/Controls.js
import React from 'react';
import { Brain, BookOpen, Map, CreditCard, StickyNote } from "lucide-react";

export default function Controls({ 
  setDifficulty, 
  handleGenerateQuiz, 
  handleGenerateExplanation, 
  handleGenerateMindMap,
  handleGenerateFlashcards,
  handleShowNotes,
  isLoading 
}) {
  return (
    <div className="space-y-6 mt-4">
      {/* Difficulty Selector - keeping your original style */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <label htmlFor="difficulty" className="block text-md font-medium text-pink-200 mb-1">
            Select Difficulty
          </label>
          <select 
            id="difficulty" 
            onChange={(e) => setDifficulty(e.target.value)} 
            defaultValue="Medium" 
            className="p-2 bg-white/5 border text-white border-white/20 rounded-lg focus:ring-2 focus:ring-pink-500"
            disabled={isLoading}
          >
            <option className="text-black">Easy</option>
            <option className="text-black">Medium</option>
            <option className="text-black">Hard</option>
          </select>
        </div>

        {/* Original buttons with icons added */}
        <div className="flex gap-4">
          <button 
            onClick={handleGenerateQuiz} 
            disabled={isLoading} 
            className="action-button bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center gap-2"
          >
            <Brain size={18} />
            Generate Quiz
          </button>
          <button 
            onClick={handleGenerateExplanation} 
            disabled={isLoading} 
            className="action-button bg-gradient-to-r from-green-500 to-teal-500 flex items-center gap-2"
          >
            <BookOpen size={18} />
            Explain & Chat
          </button>
        </div>
      </div>

      {/* New feature buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={handleGenerateMindMap}
          disabled={isLoading}
          className="action-button bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center gap-2"
        >
          <Map size={18} />
          Generate Mind Map
        </button>

        <button
          onClick={handleGenerateFlashcards}
          disabled={isLoading}
          className="action-button bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center gap-2"
        >
          <CreditCard size={18} />
          Generate Flashcards
        </button>

        <button
          onClick={handleShowNotes}
          disabled={isLoading}
          className="action-button bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center gap-2"
        >
          <StickyNote size={18} />
          My Notes
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-pink-200">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-400"></div>
          <span className="text-sm">Generating content...</span>
        </div>
      )}

      <style jsx>{`
        .action-button {
          color: white;
          font-weight: bold;
          padding: 10px 24px;
          border-radius: 8px;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          border: none;
          cursor: pointer;
        }
        .action-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 7px 10px rgba(0,0,0,0.1);
        }
        .action-button:active:not(:disabled) {
          transform: translateY(0);
        }
        .action-button:disabled {
          background: #4b5563 !important;
          cursor: not-allowed;
          transform: translateY(0);
          box-shadow: none;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
