
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
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; }
        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body class="min-h-screen flex flex-col p-4 md:p-8">
    <div id="quiz-app" class="max-w-3xl mx-auto w-full">
        <!-- Header -->
        <div class="mb-8 text-center">
            <h1 class="text-3xl font-extrabold text-slate-900 mb-2">${session.title}</h1>
            <div id="progress-container" class="w-full h-2 bg-slate-200 rounded-full mt-4 overflow-hidden">
                <div id="progress-bar" class="h-full bg-blue-600 transition-all duration-500" style="width: 0%"></div>
            </div>
        </div>

        <!-- Question Card -->
        <div id="question-container" class="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-slate-100 fade-in">
            <div id="question-header" class="flex justify-between items-center mb-6">
                <span id="q-type" class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider"></span>
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
            <h2 class="text-4xl font-black text-slate-900 mb-4">Quiz Complete!</h2>
            <div class="text-6xl font-black text-blue-600 mb-6" id="final-score">0%</div>
            <p class="text-slate-500 mb-10 text-lg">You answered <span id="correct-count" class="font-bold text-slate-900"></span> out of <span id="total-count" class="font-bold text-slate-900"></span> questions correctly.</p>
            <button onclick="window.location.reload()" class="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all">Restart Quiz</button>
        </div>
    </div>

    <script>
        const quiz = ${quizData};
        let currentIndex = 0;
        let score = 0;
        let answered = false;

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
                    btn.className = 'w-full text-left p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-400 hover:bg-blue-50 transition-all font-semibold text-lg flex items-center group';
                    btn.innerHTML = \`<span class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mr-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">\${String.fromCharCode(65+i)}</span> \${opt}\`;
                    btn.onclick = () => selectOption(opt, btn);
                    optionsGrid.appendChild(btn);
                });
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = 'Type your answer...';
                input.className = 'w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none text-lg';
                input.onkeydown = (e) => { if(e.key === 'Enter') selectOption(input.value, input); };
                optionsGrid.appendChild(input);
                
                const submitBtn = document.createElement('button');
                submitBtn.innerText = 'Submit Answer';
                submitBtn.className = 'mt-4 w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700';
                submitBtn.onclick = () => selectOption(input.value, input);
                optionsGrid.appendChild(submitBtn);
            }
        }

        function selectOption(val, el) {
            if (answered) return;
            answered = true;
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
                    const btnText = btn.innerText.substring(2).trim();
                    if (btnText === q.correctAnswer) btn.classList.add('border-green-500', 'bg-green-50');
                    else if (btnText === val) btn.classList.add('border-red-500', 'bg-red-50');
                    btn.disabled = true;
                });
            }
        }

        document.getElementById('next-btn').onclick = () => {
            currentIndex++;
            answered = false;
            document.getElementById('feedback').classList.add('hidden');
            document.getElementById('next-btn').classList.add('hidden');
            
            if (currentIndex < quiz.questions.length) {
                updateUI();
            } else {
                showResults();
            }
        };

        function showResults() {
            document.getElementById('question-container').classList.add('hidden');
            document.getElementById('results-container').classList.remove('hidden');
            document.getElementById('progress-bar').style.width = '100%';
            
            const pct = Math.round((score / quiz.questions.length) * 100);
            document.getElementById('final-score').innerText = pct + '%';
            document.getElementById('correct-count').innerText = score;
            document.getElementById('total-count').innerText = quiz.questions.length;
        }

        updateUI();
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
