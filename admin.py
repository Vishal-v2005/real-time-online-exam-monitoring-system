from django.contrib import admin
from .models import ExamLog, QuizResult

# Register your models here.

@admin.register(ExamLog)
class ExamLogAdmin(admin.ModelAdmin):
    list_display = ['username', 'student_id', 'event', 'timestamp']
    list_filter = ['event', 'timestamp']
    search_fields = ['username', 'student_id']
    readonly_fields = ['timestamp']

@admin.register(QuizResult)
class QuizResultAdmin(admin.ModelAdmin):
    list_display = ['username', 'score', 'total', 'percentage', 'timestamp']
    list_filter = ['timestamp']
    search_fields = ['username']
    readonly_fields = ['timestamp']
