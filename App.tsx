import React, { useState, useEffect } from 'react';
import { AppState, QuizConfig, QuizSession, Question } from './types';
import { generateQuizQuestions } from './services/geminiService';
import { CreateQuizForm } from './components/CreateQuizForm';
import { QuizCard } from './components/QuizCard';
import { ResultsDashboard } from './components/ResultsDashboard';
import { Button } from './components/Button';
import { BrainCircuit, BookOpen, Clock } from 'lucide-react';

// Using a mock ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [state, setState] = useState<AppState>({
    view: 'home',
    currentQuiz: null,
    history: [],
    isLoading: false,
    error: null,
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(0);

  // Timer logic for active quiz
  useEffect(() => {
    let interval: any;
    if (state.view === 'quiz' && !state.currentQuiz?.completed) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.view, state.currentQuiz?.completed]);

  const handleGenerateQuiz = async (config: QuizConfig) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const { title, questions } = await generateQuizQuestions(config);
      
      const newSession: QuizSession = {
        id: generateId(),
        createdAt: Date.now(),
        title,
        questions,
        userAnswers: {},
        score: 0,
        completed: false,
        timeSpentSeconds: 0,
      };

      setState((prev) => ({
        ...prev,
        isLoading: false,
        view: 'quiz',
        currentQuiz: newSession,
      }));
      setCurrentQuestionIndex(0);
      setTimer(0);
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || "Something went wrong",
      }));
    }
  };

  const handleAnswer = (answer: string) => {
    if (!state.currentQuiz) return;

    const currentQuestion = state.currentQuiz.questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    const updatedSession = {
      ...state.currentQuiz,
      userAnswers: {
        ...state.currentQuiz.userAnswers,
        [currentQuestion.id]: answer,
      },
      score: isCorrect ? state.currentQuiz.score + 1 : state.currentQuiz.score,
    };

    // Automatically move to next question after a short delay to read feedback if needed
    // For this UI, we might want to let user click "Next" explicitly if we show instant feedback.
    // Let's update state but not move index yet if we want to show feedback on the card.
    // However, the QuizCard shows feedback immediately when answered.
    
    setState((prev) => ({ ...prev, currentQuiz: updatedSession }));
  };

  const handleNextQuestion = () => {
    if (!state.currentQuiz) return;
    
    if (currentQuestionIndex < state.currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Finish Quiz
      const finalSession = {
        ...state.currentQuiz,
        completed: true,
        timeSpentSeconds: timer,
      };
      setState((prev) => ({
        ...prev,
        view: 'results',
        currentQuiz: finalSession,
        history: [finalSession, ...prev.history],
      }));
    }
  };

  const handleRetry = () => {
    if (!state.currentQuiz) return;
    const retrySession = {
      ...state.currentQuiz,
      id: generateId(),
      userAnswers: {},
      score: 0,
      completed: false,
      timeSpentSeconds: 0,
    };
    setState(prev => ({ ...prev, view: 'quiz', currentQuiz: retrySession }));
    setCurrentQuestionIndex(0);
    setTimer(0);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => setState(prev => ({ ...prev, view: 'home' }))}>
              <BrainCircuit className="h-8 w-8 text-brand-600 mr-2" />
              <span className="font-bold text-xl tracking-tight text-slate-900">QuizGen AI</span>
            </div>
            <div className="flex items-center space-x-4">
              {state.view === 'quiz' && (
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-1">
                  <Clock size={16} className="text-gray-500 mr-2" />
                  <span className="font-mono font-medium text-sm">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {state.error && (
             <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between">
               <span>{state.error}</span>
               <button onClick={() => setState(prev => ({...prev, error: null}))}><span className="font-bold">&times;</span></button>
             </div>
          )}

          {state.view === 'home' && (
            <div className="space-y-12">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                  Master any topic with <span className="text-brand-600">AI-generated quizzes</span>
                </h1>
                <p className="text-lg text-slate-600">
                  Upload your documents or paste links. Let Gemini create personalized study plans and quizzes instantly.
                </p>
              </div>
              
              <CreateQuizForm onGenerate={handleGenerateQuiz} isLoading={state.isLoading} />

              {/* History Preview */}
              {state.history.length > 0 && (
                <div className="max-w-2xl mx-auto mt-12">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <BookOpen size={20} /> Recent Quizzes
                  </h3>
                  <div className="grid gap-4">
                    {state.history.slice(0, 3).map((session) => (
                      <div key={session.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                        <div>
                          <p className="font-semibold text-slate-800">{session.title}</p>
                          <p className="text-xs text-slate-500">{new Date(session.createdAt).toLocaleDateString()} • Score: {Math.round((session.score/session.questions.length)*100)}%</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setState(prev => ({ ...prev, view: 'results', currentQuiz: session }))}>View Results</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {state.view === 'quiz' && state.currentQuiz && (
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 flex justify-between items-center text-sm font-medium text-gray-500">
                <span>Question {currentQuestionIndex + 1} of {state.currentQuiz.questions.length}</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-500 transition-all duration-300 ease-out"
                    style={{ width: `${((currentQuestionIndex + 1) / state.currentQuiz.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <QuizCard 
                question={state.currentQuiz.questions[currentQuestionIndex]}
                currentAnswer={state.currentQuiz.userAnswers[state.currentQuiz.questions[currentQuestionIndex].id]}
                onAnswer={handleAnswer}
              />

              <div className="mt-8 flex justify-end">
                <Button 
                  size="lg"
                  onClick={handleNextQuestion}
                  disabled={!state.currentQuiz.userAnswers[state.currentQuiz.questions[currentQuestionIndex].id]}
                  className="shadow-xl"
                >
                  {currentQuestionIndex === state.currentQuiz.questions.length - 1 ? "Finish Quiz" : "Next Question"}
                </Button>
              </div>
            </div>
          )}

          {state.view === 'results' && state.currentQuiz && (
            <ResultsDashboard 
              session={state.currentQuiz} 
              onRetry={handleRetry} 
              onHome={() => setState(prev => ({ ...prev, view: 'home' }))} 
            />
          )}

        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} QuizGen AI. Powered by Google Gemini 2.5.</p>
      </footer>
    </div>
  );
}
