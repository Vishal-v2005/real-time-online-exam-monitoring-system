from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import datetime
import os
import json

app = Flask(__name__, static_folder='static')
CORS(app)

# Simulated database
exam_logs = []
quiz_results = []

# Simple user database (in production, use proper database)
users = {
    'admin': 'admin123',
    'user': 'user123',
    'student': 'student123'
}

# Endpoint to submit answers
@app.route('/submit_answer', methods=['POST'])
def submit_answer():
    data = request.json
    student_id = data['student_id']
    answer = data['answer']

    # AI detection simulation
    suspicious = False
    if "AI-generated" in answer:  # simple simulation
        suspicious = True

    log = {
        'student_id': student_id,
        'answer': answer,
        'suspicious': suspicious,
        'timestamp': datetime.datetime.now().isoformat()
    }
    exam_logs.append(log)
    return jsonify({"status": "success", "suspicious": suspicious})

# Endpoint for tab switch detection
@app.route('/tab_switch', methods=['POST'])
def tab_switch():
    data = request.json
    student_id = data['student_id']
    timestamp = datetime.datetime.now().isoformat()
    exam_logs.append({'student_id': student_id, 'event': 'tab_switch', 'timestamp': timestamp})
    return jsonify({"status": "tab switch recorded"})

# Endpoint to fetch logs
@app.route('/logs', methods=['GET'])
def get_logs():
    return jsonify(exam_logs)

# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if username in users and users[username] == password:
        return jsonify({
            'success': True,
            'message': 'Login successful'
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid username or password'
        }), 401

# Face detection status endpoint
@app.route('/face_detection_status', methods=['POST'])
def face_detection_status():
    data = request.json
    log = {
        'username': data.get('username'),
        'event': 'face_detection',
        'status': data.get('status'),
        'timestamp': data.get('timestamp', datetime.datetime.now().isoformat())
    }
    exam_logs.append(log)
    return jsonify({'status': 'recorded'})

# Serve quiz questions
@app.route('/quiz/questions', methods=['GET'])
def get_questions():
    try:
        with open('questions.json', 'r', encoding='utf-8') as f:
            questions = json.load(f)
        return jsonify(questions)
    except FileNotFoundError:
        return jsonify({'error': 'Questions file not found'}), 404

# Submit quiz results
@app.route('/quiz/submit', methods=['POST'])
def submit_quiz():
    data = request.json
    result = {
        'username': data.get('username'),
        'answers': data.get('answers'),
        'score': data.get('score'),
        'total': data.get('total'),
        'percentage': data.get('percentage'),
        'timestamp': datetime.datetime.now().isoformat()
    }
    quiz_results.append(result)
    return jsonify({'status': 'success', 'result_id': len(quiz_results) - 1})

# Get quiz results
@app.route('/quiz/results', methods=['GET'])
def get_quiz_results():
    username = request.args.get('username')
    if username:
        user_results = [r for r in quiz_results if r.get('username') == username]
        return jsonify(user_results)
    return jsonify(quiz_results)

# Serve static files
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(app.static_folder, filename)

# Serve HTML pages
@app.route('/')
def index():
    return send_file('index.html')

@app.route('/quiz.html')
def quiz():
    return send_file('quiz.html')

@app.route('/analysis.html')
def analysis():
    return send_file('analysis.html')

# Serve questions.json
@app.route('/questions.json')
def questions_json():
    return send_file('questions.json')

if __name__ == '__main__':
    app.run(debug=True)
