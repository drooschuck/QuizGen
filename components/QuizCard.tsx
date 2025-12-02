import React, { useState, useEffect } from 'react';
import { Question, QuestionType } from '../types';
import { Button } from './Button';
import { CheckCircle, XCircle, Volume2, HelpCircle } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  currentAnswer: string | undefined;
  onAnswer: (answer: string) => void;
  isReviewMode?: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({ question, currentAnswer, onAnswer, isReviewMode = false }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState(currentAnswer || '');

  useEffect(() => {
    setTypedAnswer(currentAnswer || '');
    if (!isReviewMode) setShowExplanation(false);
  }, [question, currentAnswer, isReviewMode]);

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(`${question.questionText}. ${question.options ? 'Options are: ' + question.options.join(', ') : ''}`);
    window.speechSynthesis.speak(utterance);
  };

  const isCorrect = currentAnswer === question.correctAnswer;
  const isAnswered = !!currentAnswer;

  const renderInput = () => {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.TRUE_FALSE:
        return (
          <div className="grid gap-3">
            {question.options?.map((option) => {
              let btnClass = "border-2 border-gray-200 hover:border-brand-300 text-left p-4 rounded-xl transition-all";
              
              if (isReviewMode || isAnswered) {
                if (option === question.correctAnswer) {
                  btnClass = "border-green-500 bg-green-50 text-green-800";
                } else if (option === currentAnswer) {
                  btnClass = "border-red-500 bg-red-50 text-red-800";
                } else {
                  btnClass = "border-gray-100 text-gray-400";
                }
              } else if (currentAnswer === option) {
                 btnClass = "border-brand-500 bg-brand-50 ring-2 ring-brand-200";
              }

              return (
                <button
                  key={option}
                  onClick={() => !isReviewMode && !isAnswered && onAnswer(option)}
                  disabled={isReviewMode || isAnswered}
                  className={btnClass}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {(isReviewMode || isAnswered) && option === question.correctAnswer && <CheckCircle size={20} className="text-green-600" />}
                    {(isReviewMode || isAnswered) && option === currentAnswer && option !== question.correctAnswer && <XCircle size={20} className="text-red-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        );

      case QuestionType.SHORT_ANSWER:
      case QuestionType.FILL_IN_THE_BLANK:
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              disabled={isReviewMode || isAnswered}
              placeholder="Type your answer here..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
            />
            {!isReviewMode && !isAnswered && (
              <Button onClick={() => onAnswer(typedAnswer)} disabled={!typedAnswer.trim()}>
                Submit Answer
              </Button>
            )}
            {(isReviewMode || isAnswered) && (
              <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <p className="font-bold mb-1">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
                {!isCorrect && <p>Correct Answer: <span className="font-semibold">{question.correctAnswer}</span></p>}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-3xl mx-auto">
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-brand-100 text-brand-700 uppercase">
            {question.type.replace(/_/g, ' ')}
          </span>
          <button onClick={handleSpeak} className="text-gray-400 hover:text-brand-600 transition-colors" title="Read Question">
            <Volume2 size={20} />
          </button>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 leading-snug">
          {question.questionText}
        </h3>

        {renderInput()}
        
        {(isAnswered || isReviewMode) && (
          <div className="mt-8 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <button 
                onClick={() => setShowExplanation(!showExplanation)}
                className="flex items-center text-brand-600 font-medium hover:text-brand-800 mb-2"
             >
                <HelpCircle size={18} className="mr-2" />
                {showExplanation ? "Hide Explanation" : "Show Explanation"}
             </button>
             {showExplanation && (
               <div className="bg-blue-50 p-4 rounded-xl text-blue-900 text-sm leading-relaxed">
                  <span className="font-semibold block mb-1">Explanation:</span>
                  {question.explanation}
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
