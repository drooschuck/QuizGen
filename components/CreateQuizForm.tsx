import React, { useState } from 'react';
import { QuizConfig, Difficulty, QuestionType } from '../types';
import { Button } from './Button';
import { FileText, Link as LinkIcon, UploadCloud, Sparkles, AlertCircle } from 'lucide-react';

interface CreateQuizFormProps {
  onGenerate: (config: QuizConfig) => void;
  isLoading: boolean;
}

export const CreateQuizForm: React.FC<CreateQuizFormProps> = ({ onGenerate, isLoading }) => {
  const [sourceType, setSourceType] = useState<'text' | 'url' | 'file'>('text');
  const [textInput, setTextInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [questionCount, setQuestionCount] = useState(5);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTextInput(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      sourceText: textInput,
      sourceType,
      difficulty,
      questionCount,
      questionTypes: [
        QuestionType.MULTIPLE_CHOICE, 
        QuestionType.TRUE_FALSE, 
        QuestionType.SHORT_ANSWER
      ],
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden animate-slide-up">
      <div className="bg-white p-8 md:p-10">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-2 mb-4 bg-brand-50 rounded-2xl">
            <Sparkles className="w-6 h-6 text-brand-500 animate-pulse-slow" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">What are we studying today?</h2>
          <p className="text-gray-500 text-lg">Choose your source material and let AI do the rest.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Source Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setSourceType('text')}
              className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 hover:shadow-lg ${sourceType === 'text' ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500' : 'border-gray-100 hover:border-brand-200 bg-gray-50/50'}`}
            >
              <div className={`p-3 rounded-full transition-colors ${sourceType === 'text' ? 'bg-brand-500 text-white' : 'bg-white text-gray-400 group-hover:text-brand-500'}`}>
                <FileText size={24} />
              </div>
              <div className="text-center">
                <span className={`block font-bold mb-1 ${sourceType === 'text' ? 'text-brand-900' : 'text-gray-700'}`}>Paste Text</span>
                <span className="text-xs text-gray-500">Notes, articles, or essays</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSourceType('url')}
              className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 hover:shadow-lg ${sourceType === 'url' ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500' : 'border-gray-100 hover:border-brand-200 bg-gray-50/50'}`}
            >
              <div className={`p-3 rounded-full transition-colors ${sourceType === 'url' ? 'bg-brand-500 text-white' : 'bg-white text-gray-400 group-hover:text-brand-500'}`}>
                <LinkIcon size={24} />
              </div>
              <div className="text-center">
                <span className={`block font-bold mb-1 ${sourceType === 'url' ? 'text-brand-900' : 'text-gray-700'}`}>Website URL</span>
                <span className="text-xs text-gray-500">News, blogs, or docs</span>
              </div>
            </button>

            <label
              className={`relative group p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 hover:shadow-lg ${sourceType === 'file' ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500' : 'border-gray-100 hover:border-brand-200 bg-gray-50/50'}`}
              onClick={() => setSourceType('file')}
            >
              <div className={`p-3 rounded-full transition-colors ${sourceType === 'file' ? 'bg-brand-500 text-white' : 'bg-white text-gray-400 group-hover:text-brand-500'}`}>
                <UploadCloud size={24} />
              </div>
              <div className="text-center">
                <span className={`block font-bold mb-1 ${sourceType === 'file' ? 'text-brand-900' : 'text-gray-700'}`}>Upload File</span>
                <span className="text-xs text-gray-500">.txt, .md, .csv files</span>
              </div>
              <input type="file" className="hidden" accept=".txt,.md,.json,.csv" onChange={handleFileUpload} />
            </label>
          </div>

          {/* Input Area */}
          <div className="space-y-4 animate-fade-in">
            {sourceType === 'url' && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <LinkIcon size={18} />
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://en.wikipedia.org/wiki/Artificial_intelligence"
                  className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
              </div>
            )}
            
            {sourceType === 'text' && (
              <textarea
                required
                rows={6}
                placeholder="Paste your study notes here..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-mono text-sm text-gray-800 placeholder-gray-400 resize-none"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />
            )}

            {sourceType === 'file' && (
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 text-center">
                 <p className="font-medium text-brand-900">{fileName ? fileName : "No file selected yet"}</p>
                 <p className="text-sm text-brand-600 mt-1">{fileName ? "Ready to generate" : "Please select a file using the card above"}</p>
              </div>
            )}
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          {/* Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">Difficulty Level</label>
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map((level) => (
                   <button
                     key={level}
                     type="button"
                     onClick={() => setDifficulty(level)}
                     className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${difficulty === level ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                   >
                     {level.toLowerCase()}
                   </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">Question Count: {questionCount}</label>
              <input
                type="range"
                min="1"
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>1</span>
                <span>10</span>
                <span>20</span>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            fullWidth 
            size="xl" 
            disabled={isLoading || !textInput}
            className="shadow-xl shadow-brand-500/20"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Crafting your quiz...</span>
              </div>
            ) : (
              "Generate Quiz"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};