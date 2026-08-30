from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer
from .celery_tasks import process_task


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    http_method_names = ['get', 'post', 'head']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()

        # Enqueue instead of running inline — a Celery worker will pick this up.
        process_task.delay(str(task.id))

        output_serializer = self.get_serializer(task)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)