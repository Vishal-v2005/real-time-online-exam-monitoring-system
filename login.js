document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const faceDetectionBtn = document.getElementById('faceDetectionBtn');
    const stopWebcamBtn = document.getElementById('stopWebcamBtn');
    const errorMessage = document.getElementById('errorMessage');
    
    let faceDetected = false;
    
    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Clear previous errors
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
        
        try {
            // Get CSRF token from Django cookie
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
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken || ''
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Check if face detection is required and completed
                if (faceDetected || window.faceDetection.isFaceDetected()) {
                    // Store login info
                    sessionStorage.setItem('username', username);
                    sessionStorage.setItem('loggedIn', 'true');
                    
                    // Redirect to quiz
                    window.location.href = '/quiz/';
                } else {
                    showError('Please complete face detection before proceeding.');
                }
            } else {
                showError(result.message || 'Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Connection error. Please try again.');
        }
    });
    
    // Handle face detection button
    faceDetectionBtn.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showError('Please enter username and password first');
            return;
        }
        
        // Start webcam
        await window.faceDetection.startWebcam();
        
        // Check for face detection periodically
        const checkFace = setInterval(() => {
            if (window.faceDetection.isFaceDetected()) {
                faceDetected = true;
                clearInterval(checkFace);
                
                // Log face detection status
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
                fetch('/api/face-detection-status/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken || ''
                    },
                    body: JSON.stringify({
                        username: username,
                        status: 'detected',
                        timestamp: new Date().toISOString()
                    })
                }).catch(err => console.error('Error logging face detection:', err));
            }
        }, 1000);
    });
    
    // Handle stop webcam button
    stopWebcamBtn.addEventListener('click', () => {
        window.faceDetection.stopWebcam();
        faceDetected = false;
    });
    
    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});

