export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: string[]; // For MC and True/False
  correctAnswer: string;
  explanation: string;
  category: string; // For "Weak Areas" analysis
}

export interface QuizConfig {
  sourceText: string;
  sourceType: 'text' | 'url' | 'file';
  difficulty: Difficulty;
  questionCount: number;
  questionTypes: QuestionType[];
}

export interface QuizSession {
  id: string;
  createdAt: number;
  title: string;
  questions: Question[];
  userAnswers: Record<string, string>; // questionId -> answer
  score: number;
  completed: boolean;
  timeSpentSeconds: number;
}

export interface AppState {
  view: 'home' | 'quiz' | 'results' | 'history';
  currentQuiz: QuizSession | null;
  history: QuizSession[];
  isLoading: boolean;
  error: string | null;
}
