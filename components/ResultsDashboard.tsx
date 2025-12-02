import React from 'react';
import { QuizSession } from '../types';
import { Button } from './Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Share2, RotateCcw, Home, Award } from 'lucide-react';

interface ResultsDashboardProps {
  session: QuizSession;
  onRetry: () => void;
  onHome: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ session, onRetry, onHome }) => {
  const percentage = Math.round((session.score / session.questions.length) * 100);
  
  // Data for Pie Chart
  const pieData = [
    { name: 'Correct', value: session.score },
    { name: 'Incorrect', value: session.questions.length - session.score },
  ];
  const COLORS = ['#4f46e5', '#e5e7eb'];

  // Data for Weak Areas (Radar Chart)
  // Group incorrect answers by category
  const categoryStats: Record<string, { total: number; correct: number }> = {};
  
  session.questions.forEach(q => {
    if (!categoryStats[q.category]) {
      categoryStats[q.category] = { total: 0, correct: 0 };
    }
    categoryStats[q.category].total += 1;
    if (session.userAnswers[q.id] === q.correctAnswer) {
      categoryStats[q.category].correct += 1;
    }
  });

  const radarData = Object.keys(categoryStats).map(cat => ({
    subject: cat,
    A: Math.round((categoryStats[cat].correct / categoryStats[cat].total) * 100),
    fullMark: 100,
  }));

  const shareResult = () => {
    if (navigator.share) {
      navigator.share({
        title: `I scored ${percentage}% on ${session.title}!`,
        text: `I just took a quiz on QuizGen AI. Can you beat my score?`,
        url: window.location.href
      });
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header / Score Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-brand-100 overflow-hidden text-center p-8 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-brand-500 to-purple-500"></div>
        
        <h2 className="text-gray-500 uppercase tracking-widest text-sm font-semibold mb-2">Quiz Complete</h2>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{session.title}</h1>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-8">
          <div className="w-48 h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-extrabold text-brand-600">{percentage}%</span>
              <span className="text-xs text-gray-400 font-medium">Score</span>
            </div>
          </div>

          <div className="text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                <Award size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Performance</p>
                <p className="font-bold text-lg text-gray-900">
                  {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing'}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>Correct Answers: <span className="font-bold text-gray-900">{session.score}</span> / {session.questions.length}</p>
              <p>Time Spent: <span className="font-bold text-gray-900">{Math.round(session.timeSpentSeconds / 60)}m {session.timeSpentSeconds % 60}s</span></p>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
           <Button variant="outline" onClick={onHome} className="gap-2">
             <Home size={18} /> Home
           </Button>
           <Button variant="secondary" onClick={onRetry} className="gap-2">
             <RotateCcw size={18} /> Retry Quiz
           </Button>
           <Button variant="primary" onClick={shareResult} className="gap-2">
             <Share2 size={18} /> Share Result
           </Button>
        </div>
      </div>

      {/* Analytics */}
      {radarData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <h3 className="text-lg font-bold mb-4">Topic Strength</h3>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                   <PolarGrid stroke="#e5e7eb" />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                   <Radar
                     name="Performance"
                     dataKey="A"
                     stroke="#4f46e5"
                     fill="#4f46e5"
                     fillOpacity={0.3}
                   />
                   <Tooltip />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mb-4">Detailed Review</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {session.questions.map((q, idx) => {
                 const isCorrect = session.userAnswers[q.id] === q.correctAnswer;
                 return (
                   <div key={q.id} className={`p-3 rounded-lg border-l-4 text-sm ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                     <div className="flex justify-between">
                       <span className="font-semibold text-gray-800">Q{idx+1}</span>
                       <span className={isCorrect ? "text-green-700" : "text-red-700"}>{isCorrect ? 'Correct' : 'Wrong'}</span>
                     </div>
                     <p className="text-gray-600 mt-1 truncate">{q.questionText}</p>
                   </div>
                 )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
