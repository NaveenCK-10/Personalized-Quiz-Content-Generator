// components/FlashcardsView.js - HOOKS ORDER FIXED
import React, { useState, useEffect, useCallback, memo } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Award, Eye, BookOpen, TrendingUp, CheckCircle, Volume2 } from 'lucide-react';

// Memoized Flashcard component
const Flashcard = memo(({ flashcard, isFlipped, onFlip, cardNumber, totalCards, onSpeak }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Card counter */}
      <div className="text-center mb-6 flex items-center justify-center gap-3">
        <div className="bg-purple-500/20 border border-purple-400/30 rounded-full px-4 py-2">
          <span className="text-white font-semibold text-sm">
            Card {cardNumber} <span className="text-purple-300">of</span> {totalCards}
          </span>
        </div>
        <div className="text-gray-400 text-sm">
          {Math.round((cardNumber / totalCards) * 100)}% Complete
        </div>
      </div>
      
      {/* 3D card with tilt */}
      <div 
        className="relative w-full h-96 cursor-pointer perspective-1000 group"
        onClick={onFlip}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? 'Show question' : 'Show answer'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onFlip();
          }
        }}
      >
        <div 
          className={`relative w-full h-full transition-all duration-700 ease-out transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          {/* Front card */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-2xl shadow-2xl border-2 border-white/20 flex flex-col justify-between p-8 transition-all duration-300 group-hover:shadow-purple-500/50 focus-within:ring-4 focus-within:ring-purple-400/50"
            onMouseMove={(e) => {
              if (isFlipped) return;
              const card = e.currentTarget;
              const rect = card.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              const rotateX = (y - centerY) / 20;
              const rotateY = (centerX - x) / 20;
              card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            }}
            onMouseLeave={(e) => {
              if (!isFlipped) {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
              }
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-purple-200 text-sm font-medium bg-purple-800/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Eye size={16} />
                Question
              </div>
              <div className="flex gap-2">
                {flashcard.difficulty && (
                  <div className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                    flashcard.difficulty === 'Easy' ? 'bg-green-500/30 text-green-200' :
                    flashcard.difficulty === 'Medium' ? 'bg-yellow-500/30 text-yellow-200' :
                    'bg-red-500/30 text-red-200'
                  }`}>
                    {flashcard.difficulty}
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSpeak(flashcard.question);
                  }}
                  className="p-1.5 bg-purple-800/40 hover:bg-purple-800/60 rounded-full transition-colors"
                  aria-label="Read question aloud"
                >
                  <Volume2 size={14} className="text-purple-200" />
                </button>
              </div>
            </div>

            <div className="text-center flex-1 flex flex-col justify-center">
              <div className="text-2xl font-bold text-white leading-relaxed mb-4">
                {flashcard.question}
              </div>
              {flashcard.topic && (
                <div className="text-sm text-purple-200 bg-purple-800/40 px-4 py-2 rounded-full inline-block mx-auto">
                  📚 {flashcard.topic}
                </div>
              )}
            </div>

            <div className="text-center">
              <div className="text-purple-200 text-sm opacity-70 group-hover:opacity-100 transition-opacity">
                Click to reveal answer
              </div>
            </div>
          </div>
          
          {/* Back card */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-2xl shadow-2xl border-2 border-white/20 flex flex-col justify-between p-8 group-hover:shadow-blue-500/50 transition-shadow focus-within:ring-4 focus-within:ring-blue-400/50">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-blue-200 text-sm font-medium bg-blue-800/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Award size={16} />
                Answer
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSpeak(flashcard.answer);
                }}
                className="p-1.5 bg-blue-800/40 hover:bg-blue-800/60 rounded-full transition-colors"
                aria-label="Read answer aloud"
              >
                <Volume2 size={14} className="text-blue-200" />
              </button>
            </div>

            <div className="text-center flex-1 flex flex-col justify-center">
              <div className="text-xl text-white leading-relaxed mb-4">
                {flashcard.answer}
              </div>
              {flashcard.explanation && (
                <div className="text-sm text-blue-200 bg-blue-800/30 px-4 py-3 rounded-xl max-w-lg mx-auto">
                  💡 {flashcard.explanation}
                </div>
              )}
            </div>

            <div className="text-center">
              <div className="text-blue-200 text-sm opacity-70">
                Click to see question
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Flashcard.displayName = 'Flashcard';

export default function FlashcardsView({ flashcardsData }) {
  // 👇 ALL HOOKS AT THE TOP - BEFORE ANY RETURNS
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState(new Set());
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState([]);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Load shuffle from localStorage
  useEffect(() => {
    const savedShuffle = localStorage.getItem('flashcards-shuffle');
    if (savedShuffle && flashcardsData?.flashcards?.length) {
      const parsed = JSON.parse(savedShuffle);
      if (parsed.length === flashcardsData.flashcards.length) {
        setShuffledIndices(parsed);
        setIsShuffled(true);
      }
    }
  }, [flashcardsData]);

  // Save shuffle to localStorage
  useEffect(() => {
    if (isShuffled && shuffledIndices.length > 0) {
      localStorage.setItem('flashcards-shuffle', JSON.stringify(shuffledIndices));
    } else {
      localStorage.removeItem('flashcards-shuffle');
    }
  }, [isShuffled, shuffledIndices]);

  // Text-to-speech
  const handleSpeak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Handlers with useCallback
  const handleNext = useCallback(() => {
    if (!flashcardsData?.flashcards?.length) return;
    const displayIndices = isShuffled ? shuffledIndices : flashcardsData.flashcards.map((_, i) => i);
    const currentCardIndex = displayIndices[currentIndex];
    
    if (currentIndex < displayIndices.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setStudiedCards(prev => new Set([...prev, currentCardIndex]));
    }
  }, [currentIndex, flashcardsData, isShuffled, shuffledIndices]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrevious();
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNext, handlePrevious, handleFlip]);

  // Touch gestures
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || !flashcardsData?.flashcards?.length) return;
    
    const displayIndices = isShuffled ? shuffledIndices : flashcardsData.flashcards.map((_, i) => i);
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < displayIndices.length - 1) {
      handleNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      handlePrevious();
    }
  }, [touchStart, touchEnd, currentIndex, flashcardsData, isShuffled, shuffledIndices, handleNext, handlePrevious]);

  // 👇 NOW SAFE TO RETURN EARLY
  if (!flashcardsData?.flashcards?.length) {
    return (
      <div className="p-8 text-center">
        <div className="bg-gradient-to-br from-purple-900/30 to-black/50 border border-purple-500/30 rounded-2xl p-16">
          <Award className="mx-auto w-20 h-20 mb-6 text-purple-400 opacity-50" />
          <p className="text-xl font-semibold text-white mb-2">No flashcards available</p>
          <p className="text-gray-400">Generate flashcards from your content to start studying.</p>
        </div>
      </div>
    );
  }

  const flashcards = flashcardsData.flashcards;
  const displayIndices = isShuffled ? shuffledIndices : flashcards.map((_, index) => index);
  const currentCardIndex = displayIndices[currentIndex];
  const currentCard = flashcards[currentCardIndex];

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
    setIsShuffled(false);
    setShuffledIndices([]);
    localStorage.removeItem('flashcards-shuffle');
  };

  const handleShuffle = () => {
    if (!isShuffled) {
      const indices = [...Array(flashcards.length).keys()];
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffledIndices(indices);
      setIsShuffled(true);
    } else {
      setIsShuffled(false);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const progress = ((currentIndex + 1) / displayIndices.length) * 100;
  const studiedCount = studiedCards.size;

  return (
    <div 
      className="p-6 max-h-[95vh] overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-black/40 via-purple-900/20 to-black/40 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                <Award size={28} className="text-white" />
              </div>
              {flashcardsData.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-300 bg-gray-800/50 px-3 py-1.5 rounded-full">
                <BookOpen size={16} />
                {displayIndices.length} Cards
              </div>
              <div className="flex items-center gap-2 text-green-300 bg-green-900/30 px-3 py-1.5 rounded-full">
                <CheckCircle size={16} />
                {studiedCount} Studied
              </div>
              {isShuffled && (
                <div className="flex items-center gap-2 text-orange-300 bg-orange-900/30 px-3 py-1.5 rounded-full">
                  <Shuffle size={16} />
                  Shuffled
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-400/50"
            aria-label={isShuffled ? 'Unshuffle cards' : 'Shuffle cards'}
          >
            <Shuffle size={18} />
            {isShuffled ? 'Unshuffle' : 'Shuffle'}
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-800/50 rounded-full h-4 mt-6 overflow-hidden border border-gray-700/50">
          <div 
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-4 rounded-full transition-all duration-500 relative"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-10">
        <Flashcard 
          flashcard={currentCard}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          cardNumber={currentIndex + 1}
          totalCards={displayIndices.length}
          onSpeak={handleSpeak}
        />
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 max-w-2xl mx-auto mb-8">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-500/50"
          aria-label="Previous card"
        >
          <ChevronLeft size={22} />
          Previous
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
          aria-label="Reset progress"
        >
          <RotateCcw size={20} />
          Reset
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === displayIndices.length - 1}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-400/50"
          aria-label="Next card"
        >
          Next
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Hints */}
      <div className="text-center text-xs text-gray-500 mb-6">
        💡 Use ← → arrows • Space to flip • 🔊 Speaker icon • 👆 Swipe on mobile
      </div>

      {/* Completion */}
      {currentIndex === displayIndices.length - 1 && studiedCards.size >= displayIndices.length - 1 && (
        <div className="text-center mb-8 p-8 bg-gradient-to-r from-green-900/40 via-emerald-900/40 to-green-900/40 border-2 border-green-500/50 rounded-2xl">
          <Award className="mx-auto w-16 h-16 text-green-400 mb-4 animate-bounce" />
          <p className="text-green-200 font-bold text-2xl mb-2">
            🎉 Congratulations! Study Session Complete!
          </p>
          <p className="text-green-300 text-sm">
            Great job! You studied all {displayIndices.length} flashcards.
          </p>
        </div>
      )}

      {/* Study Tips */}
      <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-gradient-to-br from-purple-900/30 to-black/50 border border-purple-500/30 rounded-xl">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-400" />
            Study Tips
          </h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              Try to answer before flipping
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              Use shuffle for random recall
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              Review difficult cards multiple times
            </li>
          </ul>
        </div>

        <div className="p-5 bg-gradient-to-br from-blue-900/30 to-black/50 border border-blue-500/30 rounded-xl">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <BookOpen size={18} className="text-blue-400" />
            Quick Actions
          </h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              Space bar to flip cards
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              🔊 Click speaker for audio
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              Take breaks every 20 minutes
            </li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1200px;
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
