let quizData = null;

// Load quiz results
function loadQuizResults() {
    // Try to get from sessionStorage first
    const storedData = sessionStorage.getItem('quizResults');
    
    if (storedData) {
        quizData = JSON.parse(storedData);
        displayAnalysis();
    } else {
        // Try to fetch from backend
        const username = sessionStorage.getItem('username');
        if (username) {
            fetch(`/api/quiz/results/?username=${username}`)
                .then(response => response.json())
                .then(results => {
                    if (results && results.length > 0) {
                        // Get the most recent result
                        quizData = results[results.length - 1];
                        displayAnalysis();
                    } else {
                        showNoResults();
                    }
                })
                .catch(error => {
                    console.error('Error loading results:', error);
                    showNoResults();
                });
        } else {
            showNoResults();
        }
    }
}

// Display analysis
function displayAnalysis() {
    if (!quizData) {
        showNoResults();
        return;
    }
    
    const score = quizData.score || 0;
    const total = quizData.total || 0;
    const percentage = quizData.percentage || 0;
    const incorrect = total - score;
    
    // Update summary
    document.getElementById('scoreDisplay').textContent = percentage + '%';
    document.getElementById('correctCount').textContent = score;
    document.getElementById('incorrectCount').textContent = incorrect;
    document.getElementById('totalQuestions').textContent = total;
    document.getElementById('percentageScore').textContent = percentage + '%';
    
    // Display question breakdown
    displayQuestionBreakdown();
}

// Display question breakdown
function displayQuestionBreakdown() {
    const breakdownContainer = document.getElementById('questionBreakdown');
    breakdownContainer.innerHTML = '';
    
    if (!quizData.results || quizData.results.length === 0) {
        breakdownContainer.innerHTML = '<p>No question data available.</p>';
        return;
    }
    
    quizData.results.forEach((result, index) => {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = `question-review ${result.isCorrect ? 'correct' : 'incorrect'}`;
        
        const questionNum = index + 1;
        const statusIcon = result.isCorrect ? '✓' : '✗';
        const statusText = result.isCorrect ? 'Correct' : 'Incorrect';
        
        reviewDiv.innerHTML = `
            <div class="review-question">
                <strong>Question ${questionNum}:</strong> ${result.question}
            </div>
            <div class="review-answer user">
                <strong>Your Answer:</strong> ${result.userAnswer || 'Not answered'}
            </div>
            ${!result.isCorrect ? `
                <div class="review-answer correct">
                    <strong>Correct Answer:</strong> ${result.correctAnswer}
                </div>
            ` : ''}
            <div style="margin-top: 10px; font-weight: 500; color: ${result.isCorrect ? '#4CAF50' : '#f44336'};">
                ${statusIcon} ${statusText}
            </div>
        `;
        
        breakdownContainer.appendChild(reviewDiv);
    });
}

// Show no results message
function showNoResults() {
    const breakdownContainer = document.getElementById('questionBreakdown');
    breakdownContainer.innerHTML = '<p>No quiz results found. Please complete a quiz first.</p>';
    
    document.getElementById('scoreDisplay').textContent = 'N/A';
    document.getElementById('correctCount').textContent = '0';
    document.getElementById('incorrectCount').textContent = '0';
    document.getElementById('totalQuestions').textContent = '0';
    document.getElementById('percentageScore').textContent = '0%';
}

// Retake quiz
function retakeQuiz() {
    sessionStorage.removeItem('quizResults');
    window.location.href = '/quiz/';
}

// Back to login
function backToLogin() {
    sessionStorage.clear();
    window.location.href = '/';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadQuizResults();
});

