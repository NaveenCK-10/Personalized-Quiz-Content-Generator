import React from 'react';

export default function QuizView({ quizData, setView, setFeedbackReport, saveHistory }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userAnswers = quizData.questions.map((_, index) => {
      return formData.get(`q${index}`) !== null ? parseInt(formData.get(`q${index}`), 10) : -1;
    });
    
    let score = 0;
    const feedback = quizData.questions.map((q, index) => {
      const isCorrect = userAnswers[index] === q.correctAnswerIndex;
      if (isCorrect) score++;
      return { ...q, userAnswer: userAnswers[index], isCorrect };
    });

    const report = { questions: feedback, score };
    setFeedbackReport(report);
    setView('report');
    saveHistory('quiz', { title: quizData.quizTitle, questions: quizData.questions.length, score });
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center text-shadow-lg">{quizData.quizTitle}</h2>
      <form onSubmit={handleSubmit}>
        {quizData.questions.map((q, index) => (
          <div key={index} className="mb-6 p-5 bg-black/20 rounded-lg shadow border border-white/20">
            <p className="font-semibold mb-3 text-lg">{index + 1}. {q.questionText}</p>
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <div key={i} className="flex items-center">
                  <input type="radio" name={`q${index}`} id={`q${index}o${i}`} value={i} required className="h-4 w-4 text-pink-500 bg-transparent border-pink-300 focus:ring-pink-500" />
                  <label htmlFor={`q${index}o${i}`} className="ml-3 block text-sm font-medium text-pink-100">{opt}</label>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="text-center mt-8">
          <button type="submit" className="action-button bg-gradient-to-r from-red-500 to-orange-500">Submit Test</button>
        </div>
      </form>
      <style jsx>{`
        .text-shadow-lg { text-shadow: 0 0 20px rgba(236, 72, 153, 0.5); }
        .action-button { color: white; font-weight: bold; padding: 10px 32px; border-radius: 8px; transition: all 0.2s ease-in-out; box-shadow: 0 4px 6px rgba(0,0,0,0.1); } 
        .action-button:hover { transform: translateY(-2px); box-shadow: 0 7px 10px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
};
