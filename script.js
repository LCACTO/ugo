// ===== VARIABLES GLOBALES =====
let currentTheme = '';
let currentDifficulty = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;

// ===== FONCTIONS DE NAVIGATION =====
function showScreen(screenId) {
    // Masquer tous les écrans
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    
    // Afficher l'écran demandé
    document.getElementById(screenId).classList.add('active');
}

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter des écouteurs d'événements aux cartes de thèmes
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
        card.addEventListener('click', function() {
            currentTheme = this.dataset.theme;
            document.getElementById('selection-title').textContent = coursData[currentTheme].title;
            showScreen('selection-screen');
        });
    });
});

// ===== GESTION DES COURS =====
function showCourse() {
    const courseContainer = document.getElementById('course-content');
    courseContainer.innerHTML = coursData[currentTheme].content;
    showScreen('course-screen');
}

// ===== GESTION DES QUIZ =====
function showDifficultySelection() {
    showScreen('difficulty-screen');
}

function startQuiz(difficulty) {
    currentDifficulty = difficulty;
    currentQuestions = quizData[currentTheme][difficulty];
    currentQuestionIndex = 0;
    userAnswers = [];
    score = 0;
    
    showScreen('quiz-screen');
    displayQuestion();
    updateProgress();
}

function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    // Afficher la question
    document.getElementById('question-text').textContent = question.question;
    
    // Afficher les options
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectOption(index);
        optionsContainer.appendChild(optionDiv);
    });
    
    // Désactiver le bouton suivant
    document.getElementById('next-button').disabled = true;
}

function selectOption(index) {
    // Retirer la sélection précédente
    const options = document.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Sélectionner la nouvelle option
    options[index].classList.add('selected');
    
    // Sauvegarder la réponse
    userAnswers[currentQuestionIndex] = index;
    
    // Activer le bouton suivant
    document.getElementById('next-button').disabled = false;
}

function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuestions.length) {
        displayQuestion();
        updateProgress();
    } else {
        // Quiz terminé
        calculateScore();
        showResults();
    }
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('question-counter').textContent = 
        `Question ${currentQuestionIndex + 1}/${currentQuestions.length}`;
}

function calculateScore() {
    score = 0;
    currentQuestions.forEach((question, index) => {
        if (userAnswers[index] === question.correct) {
            score++;
        }
    });
}

function showResults() {
    showScreen('results-screen');
    
    const percentage = Math.round((score / currentQuestions.length) * 100);
    const totalQuestions = currentQuestions.length;
    const incorrect = totalQuestions - score;
    
    // Afficher le score
    document.getElementById('score-percentage').textContent = percentage + '%';
    document.getElementById('score-value').textContent = `${score}/${totalQuestions}`;
    document.getElementById('correct-answers').textContent = score;
    document.getElementById('incorrect-answers').textContent = incorrect;
    
    // Message personnalisé
    let message = '';
    let title = '';
    if (percentage === 100) {
        title = 'Parfait ! 🎉';
        message = 'Tu as tout juste ! Tu maîtrises parfaitement ce thème !';
    } else if (percentage >= 80) {
        title = 'Excellent ! 🌟';
        message = 'Très bon travail ! Tu es sur la bonne voie !';
    } else if (percentage >= 60) {
        title = 'Bien joué ! 👍';
        message = 'C\'est pas mal ! Continue de t\'entraîner !';
    } else if (percentage >= 40) {
        title = 'Pas mal ! 💪';
        message = 'Tu progresses, continue tes efforts !';
    } else {
        title = 'Continue ! 📚';
        message = 'N\'abandonne pas ! Relis le cours et réessaie !';
    }
    
    document.getElementById('results-title').textContent = title;
    document.getElementById('results-message').textContent = message;
    
    // Afficher les corrections
    displayCorrections();
}

function displayCorrections() {
    const correctionsContainer = document.getElementById('corrections-container');
    correctionsContainer.innerHTML = '<h3 style="margin: 20px 0; color: #2C3E50;">📝 Corrections Détaillées</h3>';
    
    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correct;
        
        const correctionDiv = document.createElement('div');
        correctionDiv.className = `correction-item ${isCorrect ? 'correct' : 'incorrect'}`;
        
        let html = `
            <div class="correction-question">
                Question ${index + 1} : ${question.question}
            </div>
            <div class="correction-status ${isCorrect ? 'correct' : 'incorrect'}">
                ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </div>
        `;
        
        if (!isCorrect) {
            html += `
                <div class="correction-answer">
                    <strong>Ta réponse :</strong> ${question.options[userAnswer] || 'Aucune réponse'}
                </div>
            `;
        }
        
        html += `
            <div class="correction-answer" style="color: #50C878; font-weight: bold;">
                <strong>Bonne réponse :</strong> ${question.options[question.correct]}
            </div>
            <div class="correction-explanation">
                <strong>📖 Explication :</strong><br>
                ${question.explanation}
            </div>
        `;
        
        correctionDiv.innerHTML = html;
        correctionsContainer.appendChild(correctionDiv);
    });
}

function retryQuiz() {
    startQuiz(currentDifficulty);
}

function confirmQuit() {
    if (confirm('Es-tu sûr de vouloir quitter le quiz ? Ta progression sera perdue.')) {
        showScreen('selection-screen');
    }
}
