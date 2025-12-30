from django.db import models
from django.contrib.auth.models import User
import json

# Create your models here.

class ExamLog(models.Model):
    username = models.CharField(max_length=100, null=True, blank=True)
    student_id = models.CharField(max_length=100, null=True, blank=True)
    event = models.CharField(max_length=100)
    answer = models.TextField(null=True, blank=True)
    suspicious = models.BooleanField(default=False)
    status = models.CharField(max_length=50, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.event} - {self.username or self.student_id} - {self.timestamp}"


class QuizResult(models.Model):
    username = models.CharField(max_length=100)
    score = models.IntegerField()
    total = models.IntegerField()
    percentage = models.FloatField()
    answers = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.username} - {self.score}/{self.total} ({self.percentage}%)"
