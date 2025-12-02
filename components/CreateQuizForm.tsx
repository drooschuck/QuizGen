import React, { useState } from 'react';
import { QuizConfig, Difficulty, QuestionType } from '../types';
import { Button } from './Button';
import { FileText, Link as LinkIcon, UploadCloud, Youtube, Type } from 'lucide-react';

interface CreateQuizFormProps {
  onGenerate: (config: QuizConfig) => void;
  isLoading: boolean;
}

export const CreateQuizForm: React.FC<CreateQuizFormProps> = ({ onGenerate, isLoading }) => {
  const [sourceType, setSourceType] = useState<'text' | 'url' | 'file'>('text');
  const [textInput, setTextInput] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [questionCount, setQuestionCount] = useState(5);
  
  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTextInput(content);
      // Automatically switch to text mode since we extracted it, but visually keep file selected or switch to text
      // Ideally, we store "sourceType" as 'text' internally now.
    };
    reader.readAsText(file); // Only supporting text-based files for this demo
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
      ], // Simplified for demo
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-brand-600 to-indigo-700 p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Create New Quiz</h2>
        <p className="text-brand-100">Turn any content into an interactive study session in seconds.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        
        {/* Source Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">Content Source</label>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setSourceType('text')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${sourceType === 'text' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:border-brand-200 text-gray-600'}`}
            >
              <Type size={24} />
              <span className="text-sm font-medium">Paste Text</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceType('url')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${sourceType === 'url' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:border-brand-200 text-gray-600'}`}
            >
              <LinkIcon size={24} />
              <span className="text-sm font-medium">Website URL</span>
            </button>
            <label
              className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${sourceType === 'file' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:border-brand-200 text-gray-600'}`}
            >
              <UploadCloud size={24} />
              <span className="text-sm font-medium">Upload File</span>
              <input type="file" className="hidden" accept=".txt,.md,.json,.csv" onChange={handleFileUpload} onClick={() => setSourceType('file')} />
            </label>
          </div>
        </div>

        {/* Input Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            {sourceType === 'url' ? 'Enter Website URL' : 'Content or Text'}
          </label>
          {sourceType === 'url' ? (
            <input
              type="url"
              required
              placeholder="https://example.com/article"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
          ) : (
            <textarea
              required
              rows={6}
              placeholder={sourceType === 'file' ? "Content from file will appear here..." : "Paste your study notes, article, or documentation here..."}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent font-mono text-sm"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
          )}
          {sourceType === 'file' && <p className="text-xs text-gray-500">* Supports .txt, .md, .csv. For PDF/Doc, please copy-paste text.</p>}
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            >
              <option value={Difficulty.EASY}>Easy</option>
              <option value={Difficulty.MEDIUM}>Medium</option>
              <option value={Difficulty.HARD}>Hard</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Number of Questions</label>
            <input
              type="number"
              min={1}
              max={20}
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          fullWidth 
          size="lg" 
          disabled={isLoading || !textInput}
          className="shadow-lg shadow-brand-200"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Quiz...
            </span>
          ) : (
            "Generate Quiz"
          )}
        </Button>
      </form>
    </div>
  );
};
