from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id', 'task_type', 'status',
            'input_file', 'result_file',
            'error_message', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'status', 'result_file', 'error_message', 'created_at', 'updated_at']