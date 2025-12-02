import React from 'react';
import { QuizSession } from '../types';
import { Button } from './Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Share2, RotateCcw, Home, Award, TrendingUp, Clock } from 'lucide-react';

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
  const COLORS = ['#2563eb', '#f1f5f9'];

  // Data for Weak Areas (Radar Chart)
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
    <div className="max-w-5xl mx-auto space-y-8 animate-slide-up pb-10">
      
      {/* Header / Score Card */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white overflow-hidden text-center relative">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-brand-400 via-brand-600 to-accent-600"></div>
        
        <div className="p-8 md:p-12">
            <h2 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-3">Assessment Complete</h2>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">{session.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center justify-items-center mb-10">
            <div className="w-64 h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    cornerRadius={10}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                    >
                    {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-5xl font-black text-brand-600 tracking-tighter">{percentage}%</span>
                <span className="text-sm text-gray-400 font-bold uppercase mt-1">Total Score</span>
                </div>
            </div>

            <div className="space-y-6 w-full max-w-sm">
                <div className="p-5 bg-gray-50 rounded-2xl flex items-center gap-4 border border-gray-100">
                    <div className="p-3 bg-white text-green-500 rounded-xl shadow-sm">
                        <Award size={28} />
                    </div>
                    <div className="text-left">
                        <p className="text-xs text-gray-500 font-bold uppercase">Performance</p>
                        <p className="font-bold text-xl text-gray-900">
                        {percentage >= 80 ? 'Mastery Level' : percentage >= 60 ? 'Proficient' : 'Needs Review'}
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                        <div className="flex items-center gap-2 mb-2 text-brand-500">
                            <TrendingUp size={18} />
                            <span className="text-xs font-bold uppercase text-gray-400">Correct</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{session.score} <span className="text-base text-gray-400 font-medium">/ {session.questions.length}</span></p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                        <div className="flex items-center gap-2 mb-2 text-brand-500">
                            <Clock size={18} />
                            <span className="text-xs font-bold uppercase text-gray-400">Time</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{Math.round(session.timeSpentSeconds / 60)}<span className="text-sm">m</span> {session.timeSpentSeconds % 60}<span className="text-sm">s</span></p>
                    </div>
                </div>
            </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="outline" onClick={onHome} className="gap-2" size="lg">
                <Home size={20} /> Home
            </Button>
            <Button variant="secondary" onClick={onRetry} className="gap-2" size="lg">
                <RotateCcw size={20} /> Retry
            </Button>
            <Button variant="primary" onClick={shareResult} className="gap-2" size="lg">
                <Share2 size={20} /> Share
            </Button>
            </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {radarData.length > 0 && (
            <div className="bg-white p-8 rounded-[2rem] shadow-lg shadow-gray-200/40 border border-gray-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                    Topic Strength
                </h3>
                <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Performance"
                        dataKey="A"
                        stroke="#2563eb"
                        strokeWidth={3}
                        fill="#3b82f6"
                        fillOpacity={0.2}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#1e3a8a', fontWeight: 'bold' }}
                    />
                    </RadarChart>
                </ResponsiveContainer>
                </div>
            </div>
        )}

        <div className="bg-white p-8 rounded-[2rem] shadow-lg shadow-gray-200/40 border border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                Detailed Review
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {session.questions.map((q, idx) => {
                    const isCorrect = session.userAnswers[q.id] === q.correctAnswer;
                    return (
                    <div key={q.id} className={`p-4 rounded-xl border-l-4 transition-all hover:shadow-md ${isCorrect ? 'bg-green-50/50 border-green-500' : 'bg-red-50/50 border-red-500'}`}>
                        <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Question {idx+1}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{isCorrect ? 'Correct' : 'Missed'}</span>
                        </div>
                        <p className="text-gray-900 font-medium line-clamp-2">{q.questionText}</p>
                    </div>
                    )
                })}
            </div>
        </div>
      </div>
    </div>
  );
};