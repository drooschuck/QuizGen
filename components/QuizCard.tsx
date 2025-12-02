import React, { useState, useEffect } from 'react';
import { Question, QuestionType } from '../types';
import { Button } from './Button';
import { CheckCircle2, XCircle, Volume2, HelpCircle, ArrowRight } from 'lucide-react';

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
          <div className="grid gap-4">
            {question.options?.map((option, index) => {
              let btnClass = "relative group flex items-center p-5 rounded-2xl border-2 text-left transition-all duration-200 w-full";
              
              if (isReviewMode || isAnswered) {
                if (option === question.correctAnswer) {
                  btnClass += " border-green-500 bg-green-50/50 text-green-900";
                } else if (option === currentAnswer) {
                  btnClass += " border-red-500 bg-red-50/50 text-red-900";
                } else {
                  btnClass += " border-gray-100 text-gray-400 opacity-60";
                }
              } else if (currentAnswer === option) {
                 btnClass += " border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-200";
              } else {
                 btnClass += " border-gray-100 hover:border-brand-300 hover:bg-white hover:shadow-md bg-white";
              }

              return (
                <button
                  key={option}
                  onClick={() => !isReviewMode && !isAnswered && onAnswer(option)}
                  disabled={isReviewMode || isAnswered}
                  className={btnClass}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-4 text-sm font-bold border transition-colors ${
                      (isReviewMode || isAnswered) && option === question.correctAnswer ? 'bg-green-500 border-green-500 text-white' :
                      (isReviewMode || isAnswered) && option === currentAnswer ? 'bg-red-500 border-red-500 text-white' :
                      'bg-gray-50 border-gray-200 text-gray-500 group-hover:border-brand-400 group-hover:text-brand-600'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="font-semibold text-lg flex-grow">{option}</span>
                  
                  {(isReviewMode || isAnswered) && option === question.correctAnswer && <CheckCircle2 className="text-green-600" size={24} />}
                  {(isReviewMode || isAnswered) && option === currentAnswer && option !== question.correctAnswer && <XCircle className="text-red-600" size={24} />}
                </button>
              );
            })}
          </div>
        );

      case QuestionType.SHORT_ANSWER:
      case QuestionType.FILL_IN_THE_BLANK:
        return (
          <div className="space-y-6">
            <input
              type="text"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              disabled={isReviewMode || isAnswered}
              placeholder="Type your answer here..."
              className="w-full p-6 text-lg border-2 border-gray-200 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all bg-white"
            />
            {!isReviewMode && !isAnswered && (
              <Button onClick={() => onAnswer(typedAnswer)} disabled={!typedAnswer.trim()} fullWidth size="lg">
                Submit Answer
              </Button>
            )}
            {(isReviewMode || isAnswered) && (
              <div className={`p-6 rounded-2xl border ${isCorrect ? 'bg-green-50 border-green-100 text-green-900' : 'bg-red-50 border-red-100 text-red-900'}`}>
                <div className="flex items-center gap-3 mb-2">
                  {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  <h4 className="font-bold text-lg">{isCorrect ? 'Correct!' : 'Incorrect'}</h4>
                </div>
                {!isCorrect && (
                   <p className="ml-9 text-red-800">The correct answer is: <span className="font-bold">{question.correctAnswer}</span></p>
                )}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-white overflow-hidden relative">
        {/* Decorative Top Bar */}
        <div className="h-2 bg-gradient-to-r from-brand-400 via-brand-500 to-accent-500"></div>
        
        <div className="p-6 md:p-10">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
               <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-brand-100 text-brand-700 uppercase">
                  {question.type.replace(/_/g, ' ')}
               </span>
               <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-gray-100 text-gray-600 uppercase">
                  {question.category}
               </span>
            </div>
            
            <button onClick={handleSpeak} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all" title="Read Question">
              <Volume2 size={22} />
            </button>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 leading-snug">
            {question.questionText}
          </h3>

          <div className="animate-fade-in">
             {renderInput()}
          </div>
          
          {(isAnswered || isReviewMode) && (
            <div className="mt-8 pt-6 border-t border-gray-100 animate-slide-up">
               <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="flex items-center text-brand-600 font-bold hover:text-brand-800 transition-colors"
               >
                  <HelpCircle size={20} className="mr-2" />
                  {showExplanation ? "Hide Explanation" : "Why is this correct?"}
               </button>
               {showExplanation && (
                 <div className="mt-4 bg-brand-50/50 p-6 rounded-2xl text-brand-900 border border-brand-100 text-base leading-relaxed">
                    {question.explanation}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};