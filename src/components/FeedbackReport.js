import React, { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronUp, XCircle } from 'lucide-react';

export default function FeedbackReport({ report }) {
  const [openExplanations, setOpenExplanations] = useState({});
  const toggleExplanation = (index) => setOpenExplanations(prev => ({ ...prev, [index]: !prev[index] }));
  const percentage = Math.round((report.score / report.questions.length) * 100);

  return (
    <div className="p-6 text-white">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-shadow-lg">Test Report</h2>
        <div className="w-full bg-black/20 rounded-full h-4 my-4">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
        <p className="text-xl mt-2">Your Score: <strong className="text-pink-300">{report.score} / {report.questions.length}</strong> ({percentage}%)</p>
      </div>
      {report.questions.map((q, index) => (
        <div key={index} className={`mb-4 p-4 rounded-lg shadow-sm border-l-4 ${q.isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
          <p className="font-semibold">{index + 1}. {q.questionText}</p>
          <div className="space-y-1 mt-2 text-sm">
            {q.options.map((opt, i) => {
              const isUserAnswer = i === q.userAnswer;
              const isCorrectAnswer = i === q.correctAnswerIndex;
              return (
                <p key={i} className={`flex items-center gap-2 ${isCorrectAnswer ? 'font-bold text-green-300' : ''} ${isUserAnswer && !q.isCorrect ? 'text-red-300' : ''}`}>
                  {isUserAnswer && (q.isCorrect ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />)}
                  {isCorrectAnswer && !isUserAnswer && <CheckCircle size={16} className="text-green-400 opacity-50" />}
                  <span className={isUserAnswer && !q.isCorrect ? 'line-through' : ''}>{opt}</span>
                </p>
              );
            })}
          </div>
          <button onClick={() => toggleExplanation(index)} className="text-sm text-pink-400 hover:underline mt-3 flex items-center gap-1">
            {openExplanations[index] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Explanation
          </button>
          {openExplanations[index] && (
            <div className="mt-2 p-3 bg-black/20 rounded text-sm text-pink-100 border border-white/10">
              {q.explanation}
            </div>
          )}
        </div>
      ))}
       <style jsx>{`.text-shadow-lg { text-shadow: 0 0 20px rgba(236, 72, 153, 0.5); }`}</style>
    </div>
  );
};
