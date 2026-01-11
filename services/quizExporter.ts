
import { QuizSession } from "../types";

export const downloadStandaloneQuiz = (session: QuizSession) => {
  const quizData = JSON.stringify({
    title: session.title,
    questions: session.questions
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${session.title} - Standalone Quiz</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; color: #1e293b; }
        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .btn-icon { display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .btn-icon:hover { transform: scale(1.1); color: #2563eb; }
    </style>
</head>
<body class="min-h-screen flex flex-col p-4 md:p-8">
    <div id="quiz-app" class="max-w-3xl mx-auto w-full">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900">${session.title}</h1>
                <div id="timer-display" class="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 font-mono font-bold text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span id="timer-text">00:00</span>
                </div>
            </div>
            <div id="progress-container" class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div id="progress-bar" class="h-full bg-blue-600 transition-all duration-500" style="width: 0%"></div>
            </div>
        </div>

        <!-- Question Card -->
        <div id="question-container" class="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-slate-100 fade-in">
            <div id="question-header" class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-3">
                    <span id="q-type" class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider"></span>
                    <button id="speak-btn" class="btn-icon text-slate-400 p-1" title="Read Question">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    </button>
                </div>
                <span id="q-counter" class="text-sm font-bold text-slate-400"></span>
            </div>
            <h2 id="question-text" class="text-2xl font-bold text-slate-900 mb-8 leading-snug"></h2>
            <div id="options-grid" class="grid gap-4"></div>
            
            <div id="feedback" class="mt-8 p-6 rounded-2xl hidden border">
                <p id="feedback-text" class="font-bold mb-2"></p>
                <p id="explanation" class="text-slate-600 text-sm"></p>
            </div>

            <button id="next-btn" class="mt-8 w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all hidden">Next Question</button>
        </div>

        <!-- Results Screen -->
        <div id="results-container" class="hidden bg-white rounded-3xl shadow-xl p-10 text-center fade-in border border-slate-100">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55.47.98.97 1.21C11.47 18.44 12 19 12 19s.53-.56 1.03-.79c.5-.23.97-.66.97-1.21v-2.34c0-1.89-1.34-2.66-2-2.66s-2 .77-2 2.66Z"/><path d="M12 7V4"/><path d="M9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0Z"/></svg>
            </div>
            <h2 class="text-4xl font-black text-slate-900 mb-2">Quiz Complete!</h2>
            <p class="text-slate-500 mb-6 font-medium">Topic: ${session.title}</p>
            
            <div class="grid grid-cols-2 gap-4 mb-10 max-w-sm mx-auto">
                <div class="bg-slate-50 p-4 rounded-2xl">
                    <p class="text-xs font-bold uppercase text-slate-400 mb-1">Score</p>
                    <p class="text-3xl font-black text-blue-600" id="final-score">0%</p>
                </div>
                <div class="bg-slate-50 p-4 rounded-2xl">
                    <p class="text-xs font-bold uppercase text-slate-400 mb-1">Time Taken</p>
                    <p class="text-3xl font-black text-slate-900" id="final-time">00:00</p>
                </div>
            </div>

            <p class="text-slate-500 mb-10 text-lg">You answered <span id="correct-count" class="font-bold text-slate-900"></span> out of <span id="total-count" class="font-bold text-slate-900"></span> questions correctly.</p>
            <button onclick="window.location.reload()" class="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Restart Quiz</button>
        </div>
    </div>

    <script>
        const quiz = ${quizData};
        let currentIndex = 0;
        let score = 0;
        let answered = false;
        let seconds = 0;
        let timerInterval;

        function startTimer() {
            timerInterval = setInterval(() => {
                seconds++;
                const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
                const secs = (seconds % 60).toString().padStart(2, '0');
                document.getElementById('timer-text').innerText = \`\${mins}:\${secs}\`;
            }, 1000);
        }

        function speakQuestion() {
            const q = quiz.questions[currentIndex];
            const textToSpeak = \`\${q.questionText}. \${q.options ? 'The options are: ' + q.options.join(', ') : ''}\`;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }

        function updateUI() {
            const q = quiz.questions[currentIndex];
            const progress = ((currentIndex) / quiz.questions.length) * 100;
            
            document.getElementById('progress-bar').style.width = \`\${progress}%\`;
            document.getElementById('q-counter').innerText = \`Question \${currentIndex + 1} of \${quiz.questions.length}\`;
            document.getElementById('q-type').innerText = q.type.replace(/_/g, ' ');
            document.getElementById('question-text').innerText = q.questionText;
            
            const optionsGrid = document.getElementById('options-grid');
            optionsGrid.innerHTML = '';
            
            if (q.options && q.options.length > 0) {
                q.options.forEach((opt, i) => {
                    const btn = document.createElement('button');
                    btn.className = 'w-full text-left p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-400 hover:bg-blue-50 transition-all font-semibold text-lg flex items-center group bg-white';
                    btn.innerHTML = \`<span class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mr-4 group-hover:bg-blue-500 group-hover:text-white transition-colors text-sm font-bold">\${String.fromCharCode(65+i)}</span> <span class="flex-1">\${opt}</span>\`;
                    btn.onclick = () => selectOption(opt, btn);
                    optionsGrid.appendChild(btn);
                });
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = 'Type your answer...';
                input.className = 'w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none text-lg bg-white mb-4';
                input.onkeydown = (e) => { if(e.key === 'Enter') selectOption(input.value, input); };
                optionsGrid.appendChild(input);
                
                const submitBtn = document.createElement('button');
                submitBtn.innerText = 'Submit Answer';
                submitBtn.className = 'w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/10 transition-all';
                submitBtn.onclick = () => selectOption(input.value, input);
                optionsGrid.appendChild(submitBtn);
            }
        }

        function selectOption(val, el) {
            if (answered) return;
            answered = true;
            window.speechSynthesis.cancel();
            const q = quiz.questions[currentIndex];
            const isCorrect = val.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
            
            if (isCorrect) score++;

            const feedback = document.getElementById('feedback');
            feedback.classList.remove('hidden');
            feedback.classList.add(isCorrect ? 'bg-green-50' : 'bg-red-50');
            feedback.classList.add(isCorrect ? 'border-green-100' : 'border-red-100');
            
            document.getElementById('feedback-text').innerText = isCorrect ? '✨ Correct!' : '❌ Incorrect';
            document.getElementById('feedback-text').className = \`font-bold mb-1 text-lg \${isCorrect ? 'text-green-700' : 'text-red-700'}\`;
            document.getElementById('explanation').innerText = q.explanation + (!isCorrect ? ' Correct answer: ' + q.correctAnswer : '');
            
            document.getElementById('next-btn').classList.remove('hidden');
            if (q.options) {
                Array.from(document.getElementById('options-grid').children).forEach(btn => {
                    const btnSpan = btn.querySelector('.flex-1');
                    const btnText = btnSpan.innerText.trim();
                    if (btnText === q.correctAnswer) btn.classList.add('border-green-500', 'bg-green-50', 'text-green-900');
                    else if (btnText === val) btn.classList.add('border-red-500', 'bg-red-50', 'text-red-900');
                    else btn.classList.add('opacity-40');
                    btn.disabled = true;
                });
            }
        }

        document.getElementById('next-btn').onclick = () => {
            currentIndex++;
            answered = false;
            document.getElementById('feedback').classList.add('hidden', 'bg-green-50', 'bg-red-50', 'border-green-100', 'border-red-100');
            document.getElementById('next-btn').classList.add('hidden');
            
            if (currentIndex < quiz.questions.length) {
                updateUI();
            } else {
                showResults();
            }
        };

        document.getElementById('speak-btn').onclick = speakQuestion;

        function showResults() {
            clearInterval(timerInterval);
            document.getElementById('question-container').classList.add('hidden');
            document.getElementById('results-container').classList.remove('hidden');
            document.getElementById('timer-display').classList.add('hidden');
            document.getElementById('progress-bar').style.width = '100%';
            
            const pct = Math.round((score / quiz.questions.length) * 100);
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            
            document.getElementById('final-score').innerText = pct + '%';
            document.getElementById('final-time').innerText = \`\${mins}:\${secs}\`;
            document.getElementById('correct-count').innerText = score;
            document.getElementById('total-count').innerText = quiz.questions.length;
        }

        // Initialize
        updateUI();
        startTimer();
    </script>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_quiz.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
