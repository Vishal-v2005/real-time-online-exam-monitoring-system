let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let quizStarted = false;

// Load questions from backend
async function loadQuestions() {
    try {
        const response = await fetch('/api/quiz/questions/');
        const data = await response.json();
        
        if (data.error) {
            console.error('Error loading questions:', data.error);
            // Fallback: try loading from local file
            const localResponse = await fetch('/questions.json');
            questions = await localResponse.json();
        } else {
            questions = data;
        }
        
        // Check if user is logged in
        const loggedIn = sessionStorage.getItem('loggedIn');
        if (!loggedIn) {
            alert('Please login first');
            window.location.href = '/';
            return;
        }
        
        // Initialize quiz
        initializeQuiz();
    } catch (error) {
        console.error('Error loading questions:', error);
        // Try loading from local JSON file
        try {
            const response = await fetch('/questions.json');
            questions = await response.json();
            initializeQuiz();
        } catch (localError) {
            console.error('Error loading local questions:', localError);
            document.getElementById('questionText').textContent = 'Error loading questions. Please refresh the page.';
        }
    }
}

// Initialize quiz
function initializeQuiz() {
    if (questions.length === 0) {
        document.getElementById('questionText').textContent = 'No questions available.';
        return;
    }
    
    quizStarted = true;
    userAnswers = new Array(questions.length).fill(null);
    currentQuestionIndex = 0;
    displayQuestion();
}

// Display current question
function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        completeQuiz();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const questionCounter = document.getElementById('questionCounter');
    const progressFill = document.getElementById('progressFill');
    
    // Update question text
    questionText.textContent = question.question;
    
    // Update counter
    questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    
    // Update progress bar
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    progressFill.style.width = progress + '%';
    
    // Clear and populate options
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
        optionBtn.dataset.index = index;
        
        optionBtn.addEventListener('click', () => handleOptionClick(index));
        
        optionsContainer.appendChild(optionBtn);
    });
}

// Handle option click
function handleOptionClick(selectedIndex) {
    const question = questions[currentQuestionIndex];
    const options = document.querySelectorAll('.option-btn');
    
    // Disable all buttons
    options.forEach(btn => {
        btn.classList.add('disabled');
        btn.style.pointerEvents = 'none';
    });
    
    // Store user answer
    userAnswers[currentQuestionIndex] = selectedIndex;
    
    // Check if answer is correct
    if (selectedIndex === question.correct) {
        // Highlight correct answer in green
        options[selectedIndex].classList.add('correct');
        
        // Move to next question after a short delay
        setTimeout(() => {
            currentQuestionIndex++;
            displayQuestion();
        }, 1000);
    } else {
        // Wrong answer - skip to next question immediately
        setTimeout(() => {
            currentQuestionIndex++;
            displayQuestion();
        }, 500);
    }
}

// Complete quiz and redirect to analysis
function completeQuiz() {
    // Calculate results
    let correctCount = 0;
    const results = [];
    
    questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correct;
        
        if (isCorrect) {
            correctCount++;
        }
        
        results.push({
            questionId: question.id,
            question: question.question,
            userAnswer: userAnswer !== null ? question.options[userAnswer] : 'Not answered',
            correctAnswer: question.options[question.correct],
            isCorrect: isCorrect,
            options: question.options
        });
    });
    
    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    
    // Store results in sessionStorage
    const quizData = {
        username: sessionStorage.getItem('username'),
        score: correctCount,
        total: totalQuestions,
        percentage: percentage,
        results: results,
        timestamp: new Date().toISOString()
    };
    
    sessionStorage.setItem('quizResults', JSON.stringify(quizData));
    
    // Submit to backend
    submitQuizResults(quizData);
    
    // Redirect to analysis page
    window.location.href = '/analysis/';
}

// Submit quiz results to backend
async function submitQuizResults(quizData) {
    try {
        // Get CSRF token from cookie
        function getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
        const csrftoken = getCookie('csrftoken');
        await fetch('/api/quiz/submit/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken || ''
            },
            body: JSON.stringify({
                username: quizData.username,
                answers: quizData.results,
                score: quizData.score,
                total: quizData.total,
                percentage: quizData.percentage
            })
        });
    } catch (error) {
        console.error('Error submitting quiz results:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
});

