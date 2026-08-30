from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['id', 'task_type', 'status', 'created_at']
    list_filter = ['task_type', 'status']