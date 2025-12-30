"""
URL configuration for quizportal project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from quizapp import views

urlpatterns = [
    path('admin/', admin.site.urls),
    # Page views
    path('', views.index, name='index'),
    path('quiz/', views.quiz, name='quiz'),
    path('analysis/', views.analysis, name='analysis'),
    # API endpoints
    path('api/login/', views.login_api, name='login_api'),
    path('api/face-detection-status/', views.face_detection_status, name='face_detection_status'),
    path('api/quiz/questions/', views.get_questions, name='get_questions'),
    path('api/quiz/submit/', views.submit_quiz, name='submit_quiz'),
    path('api/quiz/results/', views.get_quiz_results, name='get_quiz_results'),
    # Legacy endpoints
    path('api/submit-answer/', views.submit_answer, name='submit_answer'),
    path('api/tab-switch/', views.tab_switch, name='tab_switch'),
    path('api/logs/', views.get_logs, name='get_logs'),
    # Serve questions.json
    path('questions.json', views.questions_json, name='questions_json'),
]
