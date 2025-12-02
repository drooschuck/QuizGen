import React, { useState, useEffect } from 'react';
import { AppState, QuizConfig, QuizSession } from './types';
import { generateQuizQuestions } from './services/geminiService';
import { CreateQuizForm } from './components/CreateQuizForm';
import { QuizCard } from './components/QuizCard';
import { ResultsDashboard } from './components/ResultsDashboard';
import { Button } from './components/Button';
import { BrainCircuit, BookOpen, Clock, ChevronRight, Menu, X } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    
    setState((prev) => ({ ...prev, currentQuiz: updatedSession }));
  };

  const handleNextQuestion = () => {
    if (!state.currentQuiz) return;
    
    if (currentQuestionIndex < state.currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
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
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-slate-50 selection:bg-brand-200">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center cursor-pointer group" onClick={() => setState(prev => ({ ...prev, view: 'home' }))}>
              <div className="bg-brand-600 p-2 rounded-xl mr-3 group-hover:scale-105 transition-transform shadow-lg shadow-brand-500/20">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">QuizGen</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
               {state.view === 'quiz' && (
                <div className="flex items-center bg-gray-100 rounded-full px-5 py-2">
                  <Clock size={18} className="text-gray-500 mr-2" />
                  <span className="font-mono font-bold text-gray-700">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              {state.history.length > 0 && state.view === 'home' && (
                 <button className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">History</button>
              )}
            </div>

            {/* Mobile Menu Button */}
             <div className="md:hidden flex items-center">
               <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                 {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
               </button>
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none z-0">
           <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200/20 rounded-full blur-3xl mix-blend-multiply filter animate-pulse-slow"></div>
           <div className="absolute top-40 right-10 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl mix-blend-multiply filter animate-pulse-slow animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative z-10">
          
          {state.error && (
             <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">{state.error}</span>
               </div>
               <button onClick={() => setState(prev => ({...prev, error: null}))} className="p-1 hover:bg-red-100 rounded-lg"><X size={18}/></button>
             </div>
          )}

          {state.view === 'home' && (
            <div className="space-y-16">
              <div className="text-center max-w-3xl mx-auto space-y-6 animate-fade-in">
                <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Master any topic with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600">AI Power</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                  Transform articles, notes, and docs into interactive quizzes instantly. Learning just got an upgrade.
                </p>
              </div>
              
              <CreateQuizForm onGenerate={handleGenerateQuiz} isLoading={state.isLoading} />

              {/* History Section */}
              {state.history.length > 0 && (
                <div className="max-w-4xl mx-auto mt-20 animate-slide-up">
                  <div className="flex items-center justify-between mb-6 px-2">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen size={24} className="text-brand-500" /> Recent Sessions
                    </h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {state.history.slice(0, 3).map((session) => (
                      <div key={session.id} onClick={() => setState(prev => ({ ...prev, view: 'results', currentQuiz: session }))} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-200 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-3">
                           <div className={`p-2 rounded-lg ${session.score/session.questions.length >= 0.8 ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'}`}>
                             <BrainCircuit size={20} />
                           </div>
                           <span className="text-xs font-semibold text-gray-400">{new Date(session.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 mb-1 group-hover:text-brand-600 transition-colors line-clamp-1">{session.title}</h4>
                        <div className="flex items-center justify-between mt-4">
                           <span className="text-sm text-slate-500">Score: <span className="font-bold text-slate-900">{Math.round((session.score/session.questions.length)*100)}%</span></span>
                           <ChevronRight size={18} className="text-gray-300 group-hover:text-brand-500 transform group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {state.view === 'quiz' && state.currentQuiz && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="mb-8">
                 <div className="flex justify-between items-end mb-2 px-1">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Question {currentQuestionIndex + 1}</span>
                    <span className="text-sm font-bold text-brand-600">{Math.round(((currentQuestionIndex + 1) / state.currentQuiz.questions.length) * 100)}% Complete</span>
                 </div>
                 <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        style={{ width: `${((currentQuestionIndex + 1) / state.currentQuiz.questions.length) * 100}%` }}
                    ></div>
                 </div>
              </div>

              <QuizCard 
                question={state.currentQuiz.questions[currentQuestionIndex]}
                currentAnswer={state.currentQuiz.userAnswers[state.currentQuiz.questions[currentQuestionIndex].id]}
                onAnswer={handleAnswer}
              />

              <div className="mt-10 flex justify-end px-4 md:px-0">
                <Button 
                  size="xl"
                  onClick={handleNextQuestion}
                  disabled={!state.currentQuiz.userAnswers[state.currentQuiz.questions[currentQuestionIndex].id]}
                  className="shadow-xl shadow-brand-500/20"
                >
                  {currentQuestionIndex === state.currentQuiz.questions.length - 1 ? "Finish Quiz" : "Next Question"}
                  <ChevronRight className="ml-2" size={20} />
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
    </div>
  );
}