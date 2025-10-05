// components/FlashcardsView.js
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Award, Eye } from 'lucide-react';

const Flashcard = ({ flashcard, isFlipped, onFlip, cardNumber, totalCards }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Card counter */}
      <div className="text-center mb-4">
        <span className="text-gray-400 text-sm">
          Card {cardNumber} of {totalCards}
        </span>
      </div>
      
      {/* Main card */}
      <div 
        className="relative w-full h-80 cursor-pointer perspective-1000"
        onClick={onFlip}
      >
        <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}>
          {/* Front of card */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-xl shadow-2xl border border-white/20 flex flex-col justify-center items-center p-8">
            <div className="text-center">
              <div className="text-sm text-purple-200 mb-4 font-medium flex items-center justify-center gap-2">
                <Eye size={16} />
                Question
              </div>
              <div className="text-xl font-semibold text-white leading-relaxed mb-4">
                {flashcard.question}
              </div>
              {flashcard.topic && (
                <div className="text-sm text-purple-200 bg-purple-800/50 px-3 py-1 rounded-full">
                  {flashcard.topic}
                </div>
              )}
            </div>
            <div className="absolute bottom-4 text-purple-200 text-sm flex items-center gap-1">
              <span>Click to reveal answer</span>
            </div>
          </div>
          
          {/* Back of card */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-xl shadow-2xl border border-white/20 flex flex-col justify-center items-center p-8">
            <div className="text-center">
              <div className="text-sm text-blue-200 mb-4 font-medium flex items-center justify-center gap-2">
                <Award size={16} />
                Answer
              </div>
              <div className="text-lg text-white leading-relaxed mb-4">
                {flashcard.answer}
              </div>
              {flashcard.difficulty && (
                <div className="text-sm text-blue-200 bg-blue-800/50 px-3 py-1 rounded-full">
                  Difficulty: {flashcard.difficulty}
                </div>
              )}
            </div>
            <div className="absolute bottom-4 text-blue-200 text-sm">
              Click to see question
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FlashcardsView({ flashcardsData }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState(new Set());
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState([]);

  if (!flashcardsData?.flashcards?.length) {
    return (
      <div className="p-8 text-center text-gray-400">
        <div className="bg-black/30 rounded-lg p-12">
          <Award className="mx-auto w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg mb-2">No flashcards available.</p>
          <p className="text-sm">Generate flashcards from your content to start studying.</p>
        </div>
      </div>
    );
  }

  const flashcards = flashcardsData.flashcards;
  const displayIndices = isShuffled ? shuffledIndices : flashcards.map((_, index) => index);
  const currentCardIndex = displayIndices[currentIndex];
  const currentCard = flashcards[currentCardIndex];

  const handleNext = () => {
    if (currentIndex < displayIndices.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setStudiedCards(prev => new Set([...prev, currentCardIndex]));
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
    setIsShuffled(false);
    setShuffledIndices([]);
  };

  const handleShuffle = () => {
    if (!isShuffled) {
      const indices = [...Array(flashcards.length).keys()];
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffledIndices(indices);
    }
    setIsShuffled(!isShuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const progress = ((currentIndex + 1) / displayIndices.length) * 100;
  const studiedCount = studiedCards.size;

  return (
    <div className="p-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Award size={24} className="text-yellow-400" />
          {flashcardsData.title}
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-gray-300">
          <div className="flex items-center gap-4">
            <span>Card {currentIndex + 1} of {displayIndices.length}</span>
            <span>{studiedCount} studied</span>
            {isShuffled && (
              <span className="bg-orange-500/20 text-orange-200 px-2 py-1 rounded-full text-xs">
                Shuffled
              </span>
            )}
          </div>
          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 rounded-lg transition-colors"
          >
            <Shuffle size={16} />
            {isShuffled ? 'Unshuffle' : 'Shuffle'}
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mt-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-8">
        <Flashcard 
          flashcard={currentCard}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          cardNumber={currentIndex + 1}
          totalCards={displayIndices.length}
        />
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center max-w-2xl mx-auto">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors transform hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors transform hover:scale-105 active:scale-95"
            title="Reset progress"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === displayIndices.length - 1}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors transform hover:scale-105 active:scale-95"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Completion Message */}
      {currentIndex === displayIndices.length - 1 && studiedCards.size >= displayIndices.length - 1 && (
        <div className="text-center mt-8 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
          <Award className="mx-auto w-12 h-12 text-green-400 mb-3" />
          <p className="text-green-200 font-medium text-lg mb-2">
            🎉 Congratulations! You've completed all flashcards!
          </p>
          <p className="text-green-300 text-sm">
            Great job studying! You can shuffle the cards or reset to study again.
          </p>
        </div>
      )}

      {/* Study Tips */}
      <div className="max-w-2xl mx-auto mt-8 p-4 bg-black/30 border border-white/10 rounded-lg">
        <h3 className="text-sm font-semibold text-white mb-2">💡 Study Tips:</h3>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Try to answer before flipping the card</li>
          <li>• Use shuffle mode to test your knowledge randomly</li>
          <li>• Review cards you found difficult multiple times</li>
          <li>• Take breaks between study sessions for better retention</li>
        </ul>
      </div>

      {/* CSS for 3D flip effect */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
