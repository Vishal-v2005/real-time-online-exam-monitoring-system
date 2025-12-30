from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import os
from django.conf import settings
from .models import ExamLog, QuizResult

# Simple user database (in production, use Django's User model)
USERS = {
    'admin': 'admin123',
    'user': 'user123',
    'student': 'student123'
}

# Home/Login page
def index(request):
    return render(request, 'index.html')

# Quiz page
def quiz(request):
    return render(request, 'quiz.html')

# Analysis page
def analysis(request):
    return render(request, 'analysis.html')

# API: Login
@csrf_exempt
@require_http_methods(["POST"])
def login_api(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        if username in USERS and USERS[username] == password:
            # Store username in session
            request.session['username'] = username
            request.session['logged_in'] = True
            return JsonResponse({
                'success': True,
                'message': 'Login successful'
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Invalid username or password'
            }, status=401)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=400)

# API: Face detection status
@csrf_exempt
@require_http_methods(["POST"])
def face_detection_status(request):
    try:
        data = json.loads(request.body)
        ExamLog.objects.create(
            username=data.get('username'),
            event='face_detection',
            status=data.get('status')
        )
        return JsonResponse({'status': 'recorded'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# API: Get quiz questions
@require_http_methods(["GET"])
def get_questions(request):
    try:
        questions_path = os.path.join(settings.BASE_DIR, 'questions.json')
        with open(questions_path, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        return JsonResponse(questions, safe=False)
    except FileNotFoundError:
        return JsonResponse({'error': 'Questions file not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# API: Submit quiz
@csrf_exempt
@require_http_methods(["POST"])
def submit_quiz(request):
    try:
        data = json.loads(request.body)
        username = data.get('username') or request.session.get('username')
        
        QuizResult.objects.create(
            username=username,
            score=data.get('score'),
            total=data.get('total'),
            percentage=data.get('percentage'),
            answers=data.get('answers', {})
        )
        
        return JsonResponse({
            'status': 'success',
            'message': 'Quiz submitted successfully'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# API: Get quiz results
@require_http_methods(["GET"])
def get_quiz_results(request):
    username = request.GET.get('username') or request.session.get('username')
    
    if username:
        results = QuizResult.objects.filter(username=username)
    else:
        results = QuizResult.objects.all()
    
    results_data = []
    for result in results:
        results_data.append({
            'username': result.username,
            'score': result.score,
            'total': result.total,
            'percentage': result.percentage,
            'answers': result.answers,
            'timestamp': result.timestamp.isoformat()
        })
    
    return JsonResponse(results_data, safe=False)

# API: Submit answer (legacy endpoint)
@csrf_exempt
@require_http_methods(["POST"])
def submit_answer(request):
    try:
        data = json.loads(request.body)
        student_id = data.get('student_id')
        answer = data.get('answer')
        
        suspicious = False
        if "AI-generated" in answer:
            suspicious = True
        
        ExamLog.objects.create(
            student_id=student_id,
            answer=answer,
            event='answer_submission',
            suspicious=suspicious
        )
        
        return JsonResponse({
            'status': 'success',
            'suspicious': suspicious
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# API: Tab switch detection (legacy endpoint)
@csrf_exempt
@require_http_methods(["POST"])
def tab_switch(request):
    try:
        data = json.loads(request.body)
        student_id = data.get('student_id')
        
        ExamLog.objects.create(
            student_id=student_id,
            event='tab_switch'
        )
        
        return JsonResponse({'status': 'tab switch recorded'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# API: Get logs
@require_http_methods(["GET"])
def get_logs(request):
    logs = ExamLog.objects.all()[:100]  # Limit to last 100
    logs_data = []
    for log in logs:
        logs_data.append({
            'username': log.username,
            'student_id': log.student_id,
            'event': log.event,
            'answer': log.answer,
            'suspicious': log.suspicious,
            'status': log.status,
            'timestamp': log.timestamp.isoformat()
        })
    return JsonResponse(logs_data, safe=False)

# Serve questions.json
@require_http_methods(["GET"])
def questions_json(request):
    try:
        questions_path = os.path.join(settings.BASE_DIR, 'questions.json')
        with open(questions_path, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        return JsonResponse(questions, safe=False)
    except FileNotFoundError:
        return JsonResponse({'error': 'Questions file not found'}, status=404)
